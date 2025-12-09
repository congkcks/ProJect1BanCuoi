import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, MoreHorizontal, Search, Eye, Play, FileText, Edit, Trash2, Copy, ListChecks } from "lucide-react";
import { ContentFormDialog } from "./ContentFormDialog";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { useToast } from "@/hooks/use-toast";
import {
  apiService,
  type CreateLessonPayload,
  type LessonContentPayload,
  type LessonContentType,
  type LessonItem,
  type ListeningContentPayload,
  type LoTrinhItem,
  type ReadingContentPayload,
  type WritingContentPayload,
} from "@/services/api";
import { QuestionManagerDialog } from "./QuestionManagerDialog";

type LessonDialogFormData = {
  maLoTrinh: string;
  tenBai: string;
  moTa?: string;
  thoiLuongPhut: number;
  soThuTu?: number;
  types: LessonContentType[];
  listening?: ListeningContentPayload;
  reading?: ReadingContentPayload;
  writing?: WritingContentPayload;
};

export function ContentManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [lessons, setLessons] = useState<LessonItem[]>([]);
  const [roadmaps, setRoadmaps] = useState<LoTrinhItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [contentDialog, setContentDialog] = useState<{
    open: boolean;
    type: "lesson" | "assessment";
    content?: LessonItem | null;
  }>({ open: false, type: "lesson" });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; item?: LessonItem; type?: string }>({ open: false });
  const [questionDialog, setQuestionDialog] = useState<{ open: boolean; lesson?: LessonItem | null; type?: LessonContentType }>(() => ({ open: false }));
  const { toast } = useToast();

  const assessments = [
    {
      id: 1,
      title: "TOEIC Practice Test A1",
      level: "A1",
      status: "active",
      attempts: 145,
      avgScore: 650,
      created: "2024-02-15"
    },
    {
      id: 2,
      title: "TOEIC Practice Test A2",
      level: "A2",
      status: "active",
      attempts: 89,
      avgScore: 720,
      created: "2024-02-20"
    },
    {
      id: 3,
      title: "TOEIC Practice Test B1",
      level: "B1",
      status: "inactive",
      attempts: 67,
      avgScore: 780,
      created: "2024-02-25"
    },
  ];

  const getErrorMessage = (err: unknown): string => {
    if (!err) return "Đã xảy ra lỗi";
    if (typeof err === "string") return err;
    if (err instanceof Error) return err.message;
    const status = (err as any)?.status;
    if (status) return `Yêu cầu thất bại (HTTP ${status})`;
    try {
      return JSON.stringify(err);
    } catch {
      return "Đã xảy ra lỗi";
    }
  };

  const collectCodeLines = (lesson: LessonItem) => {
    const lines: string[] = [];
    if (lesson.maBai) lines.push(`BH: ${lesson.maBai}`);
    const docCodes = lesson.baiDocs?.map((doc) => doc.maBaiDoc).filter(Boolean);
    if (docCodes && docCodes.length) lines.push(`BD: ${docCodes.join(", ")}`);
    const ngheCodes = lesson.baiNghes?.map((item) => item.maBaiNghe).filter(Boolean);
    if (ngheCodes && ngheCodes.length) lines.push(`BN: ${ngheCodes.join(", ")}`);
    const vietCodes = lesson.baiViets?.map((item) => item.maBaiViet).filter(Boolean);
    if (vietCodes && vietCodes.length) lines.push(`BV: ${vietCodes.join(", ")}`);
    return lines;
  };

  const getLessonTypes = (lesson: LessonItem): LessonContentType[] => {
    const types: LessonContentType[] = [];
    if (lesson.baiDocs?.length) types.push("reading");
    if (lesson.baiNghes?.length) types.push("listening");
    if (lesson.baiViets?.length) types.push("writing");
    if (!types.length) types.push("reading");
    return types;
  };

  const sumQuestions = (items?: Array<{ tongCauHoi?: number; cauHois?: { length: number }[] }>) => {
    if (!items) return 0;
    return items.reduce((total, item) => {
      if (!item) return total;
      const count = item.tongCauHoi ?? item.cauHois?.length ?? 0;
      return total + count;
    }, 0);
  };

  const sumLessonQuestions = (lesson: LessonItem) => {
    const readingQuestions = sumQuestions(lesson.baiDocs);
    const listeningQuestions = sumQuestions(lesson.baiNghes);
    const writingQuestions = lesson.baiViets?.length ?? 0;
    return readingQuestions + listeningQuestions + writingQuestions;
  };

  const formatDate = (value?: string | null) => {
    if (!value) return "--";
    try {
      return new Date(value).toLocaleDateString("vi-VN");
    } catch {
      return value;
    }
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [lessonResponse, roadmapResponse] = await Promise.all([
        apiService
          .getAllLessonsWithContent()
          .catch(async (err) => {
            console.warn("[admin] Auth lessons failed, fallback to public", err);
            return apiService.getLessons();
          }),
        apiService.getAvailableRoadmaps().catch((err) => {
          console.warn("[admin] Load roadmaps failed", err);
          return { data: [] as LoTrinhItem[] };
        }),
      ]);

      setLessons(lessonResponse.data ?? []);
      setRoadmaps(roadmapResponse.data ?? []);
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      toast({ title: "Không thể tải dữ liệu", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const handleAuthChange = () => loadData();
    window.addEventListener("auth:token-updated", handleAuthChange);
    window.addEventListener("auth:logged-in", handleAuthChange);
    return () => {
      window.removeEventListener("auth:token-updated", handleAuthChange);
      window.removeEventListener("auth:logged-in", handleAuthChange);
    };
  }, [loadData]);

  const roadmapMap = useMemo(() => {
    return new Map(roadmaps.map((roadmap) => [roadmap.maLoTrinh, roadmap]));
  }, [roadmaps]);

  const decoratedLessons = useMemo(() => {
    return lessons.map((lesson) => {
      const types = getLessonTypes(lesson);
      const roadmap = roadmapMap.get(lesson.maLoTrinh);
      const questions = sumLessonQuestions(lesson);

      return {
        raw: lesson,
        title: lesson.tenBai,
        types,
        level: roadmap?.capDo || "--",
        questions,
        duration: lesson.thoiLuongPhut ? `${lesson.thoiLuongPhut} phút` : "--",
        status: "published" as const,
        created: formatDate(lesson.ngayTao),
        codes: collectCodeLines(lesson),
      };
    });
  }, [lessons, roadmapMap]);

  const getStatusBadge = (status: string) => {
    const variants = {
      published: "default",
      draft: "secondary",
      active: "default",
      inactive: "secondary",
    };
    
    const labels = {
      published: "Đã xuất bản",
      draft: "Bản nháp",
      active: "Hoạt động",
      inactive: "Không hoạt động",
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] as any}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      listening: Play,
      reading: FileText,
      writing: FileText,
    };
    
    const Icon = icons[type as keyof typeof icons] || FileText;
    return <Icon className="h-4 w-4" />;
  };

  const handleCreateContent = (type: "lesson" | "assessment") => {
    if (type === "lesson" && roadmaps.length === 0) {
      toast({
        title: "Thiếu lộ trình",
        description: "Bạn cần tạo lộ trình trước khi thêm bài học.",
        variant: "destructive",
      });
      return;
    }
    setContentDialog({ open: true, type, content: undefined });
  };

  const handleEditContent = (type: "lesson" | "assessment", content: LessonItem | any) => {
    setContentDialog({ open: true, type, content });
  };

  const handleDeleteContent = (item: LessonItem, type: string) => {
    setDeleteDialog({ open: true, item, type });
  };

  const handleManageQuestions = (lesson: LessonItem, type?: LessonContentType) => {
    setQuestionDialog({ open: true, lesson, type });
  };

  const buildLessonBasePayload = (form: LessonDialogFormData): Omit<CreateLessonPayload, "content"> => ({
    maLoTrinh: form.maLoTrinh,
    tenBai: form.tenBai,
    moTa: form.moTa,
    thoiLuongPhut: form.thoiLuongPhut,
    soThuTu: form.soThuTu,
  });

  const buildContentPayloads = (form: LessonDialogFormData): LessonContentPayload[] => {
    const payloads: LessonContentPayload[] = [];
    form.types.forEach((type) => {
      if (type === "listening" && form.listening) {
        payloads.push({ type: "listening", listening: form.listening });
      } else if (type === "reading" && form.reading) {
        payloads.push({ type: "reading", reading: form.reading });
      } else if (type === "writing" && form.writing) {
        payloads.push({ type: "writing", writing: form.writing });
      }
    });
    return payloads;
  };

  const handleContentSubmit = async (data: any) => {
    if (contentDialog.type !== "lesson") {
      toast({ title: "Đang phát triển", description: "Tính năng đề thi sẽ sớm có mặt." });
      return;
    }

    try {
      setIsSaving(true);
      const lessonForm = data as LessonDialogFormData;
      const contentPayloads = buildContentPayloads(lessonForm);
      if (contentPayloads.length === 0) {
        toast({ title: "Thiếu nội dung", description: "Chọn ít nhất một loại nội dung và nhập dữ liệu." });
        return;
      }

      const [primaryContent, ...extraContents] = contentPayloads;
      const basePayload: CreateLessonPayload = {
        ...buildLessonBasePayload(lessonForm),
        content: primaryContent,
      };

      let targetLessonId = contentDialog.content?.maBai;

      if (contentDialog.content) {
        await apiService.updateAdminLesson(targetLessonId!, basePayload);
        if (extraContents.length > 0) {
          for (const contentPayload of extraContents) {
            await apiService.updateAdminLesson(targetLessonId!, { content: contentPayload });
          }
        }
        toast({ title: "Đã cập nhật", description: `Bài học "${lessonForm.tenBai}" đã được lưu.` });
      } else {
        const created = await apiService.createAdminLesson(basePayload);
        const createdLesson = created?.data ?? created;
        targetLessonId = createdLesson?.maBai ?? createdLesson?.MaBai ?? targetLessonId;
        if (!targetLessonId) {
          throw new Error("Không thể xác định mã bài học sau khi tạo.");
        }
        if (extraContents.length > 0) {
          for (const contentPayload of extraContents) {
            await apiService.updateAdminLesson(targetLessonId, { content: contentPayload });
          }
        }
        toast({ title: "Đã tạo", description: `Bài học "${lessonForm.tenBai}" đã được thêm mới.` });
      }
      await loadData();
    } catch (err) {
      const message = getErrorMessage(err);
      toast({ title: "Không thể lưu bài học", description: message, variant: "destructive" });
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (deleteDialog.type !== "bài học" || !deleteDialog.item) {
      toast({ title: "Đang phát triển", description: "Chỉ hỗ trợ xóa bài học hiện tại." });
      return;
    }

    try {
      await apiService.deleteAdminLesson(deleteDialog.item.maBai);
      toast({ title: "Đã xóa", description: `Bài học "${deleteDialog.item.tenBai}" đã được xóa.` });
      await loadData();
    } catch (err) {
      const message = getErrorMessage(err);
      toast({ title: "Không thể xóa", description: message, variant: "destructive" });
    }
  };

  const handleCopyContent = (item: any, type: string) => {
    const name = item?.title ?? item?.tenBai ?? "nội dung";
    toast({
      title: "Sao chép thành công",
      description: `Đã tạo bản sao của ${type} "${name}"`,
    });
  };

  const filteredLessons = decoratedLessons.filter((lesson) =>
    lesson.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAssessments = assessments.filter(assessment =>
    assessment.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Quản lý nội dung</h2>
          <p className="text-muted-foreground">Quản lý bài học, đề thi và tài liệu học tập</p>
        </div>
      </div>

      <Tabs defaultValue="lessons" className="space-y-4">
        <TabsList>
          <TabsTrigger value="lessons">Bài học</TabsTrigger>
          <TabsTrigger value="assessments">Đề thi</TabsTrigger>
          <TabsTrigger value="roadmaps">Lộ trình</TabsTrigger>
        </TabsList>

        <TabsContent value="lessons" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Danh sách bài học</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Tìm kiếm bài học..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-80"
                    />
                  </div>
                  <Button onClick={() => handleCreateContent("lesson")}>
                    <Plus className="mr-2 h-4 w-4" />
                    Thêm bài học
                  </Button>
                </div>
              </div>
              {error && (
                <p className="text-sm text-red-500 mt-2">{error}</p>
              )}
            </CardHeader>
            <CardContent>
              <Table className="table-fixed">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[18%]">Bài học</TableHead>
                    <TableHead className="w-[16%]">Mã</TableHead>
                    <TableHead className="w-[14%]">Loại</TableHead>
                    <TableHead className="w-[10%]">Cấp độ</TableHead>
                    <TableHead className="w-[12%]">Thời lượng</TableHead>
                    <TableHead className="w-[10%]">Trạng thái</TableHead>
                    <TableHead className="w-[10%]">Ngày tạo</TableHead>
                    <TableHead className="w-[6%] text-right">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                        Đang tải dữ liệu...
                      </TableCell>
                    </TableRow>
                  )}
                  {!loading && filteredLessons.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                        Không tìm thấy bài học phù hợp.
                      </TableCell>
                    </TableRow>
                  )}
                  {!loading &&
                    filteredLessons.map(({ raw, title, types, level, questions, duration, status, created, codes }) => (
                      <TableRow key={raw.maBai}>
                        <TableCell className="font-medium pr-4">{title}</TableCell>
                        <TableCell className="pr-4">
                          <div className="flex flex-col text-xs font-mono text-muted-foreground gap-0.5">
                            {codes?.map((line) => (
                              <span key={`${raw.maBai}-${line}`}>{line}</span>
                            ))}
                          </div>
                        </TableCell>
                      <TableCell className="pr-4">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {types.map((type) => (
                            <span key={`${raw.maBai}-${type}`} className="inline-flex items-center gap-1 text-sm capitalize">
                              {getTypeIcon(type)}
                              {type}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="pr-2">
                          <Badge variant="outline">{level}</Badge>
                      </TableCell>
                        <TableCell>{duration}</TableCell>
                        <TableCell>{getStatusBadge(status)}</TableCell>
                        <TableCell>{created}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              Xem trước
                            </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditContent("lesson", raw)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Chỉnh sửa
                            </DropdownMenuItem>
                            {raw.baiDocs?.length ? (
                              <DropdownMenuItem onClick={() => handleManageQuestions(raw, "reading")}>
                                <ListChecks className="mr-2 h-4 w-4" />
                                Câu hỏi bài đọc
                              </DropdownMenuItem>
                            ) : null}
                            {raw.baiNghes?.length ? (
                              <DropdownMenuItem onClick={() => handleManageQuestions(raw, "listening")}>
                                <ListChecks className="mr-2 h-4 w-4" />
                                Câu hỏi bài nghe
                              </DropdownMenuItem>
                            ) : null}
                              <DropdownMenuItem onClick={() => handleCopyContent(raw, "bài học")}>
                              <Copy className="mr-2 h-4 w-4" />
                              Sao chép
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600"
                                onClick={() => handleDeleteContent(raw, "bài học")}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Xóa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assessments" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Danh sách đề thi</CardTitle>
                <Button onClick={() => handleCreateContent("assessment")}>
                  <Plus className="mr-2 h-4 w-4" />
                  Thêm đề thi
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên đề thi</TableHead>
                    <TableHead>Cấp độ</TableHead>
                    <TableHead>Lượt thi</TableHead>
                    <TableHead>Điểm TB</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead className="text-right">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssessments.map((assessment) => (
                    <TableRow key={assessment.id}>
                      <TableCell className="font-medium">{assessment.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{assessment.level}</Badge>
                      </TableCell>
                      <TableCell>{assessment.attempts}</TableCell>
                      <TableCell>{assessment.avgScore}</TableCell>
                      <TableCell>{getStatusBadge(assessment.status)}</TableCell>
                      <TableCell>{assessment.created}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              Xem chi tiết
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditContent("assessment", assessment)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem>Thống kê</DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => handleDeleteContent(assessment, "đề thi")}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Xóa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roadmaps" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quản lý lộ trình học tập</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">Chức năng quản lý lộ trình đang được phát triển</p>
                <Button onClick={() => handleCreateContent("lesson")}>
                  <Plus className="mr-2 h-4 w-4" />
                  Tạo lộ trình mới
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ContentFormDialog
        open={contentDialog.open}
        onOpenChange={(open) => setContentDialog({ ...contentDialog, open })}
        type={contentDialog.type}
        content={contentDialog.content}
        onSubmit={handleContentSubmit}
        roadmaps={roadmaps}
        isSubmitting={isSaving}
      />

      <DeleteConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open })}
        title={`Xác nhận xóa ${deleteDialog.type}`}
        description={`Bạn có chắc chắn muốn xóa ${deleteDialog.type} "${deleteDialog.item?.tenBai || deleteDialog.item?.title || ""}"? Hành động này không thể hoàn tác.`}
        onConfirm={handleConfirmDelete}
      />

      <QuestionManagerDialog
        open={questionDialog.open}
        lesson={questionDialog.lesson}
        lessonType={questionDialog.type}
        onOpenChange={(open) =>
          setQuestionDialog((prev) => (open ? { ...prev, open } : { open, lesson: null, type: undefined }))
        }
        onQuestionsUpdated={loadData}
      />
    </div>
  );
}
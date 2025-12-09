import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  apiService,
  type AdminQuestionPayload,
  type CauHoiItem,
  type LessonContentType,
  type LessonItem,
} from "@/services/api";
import { Loader2, Trash2, Plus, RefreshCw, Edit } from "lucide-react";

interface QuestionManagerDialogProps {
  open: boolean;
  lesson?: LessonItem | null;
  lessonType?: LessonContentType;
  onOpenChange: (open: boolean) => void;
  onQuestionsUpdated?: () => void | Promise<void>;
}

interface AnswerFormValue {
  noiDungDapAn: string;
  laDapAnDung: boolean;
  thuTuHienThi?: number | null;
}

interface QuestionFormValues {
  noiDungCauHoi: string;
  giaiThich?: string;
  diem: number;
  thuTuHienThi?: number | null;
  answers: AnswerFormValue[];
}

const buildDefaultAnswers = (): AnswerFormValue[] =>
  Array.from({ length: 4 }).map((_, idx) => ({
    noiDungDapAn: "",
    laDapAnDung: idx === 0,
    thuTuHienThi: idx + 1,
  }));

const buildDefaultFormValues = (): QuestionFormValues => ({
  noiDungCauHoi: "",
  giaiThich: "",
  diem: 1,
  thuTuHienThi: undefined,
  answers: buildDefaultAnswers(),
});

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

const collectLessonCodes = (lesson?: LessonItem | null, type?: LessonContentType): string[] => {
  if (!lesson) return [];
  const lines: string[] = [];
  if (lesson.maBai) lines.push(`BH: ${lesson.maBai}`);
  if (!type || type === "reading") {
    const docCodes = lesson.baiDocs?.map((doc) => doc.maBaiDoc).filter(Boolean) as string[] | undefined;
    if (docCodes?.length) lines.push(`BD: ${docCodes.join(", ")}`);
  }
  if (!type || type === "listening") {
    const ngheCodes = lesson.baiNghes?.map((nghe) => nghe.maBaiNghe).filter(Boolean) as string[] | undefined;
    if (ngheCodes?.length) lines.push(`BN: ${ngheCodes.join(", ")}`);
  }
  return lines;
};

export function QuestionManagerDialog({
  open,
  lesson,
  lessonType,
  onOpenChange,
  onQuestionsUpdated,
}: QuestionManagerDialogProps) {
  const isSupportedType = lessonType === "reading" || lessonType === "listening";
  const { toast } = useToast();
  const [questions, setQuestions] = useState<CauHoiItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [mutating, setMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lessonCodes = useMemo(() => collectLessonCodes(lesson, lessonType), [lesson, lessonType]);
  const questionCodePrefix = useMemo(() => {
    if (lessonType === "reading") return "CHD";
    if (lessonType === "listening") return "CHN";
    return undefined;
  }, [lessonType]);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    register,
    formState: { errors },
  } = useForm<QuestionFormValues>({
    defaultValues: buildDefaultFormValues(),
  });
  const { fields, append, remove } = useFieldArray({ control, name: "answers" });
  const answerValues = watch("answers");

  const contentId = useMemo(() => {
    if (!lesson) return null;
    if (lessonType === "reading") return lesson.baiDocs?.[0]?.maBaiDoc ?? null;
    if (lessonType === "listening") return lesson.baiNghes?.[0]?.maBaiNghe ?? null;
    return null;
  }, [lesson, lessonType]);

  const contentTitle = useMemo(() => {
    if (!lesson) return "";
    if (lessonType === "reading") return lesson.baiDocs?.[0]?.tieuDe ?? lesson.tenBai;
    if (lessonType === "listening") return lesson.baiNghes?.[0]?.tieuDe ?? lesson.tenBai;
    return lesson.tenBai;
  }, [lesson, lessonType]);

  const resetForm = useCallback(() => {
    reset(buildDefaultFormValues());
  }, [reset]);

  const refreshQuestions = useCallback(async () => {
    if (!contentId || !isSupportedType) {
      setQuestions([]);
      setError(isSupportedType ? "Bài học này chưa có nội dung để thêm câu hỏi." : "Chỉ hỗ trợ bài đọc hoặc bài nghe.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      if (lessonType === "reading") {
        const detail = await apiService.getReadingDocDetail(contentId);
        setQuestions(detail?.cauHois ?? []);
      } else if (lessonType === "listening") {
        const detail = await apiService.getListeningDetail(contentId);
        setQuestions(detail?.cauHois ?? []);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [contentId, isSupportedType, lessonType]);

  useEffect(() => {
    if (!open) return;
    refreshQuestions();
  }, [open, refreshQuestions]);

  useEffect(() => {
    if (!open) {
      resetForm();
      setError(null);
    }
  }, [open, resetForm]);

  const enforceSingleCorrect = (index: number) => {
    answerValues.forEach((_, idx) => {
      setValue(`answers.${idx}.laDapAnDung`, idx === index);
    });
  };

  const handleAddAnswer = () => {
    if (fields.length >= 6) {
      toast({ title: "Giới hạn đáp án", description: "Tối đa 6 đáp án cho mỗi câu hỏi", variant: "destructive" });
      return;
    }
    append({ noiDungDapAn: "", laDapAnDung: false, thuTuHienThi: fields.length + 1 });
  };

  const handleRemoveAnswer = (index: number) => {
    if (fields.length <= 2) {
      toast({ title: "Không thể xóa", description: "Cần tối thiểu 2 đáp án", variant: "destructive" });
      return;
    }
    remove(index);
  };

  const onSubmit = handleSubmit(async (values) => {
    if (!contentId) {
      toast({ title: "Thiếu nội dung", description: "Không tìm thấy mã nội dung để thêm câu hỏi.", variant: "destructive" });
      return;
    }

    const trimmedAnswers = values.answers
      .map((ans, idx) => ({
        nhanDapAn: String.fromCharCode(65 + idx),
        noiDungDapAn: ans.noiDungDapAn.trim(),
        laDapAnDung: ans.laDapAnDung,
        thuTuHienThi: ans.thuTuHienThi ?? idx + 1,
      }))
      .filter((ans) => ans.noiDungDapAn.length > 0);

    if (trimmedAnswers.length < 2) {
      toast({ title: "Thiếu đáp án", description: "Cần ít nhất 2 đáp án có nội dung.", variant: "destructive" });
      return;
    }

    if (!trimmedAnswers.some((ans) => ans.laDapAnDung)) {
      toast({ title: "Thiếu đáp án đúng", description: "Chọn ít nhất 1 đáp án đúng", variant: "destructive" });
      return;
    }

    const payload: AdminQuestionPayload = {
      noiDungCauHoi: values.noiDungCauHoi.trim(),
      giaiThich: values.giaiThich?.trim() || undefined,
      diem: values.diem,
      thuTuHienThi: values.thuTuHienThi ?? undefined,
      dapAns: trimmedAnswers,
    };

    setMutating(true);
    try {
      let createdCode: string | undefined;
      if (lessonType === "reading") {
        const res = await apiService.createReadingQuestion(contentId, payload);
        createdCode = (res as any)?.maCauHoi ?? (res as any)?.data?.maCauHoi;
      } else if (lessonType === "listening") {
        const res = await apiService.createListeningQuestion(contentId, payload);
        createdCode = (res as any)?.maCauHoi ?? (res as any)?.data?.maCauHoi;
      } else {
        throw new Error("Chỉ hỗ trợ bài đọc và bài nghe.");
      }

      toast({
        title: "Đã thêm câu hỏi",
        description: createdCode ? `Mã câu hỏi: ${createdCode}` : "Câu hỏi mới đã được lưu.",
      });
      resetForm();
      await refreshQuestions();
      await onQuestionsUpdated?.();
    } catch (err) {
      toast({ title: "Không thể lưu", description: getErrorMessage(err), variant: "destructive" });
    } finally {
      setMutating(false);
    }
  });

  const handleDeleteQuestion = async (questionId: string) => {
    if (!contentId) return;
    const confirmed = window.confirm(`Bạn có chắc chắn muốn xóa câu hỏi ${questionId}?`);
    if (!confirmed) return;

    setMutating(true);
    try {
      if (lessonType === "reading") {
        await apiService.deleteReadingQuestion(contentId, questionId);
      } else if (lessonType === "listening") {
        await apiService.deleteListeningQuestion(contentId, questionId);
      }
      toast({ title: "Đã xóa", description: "Câu hỏi đã được xóa." });
      await refreshQuestions();
      await onQuestionsUpdated?.();
    } catch (err) {
      toast({ title: "Không thể xóa", description: getErrorMessage(err), variant: "destructive" });
    } finally {
      setMutating(false);
    }
  };

  const handleEditQuestion = (question: CauHoiItem) => {
    // populate form with existing question to edit inline
    reset({
      noiDungCauHoi: question.noiDungCauHoi,
      giaiThich: question.giaiThich ?? "",
      diem: question.diem ?? 1,
      thuTuHienThi: question.thuTuHienThi ?? undefined,
      answers: (question.dapAns || []).map((ans, idx) => ({
        noiDungDapAn: ans.noiDungDapAn,
        laDapAnDung: !!ans.laDapAnDung,
        thuTuHienThi: ans.thuTuHienThi ?? idx + 1,
      })),
    });
    toast({ title: "Chỉnh sửa câu hỏi", description: "Bạn đang chỉnh sửa câu hỏi hiện tại. Nhấn lưu để cập nhật." });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-full max-h-[90vh] overflow-hidden gap-6">
        <DialogHeader>
          <DialogTitle>Quản lý câu hỏi bài học</DialogTitle>
          <DialogDescription>
            {lesson ? (
              <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-foreground">{lesson.tenBai}</span>
                  <Badge variant="outline" className="capitalize">{lessonType}</Badge>
                  {contentTitle && <span>• {contentTitle}</span>}
                </div>
                <div className="flex flex-wrap gap-2 text-xs font-mono text-muted-foreground/90">
                  {lessonCodes.length ? (
                    lessonCodes.map((codeLine) => <span key={codeLine}>{codeLine}</span>)
                  ) : (
                    <span>Chưa có mã nội dung, hệ thống sẽ tự sinh sau khi lưu.</span>
                  )}
                </div>
                {questionCodePrefix && (
                  <div className="text-xs text-muted-foreground">
                    Định dạng mã câu hỏi: <code>{`${questionCodePrefix}xxx`}</code>
                  </div>
                )}
              </div>
            ) : (
              "Chọn một bài học để quản lý câu hỏi."
            )}
          </DialogDescription>
        </DialogHeader>

        {!isSupportedType && (
          <div className="rounded-md border border-dashed border-yellow-400 bg-yellow-50 p-4 text-sm text-yellow-900">
            Tính năng này hiện chỉ hỗ trợ bài đọc và bài nghe.
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] overflow-hidden">
          <ScrollArea className="h-[60vh] pr-2">
          <div className="space-y-4 pr-2">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold">Thêm câu hỏi mới</h3>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={resetForm} disabled={mutating}>
                  Đặt lại
                </Button>
                <Button variant="outline" size="sm" onClick={refreshQuestions} disabled={loading}>
                  <RefreshCw className="mr-1 h-4 w-4" />
                  Tải lại
                </Button>
              </div>
            </div>
            <form className="space-y-4" onSubmit={onSubmit}>
              <div className="space-y-2">
                <Label htmlFor="noiDungCauHoi">Nội dung câu hỏi</Label>
                  <Textarea
                    id="noiDungCauHoi"
                    rows={4}
                    placeholder="Nhập nội dung câu hỏi..."
                    {...register("noiDungCauHoi", { required: true })}
                    disabled={!isSupportedType || mutating}
                  />
                {errors.noiDungCauHoi && <p className="text-xs text-red-500">Nội dung câu hỏi là bắt buộc.</p>}
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="diem">Điểm</Label>
                  <Input
                    id="diem"
                    type="number"
                    min={1}
                    max={100}
                    {...register("diem", { valueAsNumber: true, min: 1 })}
                    disabled={!isSupportedType || mutating}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="thuTu">Thứ tự hiển thị (tùy chọn)</Label>
                  <Input
                    id="thuTu"
                    type="number"
                    min={1}
                    {...register("thuTuHienThi", { valueAsNumber: true, min: 1 })}
                    disabled={!isSupportedType || mutating}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="giaiThich">Giải thích (tùy chọn)</Label>
                <Textarea
                  id="giaiThich"
                  rows={3}
                  placeholder="Giải thích hoặc ghi chú thêm..."
                  {...register("giaiThich")}
                  disabled={!isSupportedType || mutating}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold">Đáp án ({fields.length})</h4>
                <Button type="button" variant="outline" size="sm" onClick={handleAddAnswer} disabled={!isSupportedType || mutating}>
                  <Plus className="mr-1 h-4 w-4" /> Thêm đáp án
                </Button>
              </div>

              <div className="space-y-3">
                {fields.map((field, index) => {
                  const letter = String.fromCharCode(65 + index);
                  const answer = answerValues[index];
                  return (
                    <div key={field.id} className="rounded-lg border border-slate-200 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <Badge variant="secondary">{letter}</Badge>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Switch
                            checked={!!answer?.laDapAnDung}
                            onCheckedChange={() => enforceSingleCorrect(index)}
                            disabled={!isSupportedType || mutating}
                          />
                          <span>Đáp án đúng</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveAnswer(index)}
                          disabled={!isSupportedType || mutating}
                          title="Xóa đáp án"
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                      <div className="mt-3 space-y-2">
                        <Textarea
                          rows={2}
                          placeholder={`Nội dung đáp án ${letter}`}
                          {...register(`answers.${index}.noiDungDapAn` as const)}
                          disabled={!isSupportedType || mutating}
                        />
                        <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground">
                          <label className="flex items-center gap-2">
                            <span>Thứ tự</span>
                            <Input
                              type="number"
                              min={1}
                              {...register(`answers.${index}.thuTuHienThi` as const, { valueAsNumber: true, min: 1 })}
                              disabled={!isSupportedType || mutating}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={!isSupportedType || mutating}>
                  {mutating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Lưu câu hỏi
                </Button>
              </div>
            </form>
          </div>
          </ScrollArea>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold">Danh sách câu hỏi ({questions.length})</h3>
              {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <ScrollArea className="h-[60vh] rounded-lg border border-slate-200">
              <div className="divide-y">
                {questions.length === 0 && !loading && (
                  <p className="p-4 text-sm text-muted-foreground">Chưa có câu hỏi nào cho nội dung này.</p>
                )}
                {questions.map((q, idx) => (
                  <div key={q.maCauHoi} className="space-y-2 p-4 hover:bg-slate-50">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold">Câu {idx + 1}</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-2">
                          <span>Điểm: {q.diem ?? 1}</span>
                          {q.maCauHoi && <span className="font-mono text-muted-foreground/80">{q.maCauHoi}</span>}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditQuestion(q)}
                          disabled={mutating}
                          title="Chỉnh sửa câu hỏi"
                        >
                          <Edit className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteQuestion(q.maCauHoi)}
                          disabled={mutating}
                          title="Xóa câu hỏi"
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-foreground">{q.noiDungCauHoi}</p>
                    <ul className="space-y-1 text-xs text-muted-foreground">
                      {(q.dapAns || []).map((ans) => (
                        <li key={ans.maDapAn} className="flex items-center gap-2">
                          <Badge variant={ans.laDapAnDung ? "default" : "outline"} className="text-[11px]">
                            {ans.nhanDapAn}
                          </Badge>
                          <span className="text-slate-700">{ans.noiDungDapAn}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

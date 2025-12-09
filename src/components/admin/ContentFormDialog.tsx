import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { LessonContentType, LessonItem, LoTrinhItem } from "@/services/api";

const listeningDetailsSchema = z.object({
  tieuDe: z.string().min(5, "Tiêu đề đoạn nghe phải có ít nhất 5 ký tự"),
  doKho: z.string().optional(),
  duongDanAudio: z.string().url("Đường dẫn audio không hợp lệ").or(z.string().min(1)).optional(),
  banGhiAm: z.string().optional(),
});

const readingDetailsSchema = z.object({
  tieuDe: z.string().min(5, "Tiêu đề bài đọc phải có ít nhất 5 ký tự"),
  doKho: z.string().optional(),
  duongDanFileTxt: z.string().url("Đường dẫn nội dung không hợp lệ").or(z.string().min(1)).optional(),
  noiDung: z.string().optional(),
});

const writingDetailsSchema = z
  .object({
    tieuDe: z.string().min(5, "Tiêu đề bài viết phải có ít nhất 5 ký tự"),
    deBai: z.string().min(10, "Đề bài phải có ít nhất 10 ký tự"),
    baiMau: z.string().optional(),
    soTuToiThieu: z
      .number({ invalid_type_error: "Số từ tối thiểu phải là số" })
      .min(0, "Số từ tối thiểu không được âm")
      .optional(),
    soTuToiDa: z
      .number({ invalid_type_error: "Số từ tối đa phải là số" })
      .min(0, "Số từ tối đa không được âm")
      .optional(),
  })
  .superRefine((val, ctx) => {
    if (
      typeof val.soTuToiThieu === "number" &&
      typeof val.soTuToiDa === "number" &&
      val.soTuToiDa < val.soTuToiThieu
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Số từ tối đa phải lớn hơn hoặc bằng số từ tối thiểu",
        path: ["soTuToiDa"],
      });
    }
  });

const lessonSchema = z
  .object({
    maLoTrinh: z.string().min(1, "Vui lòng chọn lộ trình"),
    tenBai: z.string().min(5, "Tiêu đề phải có ít nhất 5 ký tự"),
    moTa: z.string().optional(),
    thoiLuongPhut: z
      .number({ invalid_type_error: "Thời lượng phải là số" })
      .min(1, "Thời lượng tối thiểu 1 phút"),
    soThuTu: z
      .number({ invalid_type_error: "Thứ tự phải là số" })
      .min(1, "Thứ tự phải lớn hơn 0")
      .optional(),
    types: z
      .array(z.enum(["listening", "reading", "writing"]))
      .min(1, "Chọn ít nhất một loại nội dung"),
    listening: listeningDetailsSchema.optional(),
    reading: readingDetailsSchema.optional(),
    writing: writingDetailsSchema.optional(),
  })
  .superRefine((data, ctx) => {
    const ensure = <T,>(schema: z.ZodType<T>, value: unknown, path: string) => {
      const result = schema.safeParse(value);
      if (!result.success) {
        result.error.issues.forEach((issue) =>
          ctx.addIssue({
            code: issue.code,
            message: issue.message,
            path: [path, ...(issue.path ?? [])],
          })
        );
      }
    };
    const hasType = (type: LessonContentType) => data.types.includes(type);

    if (hasType("listening")) {
      ensure(listeningDetailsSchema, data.listening, "listening");
    }
    if (hasType("reading")) {
      ensure(readingDetailsSchema, data.reading, "reading");
    }
    if (hasType("writing")) {
      ensure(writingDetailsSchema, data.writing, "writing");
    }
  });

const assessmentSchema = z.object({
  title: z.string().min(5, "Tiêu đề phải có ít nhất 5 ký tự"),
  level: z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]),
  description: z.string().min(10, "Mô tả phải có ít nhất 10 ký tự"),
  duration: z.string().min(1, "Thời lượng không được để trống"),
  totalQuestions: z.number().min(1, "Tổng số câu hỏi phải lớn hơn 0"),
  passingScore: z.number().min(1, "Điểm đạt phải lớn hơn 0"),
  status: z.enum(["active", "inactive"]),
});

type AssessmentFormData = z.infer<typeof assessmentSchema>;
type LessonFormData = z.infer<typeof lessonSchema>;

const contentCodePrefixes: Record<LessonContentType, string> = {
  listening: "BN",
  reading: "BD",
  writing: "BV",
};

const questionCodePrefixes: Partial<Record<LessonContentType, string>> = {
  listening: "CHN",
  reading: "CHD",
};

const typeCodeLabels: Record<LessonContentType, string> = {
  listening: "Mã bài nghe",
  reading: "Mã bài đọc",
  writing: "Mã bài viết",
};
const CONTENT_TYPE_ORDER: LessonContentType[] = ["reading", "listening", "writing"];
const contentTypeOptions: { value: LessonContentType; label: string }[] = [
  { value: "reading", label: "Đọc" },
  { value: "listening", label: "Nghe" },
  { value: "writing", label: "Viết" },
];

const determineLessonTypes = (lesson?: LessonItem): LessonContentType[] => {
  const types: LessonContentType[] = [];
  if (lesson?.baiDocs?.length) types.push("reading");
  if (lesson?.baiNghes?.length) types.push("listening");
  if (lesson?.baiViets?.length) types.push("writing");
  if (!types.length) types.push("reading");
  return types;
};

const collectLessonCodes = (lesson?: LessonItem | null) => {
  if (!lesson) return [] as string[];
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

const buildLessonDefaults = (
  lesson: LessonItem | undefined,
  roadmaps: LoTrinhItem[]
): LessonFormData => {
  const fallbackLoTrinh = lesson?.maLoTrinh || roadmaps[0]?.maLoTrinh || "";
  const types = determineLessonTypes(lesson);
  const defaults: LessonFormData = {
    maLoTrinh: fallbackLoTrinh,
    tenBai: lesson?.tenBai ?? "",
    moTa: lesson?.moTa ?? "",
    thoiLuongPhut: lesson?.thoiLuongPhut ?? 30,
    soThuTu: lesson?.soThuTu,
    types,
    listening: undefined,
    reading: undefined,
    writing: undefined,
  };

  const listening = lesson?.baiNghes?.[0];
  if (listening) {
    defaults.listening = {
      tieuDe: listening.tieuDe ?? lesson?.tenBai ?? "",
      doKho: listening.doKho ?? undefined,
      duongDanAudio: listening.duongDanAudio ?? undefined,
      banGhiAm: listening.banGhiAm ?? undefined,
    };
  }

  const reading = lesson?.baiDocs?.[0];
  if (reading) {
    defaults.reading = {
      tieuDe: reading.tieuDe ?? lesson?.tenBai ?? "",
      doKho: reading.doKho ?? undefined,
      duongDanFileTxt: reading.duongDanFileTxt ?? undefined,
      noiDung: reading.noiDung ?? undefined,
    };
  }

  const writing = lesson?.baiViets?.[0];
  if (writing) {
    defaults.writing = {
      tieuDe: writing.tieuDe ?? lesson?.tenBai ?? "",
      deBai: writing.deBai ?? lesson?.moTa ?? "",
      baiMau: writing.baiMau ?? undefined,
      soTuToiThieu: writing.soTuToiThieu ?? undefined,
      soTuToiDa: writing.soTuToiDa ?? undefined,
    };
  }

  return defaults;
};

interface ContentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "lesson" | "assessment";
  content?: any;
  onSubmit: (data: any) => Promise<void> | void;
  roadmaps: LoTrinhItem[];
  isSubmitting?: boolean;
}

export function ContentFormDialog({ 
  open, 
  onOpenChange, 
  type, 
  content, 
  onSubmit,
  roadmaps,
  isSubmitting = false,
}: ContentFormDialogProps) {
  const isEditing = !!content;
  const isLesson = type === "lesson";

  const lessonDefaults = useMemo(
    () => (isLesson ? buildLessonDefaults(content as LessonItem | undefined, roadmaps) : undefined),
    [content, roadmaps, isLesson]
  );

  const form = useForm({
    resolver: zodResolver(isLesson ? lessonSchema : assessmentSchema),
    defaultValues: isLesson
      ? lessonDefaults
      : {
          title: content?.title || "",
          level: content?.level || "A1",
          description: content?.description || "",
          duration: content?.duration || "",
          totalQuestions: content?.totalQuestions || 50,
          passingScore: content?.passingScore || 600,
          status: content?.status || "active",
        },
  });

  const selectedTypes = isLesson ? ((form.watch("types") as LessonContentType[] | undefined) ?? []) : [];
  const lessonCodeLines = isLesson ? collectLessonCodes(content as LessonItem | undefined) : [];
  const readingCodes = (content as LessonItem | undefined)?.baiDocs?.map((d) => d.maBaiDoc).filter(Boolean) ?? [];
  const listeningCodes = (content as LessonItem | undefined)?.baiNghes?.map((d) => d.maBaiNghe).filter(Boolean) ?? [];
  const writingCodes = (content as LessonItem | undefined)?.baiViets?.map((d) => d.maBaiViet).filter(Boolean) ?? [];
  const typeToCodes: Record<LessonContentType, string[]> = {
    reading: readingCodes,
    listening: listeningCodes,
    writing: writingCodes,
  };

  useEffect(() => {
    if (isLesson && lessonDefaults) {
      form.reset(lessonDefaults);
    }
  }, [isLesson, lessonDefaults, form]);

  useEffect(() => {
    if (!isLesson || !open) return;
    selectedTypes.forEach((type) => {
      if (type === "listening" && !form.getValues("listening")) {
        form.setValue("listening", {
          tieuDe: form.getValues("tenBai") ?? "",
        });
      }
      if (type === "reading" && !form.getValues("reading")) {
        form.setValue("reading", {
          tieuDe: form.getValues("tenBai") ?? "",
        });
      }
      if (type === "writing" && !form.getValues("writing")) {
        form.setValue("writing", {
          tieuDe: form.getValues("tenBai") ?? "",
          deBai: form.getValues("moTa") ?? "",
        });
      }
    });
  }, [form, isLesson, open, selectedTypes]);

  const handleSubmit = async (data: any) => {
    await Promise.resolve(onSubmit(data));
    form.reset();
    onOpenChange(false);
  };

  const renderLessonFields = (lessonTypes: LessonContentType[]) => {
    const hasRoadmaps = roadmaps.length > 0;

    return (
      <>
        <FormField
          control={form.control}
          name="maLoTrinh"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lộ trình</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!hasRoadmaps}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={hasRoadmaps ? "Chọn lộ trình" : "Chưa có lộ trình"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {roadmaps.map((roadmap) => (
                    <SelectItem key={roadmap.maLoTrinh} value={roadmap.maLoTrinh}>
                      {roadmap.tenLoTrinh}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tenBai"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tiêu đề bài học</FormLabel>
              <FormControl>
                <Input placeholder="Nhập tiêu đề..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="moTa"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mô tả</FormLabel>
              <FormControl>
                <Textarea placeholder="Nhập mô tả chi tiết..." className="resize-none" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="thoiLuongPhut"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Thời lượng (phút)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="30"
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="soThuTu"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Thứ tự</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="1"
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="types"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Loại nội dung</FormLabel>
              <div className="space-y-2">
                {contentTypeOptions.map((option) => {
                  const valueArray = (field.value as LessonContentType[] | undefined) ?? [];
                  const isChecked = valueArray.includes(option.value);
                  return (
                    <div
                      key={option.value}
                      className="flex items-center gap-2 rounded-md border border-dashed px-3 py-2"
                    >
                      <Checkbox
                        id={`type-${option.value}`}
                        checked={isChecked}
                        onCheckedChange={(checked) => {
                          const current = (field.value as LessonContentType[] | undefined) ?? [];
                          const isAdding = checked === true;
                          const next = isAdding
                            ? [...current, option.value]
                            : current.filter((val) => val !== option.value);
                          const ordered = Array.from(new Set(next)).sort(
                            (a, b) => CONTENT_TYPE_ORDER.indexOf(a) - CONTENT_TYPE_ORDER.indexOf(b)
                          );
                          field.onChange(ordered);
                        }}
                      />
                      <label htmlFor={`type-${option.value}`} className="text-sm font-medium leading-none">
                        {option.label}
                      </label>
                    </div>
                  );
                })}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {lessonTypes.includes("listening") && (
          <div className="space-y-4 rounded-lg border p-4">
            <FormField
              control={form.control}
              name="listening.tieuDe"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tiêu đề đoạn nghe</FormLabel>
                  <FormControl>
                    <Input placeholder="VD: TOEIC Listening Part 1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="listening.doKho"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Độ khó</FormLabel>
                  <FormControl>
                    <Input placeholder="VD: A1, A2..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="listening.duongDanAudio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Đường dẫn audio</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="listening.banGhiAm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transcript</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Nhập transcript nếu có" className="resize-none" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {lessonTypes.includes("reading") && (
          <div className="space-y-4 rounded-lg border p-4">
            <FormField
              control={form.control}
              name="reading.tieuDe"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tiêu đề bài đọc</FormLabel>
                  <FormControl>
                    <Input placeholder="VD: TOEIC Reading Part 5" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="reading.doKho"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Độ khó</FormLabel>
                  <FormControl>
                    <Input placeholder="VD: Trung bình" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="reading.duongDanFileTxt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Đường dẫn nội dung</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="reading.noiDung"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nội dung tóm tắt</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Nhập mô tả ngắn" className="resize-none" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {lessonTypes.includes("writing") && (
          <div className="space-y-4 rounded-lg border p-4">
            <FormField
              control={form.control}
              name="writing.tieuDe"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tiêu đề bài viết</FormLabel>
                  <FormControl>
                    <Input placeholder="VD: TOEIC Writing Task" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="writing.deBai"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Đề bài</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Nhập đề bài chi tiết" className="resize-none" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="writing.baiMau"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bài mẫu (tuỳ chọn)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Nhập bài mẫu nếu có" className="resize-none" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="writing.soTuToiThieu"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số từ tối thiểu</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="100"
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="writing.soTuToiDa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số từ tối đa</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="200"
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing 
              ? `Chỉnh sửa ${isLesson ? 'bài học' : 'đề thi'}` 
              : `Thêm ${isLesson ? 'bài học' : 'đề thi'} mới`
            }
          </DialogTitle>
        </DialogHeader>

        {isLesson && (
          <div className="rounded-md border border-dashed bg-muted/50 p-3 text-xs text-muted-foreground space-y-1">
            <div>
              <span className="font-semibold text-foreground">Mã bài học:</span>{" "}
              {content?.maBai ? <code>{content.maBai}</code> : <span>Tự sinh dạng <code>BHxxx</code> sau khi lưu</span>}
            </div>
            {selectedTypes.length > 0 && (
              <div className="space-y-1">
                {selectedTypes.map((type) => {
                  const codes = typeToCodes[type] ?? [];
                  const prefix = contentCodePrefixes[type];
                  const questionPrefix = questionCodePrefixes[type];
                  return (
                    <div key={`type-meta-${type}`} className="space-y-0.5">
                      <div>
                        <span className="font-semibold text-foreground">{typeCodeLabels[type]}:</span>{" "}
                        {codes.length > 0 ? (
                          <code>{codes.join(", ")}</code>
                        ) : (
                          <span>
                            {`Tự sinh dạng `}
                            <code>{prefix}xxx</code>
                            {` sau khi lưu`}
                          </span>
                        )}
                      </div>
                      {questionPrefix && (
                        <div className="pl-4 text-muted-foreground">
                          Mã câu hỏi tương ứng: <code>{questionPrefix}xxx</code>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            {lessonCodeLines.length > 1 && (
              <div className="flex flex-wrap gap-2 pt-1 text-[11px]">
                {lessonCodeLines.map((line) => (
                  <span key={`lesson-code-${line}`} className="font-mono text-muted-foreground/80">
                    {line}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {isLesson ? (
              renderLessonFields(selectedTypes)
            ) : (
              <>
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tiêu đề</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập tiêu đề..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cấp độ</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn cấp độ" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="A1">A1 - Sơ cấp</SelectItem>
                          <SelectItem value="A2">A2 - Cơ bản</SelectItem>
                          <SelectItem value="B1">B1 - Trung cấp</SelectItem>
                          <SelectItem value="B2">B2 - Trung cấp cao</SelectItem>
                          <SelectItem value="C1">C1 - Nâng cao</SelectItem>
                          <SelectItem value="C2">C2 - Thành thạo</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mô tả</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Nhập mô tả chi tiết..." className="resize-none" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Thời lượng</FormLabel>
                        <FormControl>
                          <Input placeholder="VD: 30 phút" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="totalQuestions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tổng số câu hỏi</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="50"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="passingScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Điểm đạt</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="600"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trạng thái</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn trạng thái" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Hoạt động</SelectItem>
                          <SelectItem value="inactive">Không hoạt động</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Đang lưu..." : isEditing ? "Cập nhật" : "Tạo mới"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
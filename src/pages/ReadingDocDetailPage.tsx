import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiService, type ReadingDocDetailResponse, type CauHoiItem } from "@/services/api";

function extractYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return u.pathname.slice(1);
    if (u.hostname.includes("youtube.com")) return u.searchParams.get("v");
    return null;
  } catch {
    return null;
  }
}

const ReadingDocDetailPage = () => {
  const { maBaiDoc } = useParams();
  const [data, setData] = useState<ReadingDocDetailResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const run = async () => {
      if (!maBaiDoc) return;
      try {
        setLoading(true);
        setError(null);
        const res = await apiService.getReadingDocDetail(maBaiDoc);
        setData(res);
      } catch (e: any) {
        setError(e?.message || "Không thể tải nội dung bài đọc.");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [maBaiDoc]);

  const ytId = useMemo(() => data ? extractYouTubeId(data.duongDanFileTxt) : null, [data]);

  const onSelect = (maCauHoi: string, nhanDapAn: string) => {
    setAnswers(prev => ({ ...prev, [maCauHoi]: nhanDapAn }));
  };

  const score = useMemo(() => {
    if (!data) return 0;
    let s = 0;
    data.cauHois.forEach((q) => {
      const ans = answers[q.maCauHoi];
      const correct = q.dapAns.find(d => d.laDapAnDung)?.nhanDapAn;
      if (ans && correct && ans === correct) s += (q.diem || 1);
    });
    return s;
  }, [answers, data]);

  if (loading) return <div className="p-6">Đang tải...</div>;
  if (error) return <div className="p-6 text-destructive">{error}</div>;
  if (!data) return null;

  return (
    <div className="container mx-auto max-w-5xl py-8 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">{data.tieuDe.trim()}</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="outline">{data.doKho || 'Mức độ'}</Badge>
          <span>{new Date(data.ngayTao).toLocaleDateString()}</span>
        </div>
      </div>

      {ytId && (
        <div className="aspect-video w-full overflow-hidden rounded-lg border">
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${ytId}`}
            title="YouTube video player"
            frameBorder={0}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Câu hỏi</CardTitle>
          <CardDescription>
            Tổng {data.tongCauHoi} câu. Chọn đáp án đúng cho mỗi câu.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.cauHois.sort((a,b)=>a.thuTuHienThi-b.thuTuHienThi).map((q: CauHoiItem) => (
            <div key={q.maCauHoi} className="p-4 border rounded-lg space-y-3">
              <div className="font-medium">{q.thuTuHienThi}. {q.noiDungCauHoi}</div>
              <div className="grid sm:grid-cols-2 gap-2">
                {q.dapAns.sort((a,b)=>a.thuTuHienThi-b.thuTuHienThi).map((a) => {
                  const selected = answers[q.maCauHoi] === a.nhanDapAn;
                  const isCorrect = submitted && a.laDapAnDung;
                  const isWrong = submitted && selected && !a.laDapAnDung;
                  return (
                    <button
                      key={a.maDapAn}
                      className={`text-left p-3 rounded border transition ${selected ? 'border-blue-500' : ''} ${isCorrect ? 'bg-green-50 border-green-400' : ''} ${isWrong ? 'bg-red-50 border-red-400' : ''}`}
                      onClick={() => !submitted && onSelect(q.maCauHoi, a.nhanDapAn)}
                    >
                      <span className="font-medium mr-2">{a.nhanDapAn}.</span>{a.noiDungDapAn}
                    </button>
                  );
                })}
              </div>
              {submitted && q.giaiThich && (
                <div className="text-sm text-muted-foreground">Giải thích: {q.giaiThich}</div>
              )}
            </div>
          ))}
          <div className="flex items-center justify-between pt-2">
            {!submitted ? (
              <Button onClick={() => setSubmitted(true)}>Nộp bài</Button>
            ) : (
              <div className="text-green-700 font-medium">Điểm của bạn: {score}</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReadingDocDetailPage;

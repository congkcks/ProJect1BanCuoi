import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Headphones, ArrowRight, FileText, CheckCircle } from "lucide-react";
import { apiService, type LessonDetailResponse, type BaiDocItem, type BaiNgheItem } from "@/services/api";

const LessonOverviewPage = () => {
  const { maBai } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<LessonDetailResponse["data"] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [baiDocsWithStatus, setBaiDocsWithStatus] = useState<Array<BaiDocItem & { daHoanThanh?: boolean }>>([]);
  const [baiNghesWithStatus, setBaiNghesWithStatus] = useState<Array<BaiNgheItem & { daHoanThanh?: boolean }>>([]);

  useEffect(() => {
    const run = async () => {
      if (!maBai) return;
      try {
        setLoading(true);
        setError(null);
        
        // Check if user is authenticated
        const isAuth = apiService.isAuthenticated();
        setIsAuthenticated(isAuth);

        // Try to get authenticated data first if user is logged in
        let lessonData: any = null;
        if (isAuth) {
          try {
            lessonData = await apiService.getLessonDetailWithStatus(maBai);
            console.log('Authenticated lesson data:', lessonData);
          } catch (e: any) {
            console.warn('Failed to load authenticated lesson data, falling back to public:', e);
            lessonData = null;
          }
        }

        // Fallback to public data if not authenticated or authenticated call failed
        if (!lessonData) {
          const res = await apiService.getLessonDetail(maBai);
          lessonData = res.data;
          console.log('Public lesson data:', lessonData);
        }

        // Ensure we have the lesson info from baiHoc if not at top level
        const lessonInfo = lessonData?.baiHoc || lessonData;
        setData(lessonInfo);
        
        // Set completion status for docs and listenings
        const baiDocs = lessonData?.baiDocs || lessonData?.baiDoc || [];
        const baiNghes = lessonData?.baiNghes || lessonData?.baiNghe || [];
        
        setBaiDocsWithStatus(baiDocs.map((bd: any) => ({
          ...bd,
          daHoanThanh: bd.daHoanThanh ?? false
        })));
        
        setBaiNghesWithStatus(baiNghes.map((bn: any) => ({
          ...bn,
          daHoanThanh: bn.daHoanThanh ?? false
        })));
      } catch (e: any) {
        setError(e?.message || "Không thể tải chi tiết bài học.");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [maBai]);

  if (loading) return <div className="p-6">Đang tải...</div>;
  if (error) return <div className="p-6 text-destructive">{error}</div>;
  if (!data) return <div className="p-6 text-muted-foreground">Không có dữ liệu bài học.</div>;

  const baiDocs = baiDocsWithStatus.length > 0 ? baiDocsWithStatus : data.baiDocs || [];
  const baiNghes = baiNghesWithStatus.length > 0 ? baiNghesWithStatus : data.baiNghes || [];
  const tenBai = data?.tenBai?.trim ? data.tenBai.trim() : (data?.tenBai || 'Bài học');
  const moTa = data?.moTa || '';
  const soThuTu = data?.soThuTu || 1;

  return (
    <div className="container mx-auto max-w-5xl py-8 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Ngày {soThuTu}: {tenBai}</h1>
        <p className="text-muted-foreground">{moTa}</p>
      </div>

      {/* Bỏ phần video ở trang này */}

      {baiDocs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BookOpen className="w-5 h-5"/>Bài đọc</CardTitle>
            <CardDescription>Chọn 1 bài để bắt đầu</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {baiDocs.map((bd: any) => (
              <div key={bd.maBaiDoc} className={`flex items-center justify-between p-4 rounded border transition-all ${isAuthenticated && bd.daHoanThanh ? 'bg-green-50 border-green-200' : ''}`}>
                <div>
                  <div className="font-medium flex items-center gap-2">
                    <FileText className="w-4 h-4"/>
                    {bd.tieuDe.trim()}
                    {isAuthenticated && bd.daHoanThanh && (
                      <CheckCircle className="w-4 h-4 text-green-500 ml-2" />
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">{bd.doKho || ""}</div>
                </div>
                <div className="flex items-center gap-2">
                  {isAuthenticated && bd.daHoanThanh && (
                    <Badge className="bg-green-500 text-white">Đã hoàn thành</Badge>
                  )}
                  <Badge variant="outline">{new Date(bd.ngayTao).toLocaleDateString()}</Badge>
                  {/* Navigate directly to the specific reading doc (BD id) so user lands on content immediately */}
                  <Button size="sm" onClick={() => navigate(`/lesson/reading/${bd.maBaiDoc}`)}>
                    <ArrowRight className="w-4 h-4 mr-2"/>Học ngay
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {baiNghes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Headphones className="w-5 h-5"/>Bài nghe</CardTitle>
            <CardDescription>Chọn 1 bài để bắt đầu</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {baiNghes.map((bn: any) => (
              <div key={bn.maBaiNghe} className={`flex items-center justify-between p-4 rounded border transition-all ${isAuthenticated && bn.daHoanThanh ? 'bg-green-50 border-green-200' : ''}`}>
                <div>
                  <div className="font-medium flex items-center gap-2">
                    {bn.tieuDe}
                    {isAuthenticated && bn.daHoanThanh && (
                      <CheckCircle className="w-4 h-4 text-green-500 ml-2" />
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">{bn.doKho || ""}</div>
                </div>
                <div className="flex items-center gap-2">
                  {isAuthenticated && bn.daHoanThanh && (
                    <Badge className="bg-green-500 text-white">Đã hoàn thành</Badge>
                  )}
                  <Badge variant="outline">{new Date(bn.ngayTao).toLocaleDateString()}</Badge>
                  <Button size="sm" onClick={() => navigate(`/listening-item/${bn.maBaiNghe}`)}>
                    <ArrowRight className="w-4 h-4 mr-2"/>Học ngay
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {baiDocs.length === 0 && baiNghes.length === 0 && (
        <div className="text-center text-muted-foreground">Bài học chưa có nội dung.</div>
      )}
    </div>
  );
};

export default LessonOverviewPage;

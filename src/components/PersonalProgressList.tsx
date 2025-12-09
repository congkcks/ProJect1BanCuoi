import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { apiService, TienDoHocTapItem, TienDoHocTapListResponse } from '@/services/api';

const PersonalProgressList = () => {
  const [items, setItems] = useState<TienDoHocTapItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const res: TienDoHocTapListResponse = await apiService.getAllTienDo();
      setItems(res?.data ?? []);
    } catch (e: any) {
      setError(e?.message || 'Không thể tải tiến độ.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-6 space-y-3">
          <div className="h-4 bg-muted rounded w-1/3" />
          <div className="h-4 bg-muted rounded w-2/3" />
          <div className="h-4 bg-muted rounded w-1/2" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center space-y-3">
          <p className="text-destructive text-sm">{error}</p>
          <button onClick={load} className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm">Thử lại</button>
        </CardContent>
      </Card>
    );
  }

  if (!items || items.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-sm text-muted-foreground">
          Chưa có tiến độ nào. Hãy bắt đầu học một bài nhé!
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold">Tiến độ cá nhân (dựa trên /TienDoHocTap)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((it) => {
          const percent = Math.max(0, Math.min(100, Number(it.phanTramHoanThanh ?? 0)));
          return (
            <div key={`${it.maBai}`} className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">{it.tenBai || it.maBai}</div>
                  <div className="text-xs text-muted-foreground">Lộ trình: {it.maLoTrinh}</div>
                </div>
                <Badge variant={percent >= 100 ? 'default' : 'secondary'}>
                  {it.trangThai || (percent >= 100 ? 'Hoàn thành' : 'Đang học')}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Progress value={percent} />
                <span className="text-xs w-10 text-right">{percent}%</span>
              </div>
              <div className="text-[11px] text-muted-foreground">
                Cập nhật: {it.ngayCapNhat ? new Date(it.ngayCapNhat).toLocaleString() : '—'}
                {it.ngayHoanThanh ? ` • Hoàn thành: ${new Date(it.ngayHoanThanh).toLocaleString()}` : ''}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default PersonalProgressList;

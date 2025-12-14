import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { testApi } from "@/lib/api";
import { TestCard } from "@/components/TestCard";
import { Button } from "@/components/ui/button";
import { Loader2, GraduationCap, History as HistoryIcon, List, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

const ListTestDe = () => {
    const { toast } = useToast();
    const navigate = useNavigate();

    const { data: tests, isLoading, error } = useQuery({
        queryKey: ["tests"],
        queryFn: testApi.getTestList,
    });

    if (error) {
        toast({
            title: "Error",
            description: "Failed to load tests. Please try again later.",
            variant: "destructive",
        });
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-background via-secondary/30 to-background">
            {/* Decorative background elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-20 left-10 w-72 h-72 bg-toeic-blue/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-40 right-10 w-96 h-96 bg-toeic-success/5 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-toeic-warning/5 rounded-full blur-3xl"></div>
            </div>

            {/* Header */}
            <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-gradient-hero p-2 rounded-lg shadow-lg">
                                <GraduationCap className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-toeic-navy">
                                    UTC-English
                                </h1>
                                <p className="text-xs text-muted-foreground">TOEIC Practice Platform</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Link to="/">
                                <Button variant="ghost" size="sm" className="gap-2 hover:bg-toeic-blue/10">
                                    <ArrowLeft className="h-4 w-4" />
                                    Trang chủ
                                </Button>
                            </Link>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate("/history")}
                                className="gap-2 border-border/50 hover:bg-card"
                            >
                                <HistoryIcon className="h-4 w-4" />
                                Lịch sử
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="container mx-auto px-4 py-16 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-toeic-blue/10 text-toeic-blue rounded-full text-sm font-medium mb-6">
                        <GraduationCap className="w-4 h-4" />
                        <span>Nền tảng luyện thi TOEIC hàng đầu</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold mb-4 text-toeic-navy leading-tight">
                        Chinh Phục
                        <span className="bg-gradient-to-r from-toeic-blue to-toeic-success bg-clip-text text-transparent"> TOEIC</span>
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Luyện tập với đề thi thực tế, theo dõi tiến trình chi tiết và đạt điểm mục tiêu của bạn
                    </p>
                </div>

                {/* Tests Grid */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center space-y-4">
                            <Loader2 className="h-12 w-12 animate-spin text-toeic-blue mx-auto" />
                            <p className="text-muted-foreground">Đang tải các đề thi...</p>
                        </div>
                    </div>
                ) : tests && tests.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
                        {tests.map((test) => (
                            <TestCard key={test.testId} test={test} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <p className="text-muted-foreground text-lg">Không có đề thi nào</p>
                    </div>
                )}
            </section>

            {/* Stats Section */}
            <section className="container mx-auto px-4 py-16 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                    <div className="bg-gradient-to-br from-toeic-blue/10 to-transparent border border-toeic-blue/20 rounded-2xl p-8 text-center backdrop-blur-sm">
                        <div className="text-3xl font-bold text-toeic-blue mb-2">1000+</div>
                        <p className="text-muted-foreground">Câu hỏi thực tế</p>
                    </div>
                    <div className="bg-gradient-to-br from-toeic-success/10 to-transparent border border-toeic-success/20 rounded-2xl p-8 text-center backdrop-blur-sm">
                        <div className="text-3xl font-bold text-toeic-success mb-2">50K+</div>
                        <p className="text-muted-foreground">Học viên thành công</p>
                    </div>
                    <div className="bg-gradient-to-br from-toeic-warning/10 to-transparent border border-toeic-warning/20 rounded-2xl p-8 text-center backdrop-blur-sm">
                        <div className="text-3xl font-bold text-toeic-warning mb-2">95%</div>
                        <p className="text-muted-foreground">Tỷ lệ đạt mục tiêu</p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-border/50 mt-20 bg-card/30 backdrop-blur-sm relative z-10">
                <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
                    <p>&copy; 2024 UTC EngLish. Practice makes perfect.</p>
                </div>
            </footer>
        </div>
    );
};

export default ListTestDe;

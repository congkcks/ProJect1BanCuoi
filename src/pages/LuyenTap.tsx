import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Headphones,
    MessageCircle,
    BookOpen,
    FileText,
    BookMarked,
    BookText,
    ClipboardList,
    Video,
    TrendingUp,
    ExternalLink,
    Sparkles,
    Target,
    Zap,
    GraduationCap,
    ArrowLeft
} from "lucide-react";

interface FeatureCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    path: string;
    external?: boolean;
    gradient: string;
    iconBg: string;
}

const FeatureCard = ({ title, description, icon, path, external, gradient, iconBg }: FeatureCardProps) => {
    const content = (
        <Card className={`relative overflow-hidden p-6 h-full hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer border-0 ${gradient}`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12" />

            <div className="relative flex flex-col h-full space-y-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${iconBg} shadow-lg`}>
                    {icon}
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-bold text-white">{title}</h3>
                        {external && <ExternalLink className="w-4 h-4 text-white/70" />}
                    </div>
                    <p className="text-white/80 text-sm leading-relaxed">{description}</p>
                </div>
                <div className="flex items-center gap-2 text-white/90 text-sm font-medium group-hover:gap-3 transition-all">
                    <span>Bắt đầu ngay</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
            </div>
        </Card>
    );

    if (external) {
        return (
            <a href={path} target="_blank" rel="noopener noreferrer" className="group block">
                {content}
            </a>
        );
    }

    return (
        <Link to={path} className="group block">
            {content}
        </Link>
    );
};

const LuyenTap = () => {
    const features: FeatureCardProps[] = [
        {
            title: "Bài Viết",
            description: "Tạo bài viết với AI hỗ trợ, luyện kỹ năng viết theo chủ đề",
            icon: <FileText className="w-7 h-7 text-white" />,
            path: "/create-lesson",
            gradient: "bg-gradient-to-br from-emerald-500 to-teal-600",
            iconBg: "bg-white/20"
        },
        {
            title: "Bài Nghe",
            description: "Luyện nghe với audio chất lượng, transcript và dịch nghĩa chi tiết",
            icon: <Headphones className="w-7 h-7 text-white" />,
            path: "/listening-practice",
            gradient: "bg-gradient-to-br from-blue-500 to-indigo-600",
            iconBg: "bg-white/20"
        },
        {
            title: "Nghe Video",
            description: "Học tiếng Anh qua video thực tế, phụ đề song ngữ",
            icon: <Video className="w-7 h-7 text-white" />,
            path: "https://congkcks.github.io/listen-learn-english/",
            external: true,
            gradient: "bg-gradient-to-br from-rose-500 to-pink-600",
            iconBg: "bg-white/20"
        },
        {
            title: "Luyện Đọc",
            description: "Đọc hiểu với các bài đọc đa dạng, từ vựng được highlight",
            icon: <BookText className="w-7 h-7 text-white" />,
            path: "/reading-config",
            gradient: "bg-gradient-to-br from-amber-500 to-orange-600",
            iconBg: "bg-white/20"
        },
        {
            title: "Đề Thi TOEIC",
            description: "Luyện đề TOEIC thực tế với đầy đủ các phần thi",
            icon: <ClipboardList className="w-7 h-7 text-white" />,
            path: "/toeic-tests",
            gradient: "bg-gradient-to-br from-violet-500 to-purple-600",
            iconBg: "bg-white/20"
        },
        {
            title: "Từ Vựng",
            description: "Flashcard thông minh, học từ vựng hiệu quả với spaced repetition",
            icon: <BookMarked className="w-7 h-7 text-white" />,
            path: "/luyentu",
            external: false,
            gradient: "bg-gradient-to-br from-cyan-500 to-blue-600",
            iconBg: "bg-white/20"
        },
        {
            title: "Hội Thoại",
            description: "Luyện nói với AI, thực hành giao tiếp theo tình huống thực tế",
            icon: <MessageCircle className="w-7 h-7 text-white" />,
            path: "/topics",
            external: false,
            gradient: "bg-gradient-to-br from-fuchsia-500 to-pink-600",
            iconBg: "bg-white/20"
        },
        {
            title: "Ngữ Pháp",
            description: "Bài tập ngữ pháp tương tác, giải thích chi tiết từng lỗi sai",
            icon: <BookOpen className="w-7 h-7 text-white" />,
            path: "/grammar-practice",
            gradient: "bg-gradient-to-br from-lime-500 to-green-600",
            iconBg: "bg-white/20"
        },
        {
            title: "Luyện Đề",
            description: "Bộ đề tổng hợp giúp ôn luyện toàn diện các kỹ năng",
            icon: <TrendingUp className="w-7 h-7 text-white" />,
            path: "/test-list",
            gradient: "bg-gradient-to-br from-slate-600 to-slate-800",
            iconBg: "bg-white/20"
        },
    ];

    const highlights = [
        {
            icon: <Sparkles className="w-8 h-8 text-primary" />,
            title: "AI Thông Minh",
            description: "Công nghệ AI tiên tiến hỗ trợ học tập cá nhân hóa"
        },
        {
            icon: <Target className="w-8 h-8 text-primary" />,
            title: "Mục Tiêu Rõ Ràng",
            description: "Lộ trình học tập được thiết kế theo chuẩn quốc tế"
        },
        {
            icon: <Zap className="w-8 h-8 text-primary" />,
            title: "Học Mọi Lúc",
            description: "Truy cập không giới hạn, học bất cứ khi nào bạn muốn"
        },
        {
            icon: <GraduationCap className="w-8 h-8 text-primary" />,
            title: "Kết Quả Thực Tế",
            description: "Phương pháp đã giúp hàng nghìn học viên đạt điểm cao"
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-background via-secondary/30 to-background">
            {/* Back to Home Button */}
            <div className="container mx-auto px-6 py-4">
                <Link to="/">
                    <Button variant="ghost" className="gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        Quay lại trang chủ
                    </Button>
                </Link>
            </div>

            {/* Hero Section */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-purple/5" />
                <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
                <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple/10 rounded-full blur-3xl" />

                <div className="container mx-auto px-6 py-16 relative">
                    <div className="text-center max-w-4xl mx-auto mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-6">
                            <Sparkles className="w-4 h-4" />
                            <span>Nền tảng học tiếng Anh #1 cho người Việt</span>
                        </div>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                            Chinh phục tiếng Anh cùng{" "}
                            <span className="bg-gradient-to-r from-primary via-info to-purple bg-clip-text text-transparent">
                                UTC-EngLish
                            </span>
                        </h1>

                        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                            Hệ thống học tập toàn diện với AI thông minh, giúp bạn nâng cao 4 kỹ năng Nghe - Nói - Đọc - Viết một cách hiệu quả nhất
                        </p>

                        <div className="flex flex-wrap justify-center gap-4">
                            <Link to="/listening-practice">
                                <Button size="lg" className="gap-2 px-8 shadow-lg shadow-primary/25">
                                    <Headphones className="w-5 h-5" />
                                    Bắt đầu học ngay
                                </Button>
                            </Link>
                            <Link to="/toeic-tests">
                                <Button size="lg" variant="outline" className="gap-2 px-8">
                                    <ClipboardList className="w-5 h-5" />
                                    Luyện đề TOEIC
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Grid */}
            <div className="container mx-auto px-6 py-12">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold mb-4">Khám phá các tính năng</h2>
                    <p className="text-muted-foreground max-w-xl mx-auto">
                        Đầy đủ công cụ giúp bạn học tiếng Anh hiệu quả, từ cơ bản đến nâng cao
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    {features.map((feature, index) => (
                        <FeatureCard key={index} {...feature} />
                    ))}
                </div>
            </div>

            {/* Highlights Section */}
            <div className="container mx-auto px-6 py-16">
                <div className="bg-gradient-to-br from-card to-secondary/50 rounded-3xl p-8 md:p-12 border border-border/50 shadow-xl">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">Tại sao chọn UTC-EngLish?</h2>
                        <p className="text-muted-foreground max-w-xl mx-auto">
                            Chúng tôi mang đến trải nghiệm học tập tốt nhất cho bạn
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {highlights.map((item, index) => (
                            <div key={index} className="text-center group">
                                <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
                                    {item.icon}
                                </div>
                                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                                <p className="text-muted-foreground text-sm">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="container mx-auto px-6 py-16">
                <div className="relative overflow-hidden bg-gradient-to-r from-primary to-info rounded-3xl p-8 md:p-12 text-center">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-30" />

                    <div className="relative">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            Sẵn sàng nâng cao trình độ tiếng Anh?
                        </h2>
                        <p className="text-white/90 text-lg mb-8 max-w-xl mx-auto">
                            Bắt đầu hành trình học tập của bạn ngay hôm nay với hàng trăm bài học và bài tập thực hành
                        </p>
                        <Link to="/create-lesson">
                            <Button size="lg" variant="secondary" className="gap-2 px-8 shadow-lg">
                                <FileText className="w-5 h-5" />
                                Tạo bài học đầu tiên
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="container mx-auto px-6 py-8 border-t border-border/50">
                <div className="flex flex-col items-center justify-center gap-4">
                    <div className="text-center text-muted-foreground text-sm">
                        <p>© 2024 UTC-EngLish. Được phát triển với ❤️ cho cộng đồng học tiếng Anh Việt Nam</p>
                    </div>
                    <Link to="/">
                        <Button variant="outline" className="gap-2">
                            <ArrowLeft className="w-4 h-4" />
                            Quay lại trang chủ
                        </Button>
                    </Link>
                </div>
            </footer>
        </div>
    );
};

export default LuyenTap;
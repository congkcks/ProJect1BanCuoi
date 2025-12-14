import { useQuery } from "@tanstack/react-query";
import { fetchFlashcardGroups } from "@/lib/luyentuvung";
import { GroupCard } from "@/components/GroupCard";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, GraduationCap, Target, MessageSquare, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const LuyenTuVung = () => {
    const { data: groups, isLoading } = useQuery({
        queryKey: ["flashcard-groups"],
        queryFn: fetchFlashcardGroups,
    });

    const groupedByType = groups?.reduce((acc, group) => {
        if (!acc[group.type]) acc[group.type] = [];
        acc[group.type].push(group);
        return acc;
    }, {} as Record<string, typeof groups>);

    const typeConfig = {
        CEFR: { title: "CEFR Levels", icon: GraduationCap, color: "text-toeic-blue", bg: "bg-gradient-to-br from-toeic-blue/10 to-transparent" },
        COMMON: { title: "Common Vocabulary", icon: BookOpen, color: "text-toeic-success", bg: "bg-gradient-to-br from-toeic-success/10 to-transparent" },
        IELTS: { title: "IELTS Preparation", icon: Target, color: "text-toeic-warning", bg: "bg-gradient-to-br from-toeic-warning/10 to-transparent" },
        TOEIC: { title: "TOEIC Vocabulary", icon: Target, color: "text-toeic-navy", bg: "bg-gradient-to-br from-toeic-navy/5 to-transparent" },
        TOPIC: { title: "Topics", icon: MessageSquare, color: "text-toeic-blue", bg: "bg-gradient-to-br from-toeic-blue/5 to-transparent" },
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-background via-secondary/30 to-background">
            {/* Decorative background elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
                <div className="absolute top-20 left-10 w-72 h-72 bg-toeic-blue/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-40 right-10 w-96 h-96 bg-toeic-success/5 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-toeic-warning/5 rounded-full blur-3xl"></div>
            </div>

            {/* Header with Back Button */}
            <div className="container mx-auto max-w-7xl px-4 py-4">
                <Link to="/">
                    <Button variant="ghost" className="gap-2 hover:bg-toeic-blue/10">
                        <ArrowLeft className="h-4 w-4" />
                        Quay lại trang chủ
                    </Button>
                </Link>
            </div>

            {/* Hero Section */}
            <div className="bg-gradient-to-r from-toeic-blue via-toeic-blue to-toeic-success py-16 px-4 relative overflow-hidden">
                {/* Decorative elements in hero */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-10 right-20 w-40 h-40 bg-toeic-success rounded-full blur-2xl"></div>
                    <div className="absolute bottom-10 left-20 w-40 h-40 bg-toeic-warning rounded-full blur-2xl"></div>
                </div>
                <div className="container mx-auto max-w-7xl relative z-10">
                    <div className="text-center text-white space-y-4">
                        <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                            <BookOpen className="w-4 h-4" />
                            <span className="text-sm font-medium">Luyện Từ Vựng TOEIC</span>
                        </div>
                        <h1 className="text-5xl font-bold tracking-tight">
                            Chinh Phục Từ Vựng
                        </h1>
                        <p className="text-xl text-white/90 max-w-2xl mx-auto">
                            Học tiếng Anh với flashcards tương tác và trò chơi hấp dẫn. Bắt đầu hành trình của bạn ngay hôm nay!
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto max-w-7xl px-4 py-16 relative z-10">
                {isLoading ? (
                    <div className="space-y-12">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="space-y-4">
                                <Skeleton className="h-8 w-48" />
                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {[1, 2, 3].map((j) => (
                                        <Skeleton key={j} className="h-40" />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-12">
                        {Object.entries(typeConfig).map(([type, config]) => {
                            const typeGroups = groupedByType?.[type]?.filter(g => g.flashcardCount > 0);
                            if (!typeGroups || typeGroups.length === 0) return null;

                            const Icon = config.icon;
                            return (
                                <section key={type}>
                                    <div className={`flex items-center gap-4 mb-6 p-5 rounded-xl border border-border/50 backdrop-blur-sm ${config.bg}`}>
                                        <Icon className={`h-8 w-8 shrink-0 ${config.color}`} />
                                        <div className="flex-1">
                                            <h2 className="text-2xl font-bold text-toeic-navy">{config.title}</h2>
                                            <span className="text-sm text-muted-foreground">
                                                {typeGroups.length} {typeGroups.length === 1 ? 'bộ từ vựng' : 'bộ từ vựng'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                        {typeGroups.map((group) => (
                                            <GroupCard key={group.id} group={group} />
                                        ))}
                                    </div>
                                </section>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LuyenTuVung;
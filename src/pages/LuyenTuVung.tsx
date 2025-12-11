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
        CEFR: { title: "CEFR Levels", icon: GraduationCap, color: "text-toeic-blue", bg: "bg-toeic-blue/10" },
        COMMON: { title: "Common Vocabulary", icon: BookOpen, color: "text-toeic-success", bg: "bg-toeic-success/10" },
        IELTS: { title: "IELTS Preparation", icon: Target, color: "text-toeic-warning", bg: "bg-toeic-warning/10" },
        TOEIC: { title: "TOEIC Vocabulary", icon: Target, color: "text-toeic-blue", bg: "bg-toeic-blue/10" },
        TOPIC: { title: "Topics", icon: MessageSquare, color: "text-toeic-navy", bg: "bg-toeic-navy/5" },
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
            <div className="bg-gradient-to-r from-toeic-blue via-toeic-success to-toeic-warning py-16 px-4">
                <div className="container mx-auto max-w-7xl">
                    <div className="text-center text-white space-y-4">
                        <h1 className="text-5xl font-bold tracking-tight">
                            UTC TOEIC - Luyện Từ Vựng
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
                                    <div className={`flex items-center gap-3 mb-6 p-4 rounded-lg ${config.bg}`}>
                                        <Icon className={`h-8 w-8 ${config.color}`} />
                                        <div>
                                            <h2 className="text-2xl font-bold text-toeic-navy">{config.title}</h2>
                                            <span className="text-sm text-muted-foreground">
                                                ({typeGroups.length} {typeGroups.length === 1 ? 'set' : 'sets'})
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
import { useState } from "react";
import { Link } from "react-router-dom";
import { useTopics } from "@/hooks/useTopics";
import { CategoryTag } from "@/components/CategoryTag";
import { Skeleton } from "@/components/ui/skeleton";
import { Headphones, BookOpen, Sparkles } from "lucide-react";
const LuyenNgheVideo = () => {
    const [activeCategory, setActiveCategory] = useState<number | null>(null);
    const {
        data: topics,
        isLoading
    } = useTopics();
    const filteredTopics = activeCategory === null ? topics : topics?.filter(topic => topic.id === activeCategory);
    return <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-level-b2 flex items-center justify-center">
                        <Headphones className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-xl font-bold text-foreground">UTC-EngLish</span>
                </div>
                <nav className="hidden md:flex items-center gap-6">
                    <a href="#topics" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                        Chủ đề
                    </a>
                    <a href="#review" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                        Ôn tập
                    </a>
                    <a href="#vocabulary" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                        Từ vựng
                    </a>
                    <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity">
                        Mở khóa PRO
                    </button>
                </nav>
            </div>
        </header>

        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-level-b2/10 to-background py-20">
            <div className="container px-4">
                <div className="mx-auto max-w-3xl text-center">
                    <div className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 mb-6">
                        <Sparkles className="h-4 w-4 text-accent-foreground" />
                        <span className="text-sm font-medium text-accent-foreground">
                            Phương pháp học tiếng Anh hiệu quả
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
                        Nâng cao kỹ năng nghe với
                        <br />
                        <span className="bg-gradient-to-r from-primary to-level-b2 bg-clip-text text-transparent">
                            Shadowing & Dictation
                        </span>
                    </h1>
                    <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                        Cải thiện kỹ năng phát âm và nói tiếng Anh của bạn với phương pháp shadowing
                        và nghe chép hiện đại. Hàng trăm bài học từ cơ bản đến nâng cao.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <div className="flex items-center gap-2 bg-background px-4 py-3 rounded-lg border border-border">
                            <Headphones className="h-5 w-5 text-primary" />
                            <span className="text-sm font-medium">Shadowing</span>
                        </div>
                        <div className="flex items-center gap-2 bg-background px-4 py-3 rounded-lg border border-border">
                            <BookOpen className="h-5 w-5 text-primary" />
                            <span className="text-sm font-medium">Dictation</span>
                        </div>
                        <div className="flex items-center gap-2 bg-background px-4 py-3 rounded-lg border border-border">
                            <Sparkles className="h-5 w-5 text-primary" />
                            <span className="text-sm font-medium">A1 - C2</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* Topics Section */}
        <section id="topics" className="py-12">
            <div className="container px-4">
                {/* Categories */}
                <div className="mb-8">
                    <h3 className="text-sm font-semibold text-foreground mb-4">Tất cả chủ đề</h3>
                    <div className="flex flex-wrap gap-2">
                        <CategoryTag label="Tất cả" isActive={activeCategory === null} onClick={() => setActiveCategory(null)} />
                        {topics?.map(topic => <CategoryTag key={topic.id} label={topic.name} isActive={activeCategory === topic.id} onClick={() => setActiveCategory(topic.id)} />)}
                    </div>
                </div>

                {/* Topics Grid */}
                {isLoading ? <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {Array.from({
                        length: 8
                    }).map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
                </div> : <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredTopics?.map(topic => <Link key={topic.id} to={`/topic/${topic.id}`} className="group p-6 rounded-xl border border-border bg-card hover:shadow-lg transition-all hover:border-primary/50">
                        <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary/20 to-level-b2/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Headphones className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="font-semibold text-card-foreground mb-2 group-hover:text-primary transition-colors">
                            {topic.name}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                            {topic.description}
                        </p>
                    </Link>)}
                </div>}
            </div>
        </section>

        {/* Footer */}
        <footer className="bg-muted/30 border-t border-border py-12 mt-20">
            <div className="container px-4">
                <div className="grid md:grid-cols-4 gap-8">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-level-b2 flex items-center justify-center">
                                <Headphones className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-lg font-bold text-foreground">EnglishListen</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Cải thiện kỹ năng phát âm và nói tiếng Anh của bạn với phương pháp shadowing
                            và nghe chép hiện đại.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-foreground mb-3">Tính năng</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>Shadowing</li>
                            <li>Nghe chép</li>
                            <li>Từ vựng</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-foreground mb-3">Thông tin</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>Chính sách bảo mật</li>
                            <li>Về chúng tôi</li>
                            <li>Điều khoản dịch vụ</li>
                            <li>Liên hệ</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-foreground mb-3">Tải ứng dụng</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                            Học mọi lúc, mọi nơi với ứng dụng di động
                        </p>
                        <div className="inline-block bg-foreground text-background px-4 py-2 rounded-lg text-xs font-semibold">
                            Coming Soon
                        </div>
                    </div>
                </div>
                <div className="border-t border-border mt-8 pt-8 text-center">
                    <p className="text-sm text-muted-foreground">
                        © 2025 EnglishListen. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    </div>;
};
export default LuyenNgheVideo;
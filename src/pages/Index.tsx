import { useState } from "react";
import { TopicCard } from "@/components/TopicCard";
import { CategoryTag } from "@/components/CategoryTag";
import { topics, categories } from "@/data/topics";
import { Headphones, BookOpen, Sparkles } from "lucide-react";

const Index = () => {
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredTopics =
    activeCategory === "all"
      ? topics
      : topics.filter((topic) => topic.category === activeCategory);

  const beginnerTopics = filteredTopics.filter((t) => ["A1", "A2"].includes(t.level));
  const advancedTopics = filteredTopics.filter((t) => ["B1", "B2", "C1", "C2"].includes(t.level));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-level-b2 flex items-center justify-center">
              <Headphones className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">EnglishListen</span>
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
          {/* Level Sections */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="p-6 rounded-xl bg-gradient-to-br from-level-a2/10 to-background border border-border">
              <h2 className="text-xl font-bold text-foreground mb-2">
                Dành cho người mới bắt đầu
              </h2>
              <p className="text-sm text-muted-foreground">
                Tập trung vào phát âm cơ bản và luyện nghe từng từ, câu đơn giản
              </p>
            </div>
            <div className="p-6 rounded-xl bg-gradient-to-br from-level-b2/10 to-background border border-border">
              <h2 className="text-xl font-bold text-foreground mb-2">
                Dành cho người đã có kinh nghiệm
              </h2>
              <p className="text-sm text-muted-foreground">
                Nâng cao kỹ năng với tốc độ nói thực tế và các chủ đề phức tạp hơn
              </p>
            </div>
          </div>

          {/* Categories */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-foreground mb-4">Tất cả chủ đề</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <CategoryTag
                  key={category.id}
                  label={category.label}
                  isActive={activeCategory === category.id}
                  onClick={() => setActiveCategory(category.id)}
                />
              ))}
            </div>
          </div>

          {/* Beginner Topics */}
          {beginnerTopics.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-foreground">
                  Dành cho người mới bắt đầu
                </h3>
                <a href="#" className="text-sm font-medium text-primary hover:underline">
                  Xem tất cả →
                </a>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {beginnerTopics.map((topic) => (
                  <TopicCard key={topic.id} {...topic} />
                ))}
              </div>
            </div>
          )}

          {/* Advanced Topics */}
          {advancedTopics.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-foreground">
                  Dành cho người đã có kinh nghiệm
                </h3>
                <a href="#" className="text-sm font-medium text-primary hover:underline">
                  Xem tất cả →
                </a>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {advancedTopics.map((topic) => (
                  <TopicCard key={topic.id} {...topic} />
                ))}
              </div>
            </div>
          )}
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
    </div>
  );
};

export default Index;

import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Headphones, Mic, BookOpen, Edit } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />

        {/* Practice Section */}
        <section className="py-20 bg-gradient-to-b from-muted/50 to-background">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-toeic-navy mb-4">
                Luyện tập 4 kỹ năng
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Thực hành toàn diện Nghe - Nói - Đọc - Viết với bài tập tương tác
              </p>
            </div>

            <div className="max-w-4xl mx-auto bg-gradient-to-br from-toeic-blue to-toeic-success p-8 rounded-2xl shadow-xl">
              <div className="grid md:grid-cols-4 gap-6 mb-8">
                <div className="flex flex-col items-center text-white">
                  <Headphones className="w-12 h-12 mb-2" />
                  <span className="font-semibold">Listening</span>
                </div>
                <div className="flex flex-col items-center text-white">
                  <Mic className="w-12 h-12 mb-2" />
                  <span className="font-semibold">Speaking</span>
                </div>
                <div className="flex flex-col items-center text-white">
                  <BookOpen className="w-12 h-12 mb-2" />
                  <span className="font-semibold">Reading</span>
                </div>
                <div className="flex flex-col items-center text-white">
                  <Edit className="w-12 h-12 mb-2" />
                  <span className="font-semibold">Writing</span>
                </div>
              </div>

              <div className="text-center">
                <Button
                  variant="outline"
                  size="lg"
                  className="bg-white hover:bg-gray-100 text-toeic-navy font-semibold px-8 py-6 text-lg"
                  onClick={() => window.open('https://congkcks.github.io/pixel-perfect-labs-01876-96953-53253-15-94322/', '_blank')}
                >
                  Bắt đầu luyện tập ngay
                </Button>
              </div>
            </div>
          </div>
        </section>

        <TestimonialsSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;

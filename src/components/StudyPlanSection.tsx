import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, MapPin } from "lucide-react";
import StudyLevels from "./StudyLevels";
import StudyRoadmap25Days from "./StudyRoadmap25Days";

const StudyPlanSection = () => {
  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-6 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-toeic-navy mb-4">Lộ trình học tập</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Học tiếng Anh theo từng cấp độ với lộ trình được thiết kế khoa học và cá nhân hóa
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="levels" className="mb-8">
          <TabsList className="grid w-full grid-cols-2 max-w-xl mx-auto">
            <TabsTrigger value="levels" className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4" />
              Lộ trình cấp độ
            </TabsTrigger>
            <TabsTrigger value="roadmap" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Lộ trình theo ngày
            </TabsTrigger>
          </TabsList>

          <TabsContent value="levels">
            <StudyLevels />
          </TabsContent>

          <TabsContent value="roadmap">
            <StudyRoadmap25Days />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StudyPlanSection;
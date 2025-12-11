import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    MessageSquare,
    BookOpen,
    Headphones,
    PenTool,
    Users,
    Clock,
    Star,
    CheckCircle2
} from "lucide-react";
import { CourseRecommendation } from "@/data/quizQuestions";

interface LevelCardProps {
    course: CourseRecommendation;
    isRecommended?: boolean;
    onStart?: () => void;
}

const LevelCard = ({ course, isRecommended = false, onStart }: LevelCardProps) => {
    const getLevelColor = (level: string) => {
        switch (level) {
            case "A1": return "bg-toeic-success text-white";
            case "A2": return "bg-toeic-blue text-white";
            case "B1": return "bg-toeic-warning text-white";
            default: return "bg-toeic-blue text-white";
        }
    };

    const getLevelBorderColor = (level: string) => {
        switch (level) {
            case "A1": return "border-l-toeic-success";
            case "A2": return "border-l-toeic-blue";
            case "B1": return "border-l-toeic-warning";
            default: return "border-l-toeic-blue";
        }
    };

    return (
        <Card className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg border-l-4 ${getLevelBorderColor(course.level)} ${isRecommended ? 'ring-2 ring-toeic-blue shadow-lg' : ''} bg-card/70 hover:bg-card`}>
            {isRecommended && (
                <div className="absolute top-4 right-4">
                    <Badge className="bg-toeic-warning text-white flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        Được đề xuất
                    </Badge>
                </div>
            )}

            <CardHeader className="pb-4">
                <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-full ${getLevelColor(course.level)} flex items-center justify-center font-bold text-lg shrink-0`}>
                        {course.level}
                    </div>
                    <div className="flex-1">
                        <h3 className="text-xl font-semibold text-toeic-navy">{course.title}</h3>
                        <p className="text-muted-foreground text-sm mt-1">{course.description}</p>
                    </div>
                    <span className="text-sm text-muted-foreground">Chưa bắt đầu</span>
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Skills */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <CheckCircle2 className="w-4 h-4 text-toeic-success" />
                            <span className="font-medium text-sm text-toeic-navy">Kỹ năng trọng tâm</span>
                        </div>
                        <div className="space-y-2">
                            {course.skills.map((skill, idx) => (
                                <div key={idx} className="flex items-center justify-between p-2 rounded hover:bg-toeic-blue/5">
                                    <div className="flex items-center gap-2">
                                        {skill.name.includes("Từ vựng") && <MessageSquare className="w-4 h-4 text-toeic-blue" />}
                                        {skill.name.includes("Ngữ pháp") && <BookOpen className="w-4 h-4 text-toeic-success" />}
                                        {skill.name.includes("Nghe") && <Headphones className="w-4 h-4 text-toeic-warning" />}
                                        <span className="text-sm">{skill.name}</span>
                                    </div>
                                    <Badge variant="outline" className="text-xs bg-toeic-blue/10 text-toeic-blue border-toeic-blue/30">
                                        {skill.priority}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Topics */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <BookOpen className="w-4 h-4 text-toeic-blue" />
                            <span className="font-medium text-sm text-toeic-navy">Chủ đề bài học</span>
                        </div>
                        <div className="space-y-2">
                            {course.topics.map((topic, idx) => (
                                <div key={idx} className="flex items-center gap-2 p-2 rounded hover:bg-toeic-success/5">
                                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-toeic-blue to-toeic-success" />
                                    <span className="text-sm text-muted-foreground">{topic}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Features and Duration */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border/50">
                    <div className="flex flex-wrap gap-2">
                        <Button
                            size="sm"
                            className={`${getLevelColor(course.level)} font-semibold`}
                            onClick={onStart}
                        >
                            <Star className="w-4 h-4 mr-1" />
                            Bắt đầu cấp độ này
                        </Button>
                        {course.features.map((feature, idx) => (
                            <Button key={idx} variant="outline" size="sm" className="text-xs border-border/50 hover:bg-toeic-blue/5">
                                {feature}
                            </Button>
                        ))}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>Chi tiết lộ trình {course.duration}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default LevelCard;

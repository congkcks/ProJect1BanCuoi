import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MessageSquare, Trash2, Loader2, Calendar, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Header from "@/components/Header";

interface ConversationTemplate {
    id: number;
    topic: string;
    level: number;
    purpose: string;
    jsonContent: string;
    createdAt: string;
}

const SavedConversations = () => {
    const navigate = useNavigate();
    const [conversations, setConversations] = useState<ConversationTemplate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    useEffect(() => {
        fetchConversations();
    }, []);

    const fetchConversations = async () => {
        try {
            const response = await fetch("https://luyende.onrender.com/api/ConversationTemplate");
            if (!response.ok) throw new Error("Failed to fetch");
            const data = await response.json();
            setConversations(data);
        } catch (error) {
            console.error("Error fetching conversations:", error);
            toast.error("Không thể tải danh sách hội thoại");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Bạn có chắc muốn xóa hội thoại này?")) return;

        setDeletingId(id);
        try {
            const response = await fetch(`https://luyende.onrender.com/api/ConversationTemplate/${id}`, {
                method: "DELETE"
            });
            if (!response.ok) throw new Error("Failed to delete");

            setConversations(prev => prev.filter(c => c.id !== id));
            toast.success("Đã xóa hội thoại");
        } catch (error) {
            console.error("Error deleting conversation:", error);
            toast.error("Không thể xóa hội thoại");
        } finally {
            setDeletingId(null);
        }
    };

    const handleSelect = (conversation: ConversationTemplate) => {
        try {
            const generatedData = JSON.parse(conversation.jsonContent);
            navigate("/writing-practice", {
                state: {
                    generatedData,
                    level: conversation.level,
                    language: "en"
                }
            });
        } catch (error) {
            console.error("Error parsing conversation data:", error);
            toast.error("Dữ liệu hội thoại không hợp lệ");
        }
    };

    const getLevelLabel = (level: number) => {
        const labels: Record<number, string> = {
            1: "🌱 Dễ",
            2: "📈 Trung bình",
            3: "🔥 Khó",
            4: "🚀 Nâng cao"
        };
        return labels[level] || `Level ${level}`;
    };

    const getPurposeLabel = (purpose: string) => {
        const labels: Record<string, string> = {
            "Conversation practice": "💬 Giao tiếp",
            "Essay writing": "🎓 IELTS",
            "Professional writing": "💼 Công việc"
        };
        return labels[purpose] || purpose;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple/10 to-primary/10">
            <Header />
            <div className="container mx-auto px-6 py-8">
                <div className="mb-6">
                    <Button variant="ghost" onClick={() => navigate("/")} className="mb-4">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Quay lại
                    </Button>

                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple to-primary bg-clip-text text-transparent">
                                📚 Hội thoại đã lưu
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                Chọn một hội thoại để tiếp tục luyện tập
                            </p>
                        </div>
                        <Button onClick={() => navigate("/create-lesson")} className="bg-primary">
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Tạo mới
                        </Button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <span className="ml-3 text-muted-foreground">Đang tải...</span>
                    </div>
                ) : conversations.length === 0 ? (
                    <Card className="p-12 text-center">
                        <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <h2 className="text-xl font-semibold mb-2">Chưa có hội thoại nào</h2>
                        <p className="text-muted-foreground mb-6">
                            Hãy tạo hội thoại đầu tiên để bắt đầu luyện tập
                        </p>
                        <Button onClick={() => navigate("/create-lesson")}>
                            Tạo hội thoại mới
                        </Button>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {conversations.map((conversation) => (
                            <Card
                                key={conversation.id}
                                onClick={() => handleSelect(conversation)}
                                className="p-5 hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer group relative"
                            >
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => handleDelete(conversation.id, e)}
                                    disabled={deletingId === conversation.id}
                                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                                >
                                    {deletingId === conversation.id ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Trash2 className="w-4 h-4" />
                                    )}
                                </Button>

                                <div className="pr-8">
                                    <h3 className="font-semibold text-lg mb-3 line-clamp-2">
                                        {conversation.topic}
                                    </h3>

                                    <div className="flex flex-wrap gap-2 mb-3">
                                        <Badge variant="secondary" className="text-xs">
                                            {getLevelLabel(conversation.level)}
                                        </Badge>
                                        <Badge variant="outline" className="text-xs">
                                            {getPurposeLabel(conversation.purpose)}
                                        </Badge>
                                    </div>

                                    <div className="flex items-center text-xs text-muted-foreground">
                                        <Calendar className="w-3 h-3 mr-1" />
                                        {formatDate(conversation.createdAt)}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SavedConversations;

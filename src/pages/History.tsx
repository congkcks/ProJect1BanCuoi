import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { testApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Home, Clock, Trophy, Calendar, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const History = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userId, setUserId] = useState<number | null>(null);
  const [inputUserId, setInputUserId] = useState("");

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      setUserId(Number(storedUserId));
      setInputUserId(storedUserId);
    }
  }, []);

  const { data: history, isLoading, error } = useQuery({
    queryKey: ["testHistory", userId],
    queryFn: () => testApi.getTestHistory(userId!),
    enabled: !!userId,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = Number(inputUserId);
    if (isNaN(id) || id <= 0) {
      toast({
        title: "Invalid User ID",
        description: "Please enter a valid user ID",
        variant: "destructive",
      });
      return;
    }
    setUserId(id);
    localStorage.setItem("userId", inputUserId);
  };

  const handleViewReview = (sessionId: string) => {
    navigate(`/review/${sessionId}`);
  };

  const calculateDuration = (startedAt: string, finishedAt: string) => {
    const start = new Date(startedAt);
    const finish = new Date(finishedAt);
    const durationMs = finish.getTime() - start.getTime();
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 800) return "text-success";
    if (score >= 600) return "text-warning";
    return "text-destructive";
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate("/")} className="gap-2">
              <Home className="h-4 w-4" />
              Home
            </Button>
            <h1 className="text-xl font-bold">Test History</h1>
            <div className="w-20" />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* User ID Input */}
        {!userId && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Enter Your User ID</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="userId">User ID</Label>
                  <Input
                    id="userId"
                    type="number"
                    value={inputUserId}
                    onChange={(e) => setInputUserId(e.target.value)}
                    placeholder="Enter your user ID"
                    required
                  />
                </div>
                <Button type="submit">View History</Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* History List */}
        {userId && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Your Test Sessions</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setUserId(null);
                  setInputUserId("");
                  localStorage.removeItem("userId");
                }}
              >
                Change User ID
              </Button>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center space-y-4">
                  <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                  <p className="text-muted-foreground">Loading your history...</p>
                </div>
              </div>
            ) : error ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-destructive mb-4">Failed to load test history</p>
                  <Button onClick={() => navigate("/")}>Return Home</Button>
                </CardContent>
              </Card>
            ) : !history || history.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No test history found</p>
                  <Button onClick={() => navigate("/")}>Take a Test</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {history.map((session) => (
                  <Card
                    key={session.sessionId}
                    className="hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => handleViewReview(session.sessionId)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold mb-2">
                            {session.testId}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {format(new Date(session.startedAt), "PPP")}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {calculateDuration(session.startedAt, session.finishedAt)}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <Trophy className="h-5 w-5 text-primary" />
                            <span className={`text-2xl font-bold ${getScoreColor(session.totalScore)}`}>
                              {session.totalScore}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            TOEIC Score
                          </p>
                        </div>
                      </div>
                      <Button className="w-full" variant="secondary">
                        View Detailed Review
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default History;

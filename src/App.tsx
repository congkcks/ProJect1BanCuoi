import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, HashRouter } from "react-router-dom";
import Index from "./pages/Index";
import StudyPlan from "./pages/StudyPlan";
import Assessment from "./pages/Assessment";
import DashboardPage from "./pages/DashboardPage";
import AdminDashboard from "./pages/AdminDashboard";
import ReadingLessonPage from "./pages/ReadingLessonPage";
import ListeningLessonPage from "./pages/ListeningLessonPage";
import WritingLessonPage from "./pages/WritingLessonPage";
import ConversationPracticePage from "./pages/ConversationPracticePage";
import AIAssessmentPage from "./pages/AIAssessmentPage";
import AIAnalysisPage from "./pages/AIAnalysisPage";
import DetailedLessonPage from "./pages/DetailedLessonPage";
import AllInterfacesPage from "./pages/AllInterfacesPage";
import InteractiveStoryPage from "./pages/InteractiveStoryPage";
import VocabularyBuilderPage from "./pages/VocabularyBuilderPage";
import PronunciationPracticePage from "./pages/PronunciationPracticePage";
import GrammarGamePage from "./pages/GrammarGamePage";
import SpeakingChallengePage from "./pages/SpeakingChallengePage";
import NotFound from "./pages/NotFound";
import Day1IntroPage from "./pages/Day1IntroPage";
import LessonOverviewPage from "./pages/LessonOverviewPage";
import RoadmapLessonsPage from "./pages/RoadmapLessonsPage";
import ReadingDocDetailPage from "./pages/ReadingDocDetailPage";
import ListeningItemPage from "./pages/ListeningItemPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import RequireAuth from "@/components/RequireAuth";
import { AuthProvider } from "@/context/AuthContext";
import LuyenTap from "./pages/LuyenTap";
import ListeningPractice from "./pages/ListeningPractice";
import ListeningPracticeLesson from "./pages/ListeningPracticeLesson";
import TestList from "./pages/TestList";
import TestConfiguration from "./pages/TestConfiguration";
import TestExam from "./pages/TestExam";
import CreateLesson from "./pages/CreateLesson";
import TopicLessons from "./pages/TopicLessons";
import LessonDetail from "./pages/LessonDetail";
import LuyenNgheVideo from "./pages/LuyenNgheVideo";
import ListTestDe from "./pages/ListTestDe";
import Review from "./pages/Review";
import Test from "./pages/Test";
import History from "./pages/History";
import Topics from "./pages/Topics";
import TopicDetail from "./pages/TopicDetail";
import LuyenTuVung from "./pages/LuyenTuVung";
import { GroupCard } from "./components/GroupCard";
import GroupDetail from "./pages/GroupDetail";
import WritingPractice from "./pages/WritingPractice";
import SavedConversations from "./pages/SavedConversations";
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <HashRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/study-plan" element={<StudyPlan />} />
            <Route path="/luyen-tap" element={<LuyenTap />} />
            <Route path="/assessment" element={<Assessment />} />
            <Route path="/listening-practice" element={<ListeningPractice />} />
            <Route path="/listening-practice-lesson" element={<ListeningPracticeLesson />} />
            <Route path="/test-list" element={<ListTestDe />} />
            <Route path="/test-config/:testId" element={<TestConfiguration />} />
            <Route path="/test-exam/:testId" element={<TestExam />} />
            <Route path="/create-lesson" element={<CreateLesson />} />
            <Route path="/topicspeaker" element={<Topics />} />
            <Route path="/saved-conversations" element={<SavedConversations />} />

            {/* Đặt route chi tiết lên trước */}
            <Route path="/topicspeaker/:id" element={<TopicDetail />} />
            <Route path="/topic/:topicId/lesson/:lessonId" element={<LessonDetail />} />
            <Route path="/topic/:topicId" element={<TopicLessons />} />

            <Route path="/luyen-nghe-video" element={<LuyenNgheVideo />} />
            <Route path="/luyen-de" element={<ListTestDe />} />
            <Route path="/test/:testId" element={<Test />} />
            <Route path="/review/:sessionId" element={<Review />} />
            <Route path="/history" element={<History />} />
            <Route path="/luyentu" element={<LuyenTuVung />} />
            <Route path="/group/:groupId" element={<GroupDetail />} />
            <Route path="/writing-practice" element={<WritingPractice />} />


            <Route
              path="/dashboard"
              element={(
                <RequireAuth>
                  <DashboardPage />
                </RequireAuth>
              )}
            />
            <Route
              path="/admin"
              element={(
                <RequireAuth roles={["Admin"]} forbiddenRedirect="/">
                  <AdminDashboard />
                </RequireAuth>
              )}
            />
            <Route path="/lesson/reading/:readingId" element={<ReadingLessonPage />} />
            <Route path="/lesson/listening" element={<ListeningLessonPage />} />
            <Route path="/lesson/writing" element={<WritingLessonPage />} />
            <Route path="/lesson/conversation" element={<ConversationPracticePage />} />
            <Route path="/ai-assessment" element={<AIAssessmentPage />} />
            <Route path="/ai-analysis" element={<AIAnalysisPage />} />
            <Route path="/detailed-lesson" element={<DetailedLessonPage />} />
            <Route path="/all-interfaces" element={<AllInterfacesPage />} />
            <Route path="/interactive-story" element={<InteractiveStoryPage />} />
            <Route path="/vocabulary-builder" element={<VocabularyBuilderPage />} />
            <Route path="/pronunciation-practice" element={<PronunciationPracticePage />} />
            <Route path="/grammar-game" element={<GrammarGamePage />} />
            <Route path="/speaking-challenge" element={<SpeakingChallengePage />} />
            {/* Auth routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/profile"
              element={(
                <RequireAuth>
                  <ProfilePage />
                </RequireAuth>
              )}
            />
            {/* New learning flow */}
            <Route path="/day1-intro" element={<Day1IntroPage />} />
            <Route path="/lesson/overview/:maBai" element={<LessonOverviewPage />} />
            <Route path="/roadmap/:maLoTrinh/:filter?" element={<RoadmapLessonsPage />} />
            <Route path="/reading-doc/:maBaiDoc" element={<ReadingDocDetailPage />} />
            <Route path="/listening-item/:maBaiNghe" element={<ListeningItemPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </HashRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

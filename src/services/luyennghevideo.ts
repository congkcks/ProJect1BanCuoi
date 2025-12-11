import { Topic, Lesson, Sentence } from "@/types/api";

const BASE_URL = "https://luyennoivideo.onrender.com/api/Home";

export const fetchTopics = async (): Promise<Topic[]> => {
    const response = await fetch(`${BASE_URL}/topics`);
    if (!response.ok) {
        throw new Error("Failed to fetch topics");
    }
    return response.json();
};

export const fetchLessonsByTopic = async (topicId: number): Promise<Lesson[]> => {
    const response = await fetch(`${BASE_URL}/topics/${topicId}/lessons`);
    if (!response.ok) {
        throw new Error("Failed to fetch lessons");
    }
    return response.json();
};

export const fetchSentencesByLesson = async (lessonId: number): Promise<Sentence[]> => {
    const response = await fetch(`${BASE_URL}/lessons/${lessonId}/sentences`);
    if (!response.ok) {
        throw new Error("Failed to fetch sentences");
    }
    return response.json();
};

export const getYoutubeVideoId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
};

export const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};
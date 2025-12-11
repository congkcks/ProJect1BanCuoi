import { FlashcardGroup, FlashcardGroupDetail } from "@/types/flashcard";

const API_BASE_URL = "https://trienkhaidb.onrender.com/api";

export const fetchFlashcardGroups = async (): Promise<FlashcardGroup[]> => {
    const response = await fetch(`${API_BASE_URL}/flashcards/groups`);
    if (!response.ok) throw new Error("Failed to fetch flashcard groups");
    return response.json();
};

export const fetchFlashcardsByGroup = async (groupId: string): Promise<FlashcardGroupDetail> => {
    const response = await fetch(`${API_BASE_URL}/flashcards/by-group/${groupId}`);
    if (!response.ok) throw new Error("Failed to fetch flashcards");
    return response.json();
};
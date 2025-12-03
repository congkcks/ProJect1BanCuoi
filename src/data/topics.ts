import { DifficultyLevel } from "@/components/TopicCard";

export interface Topic {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  level: DifficultyLevel;
  views: number;
  hasDictation: boolean;
  hasShadowing: boolean;
  isPremium: boolean;
  category: string;
  source: string;
}

export const categories = [
  { id: "all", label: "Tất cả chủ đề" },
  { id: "movie", label: "Movie short clip" },
  { id: "conversation", label: "Daily English Conversation" },
  { id: "ielts", label: "IELTS Listening" },
  { id: "learning", label: "Learning resources" },
  { id: "shadowing", label: "Listening Time (Shadowing)" },
  { id: "entertainment", label: "Entertainment" },
  { id: "toeic", label: "TOEIC Listening" },
  { id: "songs", label: "US UK songs" },
  { id: "bbc", label: "BBC learning english" },
  { id: "voa", label: "VOA Learning English" },
  { id: "toefl", label: "Toefl Listening" },
  { id: "science", label: "Science and Facts" },
  { id: "fairy", label: "Fairy Tales" },
  { id: "news", label: "News" },
  { id: "ted", label: "TED" },
  { id: "business", label: "Business English" },
];

export const topics: Topic[] = [
  {
    id: "1",
    title: "KIKI'S DELIVERY SERVICE | Official English Trailer",
    thumbnail: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&h=450&fit=crop",
    duration: "00:50",
    level: "B1",
    views: 25912,
    hasDictation: true,
    hasShadowing: true,
    isPremium: false,
    category: "movie",
    source: "Youtube",
  },
  {
    id: "2",
    title: "YOUR NAME English Trailer (2016) Anime Movie",
    thumbnail: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&h=450&fit=crop",
    duration: "01:47",
    level: "B1",
    views: 11268,
    hasDictation: true,
    hasShadowing: true,
    isPremium: false,
    category: "movie",
    source: "Youtube",
  },
  {
    id: "3",
    title: "I Want It That Way | Brooklyn Nine-Nine",
    thumbnail: "https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=800&h=450&fit=crop",
    duration: "01:28",
    level: "A2",
    views: 17273,
    hasDictation: true,
    hasShadowing: true,
    isPremium: false,
    category: "entertainment",
    source: "Youtube",
  },
  {
    id: "4",
    title: "TOM & JERRY - Official Trailer",
    thumbnail: "https://images.unsplash.com/photo-1595769816263-9b910be24d5f?w=800&h=450&fit=crop",
    duration: "02:25",
    level: "B2",
    views: 9885,
    hasDictation: true,
    hasShadowing: true,
    isPremium: true,
    category: "movie",
    source: "Youtube",
  },
  {
    id: "5",
    title: "How to Make Small Talk in English - Conversation Practice",
    thumbnail: "https://images.unsplash.com/photo-1543269664-56d93c1b41a6?w=800&h=450&fit=crop",
    duration: "08:45",
    level: "A2",
    views: 34521,
    hasDictation: true,
    hasShadowing: true,
    isPremium: false,
    category: "conversation",
    source: "Youtube",
  },
  {
    id: "6",
    title: "IELTS Listening Practice Test 2024 with Answers",
    thumbnail: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=450&fit=crop",
    duration: "35:20",
    level: "B2",
    views: 45123,
    hasDictation: true,
    hasShadowing: false,
    isPremium: false,
    category: "ielts",
    source: "Youtube",
  },
  {
    id: "7",
    title: "BBC Learning English - 6 Minute English: Climate Change",
    thumbnail: "https://images.unsplash.com/photo-1569163139394-de4798aa62b6?w=800&h=450&fit=crop",
    duration: "06:03",
    level: "B1",
    views: 28934,
    hasDictation: true,
    hasShadowing: true,
    isPremium: false,
    category: "bbc",
    source: "Youtube",
  },
  {
    id: "8",
    title: "Business English: Negotiation Skills",
    thumbnail: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=450&fit=crop",
    duration: "12:30",
    level: "C1",
    views: 15678,
    hasDictation: true,
    hasShadowing: true,
    isPremium: true,
    category: "business",
    source: "Youtube",
  },
];

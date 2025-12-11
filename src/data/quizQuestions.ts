export interface Question {
    id: number;
    type: "vocabulary" | "grammar" | "reading" | "listening";
    question: string;
    options: string[];
    correct: number;
    difficulty: "a1" | "a2" | "b1";
}

export const quizQuestions: Question[] = [
    // A1 Level - Easy (1-15)
    {
        id: 1,
        type: "vocabulary",
        question: "What is the opposite of 'hot'?",
        options: ["Cold", "Warm", "Cool", "Nice"],
        correct: 0,
        difficulty: "a1"
    },
    {
        id: 2,
        type: "vocabulary",
        question: "'Apple' là gì trong tiếng Việt?",
        options: ["Quả cam", "Quả táo", "Quả chuối", "Quả nho"],
        correct: 1,
        difficulty: "a1"
    },
    {
        id: 3,
        type: "grammar",
        question: "She _____ a student.",
        options: ["am", "is", "are", "be"],
        correct: 1,
        difficulty: "a1"
    },
    {
        id: 4,
        type: "vocabulary",
        question: "How do you say 'xin chào' in English?",
        options: ["Goodbye", "Hello", "Thank you", "Sorry"],
        correct: 1,
        difficulty: "a1"
    },
    {
        id: 5,
        type: "grammar",
        question: "I _____ from Vietnam.",
        options: ["is", "are", "am", "be"],
        correct: 2,
        difficulty: "a1"
    },
    {
        id: 6,
        type: "vocabulary",
        question: "What color is the sky?",
        options: ["Green", "Red", "Blue", "Yellow"],
        correct: 2,
        difficulty: "a1"
    },
    {
        id: 7,
        type: "grammar",
        question: "They _____ teachers.",
        options: ["is", "am", "are", "be"],
        correct: 2,
        difficulty: "a1"
    },
    {
        id: 8,
        type: "vocabulary",
        question: "'Dog' là gì trong tiếng Việt?",
        options: ["Con mèo", "Con chó", "Con chim", "Con cá"],
        correct: 1,
        difficulty: "a1"
    },
    {
        id: 9,
        type: "reading",
        question: "My name _____ John.",
        options: ["am", "is", "are", "be"],
        correct: 1,
        difficulty: "a1"
    },
    {
        id: 10,
        type: "vocabulary",
        question: "What day comes after Monday?",
        options: ["Sunday", "Wednesday", "Tuesday", "Thursday"],
        correct: 2,
        difficulty: "a1"
    },
    {
        id: 11,
        type: "grammar",
        question: "_____ you a doctor?",
        options: ["Is", "Am", "Are", "Be"],
        correct: 2,
        difficulty: "a1"
    },
    {
        id: 12,
        type: "vocabulary",
        question: "How many months are in a year?",
        options: ["10", "11", "12", "13"],
        correct: 2,
        difficulty: "a1"
    },
    {
        id: 13,
        type: "grammar",
        question: "This is _____ book.",
        options: ["a", "an", "the", "some"],
        correct: 0,
        difficulty: "a1"
    },
    {
        id: 14,
        type: "vocabulary",
        question: "'Mother' trong tiếng Việt là gì?",
        options: ["Bố", "Mẹ", "Anh", "Chị"],
        correct: 1,
        difficulty: "a1"
    },
    {
        id: 15,
        type: "reading",
        question: "I have two _____.",
        options: ["hand", "hands", "handing", "handed"],
        correct: 1,
        difficulty: "a1"
    },

    // A2 Level - Medium (16-28)
    {
        id: 16,
        type: "grammar",
        question: "She _____ to work every day.",
        options: ["go", "goes", "going", "went"],
        correct: 1,
        difficulty: "a2"
    },
    {
        id: 17,
        type: "vocabulary",
        question: "What does 'appointment' mean?",
        options: ["A meeting arranged in advance", "A type of food", "A place to live", "A kind of music"],
        correct: 0,
        difficulty: "a2"
    },
    {
        id: 18,
        type: "grammar",
        question: "I _____ watching TV when you called.",
        options: ["am", "was", "were", "is"],
        correct: 1,
        difficulty: "a2"
    },
    {
        id: 19,
        type: "reading",
        question: "The children are playing _____ the garden.",
        options: ["on", "at", "in", "to"],
        correct: 2,
        difficulty: "a2"
    },
    {
        id: 20,
        type: "vocabulary",
        question: "'Expensive' có nghĩa là gì?",
        options: ["Rẻ", "Đắt", "Miễn phí", "Giảm giá"],
        correct: 1,
        difficulty: "a2"
    },
    {
        id: 21,
        type: "grammar",
        question: "Have you ever _____ to Japan?",
        options: ["be", "been", "being", "was"],
        correct: 1,
        difficulty: "a2"
    },
    {
        id: 22,
        type: "vocabulary",
        question: "What is the opposite of 'remember'?",
        options: ["Recall", "Forget", "Think", "Know"],
        correct: 1,
        difficulty: "a2"
    },
    {
        id: 23,
        type: "grammar",
        question: "She speaks English _____ than her brother.",
        options: ["good", "better", "best", "well"],
        correct: 1,
        difficulty: "a2"
    },
    {
        id: 24,
        type: "reading",
        question: "I usually _____ breakfast at 7 AM.",
        options: ["have", "has", "having", "had"],
        correct: 0,
        difficulty: "a2"
    },
    {
        id: 25,
        type: "vocabulary",
        question: "'Colleague' means:",
        options: ["A family member", "A person you work with", "A neighbor", "A teacher"],
        correct: 1,
        difficulty: "a2"
    },
    {
        id: 26,
        type: "grammar",
        question: "If it rains, I _____ stay at home.",
        options: ["will", "would", "can", "should"],
        correct: 0,
        difficulty: "a2"
    },
    {
        id: 27,
        type: "vocabulary",
        question: "What does 'accommodation' mean?",
        options: ["Transportation", "A place to stay", "Food and drink", "Entertainment"],
        correct: 1,
        difficulty: "a2"
    },
    {
        id: 28,
        type: "grammar",
        question: "The movie _____ at 8 PM yesterday.",
        options: ["start", "starts", "started", "starting"],
        correct: 2,
        difficulty: "a2"
    },

    // B1 Level - Hard (29-40)
    {
        id: 29,
        type: "grammar",
        question: "By the time I arrived, the meeting _____.",
        options: ["has started", "had started", "started", "was starting"],
        correct: 1,
        difficulty: "b1"
    },
    {
        id: 30,
        type: "vocabulary",
        question: "What does 'nevertheless' mean?",
        options: ["Therefore", "However", "Because", "Although"],
        correct: 1,
        difficulty: "b1"
    },
    {
        id: 31,
        type: "reading",
        question: "The report _____ by the manager next week.",
        options: ["will review", "will be reviewed", "is reviewing", "reviewed"],
        correct: 1,
        difficulty: "b1"
    },
    {
        id: 32,
        type: "grammar",
        question: "I wish I _____ more time to study.",
        options: ["have", "had", "has", "having"],
        correct: 1,
        difficulty: "b1"
    },
    {
        id: 33,
        type: "vocabulary",
        question: "'Comprehensive' có nghĩa là gì?",
        options: ["Ngắn gọn", "Toàn diện", "Đơn giản", "Phức tạp"],
        correct: 1,
        difficulty: "b1"
    },
    {
        id: 34,
        type: "grammar",
        question: "_____ having lunch, he went back to work.",
        options: ["After", "Before", "While", "During"],
        correct: 0,
        difficulty: "b1"
    },
    {
        id: 35,
        type: "reading",
        question: "The company has been _____ significant growth this year.",
        options: ["experiencing", "experience", "experienced", "experiences"],
        correct: 0,
        difficulty: "b1"
    },
    {
        id: 36,
        type: "vocabulary",
        question: "What is a synonym for 'essential'?",
        options: ["Optional", "Necessary", "Additional", "Minor"],
        correct: 1,
        difficulty: "b1"
    },
    {
        id: 37,
        type: "grammar",
        question: "She asked me where I _____.",
        options: ["live", "lived", "living", "lives"],
        correct: 1,
        difficulty: "b1"
    },
    {
        id: 38,
        type: "vocabulary",
        question: "'Despite' is similar to:",
        options: ["Because of", "In spite of", "Due to", "Thanks to"],
        correct: 1,
        difficulty: "b1"
    },
    {
        id: 39,
        type: "grammar",
        question: "Not only _____ intelligent, but she is also hardworking.",
        options: ["she is", "is she", "she was", "was she"],
        correct: 1,
        difficulty: "b1"
    },
    {
        id: 40,
        type: "reading",
        question: "The deadline for the project _____ extended due to unforeseen circumstances.",
        options: ["has been", "have been", "is being", "was being"],
        correct: 0,
        difficulty: "b1"
    }
];

export interface CourseRecommendation {
    level: "A1" | "A2" | "B1";
    title: string;
    description: string;
    duration: string;
    skills: { name: string; priority: "Cần thiết" | "Trọng tâm" }[];
    topics: string[];
    features: string[];
}

export const courseRecommendations: CourseRecommendation[] = [
    {
        level: "A1",
        title: "A1 - Cơ bản",
        description: "Dành cho người mới bắt đầu, nền tảng từ vựng và ngữ pháp cơ bản",
        duration: "2-3 tháng",
        skills: [
            { name: "Từ vựng cơ bản", priority: "Cần thiết" },
            { name: "Ngữ pháp đơn giản", priority: "Trọng tâm" },
            { name: "Nghe hiểu cơ bản", priority: "Cần thiết" }
        ],
        topics: [
            "Giới thiệu bản thân",
            "Gia đình và bạn bè",
            "Công việc hàng ngày",
            "Mua sắm cơ bản",
            "Thời gian và ngày tháng"
        ],
        features: ["Bài đọc hiểu", "Bài luyện nghe", "Bài tập viết", "Luyện giao tiếp"]
    },
    {
        level: "A2",
        title: "A2 - Sơ trung cấp",
        description: "Phát triển kỹ năng giao tiếp cơ bản trong công việc",
        duration: "3-4 tháng",
        skills: [
            { name: "Từ vựng cơ bản", priority: "Cần thiết" },
            { name: "Ngữ pháp đơn giản", priority: "Trọng tâm" },
            { name: "Nghe hiểu cơ bản", priority: "Cần thiết" }
        ],
        topics: [
            "Giới thiệu bản thân",
            "Gia đình và bạn bè",
            "Công việc hàng ngày",
            "Mua sắm cơ bản",
            "Thời gian và ngày tháng"
        ],
        features: ["Bài đọc hiểu", "Bài luyện nghe", "Bài tập viết", "Luyện giao tiếp"]
    },
    {
        level: "B1",
        title: "B1 - Trung cấp",
        description: "Tập trung phát triển kỹ năng đọc hiểu và nghe hiểu",
        duration: "4-5 tháng",
        skills: [
            { name: "Từ vựng cơ bản", priority: "Cần thiết" },
            { name: "Ngữ pháp đơn giản", priority: "Trọng tâm" },
            { name: "Nghe hiểu cơ bản", priority: "Cần thiết" }
        ],
        topics: [
            "Giới thiệu bản thân",
            "Gia đình và bạn bè",
            "Công việc hàng ngày",
            "Mua sắm cơ bản",
            "Thời gian và ngày tháng"
        ],
        features: ["Bài đọc hiểu", "Bài luyện nghe", "Bài tập viết", "Luyện giao tiếp"]
    }
];

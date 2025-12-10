import { useState } from 'react';
import { ReadingLesson, ReadingConfig } from '@/types/reading';
import { toast } from '@/hooks/use-toast';

export const useReadingPractice = () => {
  const initialLesson = (() => {
    try {
      const raw = sessionStorage.getItem('reading_lesson');
      return raw ? (JSON.parse(raw) as ReadingLesson) : null;
    } catch {
      return null;
    }
  })();
  const [lesson, setLesson] = useState<ReadingLesson | null>(initialLesson);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string | boolean>>({});
  const [showResults, setShowResults] = useState(false);

  const generateLesson = async (config: ReadingConfig) => {
    setIsLoading(true);
    try {
      const response = await fetch('https://btl-d39f.onrender.com/api/reading/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        throw new Error('Failed to generate reading lesson');
      }

      // Get text response first
      let textData = await response.text();
      
      // Remove markdown code blocks if present (```json ... ```)
      textData = textData.trim();
      if (textData.startsWith('```json')) {
        textData = textData.replace(/^```json\s*/, '').replace(/```\s*$/, '');
      } else if (textData.startsWith('```')) {
        textData = textData.replace(/^```\s*/, '').replace(/```\s*$/, '');
      }
      
      // Parse cleaned JSON
      const data = JSON.parse(textData);
      setLesson(data);
      sessionStorage.setItem('reading_lesson', JSON.stringify(data));
      setCurrentStep(0);
      setUserAnswers({});
      setShowResults(false);
      toast({
        title: "Bài đọc đã được tạo!",
        description: `Chủ đề: ${data.meta.topic}`,
      });
    } catch (error) {
      console.error('Error generating lesson:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tạo bài đọc. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const submitAnswer = (questionIndex: number, answer: string | boolean) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionIndex]: answer,
    }));
  };

  const checkAnswers = () => {
    setShowResults(true);
    const correctCount = lesson?.post_reading.quizzes.reduce((count, quiz, index) => {
      const userAnswer = userAnswers[index];
      if (quiz.type === 'mcq' && userAnswer === quiz.correct) return count + 1;
      if (quiz.type === 'tf' && userAnswer === quiz.answer) return count + 1;
      if (quiz.type === 'gapfill' && typeof userAnswer === 'string' && 
          userAnswer.toLowerCase().trim() === quiz.answer?.toString().toLowerCase().trim()) {
        return count + 1;
      }
      return count;
    }, 0) || 0;

    toast({
      title: "Kết quả",
      description: `Bạn trả lời đúng ${correctCount}/${lesson?.post_reading.quizzes.length || 0} câu`,
    });
  };

  return {
    lesson,
    isLoading,
    currentStep,
    userAnswers,
    showResults,
    generateLesson,
    nextStep,
    prevStep,
    submitAnswer,
    checkAnswers,
  };
};

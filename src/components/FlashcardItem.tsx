import { useState } from "react";
import { Flashcard } from "@/types/flashcard";
import { Card, CardContent } from "@/components/ui/card";
import { Volume2 } from "lucide-react";

interface FlashcardItemProps {
  flashcard: Flashcard;
}

export const FlashcardItem = ({ flashcard }: FlashcardItemProps) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    speechSynthesis.speak(utterance);
  };

  return (
    <div className="perspective-1000 h-[280px]">
      <div
        className="relative w-full h-full cursor-pointer transition-transform duration-700 transform-style-3d"
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* Front side */}
        <Card
          className="absolute inset-0 backface-hidden border-2 shadow-md hover:shadow-lg transition-shadow"
          style={{ 
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden"
          }}
        >
          <CardContent className="flex flex-col items-center justify-center h-full p-6 text-center">
            <div className="mb-4">
              <h3 className="text-3xl font-bold text-primary mb-2">
                {flashcard.englishWord}
              </h3>
              <div className="flex items-center justify-center gap-2">
                <p className="text-muted-foreground">{flashcard.phonetic}</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    speak(flashcard.englishWord);
                  }}
                  className="p-1 hover:bg-accent/10 rounded-full transition-colors"
                >
                  <Volume2 className="h-4 w-4 text-accent" />
                </button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground italic">
              Nhấn để xem nghĩa
            </p>
          </CardContent>
        </Card>

        {/* Back side */}
        <Card
          className="absolute inset-0 backface-hidden border-2 shadow-md bg-gradient-to-br from-primary/5 to-accent/5"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <CardContent className="flex flex-col justify-center h-full p-6">
            <div className="mb-6 text-center">
              <div className="inline-block px-4 py-2 bg-primary/10 rounded-lg mb-3">
                <h3 className="text-2xl font-bold text-primary">
                  {flashcard.vietnameseMeaning}
                </h3>
              </div>
              <p className="text-sm text-muted-foreground">
                {flashcard.englishWord} {flashcard.phonetic}
              </p>
            </div>
            <div className="space-y-3 text-sm bg-card/50 p-4 rounded-lg">
              <p className="text-foreground font-medium">{flashcard.exampleSentenceEn}</p>
              <p className="text-muted-foreground italic">
                {flashcard.exampleSentenceVi}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

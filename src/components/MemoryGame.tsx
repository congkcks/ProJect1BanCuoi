import { useState, useEffect, useCallback } from "react";
import { Flashcard } from "@/types/flashcard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Trophy, Clock, RotateCcw, Zap } from "lucide-react";

interface MemoryGameProps {
  flashcards: Flashcard[];
  groupId: string;
}

interface GameCard {
  id: string;
  content: string;
  pairId: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface HighScore {
  score: number;
  time: number;
  flips: number;
  date: string;
}

export const MemoryGame = ({ flashcards, groupId }: MemoryGameProps) => {
  const { toast } = useToast();
  const [cards, setCards] = useState<GameCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<string[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number>(0);
  const [flipCount, setFlipCount] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [highScores, setHighScores] = useState<HighScore[]>([]);

  // Load high scores from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(`memory-game-scores-${groupId}`);
    if (stored) {
      setHighScores(JSON.parse(stored));
    }
  }, [groupId]);

  // Initialize game
  const initializeGame = useCallback(() => {
    // Select random flashcards (4-6 pairs = 8-12 cards)
    const numPairs = Math.min(6, Math.max(4, Math.floor(flashcards.length / 2)));
    const selectedCards = flashcards
      .sort(() => Math.random() - 0.5)
      .slice(0, numPairs);

    // Create pairs (English word + Vietnamese meaning)
    const gamePairs: GameCard[] = [];
    selectedCards.forEach((card, idx) => {
      gamePairs.push(
        {
          id: `${idx}-en`,
          content: card.englishWord,
          pairId: `pair-${idx}`,
          isFlipped: false,
          isMatched: false,
        },
        {
          id: `${idx}-vi`,
          content: card.vietnameseMeaning,
          pairId: `pair-${idx}`,
          isFlipped: false,
          isMatched: false,
        }
      );
    });

    // Shuffle all cards
    const shuffled = gamePairs.sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setFlippedCards([]);
    setMatchedPairs(0);
    setFlipCount(0);
    setTimer(0);
    setIsPlaying(true);
    setIsComplete(false);
  }, [flashcards]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && !isComplete) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, isComplete]);

  // Handle card click
  const handleCardClick = (cardId: string) => {
    if (
      !isPlaying ||
      isComplete ||
      flippedCards.length >= 2 ||
      flippedCards.includes(cardId) ||
      cards.find((c) => c.id === cardId)?.isMatched
    ) {
      return;
    }

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    if (newFlippedCards.length === 2) {
      setFlipCount((prev) => prev + 1);
      checkMatch(newFlippedCards);
    }
  };

  // Check if cards match
  const checkMatch = (flipped: string[]) => {
    const [card1Id, card2Id] = flipped;
    const card1 = cards.find((c) => c.id === card1Id);
    const card2 = cards.find((c) => c.id === card2Id);

    if (card1?.pairId === card2?.pairId) {
      // Match found! Mark as matched first
      setCards((prev) =>
        prev.map((c) =>
          c.id === card1Id || c.id === card2Id ? { ...c, isMatched: true } : c
        )
      );

      toast({
        title: "🎉 Đúng rồi!",
        description: "Bạn đã tìm được một cặp!",
      });

      // Remove cards after animation
      setTimeout(() => {
        setCards((prev) => prev.filter((c) => c.id !== card1Id && c.id !== card2Id));
        setMatchedPairs((prev) => prev + 1);
        setFlippedCards([]);
      }, 800);
    } else {
      // No match - flip back after delay
      setTimeout(() => {
        setFlippedCards([]);
      }, 1000);
    }
  };

  // Check if game is complete
  useEffect(() => {
    const totalPairs = (cards.length + matchedPairs * 2) / 2;
    if (matchedPairs > 0 && matchedPairs === totalPairs) {
      setIsComplete(true);
      setIsPlaying(false);

      // Calculate score (lower is better: time + flips)
      const score = timer + flipCount * 2;
      const newScore: HighScore = {
        score,
        time: timer,
        flips: flipCount,
        date: new Date().toISOString(),
      };

      // Update high scores
      const updatedScores = [...highScores, newScore]
        .sort((a, b) => a.score - b.score)
        .slice(0, 10);
      setHighScores(updatedScores);
      localStorage.setItem(
        `memory-game-scores-${groupId}`,
        JSON.stringify(updatedScores)
      );

      toast({
        title: "🎊 Hoàn thành!",
        description: `Điểm của bạn: ${score} (${timer}s, ${flipCount} lượt lật)`,
        duration: 5000,
      });
    }
  }, [matchedPairs, cards.length, timer, flipCount, groupId, highScores, toast]);

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!isPlaying && cards.length === 0) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
            <Zap className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-3xl font-bold">Trò chơi Ghép Thẻ</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Tìm các cặp từ tiếng Anh và nghĩa tiếng Việt của chúng. Hoàn thành nhanh nhất với ít lượt lật nhất!
          </p>
          <Button onClick={initializeGame} size="lg" className="mt-4">
            Bắt đầu chơi
          </Button>
        </div>

        {/* High Scores */}
        {highScores.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <h3 className="text-xl font-bold">Bảng Xếp Hạng</h3>
              </div>
              <div className="space-y-2">
                {highScores.map((score, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-lg w-6">#{idx + 1}</span>
                      <div className="text-sm">
                        <div className="font-medium">
                          Điểm: {score.score}
                        </div>
                        <div className="text-muted-foreground">
                          {formatTime(score.time)} • {score.flips} lượt
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(score.date).toLocaleDateString("vi-VN")}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Game Stats */}
      <div className="flex items-center justify-between gap-4 p-4 rounded-lg bg-card border">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="font-mono text-lg font-bold">
              {formatTime(timer)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-muted-foreground" />
            <span className="font-mono text-lg font-bold">{flipCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-muted-foreground" />
            <span className="font-mono text-lg font-bold">
              {matchedPairs}/{(cards.length + matchedPairs * 2) / 2}
            </span>
          </div>
        </div>
        <Button onClick={initializeGame} variant="outline" size="sm">
          <RotateCcw className="w-4 h-4 mr-2" />
          Chơi lại
        </Button>
      </div>

      {/* Game Board */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {cards.map((card) => {
          const isFlipped = flippedCards.includes(card.id) || card.isMatched;
          return (
            <button
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              disabled={isFlipped}
              className={`relative aspect-square group transition-all duration-500 ${
                card.isMatched ? "scale-110 opacity-0" : ""
              }`}
            >
              <div
                className={`absolute inset-0 transition-all duration-500 transform-gpu preserve-3d ${
                  isFlipped ? "rotate-y-180" : ""
                }`}
                style={{
                  transformStyle: "preserve-3d",
                  transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                }}
              >
                {/* Card Back */}
                <div
                  className={`absolute inset-0 rounded-lg border-2 flex items-center justify-center backface-hidden ${
                    card.isMatched
                      ? "bg-green-500/80 border-green-400 shadow-lg shadow-green-500/50"
                      : "bg-gradient-to-br from-primary via-primary to-accent border-primary/20 group-hover:scale-105 transition-transform"
                  }`}
                  style={{ backfaceVisibility: "hidden" }}
                >
                  {!card.isMatched && (
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                      <span className="text-2xl">?</span>
                    </div>
                  )}
                </div>

                {/* Card Front */}
                <div
                  className="absolute inset-0 rounded-lg border-2 border-border bg-card p-4 flex items-center justify-center text-center backface-hidden"
                  style={{
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                  }}
                >
                  <span className="font-medium text-sm break-words">
                    {card.content}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Completion Message */}
      {isComplete && (
        <Card className="border-success bg-success/5">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="text-5xl mb-2">🎉</div>
            <h3 className="text-2xl font-bold">Xuất sắc!</h3>
            <p className="text-muted-foreground">
              Bạn đã hoàn thành trong {formatTime(timer)} với {flipCount} lượt lật
            </p>
            <p className="text-lg font-semibold">
              Điểm số: {timer + flipCount * 2}
            </p>
            <Button onClick={initializeGame} size="lg">
              Chơi lại
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

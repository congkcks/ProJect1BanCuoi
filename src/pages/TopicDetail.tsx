import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { getTopicSentences, getTopics } from "@/services/conversationApi";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Volume2, Mic, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Breadcrumb } from "@/components/Breadcrumb";
import { ChatMessage } from "@/components/ChatMessage";
import { SpeakingModal } from "@/components/SpeakingModal";
import { ListenModal } from "@/components/ListenModal";
import { CharacterSelectionDialog } from "@/components/CharacterSelectionDialog";

const TopicDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState<number | null>(null);
  const [isSpeakingModalOpen, setIsSpeakingModalOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [currentWords, setCurrentWords] = useState<Array<{ text: string; status: 'correct' | 'incorrect' | 'missing' | 'pending' }>>([]);
  const [selectedSentenceIndex, setSelectedSentenceIndex] = useState(0);
  const [showCharacterSelection, setShowCharacterSelection] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<'John' | 'Tom' | null>(null);
  const [isListenModalOpen, setIsListenModalOpen] = useState(false);
  const [listenSentenceIndex, setListenSentenceIndex] = useState(0);

  const { data: topics } = useQuery({
    queryKey: ['topics'],
    queryFn: getTopics,
  });

  const { data: sentences, isLoading, error } = useQuery({
    queryKey: ['topic-sentences', id],
    queryFn: () => getTopicSentences(Number(id)),
    enabled: !!id,
  });

  const currentTopic = topics?.find(t => t.topic_id === Number(id));

  const handleStopPlayback = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setCurrentSentenceIndex(null);
    setIsListenModalOpen(false);
  };

  const handleListenAll = () => {
    if (!sentences || sentences.length === 0) return;
    
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlaying(true);
      setListenSentenceIndex(0);
      setIsListenModalOpen(true);
      
      const speakSentence = (index: number) => {
        if (index >= sentences.length) {
          setIsPlaying(false);
          setIsListenModalOpen(false);
          return;
        }

        setListenSentenceIndex(index);
        
        const utterance = new SpeechSynthesisUtterance(sentences[index].sentence_text);
        utterance.lang = 'en-US';
        utterance.rate = 0.9;
        
        utterance.onend = () => {
          setTimeout(() => {
            speakSentence(index + 1);
          }, 1000);
        };

        window.speechSynthesis.speak(utterance);
      };

      speakSentence(0);
    } else {
      toast({
        title: "Not supported",
        description: "Speech synthesis is not supported in your browser.",
        variant: "destructive",
      });
    }
  };

  const handleSpeak = () => {
    if (!sentences || sentences.length === 0) return;
    setShowCharacterSelection(true);
  };

  const handleCharacterSelected = (character: 'John' | 'Tom') => {
    setSelectedCharacter(character);
    
    // Start from beginning of conversation
    if (messages[0].speaker === character) {
      // User speaks first
      setSelectedSentenceIndex(0);
      setIsSpeakingModalOpen(true);
      const words = sentences[0].sentence_text.split(' ').map(word => ({
        text: word,
        status: 'pending' as const
      }));
      setCurrentWords(words);
    } else {
      // Other character speaks first, auto-play then move to user's turn
      setIsSpeakingModalOpen(true);
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(sentences[0].sentence_text);
        utterance.lang = 'en-US';
        utterance.rate = 0.9;
        
        utterance.onend = () => {
          // Move to user's first sentence
          setSelectedSentenceIndex(1);
          const words = sentences[1].sentence_text.split(' ').map(word => ({
            text: word,
            status: 'pending' as const
          }));
          setCurrentWords(words);
        };
        
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  const handlePlayCurrentSentence = () => {
    if (!sentences) return;
    
    const sentence = sentences[selectedSentenceIndex];
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(sentence.sentence_text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleStartRecording = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({
        title: "Not supported",
        description: "Speech recognition is not supported in your browser.",
        variant: "destructive",
      });
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      const expectedText = sentences![selectedSentenceIndex].sentence_text.toLowerCase();
      
      // Simple word matching for demo
      const spokenWords = transcript.split(' ');
      const expectedWords = expectedText.split(' ');
      
      const scoredWords = expectedWords.map((word, idx) => {
        const cleanWord = word.replace(/[.,!?]/g, '');
        const spokenWord = spokenWords[idx]?.replace(/[.,!?]/g, '');
        
        if (spokenWord === cleanWord) {
          return { text: word, status: 'correct' as const };
        } else if (spokenWords.includes(cleanWord)) {
          return { text: word, status: 'missing' as const };
        } else {
          return { text: word, status: 'incorrect' as const };
        }
      });
      
      setCurrentWords(scoredWords);
      setIsRecording(false);
      
      toast({
        title: "Recording complete!",
        description: "Check your pronunciation above.",
      });

      // Automatically play next sentence after 1.5 seconds
      setTimeout(() => {
        playNextCharacterSentence();
      }, 1500);
    };

    recognition.onerror = () => {
      setIsRecording(false);
      toast({
        title: "Error",
        description: "Speech recognition error occurred.",
        variant: "destructive",
      });
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
  };

  const playNextCharacterSentence = () => {
    if (!sentences || !selectedCharacter) return;

    // Find next sentence that is NOT the selected character's turn
    const nextIndex = selectedSentenceIndex + 1;
    if (nextIndex < sentences.length) {
      const nextMessage = messages[nextIndex];
      
      // Play the other character's voice
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(sentences[nextIndex].sentence_text);
        utterance.lang = 'en-US';
        utterance.rate = 0.9;
        
        utterance.onend = () => {
          // After playing, move to the next sentence for the user
          const userNextIndex = nextIndex + 1;
          if (userNextIndex < sentences.length && messages[userNextIndex].speaker === selectedCharacter) {
            setSelectedSentenceIndex(userNextIndex);
            const words = sentences[userNextIndex].sentence_text.split(' ').map(word => ({
              text: word,
              status: 'pending' as const
            }));
            setCurrentWords(words);
          } else {
            // Conversation complete
            toast({
              title: "Great job!",
              description: "You've completed this conversation practice.",
            });
            setIsSpeakingModalOpen(false);
          }
        };

        window.speechSynthesis.speak(utterance);
      }
    } else {
      // Conversation complete
      toast({
        title: "Great job!",
        description: "You've completed this conversation practice.",
      });
      setIsSpeakingModalOpen(false);
    }
  };

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="mx-auto max-w-4xl">
          <Skeleton className="mb-8 h-10 w-64" />
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !sentences) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="mx-auto max-w-4xl">
          <Alert variant="destructive">
            <AlertDescription>
              Failed to load sentences. Please try again later.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // Determine speakers (alternating between two speakers)
  const messages = sentences.map((sentence, index) => ({
    ...sentence,
    speaker: index % 2 === 0 ? "Tom" : "John",
    isRight: index % 2 === 0,
  }));

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-4xl animate-fade-in">
        <Breadcrumb 
          items={[
            { label: "Speaking", href: "/topics" },
            { label: currentTopic?.level || "Beginner" },
            { label: "Conversation" }
          ]}
        />

        <h1 className="mb-8 text-center text-3xl font-bold text-primary">
          {currentTopic?.title || "Conversation Practice"}
        </h1>

        {/* Chat Messages */}
        <div className="mb-8 max-h-[60vh] overflow-y-auto rounded-lg bg-card border border-border p-4 shadow-sm">
          {messages.map((message, index) => (
            <ChatMessage
              key={message.sentence_id}
              text={message.sentence_text}
              textVi={message.sentence_vi}
              speaker={message.speaker}
              isRight={message.isRight}
              isActive={currentSentenceIndex === index}
            />
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          {isPlaying ? (
            <Button
              onClick={handleStopPlayback}
              size="lg"
              variant="destructive"
              className="px-8 transition-all hover:scale-105"
            >
              <X className="mr-2 h-5 w-5" />
              Stop
            </Button>
          ) : (
            <>
              <Button
                onClick={handleListenAll}
                size="lg"
                className="bg-info hover:bg-info/90 text-info-foreground px-8 transition-all hover:scale-105 shadow-md"
              >
                <Volume2 className="mr-2 h-5 w-5" />
                Listen
              </Button>
              <Button
                onClick={handleSpeak}
                size="lg"
                className="bg-warning hover:bg-warning/90 text-warning-foreground px-8 transition-all hover:scale-105 shadow-md"
              >
                <Mic className="mr-2 h-5 w-5" />
                Speak
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      {sentences && sentences.length > 0 && (
        <>
          <ListenModal
            open={isListenModalOpen}
            onClose={() => {
              setIsListenModalOpen(false);
              if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
              }
            }}
            sentence={sentences[listenSentenceIndex]?.sentence_text || ""}
            sentenceVi={sentences[listenSentenceIndex]?.sentence_vi}
            speaker={messages[listenSentenceIndex]?.speaker || "John"}
            isRight={messages[listenSentenceIndex]?.isRight}
          />
          <CharacterSelectionDialog
            open={showCharacterSelection}
            onClose={() => setShowCharacterSelection(false)}
            onSelectCharacter={handleCharacterSelected}
          />
          <SpeakingModal
            open={isSpeakingModalOpen}
            onClose={() => {
              setIsSpeakingModalOpen(false);
              setIsRecording(false);
              setSelectedCharacter(null);
              if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
              }
            }}
            sentence={sentences[selectedSentenceIndex]?.sentence_text || ""}
            sentenceVi={sentences[selectedSentenceIndex]?.sentence_vi}
            speaker={messages[selectedSentenceIndex]?.speaker || "John"}
            isRecording={isRecording}
            words={currentWords}
            onPlaySentence={handlePlayCurrentSentence}
            onStartRecording={handleStartRecording}
          />
        </>
      )}
    </div>
  );
};

export default TopicDetail;

import { useState } from "react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Skeleton } from "@/components/ui/skeleton";

interface WordDefinition {
  word: string;
  phonetic?: string;
  meanings: {
    partOfSpeech: string;
    definitions: {
      definition: string;
      example?: string;
    }[];
  }[];
}

interface WordTooltipProps {
  word: string;
  children: React.ReactNode;
}

export const WordTooltip = ({ word, children }: WordTooltipProps) => {
  const [definition, setDefinition] = useState<WordDefinition | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [fetched, setFetched] = useState(false);

  const fetchDefinition = async () => {
    if (fetched) return;
    
    setLoading(true);
    setError(false);
    setFetched(true);

    try {
      const response = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`
      );
      
      if (!response.ok) {
        throw new Error("Word not found");
      }

      const data = await response.json();
      setDefinition(data[0]);
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <HoverCard openDelay={300}>
      <HoverCardTrigger asChild>
        <span
          className="cursor-help underline decoration-dotted decoration-primary/30 hover:decoration-primary/60 transition-colors"
          onMouseEnter={fetchDefinition}
        >
          {children}
        </span>
      </HoverCardTrigger>
      <HoverCardContent className="w-80 max-h-96 overflow-y-auto" side="top">
        {loading && (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
          </div>
        )}

        {error && (
          <div className="text-sm text-muted-foreground">
            Không tìm thấy định nghĩa cho từ này.
          </div>
        )}

        {definition && !loading && (
          <div className="space-y-3">
            <div>
              <h4 className="font-bold text-lg">{definition.word}</h4>
              {definition.phonetic && (
                <p className="text-sm text-muted-foreground">{definition.phonetic}</p>
              )}
            </div>

            {definition.meanings.slice(0, 2).map((meaning, idx) => (
              <div key={idx} className="space-y-2">
                <p className="text-sm font-semibold text-primary">
                  {meaning.partOfSpeech}
                </p>
                {meaning.definitions.slice(0, 2).map((def, defIdx) => (
                  <div key={defIdx} className="ml-2 space-y-1">
                    <p className="text-sm">{def.definition}</p>
                    {def.example && (
                      <p className="text-xs italic text-muted-foreground">
                        "{def.example}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </HoverCardContent>
    </HoverCard>
  );
};

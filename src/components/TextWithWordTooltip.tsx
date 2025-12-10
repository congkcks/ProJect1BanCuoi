import { WordTooltip } from "./WordTooltip";

interface TextWithWordTooltipProps {
  text: string;
  className?: string;
}

export const TextWithWordTooltip = ({ text, className = "" }: TextWithWordTooltipProps) => {
  // Tách text thành các từ và dấu câu
  const parts = text.split(/(\s+|[.,!?;:()"-])/g);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        // Kiểm tra nếu là từ (không phải khoảng trắng hoặc dấu câu)
        const isWord = /^[a-zA-Z]+$/.test(part);
        
        if (isWord && part.length > 2) {
          return (
            <WordTooltip key={index} word={part}>
              {part}
            </WordTooltip>
          );
        }
        
        return <span key={index}>{part}</span>;
      })}
    </span>
  );
};

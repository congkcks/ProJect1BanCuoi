import { Button } from "@/components/ui/button";

interface CategoryTagProps {
  label: string;
  isActive?: boolean;
  onClick?: () => void;
}

export const CategoryTag = ({ label, isActive = false, onClick }: CategoryTagProps) => {
  return (
    <Button
      variant={isActive ? "default" : "outline"}
      size="sm"
      onClick={onClick}
      className="rounded-full px-4 py-2 text-sm font-medium transition-all hover:scale-105"
    >
      {label}
    </Button>
  );
};

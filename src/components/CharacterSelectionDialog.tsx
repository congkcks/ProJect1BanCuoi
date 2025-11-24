import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";

interface CharacterSelectionDialogProps {
  open: boolean;
  onClose: () => void;
  onSelectCharacter: (character: 'John' | 'Tom') => void;
}

export const CharacterSelectionDialog = ({ 
  open, 
  onClose,
  onSelectCharacter
}: CharacterSelectionDialogProps) => {
  const handleSelect = (character: 'John' | 'Tom') => {
    onSelectCharacter(character);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">Select Character</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-6 py-6">
          {/* John Character */}
          <button
            onClick={() => handleSelect('John')}
            className="flex flex-col items-center gap-3 p-4 rounded-lg hover:bg-accent transition-colors"
          >
            <div className="w-32 h-32 rounded-full bg-info/20 flex items-center justify-center border-4 border-info/30 hover:border-info transition-all">
              <User className="h-16 w-16 text-info" />
            </div>
            <span className="text-lg font-semibold">John</span>
          </button>

          {/* Tom Character */}
          <button
            onClick={() => handleSelect('Tom')}
            className="flex flex-col items-center gap-3 p-4 rounded-lg hover:bg-accent transition-colors"
          >
            <div className="w-32 h-32 rounded-full bg-success/20 flex items-center justify-center border-4 border-success/30 hover:border-success transition-all">
              <User className="h-16 w-16 text-success" />
            </div>
            <span className="text-lg font-semibold">Tom</span>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
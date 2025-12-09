import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => Promise<void> | void;
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
}: DeleteConfirmDialogProps) {
  const [pending, setPending] = useState(false);

  const handleConfirm = async () => {
    try {
      setPending(true);
      await onConfirm();
      onOpenChange(false);
    } finally {
      setPending(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Huy</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={pending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {pending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Dang xoa...
              </span>
            ) : (
              "Xoa"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}


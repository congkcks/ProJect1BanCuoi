import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface UserInfoDialogProps {
  open: boolean;
  onSubmit: (userId: number, userEmail: string) => void;
}

export const UserInfoDialog = ({ open, onSubmit }: UserInfoDialogProps) => {
  const [userId, setUserId] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId || !userEmail) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const userIdNum = parseInt(userId);
    if (isNaN(userIdNum)) {
      toast({
        title: "Error",
        description: "User ID must be a number",
        variant: "destructive",
      });
      return;
    }

    onSubmit(userIdNum, userEmail);
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Enter Your Information</DialogTitle>
          <DialogDescription>
            Please provide your user ID and email to start the test.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="userId">User ID</Label>
            <Input
              id="userId"
              type="number"
              placeholder="Enter your user ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="userEmail">Email</Label>
            <Input
              id="userEmail"
              type="email"
              placeholder="Enter your email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full">
            Start Test
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

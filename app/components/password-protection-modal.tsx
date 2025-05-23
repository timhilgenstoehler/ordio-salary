import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function PasswordProtectionModal({
  isOpen,
  onSuccess,
}: {
  isOpen: boolean;
  onSuccess: () => void;
}) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    if (isAuthenticated === "true") {
      onSuccess();
    }
    setIsChecking(false);
  }, [onSuccess]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // This is a very simple password check - in a real app, you'd want to use proper authentication
    if (password === "admin123") {
      localStorage.setItem("isAuthenticated", "true");
      onSuccess();
      setError(false);
    } else {
      setError(true);
    }
  };

  if (isChecking) {
    return null; // Don't show anything while checking localStorage
  }

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Password Required</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={error ? "border-red-500" : ""}
            />
            {error && (
              <p className="text-sm text-red-500">Incorrect password</p>
            )}
          </div>
          <Button type="submit" className="w-full">
            Submit
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createDeveloper } from "@/app/actions/developer-actions";
import { useRouter } from "next/navigation";

type AddDeveloperButtonProps = {
  variant?:
    | "default"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "destructive";
};

export function AddDeveloperButton({
  variant = "outline",
}: AddDeveloperButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    current_level: "1",
    current_salary: "",
    hire_date: new Date().toISOString().split("T")[0],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLevelChange = (value: string) => {
    setFormData((prev) => ({ ...prev, current_level: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await createDeveloper({
        name: formData.name,
        email: formData.email,
        current_level: Number.parseInt(formData.current_level),
        current_salary: Number.parseFloat(formData.current_salary),
        hire_date: formData.hire_date,
      });

      setOpen(false);
      router.refresh();

      setFormData({
        name: "",
        email: "",
        current_level: "1",
        current_salary: "",
        hire_date: new Date().toISOString().split("T")[0],
      });
    } catch (err: any) {
      console.error("Error creating developer:", err);
      setError("Failed to create developer. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant}>
          <Users className="mr-2 h-4 w-4" />
          Add Developer
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Developer</DialogTitle>
            <DialogDescription>
              Add a new developer to the progression framework.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <Alert variant="destructive" className="my-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="current_level" className="text-right">
                Level
              </Label>
              <Select
                value={formData.current_level}
                onValueChange={handleLevelChange}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Level 1 - Junior</SelectItem>
                  <SelectItem value="2">Level 2 - Mid</SelectItem>
                  <SelectItem value="3">Level 3 - Senior</SelectItem>
                  <SelectItem value="4">Level 4 - Specialist</SelectItem>
                  <SelectItem value="5">
                    Level 5 - Expert / Team Lead
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="current_salary" className="text-right">
                Salary (€)
              </Label>
              <Input
                id="current_salary"
                name="current_salary"
                type="number"
                value={formData.current_salary}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="hire_date" className="text-right">
                Hire Date
              </Label>
              <Input
                id="hire_date"
                name="hire_date"
                type="date"
                value={formData.hire_date}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Developer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

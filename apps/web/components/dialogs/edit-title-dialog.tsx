
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@workspace/ui/components/dialog";
import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";
import { useState, useEffect } from "react";
import type { FC } from "react";

interface EditTitleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newTitle: string) => void;
  initialTitle: string;
  title: string;
  description: string;
}

export const EditTitleDialog: FC<EditTitleDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  initialTitle,
  title,
  description,
}) => {
  const [newTitle, setNewTitle] = useState(initialTitle);

  useEffect(() => {
    setNewTitle(initialTitle);
  }, [initialTitle]);

  const handleSave = () => {
    onSave(newTitle);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

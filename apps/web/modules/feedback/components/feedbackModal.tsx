"use client";

import React, { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { Button } from "@workspace/ui/components/button";
import { X } from "lucide-react";

interface FeedbackModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  customerId: string;
}

const FEEDBACK_TYPES = [
  { value: "bug", label: "Bug" },
  { value: "feature", label: "Feature" },
  { value: "improvement", label: "Improvement" },
  { value: "general", label: "General" },
];

const PRIORITIES = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

type FeedbackType = "bug" | "feature" | "improvement" | "general";
type PriorityType = "low" | "medium" | "high";

export default function FeedbackModal({
  open,
  setOpen,
  customerId,
}: FeedbackModalProps) {
  const [feedbackType, setFeedbackType] = useState<FeedbackType>("bug");
  const [priority, setPriority] = useState<PriorityType>("medium");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [screenshots, setScreenshots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitFeedback = useMutation(api.web.feedback.submitFeedback);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await submitFeedback({
        customerId,
        feedbackType,
        title,
        description,
        priority,
        screenshots: screenshots.length > 0 ? screenshots : undefined,
      });
      setSuccess(true);
      setTimeout(() => {
        setOpen(false);
        setSuccess(false);
        setTitle("");
        setDescription("");
        setScreenshots([]);
      }, 1200);
    } catch {
      setError("Failed to submit feedback. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-6xl bg-card border border-border rounded-2xl shadow-2xl my-12 mx-4 p-8 animate-fadeIn">
        {/* Close Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
          onClick={() => setOpen(false)}
          aria-label="Close"
        >
          X
        </Button>

        <h2 className="text-3xl font-bold mb-6 text-foreground">
          Submit Feedback
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Type and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Feedback Type
              </label>
              <select
                className="w-full border border-input rounded-lg px-4 py-2 bg-background text-foreground focus:border-ring focus:ring-2 focus:ring-ring/30 outline-none transition"
                value={feedbackType}
                onChange={(e) =>
                  setFeedbackType(e.target.value as FeedbackType)
                }
                required
              >
                {FEEDBACK_TYPES.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Priority
              </label>
              <select
                className="w-full border border-input rounded-lg px-4 py-2 bg-background text-foreground focus:border-ring focus:ring-2 focus:ring-ring/30 outline-none transition"
                value={priority}
                onChange={(e) => setPriority(e.target.value as PriorityType)}
                required
              >
                {PRIORITIES.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Title
            </label>
            <input
              className="w-full border border-input rounded-lg px-4 py-2 bg-background text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30 outline-none transition"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={80}
              placeholder="Short summary of your feedback"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Description
            </label>
            <textarea
              className="w-full border border-input rounded-lg px-4 py-2 min-h-[150px] bg-background text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30 outline-none transition resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              maxLength={1000}
              placeholder="Describe your feedback in detail..."
            />
          </div>

          {/* Screenshot input (optional, if you want to keep it) */}
          {/* <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Screenshot URLs (optional)
            </label>
            <input
              type="text"
              placeholder="Paste image URL and press Enter"
              className="w-full border border-input rounded-lg px-4 py-2 bg-background text-foreground focus:border-ring focus:ring-2 focus:ring-ring/30 outline-none transition"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  const input = e.target as HTMLInputElement;
                  const url = input.value.trim();
                  if (url && !screenshots.includes(url)) {
                    setScreenshots([...screenshots, url]);
                    input.value = "";
                  }
                }
              }}
            />
            {screenshots.length > 0 && (
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                {screenshots.map((s, i) => (
                  <li key={i} className="truncate">
                    {s}
                  </li>
                ))}
              </ul>
            )}
          </div> */}

          {/* Feedback Messages */}
          {error && (
            <div className="text-destructive text-sm font-medium">{error}</div>
          )}
          {success && (
            <div className="text-green-600 dark:text-green-400 text-sm font-medium">
              Feedback submitted successfully!
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={loading} className="px-6 py-2">
              {loading ? "Submitting..." : "Submit Feedback"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

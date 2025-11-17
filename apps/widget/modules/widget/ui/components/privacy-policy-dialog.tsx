"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Button } from "@workspace/ui/components/button";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { useMutation } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { useAtom } from "jotai";
import { contactSessionIdAtomFamily } from "../../atoms/widget-atoms";
import { Id } from "@workspace/backend/_generated/dataModel";

interface PrivacyPolicyDialogProps {
  privacyPolicyText: string;
  organizationId: string;
  onAccept?: (name?: string, contactSessionId?: Id<"contactSessions">) => void;
  backgroundColor?: string;
  textColor?: string;
  mutedTextColor?: string;
  borderColor?: string;
}

export const PrivacyPolicyDialog = ({
  privacyPolicyText,
  organizationId,
  onAccept,
  backgroundColor,
  textColor,
  mutedTextColor,
  borderColor,
}: PrivacyPolicyDialogProps) => {
  const [open, setOpen] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!organizationId) {
    throw new Error("organizationId is required for PrivacyPolicyDialog");
  }

  const [contactSessionId, setContactSessionId] = useAtom(
    contactSessionIdAtomFamily(organizationId)
  );

  const createContactSession = useMutation(api.public.contactSessions.create);
  const validateContactSession = useMutation(
    api.public.contactSessions.validate
  );

  useEffect(() => {
    if (!isClient) {
      return;
    }

    const validateSession = async () => {
      if (contactSessionId) {
        try {
          const result = await validateContactSession({ contactSessionId });
          if (result.valid) {
            setOpen(false);
          } else {
            // Session is expired or invalid, clear it
            setContactSessionId(null);
            setOpen(true);
          }
        } catch (error) {
          console.error("Error validating contact session:", error);
          // Also clear session on error
          setContactSessionId(null);
          setOpen(true);
        }
      } else {
        // No session ID, so we need to ask for consent.
        setOpen(true);
      }
    };

    if (organizationId) {
      validateSession();
    }
  }, [
    isClient,
    contactSessionId,
    organizationId,
    setContactSessionId,
    validateContactSession,
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreed) {
      return;
    }
    setLoading(true);

    try {
      // Create contact session in database
      const newContactSessionId = await createContactSession({
        name: name,
        email: email,
        organizationId: organizationId,
        metadata: {
          userAgent: navigator.userAgent,
          language: navigator.language,
          platform: navigator.platform,
          currentUrl: window.location.href,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          timezoneOffset: new Date().getTimezoneOffset(),
          cookieEnabled: navigator.cookieEnabled,
        },
      });

      // Update state
      setContactSessionId(newContactSessionId);

      // Close dialog
      setOpen(false);

      // Reset loading state
      setLoading(false);

      // 5. Pass contactSessionId to the parent handler
      if (onAccept) {
        onAccept(name || undefined, newContactSessionId);
      }
    } catch (error) {
      console.error("Error saving privacy acceptance:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-[500px] max-h-[90vh] flex flex-col"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        style={{ backgroundColor, borderColor }}
      >
        <DialogHeader>
          <DialogTitle style={{ color: textColor }}>Privacy Policy</DialogTitle>
          <DialogDescription style={{ color: mutedTextColor }}>
            Please review and accept our privacy policy to continue.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-6 flex-1 overflow-hidden"
        >
          {/* Scrollable privacy policy text */}
          <div 
            className="flex-1 overflow-y-auto border rounded-md p-4"
            style={{ borderColor, backgroundColor: backgroundColor ? `${backgroundColor}20` : undefined }}
          >
            <p 
              className="text-sm whitespace-pre-wrap"
              style={{ color: mutedTextColor }}
            >
              {privacyPolicyText}
            </p>
          </div>

          {/* Name input (optional) */}
          <div className="space-y-2">
            <Label htmlFor="name" style={{ color: textColor }}>Name (Optional)</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ backgroundColor, borderColor, color: textColor }}
            />
            <Label htmlFor="email" style={{ color: textColor }}>Email (Optional)</Label>
            <Input
              id="email"
              type="text"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ backgroundColor, borderColor, color: textColor }}
            />
          </div>

          {/* Agreement checkbox */}
          <div className="flex items-start space-x-3">
            <Checkbox
              id="agreement"
              checked={agreed}
              onCheckedChange={(checked) => setAgreed(checked === true)}
              style={{ borderColor }}
            />
            <Label
              htmlFor="agreement"
              className="text-sm font-normal leading-normal cursor-pointer"
              style={{ color: textColor }}
            >
              I have read and agree to the privacy policy
            </Label>
          </div>

          {/* Submit button */}
          <DialogFooter>
            <Button
              type="submit"
              disabled={!agreed} // Only disable if not agreed
              className="w-full sm:w-auto"
            >
              {loading
                ? "Loading..."
                : !agreed
                  ? "You must agree to continue"
                  : "Accept and Continue"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

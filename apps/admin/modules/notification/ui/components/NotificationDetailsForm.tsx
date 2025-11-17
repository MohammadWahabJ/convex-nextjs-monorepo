import React from "react";
import { Label } from "@workspace/ui/components/label";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { NotificationType, NotificationFormData } from "../../types";
import { NOTIFICATION_TYPES, FORM_LIMITS } from "../../constants";

interface NotificationDetailsFormProps {
  formData: NotificationFormData;
  onFormDataChange: (data: Partial<NotificationFormData>) => void;
}

export const NotificationDetailsForm: React.FC<
  NotificationDetailsFormProps
> = ({ formData, onFormDataChange }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Notification Details</h3>

      {/* Type and Created By */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="type" className="text-sm font-medium">
            Type *
          </Label>
          <Select
            value={formData.type}
            onValueChange={(value: NotificationType) =>
              onFormDataChange({ type: value })
            }
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {NOTIFICATION_TYPES.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Title */}
      <div>
        <Label htmlFor="title" className="text-sm font-medium">
          Title * ({formData.title.length}/{FORM_LIMITS.TITLE_MAX_LENGTH})
        </Label>
        <Input
          id="title"
          type="text"
          value={formData.title}
          onChange={(e) => onFormDataChange({ title: e.target.value })}
          required
          maxLength={FORM_LIMITS.TITLE_MAX_LENGTH}
          placeholder="Enter notification title"
          className="mt-1"
        />
      </div>

      {/* Message */}
      <div>
        <Label htmlFor="message" className="text-sm font-medium">
          Message * ({formData.message.length}/{FORM_LIMITS.MESSAGE_MAX_LENGTH})
        </Label>
        <Textarea
          id="message"
          value={formData.message}
          onChange={(e) => onFormDataChange({ message: e.target.value })}
          required
          maxLength={FORM_LIMITS.MESSAGE_MAX_LENGTH}
          placeholder="Enter notification message"
          className="mt-1 min-h-[120px] resize-none"
          rows={5}
        />
      </div>

      {/* Action URL */}
      {/* <div>
        <Label htmlFor="actionUrl" className="text-sm font-medium">
          Action URL (Optional)
        </Label>
        <Input
          id="actionUrl"
          type="url"
          value={formData.actionUrl}
          onChange={(e) => onFormDataChange({ actionUrl: e.target.value })}
          placeholder="Enter optional action URL"
          className="mt-1"
        />
      </div> */}
    </div>
  );
};

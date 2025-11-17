"use client";

import { Label } from "@workspace/ui/components/label";
import { Checkbox } from "@workspace/ui/components/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";

interface ProcessingOptionsProps {
  includeImages: boolean;
  includeDocuments: boolean;
  frequency: string;
  onIncludeImagesChange: (value: boolean) => void;
  onIncludeDocumentsChange: (value: boolean) => void;
  onFrequencyChange: (value: string) => void;
}

export function ProcessingOptions({
  includeImages,
  includeDocuments,
  frequency,
  onIncludeImagesChange,
  onIncludeDocumentsChange,
  onFrequencyChange,
}: ProcessingOptionsProps) {
  return (
    <div className="space-y-4 mb-4 p-4 bg-muted/50 dark:bg-muted/20 rounded-lg border">
      <h4 className="font-medium text-sm text-foreground">
        Processing Options
      </h4>

      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="include-images"
            checked={includeImages}
            onCheckedChange={(checked) =>
              onIncludeImagesChange(checked as boolean)
            }
          />
          <Label
            htmlFor="include-images"
            className="text-sm font-normal cursor-pointer"
          >
            Include Images
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="include-documents"
            checked={includeDocuments}
            onCheckedChange={(checked) =>
              onIncludeDocumentsChange(checked as boolean)
            }
          />
          <Label
            htmlFor="include-documents"
            className="text-sm font-normal cursor-pointer"
          >
            Include Documents
          </Label>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="frequency">Update Frequency</Label>
        <Select value={frequency} onValueChange={onFrequencyChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select frequency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="never">Never</SelectItem>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

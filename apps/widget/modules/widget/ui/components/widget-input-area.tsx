import React from 'react'
import { cn } from '@workspace/ui/lib/utils'

import { 
  PromptInput,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
  PromptInputSubmit
} from '@workspace/ui/components/ai/prompt-input'

interface WidgetInputAreaProps {
  onSubmit?: (message: { text: string }) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  backgroundColor?: string
  borderColor?: string
  textColor?: string
}

export const WidgetInputArea = ({
  onSubmit,
  placeholder = 'How can I help you today?',
  disabled = false,
  className,
  backgroundColor,
  borderColor,
  textColor,
}: WidgetInputAreaProps) => {
  const handleSubmit = ({ text }: { text?: string }) => {
    if (text?.trim() && onSubmit) {
      onSubmit({ text: text.trim() })
    }
  }

  return (
    <div className={cn('px-6 py-4 border-t', className)} style={{ backgroundColor, borderColor }}>
      <PromptInput onSubmit={handleSubmit}>
        <PromptInputTextarea
            placeholder={placeholder}
            disabled={disabled}
            style={{ color: textColor }}
        />
        <PromptInputToolbar>
            <PromptInputTools>
                {/* Add any additional tools here if needed */}
            </PromptInputTools>
            <PromptInputSubmit disabled={disabled} />
        </PromptInputToolbar>
      </PromptInput>
    </div>
  )
}

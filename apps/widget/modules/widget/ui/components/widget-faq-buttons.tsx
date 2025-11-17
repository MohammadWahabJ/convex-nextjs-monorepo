import React from 'react'
import { cn } from '@workspace/ui/lib/utils'
import { Button } from '@workspace/ui/components/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export interface FAQItem {
  id: string
  question: string
}

interface WidgetFAQButtonsProps {
  title?: string
  faqs?: FAQItem[]
  onFAQClick?: (faq: FAQItem) => void
  onPrevious?: () => void
  onNext?: () => void
  showNavigation?: boolean
  className?: string
  textColor?: string
  mutedTextColor?: string
  borderColor?: string
  buttonBackgroundColor?: string
}

export const WidgetFAQButtons = ({
  title = 'FREQUENTLY ASKED QUESTIONS',
  faqs = [],
  onFAQClick,
  onPrevious,
  onNext,
  showNavigation = true,
  className,
  textColor,
  mutedTextColor,
  borderColor,
  buttonBackgroundColor,
}: WidgetFAQButtonsProps) => {
  return (
    <div className={cn('px-6 py-4 space-y-4 mb-auto', className)}>
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold tracking-wide" style={{ color: mutedTextColor }}>
          {title}
        </h2>
        {/* {showNavigation && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={onPrevious}
              style={{ color: textColor }}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={onNext}
              style={{ color: textColor }}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )} */}
      </div>

      {/* FAQ Buttons Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {faqs.map((faq) => (
          <Button
            key={faq.id}
            variant="outline"
            className="h-auto py-3 cursor-pointer px-4 text-left justify-start whitespace-normal"
            onClick={() => onFAQClick?.(faq)}
            style={{
              color: textColor,
              borderColor: borderColor,
              backgroundColor: buttonBackgroundColor,
            }}
          >
            {faq.question}
          </Button>
        ))}
      </div>

      {/* Empty State */}
      {faqs.length === 0 && (
        <div className="text-center py-8 text-sm" style={{ color: mutedTextColor }}>
          No frequently asked questions available.
        </div>
      )}
    </div>
  )
}

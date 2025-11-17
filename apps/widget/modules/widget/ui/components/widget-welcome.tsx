import React from 'react'
import { cn } from '@workspace/ui/lib/utils'

interface WidgetWelcomeProps {
  title?: string
  description?: string
  aiNotice?: string
  className?: string
  textColor?: string
  mutedTextColor?: string
}

export const WidgetWelcome = ({
  title = 'Welcome',
  description = 'I am your digital assistant and am available to you around the clock for questions and concerns. Simply write your request in the input field below. I look forward to helping you!',
  aiNotice = 'This AI-generated information is for initial orientation; for binding information, please contact experts.',
  className,
  textColor,
  mutedTextColor,
}: WidgetWelcomeProps) => {
  return (
    <div className={cn('px-6 py-6 flex-grow space-y-4', className)}>
      <h1 className="text-2xl font-bold" style={{ color: textColor }}>{title}</h1>
      <p className="leading-relaxed" style={{ color: mutedTextColor }}>{description}</p>
      <p className="text-xs italic" style={{ color: mutedTextColor }}>{aiNotice}</p>
    </div>
  )
}

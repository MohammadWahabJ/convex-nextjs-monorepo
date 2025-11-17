import React from 'react'
import { cn } from '@workspace/ui/lib/utils'

interface WidgetContainerProps {
  children: React.ReactNode
  className?: string
  backgroundColor?: string
}

export const WidgetContainer = ({ children, className, backgroundColor }: WidgetContainerProps) => {
  return (
    <div
      className={cn(
        'flex flex-col h-screen w-full overflow-hidden',
        className
      )}
      style={{ backgroundColor }}
    >
      {children}
    </div>
  )
}

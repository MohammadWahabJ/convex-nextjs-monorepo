import React from 'react'
import Image from 'next/image'
import { cn } from '@workspace/ui/lib/utils'

interface WidgetSideBarProps {
  logoUrl?: string
  logoAlt?: string
  headerText?: string
  footerText?: string
  className?: string
  backgroundColor?: string
  borderColor?: string
  textColor?: string
  mutedTextColor?: string
}

const WidgetSideBar = ({
  logoUrl,
  logoAlt = 'Logo',
  headerText,
  footerText,
  className,
  backgroundColor,
  borderColor,
  textColor,
  mutedTextColor,
}: WidgetSideBarProps) => {
  return (
    <div 
      className={cn('hidden md:flex flex-col justify-between h-screen w-[200px] border-r py-8', className)}
      style={{ backgroundColor, borderColor }}
    >
      {/* Logo at the top */}
      <div className="flex justify-center">
        {logoUrl ? (
          <Image 
            src={logoUrl} 
            alt={logoAlt}
            width={160}
            height={160}
            className="object-contain" 
          />
        ) : (
          <h2 className="text-2xl font-bold" style={{ color: textColor }}>Logo</h2>
        )}
      </div>
      
      {/* Headline text at the bottom */}
      <div className="flex flex-col px-8">
        <p className="text-lg font-semibold" style={{ color: textColor }}>{headerText}</p>
        <p className="text-xs" style={{ color: mutedTextColor }}>{footerText}</p>
      </div>
    </div>
  )
}

export default WidgetSideBar
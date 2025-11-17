import { cn } from "@workspace/ui/lib/utils"
import { Spinner } from "@workspace/ui/components/spinner"

interface SplashScreenLoadingProps {
  /**
   * The text to display below the spinner
   * @default "Loading..."
   */
  text?: string
  /**
   * Additional className for the container
   */
  className?: string
  /**
   * Additional className for the spinner
   */
  spinnerClassName?: string
  /**
   * Additional className for the text
   */
  textClassName?: string
  /**
   * Size variant for the spinner
   */
  size?: "sm" | "md" | "lg" | "xl"
}

const sizeClasses = {
  sm: "size-6",
  md: "size-8", 
  lg: "size-12",
  xl: "size-16"
}

function SplashScreenLoading({ 
  text = "Loading...",
  className,
  spinnerClassName,
  textClassName,
  size = "lg"
}: SplashScreenLoadingProps) {
  return (
    <div 
      className={cn(
        "fixed inset-0 z-50 flex flex-col items-center justify-center bg-background",
        className
      )}
      role="status"
      aria-live="polite"
      aria-label={text}
    >
      <div className="flex flex-col items-center gap-4">
        <Spinner 
          className={cn(
            sizeClasses[size],
            spinnerClassName
          )}
        />
        {text && (
          <p 
            className={cn(
              "text-sm text-muted-foreground animate-pulse",
              textClassName
            )}
          >
            {text}
          </p>
        )}
      </div>
    </div>
  )
}

export { SplashScreenLoading, type SplashScreenLoadingProps }
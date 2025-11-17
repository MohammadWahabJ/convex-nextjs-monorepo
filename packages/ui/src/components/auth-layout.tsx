import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { BackgroundGradientAnimation } from "@workspace/ui/components/background-gradient-animation";
import { ThemeSwitcher } from "@workspace/ui/components/theme-switcher";
import { LanguageSwitcher } from "@workspace/ui/components/language-switcher";

interface AuthLayoutProps {
  children: React.ReactNode;
  className?: string;
  showSwitchers?: boolean;
  showLanguageButton?: boolean;
  languageButtonText?: string;
  onLanguageClick?: () => void;
  brandingText?: string;
  brandingClassName?: string;
  gradientConfig?: {
    gradientBackgroundStart?: string;
    gradientBackgroundEnd?: string;
    firstColor?: string;
    secondColor?: string;
    thirdColor?: string;
    fourthColor?: string;
    fifthColor?: string;
    pointerColor?: string;
    interactive?: boolean;
  };
}

export const AuthLayout = ({
  children,
  className,
  showSwitchers = true,
  showLanguageButton = false,
  languageButtonText = "Language",
  onLanguageClick,
  brandingText = "KI QUADRAT",
  brandingClassName,
  gradientConfig = {
    gradientBackgroundStart: "rgb(0, 50, 150)",
    gradientBackgroundEnd: "rgb(0, 20, 100)",
    firstColor: "30, 144, 255",
    secondColor: "65, 105, 225",
    thirdColor: "100, 149, 237",
    fourthColor: "70, 130, 180",
    fifthColor: "135, 206, 250",
    pointerColor: "100, 149, 237",
    interactive: true,
  },
}: AuthLayoutProps) => {
  return (
    <div
      className={cn(
        "bg-background relative h-screen w-full overflow-hidden",
        className
      )}
    >
      {(showSwitchers || showLanguageButton) && (
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          {showSwitchers && (
            <>
              {/* <ThemeSwitcher />
              <LanguageSwitcher /> */}
            </>
          )}
          {showLanguageButton && !showSwitchers && (
            <Button onClick={onLanguageClick}>{languageButtonText}</Button>
          )}
        </div>
      )}

      <div className="grid h-full w-full lg:grid-cols-2">
        {/* Left side - Logo with blue gradient background */}
        <div className="relative hidden overflow-hidden lg:block">
          <BackgroundGradientAnimation
            containerClassName="h-full w-full"
            gradientBackgroundStart={gradientConfig.gradientBackgroundStart}
            gradientBackgroundEnd={gradientConfig.gradientBackgroundEnd}
            firstColor={gradientConfig.firstColor}
            secondColor={gradientConfig.secondColor}
            thirdColor={gradientConfig.thirdColor}
            fourthColor={gradientConfig.fourthColor}
            fifthColor={gradientConfig.fifthColor}
            pointerColor={gradientConfig.pointerColor}
            interactive={gradientConfig.interactive}
          >
            {/* Branding Text */}
            <div className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center px-4 text-center text-3xl font-bold text-white md:text-4xl lg:text-6xl">
              <p
                className={cn(
                  "bg-gradient-to-b from-white/90 to-white/40 bg-clip-text text-transparent drop-shadow-2xl",
                  brandingClassName
                )}
              >
                {brandingText}
              </p>
            </div>
          </BackgroundGradientAnimation>
        </div>

        {/* Right side - Form with background dots */}
        <div className="relative flex items-center justify-center overflow-y-auto bg-blue-50">
          <div className="flex w-full flex-col items-center justify-center">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

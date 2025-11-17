import { BackgroundGradientAnimation } from "../components/background-gradient-animation";

export const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="bg-background min-h-screen w-full flex items-center justify-center">
      {/* Outer wrapper ensures full-viewport height so each column can use h-screen */}
      <div className="flex w-full h-screen flex-col lg:flex-row">
        {/* Left: Gradient animation - takes half the screen on lg+ */}
        <div className="w-full lg:w-1/2 h-1/2 lg:h-screen flex items-center justify-center overflow-hidden relative">
          <BackgroundGradientAnimation
            containerClassName="h-full w-full"
            gradientBackgroundStart="rgb(0, 50, 150)"
            gradientBackgroundEnd="rgb(0, 20, 100)"
            firstColor="30, 144, 255"
            secondColor="65, 105, 225"
            thirdColor="100, 149, 237"
            fourthColor="70, 130, 180"
            fifthColor="135, 206, 250"
            pointerColor="100, 149, 237"
            interactive={true}
          >
            {/* Centered title inside the gradient */}
            <div className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center px-4 text-center text-4xl font-extrabold text-white md:text-5xl lg:text-6xl">
              <p className="bg-gradient-to-b from-white/90 to-white/40 bg-clip-text text-transparent drop-shadow-2xl">
                KI QUADRAT
              </p>
            </div>
          </BackgroundGradientAnimation>
        </div>

        {/* Right: children - takes half the screen on lg+ and centers its content */}
        <div className="w-full lg:w-1/2 h-1/2 lg:h-screen flex items-center justify-center">
          <div className="w-full max-w-md px-6 py-12">{children}</div>
        </div>
      </div>
    </div>
  );
};

"use client";

import { cn } from "@workspace/ui/lib/utils";
import { motion } from "framer-motion";
import { Brain } from "lucide-react";


// --- Framer Motion Variants ---

const containerVariants = {
  // Staggering the start of the dot animation
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.15,
      // We let the individual dot variant handle the infinite loop
    },
  },
};

const dotVariants = {
  initial: {
    y: "0%",
  },
  // Bounce animation using keyframes
  animate: {
    y: ["0%", "-60%", "0%"],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      repeatType: "loop" as const,
      ease: "easeInOut" as const,
    },
  },
};

// --- Component ---

interface ThinkingProps {
  className?: string;
}

export const Thinking = ({ className }: ThinkingProps) => {
  return (
    // Centering the component in the viewport
    <div
      className={cn(
        "flex items-center justify-center h-screen w-screen bg-background",
        className,
      )}
    >
      <div className="flex items-center space-x-3 text-card-foreground">
        
        {/* --- Text and Pulsating Dots Section --- */}
        <div className="flex items-center space-x-2">
          {/* Increased font size for better visibility and a cleaner look */}
          <span className="text-3xl font-semibold">
            Thinking
          </span>
          
          <motion.div
            className="flex h-6 items-end space-x-1 pt-1" // Added padding to align dots better
            variants={containerVariants}
            initial="initial"
            animate="animate"
          >
            {/* Animated dots */}
            {[0, 1, 2].map((index) => (
              <motion.span
                key={index}
                className="h-2.5 w-2.5 rounded-full bg-primary"
                variants={dotVariants}
              />
            ))}
          </motion.div>
        </div>
        
      </div>
    </div>
  );
};
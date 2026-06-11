"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/shared/lib/utils";

type SliderProps = React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> & {
  size?: "default" | "sm";
  trackClassName?: string;
  thumbClassName?: string;
};

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ className, size = "default", trackClassName, thumbClassName, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn("relative flex w-full touch-none select-none items-center", className)}
    {...props}
  >
    <SliderPrimitive.Track
      className={cn(
        "relative w-full grow overflow-hidden rounded-full bg-secondary",
        size === "sm" ? "h-1" : "h-1.5",
        trackClassName,
      )}
    >
      <SliderPrimitive.Range className="absolute h-full bg-primary" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb
      className={cn(
        "block rounded-full border-2 border-background bg-primary shadow-xs ring-offset-background transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50",
        size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5",
        thumbClassName,
      )}
    />
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };

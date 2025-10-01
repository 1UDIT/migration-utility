import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-4 items-center overflow-hidden   bg-primary/20 mr-2 border border-black",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1  bg-gradient-to-r from-[#00fbff] to-[#00d0ff] transition-all"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    >
    </ProgressPrimitive.Indicator>
    {/* <span className="flex flex-row-reverse text-dark">{value}%</span> */}
    <span className="absolute text-white -bottom-[3px] text-sm">{value}%</span>
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
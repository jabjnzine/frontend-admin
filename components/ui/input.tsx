import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // Base styles
          "flex h-11 w-full rounded-lg border border-slate-200",
          "bg-white px-4 py-2.5 text-sm text-slate-900",
          "placeholder:text-slate-400",
          // Shadow and depth
          "shadow-sm",
          // Transitions - explicit properties only (not "all")
          "transition-[border-color,box-shadow,background-color] duration-200 ease-out",
          // Hover state
          "hover:border-slate-300 hover:shadow-md",
          // Focus state - visible focus ring
          "focus-visible:outline-none",
          "focus-visible:ring-2 focus-visible:ring-blue-500/20",
          "focus-visible:border-blue-500",
          "focus-visible:shadow-md focus-visible:shadow-blue-500/10",
          // Disabled state
          "disabled:cursor-not-allowed disabled:opacity-50",
          "disabled:bg-slate-50 disabled:border-slate-200",
          // File input specific
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          // Reduced motion support
          "motion-reduce:transition-none",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }

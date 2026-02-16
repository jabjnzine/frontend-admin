"use client";

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className="relative group">
        <select
          className={cn(
            // Base styles
            "flex h-11 w-full rounded-lg border border-slate-200",
            "bg-white px-4 py-2.5 pr-10 text-sm text-slate-900",
            "appearance-none cursor-pointer",
            // Shadow and depth
            "shadow-sm",
            // Transitions - explicit properties only
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
            // Reduced motion support
            "motion-reduce:transition-none",
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        {/* Custom chevron icon */}
        <ChevronDown 
          className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none transition-transform duration-200 ease-out group-hover:text-slate-600 group-focus-within:text-blue-500 group-focus-within:rotate-180 motion-reduce:transition-none"
          aria-hidden="true"
        />
        {/* Focus indicator line */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-b-lg opacity-0 scale-x-0 transition-[opacity,transform] duration-200 ease-out group-focus-within:opacity-100 group-focus-within:scale-x-100 motion-reduce:transition-none"
          aria-hidden="true"
        />
      </div>
    )
  }
)
Select.displayName = "Select"

export { Select }

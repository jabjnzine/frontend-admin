"use client";

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-sm font-semibold ring-offset-background transition-all duration-[250ms] ease-[cubic-bezier(0.4,0,0.2,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer relative overflow-hidden",
  {
    variants: {
      variant: {
        default: 
          "bg-[#8B5CF6] text-white border-none rounded-[10px] shadow-[0_1px_3px_rgba(139,92,246,0.3)] hover:bg-[#7C3AED] hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(139,92,246,0.4)] active:translate-y-0 active:shadow-[0_2px_8px_rgba(139,92,246,0.3)]",
        destructive:
          "bg-transparent text-red-600 border-2 border-red-500 rounded-[10px] hover:bg-red-500 hover:text-white hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(239,68,68,0.3)] active:translate-y-0",
        outline:
          "bg-transparent text-[#8B5CF6] border-2 border-[#8B5CF6] rounded-[10px] hover:bg-[#8B5CF6] hover:text-white hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(139,92,246,0.3)] active:translate-y-0",
        secondary:
          "bg-[#F5F3FF] text-[#8B5CF6] border-none rounded-[10px] hover:bg-[#EDE9FE] hover:-translate-y-0.5 active:translate-y-0",
        ghost: 
          "bg-transparent text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 rounded-lg active:scale-95",
        link: "text-[#8B5CF6] underline-offset-4 hover:underline hover:text-[#7C3AED] bg-transparent",
      },
      size: {
        default: "h-11 px-6 py-2.5 rounded-[10px]",
        sm: "h-9 rounded-[8px] px-4 text-xs",
        lg: "h-12 rounded-[12px] px-10 text-base",
        icon: "h-11 w-11 rounded-[12px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, onClick, ...props }, ref) => {
    const buttonRef = React.useRef<HTMLButtonElement>(null);
    const [ripples, setRipples] = React.useState<Array<{ x: number; y: number; id: number; diameter: number }>>([]);

    React.useImperativeHandle(ref, () => buttonRef.current as HTMLButtonElement);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (props.disabled) return;
      
      const button = e.currentTarget;
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const diameter = Math.max(button.clientWidth, button.clientHeight);
      const id = Date.now();

      setRipples((prev) => [...prev, { x, y, id, diameter }]);

      setTimeout(() => {
        setRipples((prev) => prev.filter((ripple) => ripple.id !== id));
      }, 600);

      onClick?.(e);
    };

    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={buttonRef}
        onClick={handleClick}
        {...props}
      >
        {props.children}
        {ripples.map((ripple) => {
          const radius = ripple.diameter / 2;
          return (
            <span
              key={ripple.id}
              className="absolute rounded-full bg-white/40 pointer-events-none"
              style={{
                left: `${ripple.x - radius}px`,
                top: `${ripple.y - radius}px`,
                width: `${ripple.diameter}px`,
                height: `${ripple.diameter}px`,
                animation: "ripple 0.6s ease-out",
              }}
            />
          );
        })}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

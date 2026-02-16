import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoadingProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  text?: string;
}

export function Loading({ className, size = "md", text }: LoadingProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-10 w-10",
    lg: "h-16 w-16",
  };

  return (
    <div className={cn("flex flex-col items-center justify-center gap-4 py-12", className)}>
      <div className="relative">
        <div className={cn("border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin", sizeClasses[size])}></div>
        <div className={cn("absolute inset-0 border-4 border-transparent border-r-purple-600 rounded-full animate-spin", sizeClasses[size])} style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
      </div>
      {text && <p className="text-sm font-medium text-slate-600 animate-pulse">{text}</p>}
    </div>
  );
}

export function TableLoading({ rows = 5 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="border-b">
          <td colSpan={100} className="p-4">
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">กำลังโหลด...</span>
            </div>
          </td>
        </tr>
      ))}
    </>
  );
}


import { cn } from '@/lib/utils'

interface LoadingIndicatorProps {
  className?: string
  text?: string
}

export function LoadingIndicator({ className, text = '載入中...' }: LoadingIndicatorProps) {
  return (
    <div className={cn("min-h-screen flex items-center justify-center", className)}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">{text}</p>
      </div>
    </div>
  )
}

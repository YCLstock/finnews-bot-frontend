import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon?: LucideIcon
  trend?: {
    value: number
    label: string
    isPositive?: boolean
  }
  status?: 'active' | 'inactive' | 'warning' | 'error'
  className?: string
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  status,
  className
}: StatCardProps) {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/10 text-green-700 border-green-500/20 dark:bg-green-400/10 dark:text-green-400 dark:border-green-400/20'
      case 'inactive':
        return 'bg-muted text-muted-foreground border-border'
      case 'warning':
        return 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20 dark:bg-yellow-400/10 dark:text-yellow-400 dark:border-yellow-400/20'
      case 'error':
        return 'bg-destructive/10 text-destructive border-destructive/20 dark:bg-destructive/10 dark:text-destructive dark:border-destructive/20'
      default:
        return 'bg-primary/10 text-primary border-primary/20 dark:bg-primary/10 dark:text-primary dark:border-primary/20'
    }
  }

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'active':
        return '運行中'
      case 'inactive':
        return '未啟用'
      case 'warning':
        return '警告'
      case 'error':
        return '錯誤'
      default:
        return '正常'
    }
  }

  return (
    <Card className={cn("transition-all hover:shadow-md", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="flex items-center space-x-2">
          {status && (
            <Badge variant="outline" className={getStatusColor(status)}>
              {getStatusText(status)}
            </Badge>
          )}
          {Icon && (
            <Icon className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        
        {description && (
          <p className="text-xs text-muted-foreground mt-1">
            {description}
          </p>
        )}
        
        {trend && (
          <div className="flex items-center mt-2">
            <span className={cn(
              "text-xs font-medium",
              trend.isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
            )}>
              {trend.isPositive ? '+' : ''}{trend.value}%
            </span>
            <span className="text-xs text-muted-foreground ml-1">
              {trend.label}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 
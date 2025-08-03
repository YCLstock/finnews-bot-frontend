'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { 
  Server, 
  RefreshCw, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Loader2
} from 'lucide-react'

interface ColdStartAlertProps {
  isRetrying: boolean
  retryAttempt: number
  maxRetries: number
  onRetry?: () => void
  className?: string
}

export function ColdStartAlert({ 
  isRetrying, 
  retryAttempt, 
  maxRetries, 
  onRetry,
  className 
}: ColdStartAlertProps) {
  const progress = (retryAttempt / maxRetries) * 100
  const isNearComplete = retryAttempt >= maxRetries - 1
  
  if (!isRetrying && retryAttempt === 0) {
    return null
  }

  return (
    <Alert className={`border-blue-200 bg-blue-50 ${className}`}>
      <Server className="h-4 w-4 text-blue-600" />
      <AlertDescription>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-blue-800 mb-1">
                {isRetrying ? '🚀 伺服器啟動中' : '⚡ 連線準備中'}
              </h4>
              <p className="text-sm text-blue-700">
                {isRetrying 
                  ? 'Render 免費版伺服器正在從休眠狀態啟動，這通常需要 30-60 秒...'
                  : '伺服器已準備就緒，可以重試載入數據'
                }
              </p>
            </div>
            
            {isRetrying && (
              <Loader2 className="h-6 w-6 text-blue-600 animate-spin flex-shrink-0" />
            )}
          </div>

          {/* 進度條 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-blue-600">
              <span>重試進度</span>
              <span>{retryAttempt} / {maxRetries}</span>
            </div>
            <Progress 
              value={progress} 
              className="h-2"
              style={{
                '--progress-foreground': isNearComplete ? '#ef4444' : '#3b82f6'
              } as React.CSSProperties}
            />
          </div>

          {/* 狀態指示 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="flex items-center space-x-2">
              <Clock className="h-3 w-3 text-blue-600" />
              <span className="text-blue-700">
                預計等待: {Math.max(0, (maxRetries - retryAttempt) * 8)}秒
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              {isNearComplete ? (
                <AlertTriangle className="h-3 w-3 text-amber-600" />
              ) : (
                <CheckCircle className="h-3 w-3 text-green-600" />
              )}
              <span className={isNearComplete ? 'text-amber-700' : 'text-green-700'}>
                {isNearComplete ? '即將完成' : '進展順利'}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Server className="h-3 w-3 text-blue-600" />
              <span className="text-blue-700">
                {isRetrying ? '啟動中...' : '已就緒'}
              </span>
            </div>
          </div>

          {/* 操作按鈕 */}
          {!isRetrying && onRetry && (
            <div className="pt-2">
              <Button
                onClick={onRetry}
                size="sm"
                variant="outline"
                className="w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                重新載入數據
              </Button>
            </div>
          )}

          {/* 提示信息 */}
          <div className="text-xs text-blue-600 bg-blue-100 p-2 rounded">
            <strong>💡 為什麼會有等待時間？</strong>
            <br />
            Render 免費版會在 15 分鐘無活動後讓伺服器休眠以節省資源。
            首次訪問時需要重新啟動伺服器，這是正常現象。
          </div>
        </div>
      </AlertDescription>
    </Alert>
  )
}
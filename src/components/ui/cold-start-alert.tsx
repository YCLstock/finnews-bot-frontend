'use client'

import { useState, useEffect } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Clock, 
  RefreshCw, 
  AlertCircle, 
  Coffee,
  ExternalLink 
} from 'lucide-react'

interface ColdStartAlertProps {
  isVisible: boolean
  onRetry?: () => void
  onDismiss?: () => void
  estimatedWaitTime?: number
  className?: string
}

export function ColdStartAlert({ 
  isVisible, 
  onRetry, 
  onDismiss, 
  estimatedWaitTime = 30,
  className 
}: ColdStartAlertProps) {
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!isVisible) {
      setTimeElapsed(0)
      setProgress(0)
      return
    }

    const interval = setInterval(() => {
      setTimeElapsed(prev => {
        const newTime = prev + 1
        setProgress((newTime / estimatedWaitTime) * 100)
        return newTime
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isVisible, estimatedWaitTime])

  if (!isVisible) return null

  const remainingTime = Math.max(0, estimatedWaitTime - timeElapsed)

  return (
    <Alert className={`border-blue-200 bg-blue-50 dark:bg-blue-900/20 ${className}`}>
      <Coffee className="h-4 w-4 text-blue-600" />
      <AlertDescription>
        <div className="space-y-3">
          <div>
            <p className="text-blue-800 dark:text-blue-200 font-medium mb-2">
              🚀 後端服務啟動中，請稍候...
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              我們使用 Render 免費服務，首次訪問可能需要 {estimatedWaitTime} 秒來啟動後端服務。
            </p>
            {remainingTime > 0 && (
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                預計還需要約 {remainingTime} 秒
              </p>
            )}
          </div>

          <Progress value={Math.min(progress, 100)} className="h-2" />

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs text-blue-600 dark:text-blue-400">
              <Clock className="h-3 w-3" />
              <span>已等待 {timeElapsed} 秒</span>
            </div>
            
            <div className="flex space-x-2">
              {onRetry && (
                <Button
                  onClick={onRetry}
                  size="sm"
                  variant="outline"
                  className="text-blue-600 border-blue-300 hover:bg-blue-100"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  重試
                </Button>
              )}
              
              {onDismiss && (
                <Button
                  onClick={onDismiss}
                  size="sm"
                  variant="ghost"
                  className="text-blue-600 hover:bg-blue-100"
                >
                  隱藏
                </Button>
              )}
            </div>
          </div>

          <details className="text-xs text-blue-600 dark:text-blue-400">
            <summary className="cursor-pointer hover:underline">
              ℹ️ 了解更多關於服務啟動
            </summary>
            <div className="mt-2 p-2 bg-blue-100 dark:bg-blue-800 rounded text-blue-800 dark:text-blue-200">
              <p>我們的後端服務部署在 Render 免費方案上：</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>服務會在無活動 15 分鐘後自動休眠</li>
                <li>首次訪問需要 10-30 秒來喚醒服務</li>
                <li>啟動完成後響應速度會恢復正常</li>
                <li>這是免費服務的正常行為，請耐心等候</li>
              </ul>
              <div className="mt-2 pt-2 border-t border-blue-300 dark:border-blue-600">
                <a 
                  href="https://render.com/docs/free#free-web-services" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-xs text-blue-700 dark:text-blue-300 hover:underline"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Render 免費服務說明
                </a>
              </div>
            </div>
          </details>
        </div>
      </AlertDescription>
    </Alert>
  )
}

// 檢測是否可能是冷啟動錯誤的工具函數
export function isColdStartError(error: Error): boolean {
  const message = error.message.toLowerCase()
  return (
    message.includes('timeout') ||
    message.includes('network error') ||
    message.includes('fetch failed') ||
    message.includes('econnrefused') ||
    message.includes('503') ||
    message.includes('504')
  )
}
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useGuidance } from '@/hooks/useGuidance'
import { 
  Target, 
  TrendingUp, 
  AlertCircle, 
  X,
  Sparkles,
  BarChart3
} from 'lucide-react'

interface OptimizationBannerProps {
  onStartOptimization?: () => void
  onDismiss?: () => void
  className?: string
}

export function OptimizationBanner({ 
  onStartOptimization, 
  onDismiss,
  className 
}: OptimizationBannerProps) {
  const { 
    needsGuidance, 
    isGuidanceCompleted, 
    focusScore 
  } = useGuidance()

  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // 判斷是否需要顯示優化橫幅
    if (needsGuidance || (isGuidanceCompleted && focusScore < 0.5)) {
      setIsVisible(true)
    } else {
      setIsVisible(false)
    }
  }, [needsGuidance, isGuidanceCompleted, focusScore])

  const handleStartOptimization = () => {
    onStartOptimization?.()
  }

  const handleDismiss = () => {
    setIsVisible(false)
    onDismiss?.()
  }

  if (!isVisible) {
    return null
  }

  // 新用戶引導橫幅
  if (needsGuidance) {
    return (
      <Card className={`border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                  🎯 設定個人化新聞推送
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  完成快速設定，獲得精準的投資新聞推送。只需要 3-5 分鐘。
                </p>
                <div className="flex items-center space-x-2 mt-3">
                  <Button 
                    size="sm" 
                    onClick={handleStartOptimization}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Target className="h-4 w-4 mr-2" />
                    開始設定
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleDismiss}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    稍後設定
                  </Button>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="text-blue-600 hover:text-blue-800"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // 優化建議橫幅 (已完成引導但聚焦度較低)
  if (isGuidanceCompleted && focusScore < 0.5) {
    return (
      <Card className={`border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="font-semibold text-yellow-900 dark:text-yellow-100">
                    📊 優化您的新聞推送
                  </h3>
                  <Badge variant="secondary">
                    聚焦度 {Math.round(focusScore * 100)}%
                  </Badge>
                </div>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  您的關鍵字聚焦度較低，優化設定可以獲得更精準的新聞推送。
                </p>
                <div className="flex items-center space-x-2 mt-3">
                  <Button 
                    size="sm" 
                    onClick={handleStartOptimization}
                    className="bg-yellow-600 hover:bg-yellow-700"
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    立即優化
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleDismiss}
                    className="text-yellow-600 hover:text-yellow-800"
                  >
                    稍後優化
                  </Button>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="text-yellow-600 hover:text-yellow-800"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return null
}

// 簡化版本的優化提示組件
export function OptimizationHint({ focusScore }: { focusScore: number }) {
  if (focusScore >= 0.7) {
    return (
      <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
        <AlertCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-700 dark:text-green-300">
          <strong>設定優秀！</strong> 您的關鍵字聚焦度很高 ({Math.round(focusScore * 100)}%)，將獲得精準的新聞推送。
        </AlertDescription>
      </Alert>
    )
  } else if (focusScore >= 0.5) {
    return (
      <Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
        <AlertCircle className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="text-yellow-700 dark:text-yellow-300">
          <strong>可以優化：</strong> 您的聚焦度為 {Math.round(focusScore * 100)}%，考慮精簡關鍵字以獲得更精準的推送。
        </AlertDescription>
      </Alert>
    )
  } else {
    return (
      <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-700 dark:text-red-300">
          <strong>建議優化：</strong> 您的聚焦度較低 ({Math.round(focusScore * 100)}%)，建議重新設定關鍵字以提升推送相關性。
        </AlertDescription>
      </Alert>
    )
  }
}
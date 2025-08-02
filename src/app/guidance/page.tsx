'use client'

import { useState } from 'react'
import { ProtectedLayout } from '@/components/layout/ProtectedLayout'
import { OnboardingFlow } from '@/components/guidance/OnboardingFlow'
import { OptimizationBanner } from '@/components/guidance/OptimizationBanner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useGuidance } from '@/hooks/useGuidance'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  CheckCircle, 
  BarChart3, 
  Target,
  History,
  Settings
} from 'lucide-react'

export default function GuidancePage() {
  const router = useRouter()
  const { 
    guidanceStatus, 
    needsGuidance, 
    isGuidanceCompleted, 
    focusScore,
    loading 
  } = useGuidance()

  const [showOnboarding, setShowOnboarding] = useState(needsGuidance)

  const handleOnboardingComplete = () => {
    setShowOnboarding(false)
    router.push('/dashboard')
  }

  const handleStartOptimization = () => {
    setShowOnboarding(true)
  }

  if (loading) {
    return (
      <ProtectedLayout>
        <div className="p-6">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p>載入引導狀態中...</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </ProtectedLayout>
    )
  }

  return (
    <ProtectedLayout>
      <div className="p-6 space-y-6">
        {/* 頁面標題 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                個人化設定
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                設定和優化您的新聞推送偏好
              </p>
            </div>
          </div>
        </div>

        {/* 引導流程或狀態展示 */}
        {showOnboarding ? (
          <OnboardingFlow
            onComplete={handleOnboardingComplete}
            onCancel={() => setShowOnboarding(false)}
          />
        ) : (
          <div className="max-w-2xl mx-auto space-y-6">
            {/* 優化建議橫幅 */}
            <OptimizationBanner 
              onStartOptimization={handleStartOptimization}
              className="mb-6"
            />

            {/* 當前狀態卡片 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                  引導狀態
                </CardTitle>
                <CardDescription>
                  您的個人化設定狀態
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">引導完成</span>
                  <Badge variant={isGuidanceCompleted ? "default" : "secondary"}>
                    {isGuidanceCompleted ? "已完成" : "未完成"}
                  </Badge>
                </div>

                {isGuidanceCompleted && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">聚焦度評分</span>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant={
                            focusScore >= 0.7 ? "default" : 
                            focusScore >= 0.5 ? "secondary" : 
                            "destructive"
                          }
                        >
                          {Math.round(focusScore * 100)}%
                        </Badge>
                        <BarChart3 className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="font-medium">關鍵字數量</span>
                      <span className="text-sm text-gray-600">
                        {guidanceStatus?.keywords?.length || 0} 個
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="font-medium">聚類方法</span>
                      <Badge variant="outline">
                        {guidanceStatus?.clustering_method === 'openai_semantic' ? 'AI 語義分析' : '規則分析'}
                      </Badge>
                    </div>

                    {guidanceStatus?.last_guidance_at && (
                      <div className="flex items-center justify-between">
                        <span className="font-medium">最後更新</span>
                        <span className="text-sm text-gray-600">
                          {new Date(guidanceStatus.last_guidance_at).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* 操作按鈕 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleStartOptimization}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Target className="h-8 w-8 text-blue-500" />
                    <div>
                      <h3 className="font-medium">重新設定</h3>
                      <p className="text-sm text-gray-600">重新進行引導流程</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/subscriptions')}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Settings className="h-8 w-8 text-gray-500" />
                    <div>
                      <h3 className="font-medium">管理訂閱</h3>
                      <p className="text-sm text-gray-600">調整訂閱設定</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 關鍵字顯示 */}
            {isGuidanceCompleted && guidanceStatus?.keywords && guidanceStatus.keywords.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>您的關鍵字</CardTitle>
                  <CardDescription>
                    當前設定的關鍵字列表
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {guidanceStatus.keywords.map((keyword, index) => (
                      <Badge key={index} variant="secondary">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </ProtectedLayout>
  )
}
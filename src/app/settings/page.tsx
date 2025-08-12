'use client'

import { useState } from 'react'
import { ProtectedLayout } from '@/components/layout/ProtectedLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SubscriptionForm } from '@/components/subscription/SubscriptionForm'
import { OnboardingFlow } from '@/components/guidance/OnboardingFlow'
import { useSubscription } from '@/hooks/useSubscription'
import { 
  Settings, 
  Target, 
  Plus, 
  Edit3, 
  Trash2, 
  RefreshCw,
  CheckCircle,
  Clock,
  AlertTriangle,
  Sparkles
} from 'lucide-react'
import { toast } from 'sonner'

export default function SettingsPage() {
  const { 
    subscription, 
    hasSubscription, 
    deleteSubscription, 
    toggleSubscription,
    loading,
    refresh
  } = useSubscription()
  

  const [showSubscriptionForm, setShowSubscriptionForm] = useState(false)
  const [subscriptionFormMode, setSubscriptionFormMode] = useState<'create' | 'edit'>('create')
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // 處理創建訂閱
  const handleCreateSubscription = () => {
    setSubscriptionFormMode('create')
    setShowSubscriptionForm(true)
  }

  // 處理編輯訂閱
  const handleEditSubscription = () => {
    setSubscriptionFormMode('edit')
    setShowSubscriptionForm(true)
  }

  // 處理表單成功
  const handleSubscriptionFormSuccess = () => {
    setShowSubscriptionForm(false)
    refresh()
    toast.success(subscriptionFormMode === 'create' ? '訂閱創建成功！' : '訂閱更新成功！')
  }

  // 處理刪除訂閱
  const handleDeleteSubscription = async () => {
    if (!confirm('確定要刪除此訂閱嗎？此操作無法撤銷。')) {
      return
    }

    setActionLoading('delete')
    try {
      await deleteSubscription()
    } finally {
      setActionLoading(null)
    }
  }

  // 處理切換訂閱狀態
  const handleToggleSubscription = async () => {
    setActionLoading('toggle')
    try {
      await toggleSubscription()
    } finally {
      setActionLoading(null)
    }
  }

  // 開始個人化優化
  const handleStartOptimization = () => {
    setShowOnboarding(true)
  }

  // 完成個人化優化
  const handleOptimizationComplete = () => {
    setShowOnboarding(false)
    refresh()
    toast.success('個人化優化完成！')
  }

  // 獲取頻率顯示文本
  const getFrequencyText = (frequency: string) => {
    switch (frequency) {
      case 'daily':
        return '每日一次 (08:00)'
      case 'twice':
        return '每日兩次 (08:00, 20:00)'
      case 'thrice':
        return '每日三次 (08:00, 13:00, 20:00)'
      default:
        return frequency
    }
  }

  if (showOnboarding) {
    return (
      <ProtectedLayout>
        <div className="p-4 md:p-6 max-w-4xl mx-auto">
          <OnboardingFlow
            onComplete={handleOptimizationComplete}
            onCancel={() => setShowOnboarding(false)}
          />
        </div>
      </ProtectedLayout>
    )
  }

  if (showSubscriptionForm) {
    return (
      <ProtectedLayout>
        <div className="p-4 md:p-6 max-w-4xl mx-auto">
          <SubscriptionForm
            mode={subscriptionFormMode}
            onSuccess={handleSubscriptionFormSuccess}
            onCancel={() => setShowSubscriptionForm(false)}
          />
        </div>
      </ProtectedLayout>
    )
  }

  return (
    <ProtectedLayout>
      <div className="p-4 md:p-6 space-y-4 md:space-y-6 max-w-6xl mx-auto">
        {/* 頁面標題 */}
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-medium tracking-tight">
              設定
            </h1>
            <p className="text-muted-foreground text-sm md:text-base">
              管理您的訂閱設定和個人化偏好
            </p>
          </div>
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <Button
              onClick={refresh}
              disabled={loading}
              variant="outline"
              size="default"
              className="flex-1 sm:flex-initial h-11 md:h-10 rounded-xl"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              刷新
            </Button>
          </div>
        </div>

        <Tabs defaultValue="subscription" className="w-full">
          <TabsList className="grid w-full grid-cols-2 rounded-xl">
            <TabsTrigger value="subscription" className="rounded-lg">
              <Settings className="h-4 w-4 mr-2" />
              訂閱管理
            </TabsTrigger>
            <TabsTrigger value="personalization" className="rounded-lg">
              <Target className="h-4 w-4 mr-2" />
              個人化設定
            </TabsTrigger>
          </TabsList>

          {/* 訂閱管理頁簽 */}
          <TabsContent value="subscription" className="space-y-6 mt-6">
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">載入中...</p>
                </div>
              </div>
            )}

            {!loading && (
              <>
                {hasSubscription ? (
                  /* 現有訂閱 */
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="p-2 bg-primary/10 rounded-lg mr-3">
                            <Settings className="h-5 w-5 text-primary" />
                          </div>
                          當前訂閱
                        </div>
                        <Badge variant={subscription?.is_active ? "default" : "secondary"}>
                          {subscription?.is_active ? "已啟用" : "已停用"}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        您的財經新聞訂閱配置和狀態
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* 基本信息 */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <div>
                          <label className="text-sm font-medium text-foreground">
                            推送平台
                          </label>
                          <p className="text-sm text-muted-foreground">
                            Discord
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-foreground">
                            推送頻率
                          </label>
                          <p className="text-sm text-muted-foreground">
                            {getFrequencyText(subscription?.push_frequency_type || '')}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-foreground">
                            摘要語言
                          </label>
                          <p className="text-sm text-muted-foreground">
                            {subscription?.summary_language === 'zh-TW' ? '繁體中文' : subscription?.summary_language}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-foreground">
                            關鍵字數量
                          </label>
                          <p className="text-sm text-muted-foreground">
                            {subscription?.keywords?.length || 0} 個關鍵字
                          </p>
                        </div>
                      </div>

                      {/* 關鍵字 */}
                      {subscription?.keywords && subscription.keywords.length > 0 && (
                        <div>
                          <label className="text-sm font-medium text-foreground">
                            監控關鍵字
                          </label>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {subscription.keywords.map((keyword, index) => (
                              <Badge key={index} variant="outline" className="rounded-lg">
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 操作按鈕 */}
                      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border/30">
                        <Button
                          onClick={handleToggleSubscription}
                          disabled={actionLoading === 'toggle'}
                          variant={subscription?.is_active ? "outline" : "default"}
                          className="h-11 sm:h-10 flex-1 sm:flex-initial rounded-xl"
                        >
                          {actionLoading === 'toggle' ? (
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          ) : subscription?.is_active ? (
                            <Clock className="h-4 w-4 mr-2" />
                          ) : (
                            <CheckCircle className="h-4 w-4 mr-2" />
                          )}
                          {subscription?.is_active ? '暫停推送' : '啟用推送'}
                        </Button>
                        
                        <Button
                          onClick={handleEditSubscription}
                          variant="outline"
                          className="h-11 sm:h-10 flex-1 sm:flex-initial rounded-xl"
                        >
                          <Edit3 className="h-4 w-4 mr-2" />
                          編輯設置
                        </Button>
                        
                        <Button
                          onClick={handleDeleteSubscription}
                          disabled={actionLoading === 'delete'}
                          variant="destructive"
                          className="h-11 sm:h-10 flex-1 sm:flex-initial rounded-xl"
                        >
                          {actionLoading === 'delete' ? (
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4 mr-2" />
                          )}
                          刪除訂閱
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  /* 無訂閱狀態 */
                  <Card className="border-dashed border-2 border-border/50 bg-accent/10">
                    <CardContent className="flex flex-col items-center justify-center py-12 md:py-16 px-4 md:px-8">
                      <div className="p-3 md:p-4 bg-primary/10 rounded-3xl mb-4 md:mb-6">
                        <Settings className="h-10 w-10 md:h-12 md:w-12 text-primary" />
                      </div>
                      <h3 className="text-xl md:text-2xl font-medium mb-2 md:mb-3 text-center">
                        設置您的第一個訂閱
                      </h3>
                      <p className="text-muted-foreground text-center mb-6 md:mb-8 max-w-md leading-relaxed text-sm md:text-base">
                        創建財經新聞訂閱，設置關鍵字和推送偏好，開始接收個人化的 AI 摘要推送
                      </p>
                      <Button onClick={handleCreateSubscription} size="lg" className="rounded-xl h-12 px-6 text-base">
                        <Plus className="h-5 w-5 mr-2" />
                        創建訂閱
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* 狀態提醒 */}
                {hasSubscription && !subscription?.is_active && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
                    <div className="flex">
                      <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                      <div className="ml-3">
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                          您的訂閱目前處於停用狀態，將不會收到任何推送通知。
                          點擊「啟用推送」按鈕重新開始接收新聞推送。
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* 個人化設定頁簽 */}
          <TabsContent value="personalization" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <div className="p-2 bg-primary/10 rounded-lg mr-3">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  AI 個人化優化
                </CardTitle>
                <CardDescription>
                  透過 AI 分析優化您的關鍵字設定，提升新聞推送的精準度
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {hasSubscription ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-accent/10 rounded-xl border border-border/30">
                      <h4 className="font-medium mb-2">建議進行優化</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        系統檢測到您的設定可以進一步優化，透過引導流程來改善推送精準度。
                      </p>
                      <Button onClick={handleStartOptimization} className="rounded-xl">
                        <Target className="h-4 w-4 mr-2" />
                        開始個人化優化
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="p-3 bg-accent/10 rounded-2xl inline-flex mb-4">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <h4 className="font-medium mb-2">設定已優化</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      您的個人化設定目前狀態良好，無需額外優化。
                    </p>
                    <Button onClick={handleStartOptimization} variant="outline" className="rounded-xl">
                      <Sparkles className="h-4 w-4 mr-2" />
                      重新優化設定
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedLayout>
  )
}
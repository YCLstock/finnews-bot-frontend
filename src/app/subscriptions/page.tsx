'use client'

import { useState } from 'react'
import { ProtectedLayout } from '@/components/layout/ProtectedLayout'
import { SubscriptionForm } from '@/components/subscription/SubscriptionForm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useSubscription } from '@/hooks/useSubscription'
import { 
  Settings, 
  Plus, 
  Edit3, 
  Trash2, 
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw
} from 'lucide-react'
import { toast } from 'sonner'

export default function SubscriptionsPage() {
  const { 
    subscription, 
    hasSubscription, 
    deleteSubscription, 
    toggleSubscription,
    loading,
    refresh
  } = useSubscription()

  const [showForm, setShowForm] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // 處理創建訂閱
  const handleCreateSubscription = () => {
    setFormMode('create')
    setShowForm(true)
  }

  // 處理編輯訂閱
  const handleEditSubscription = () => {
    setFormMode('edit')
    setShowForm(true)
  }

  // 處理表單成功
  const handleFormSuccess = () => {
    setShowForm(false)
    refresh()
    toast.success(formMode === 'create' ? '訂閱創建成功！' : '訂閱更新成功！')
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

  // 獲取平台顯示名稱
  const getPlatformDisplayName = (platform: string) => {
    switch (platform) {
      case 'discord':
        return 'Discord'
      case 'email':
        return 'Email'
      default:
        return platform
    }
  }

  // 獲取平台目標標籤
  const getPlatformTargetLabel = (platform: string) => {
    switch (platform) {
      case 'discord':
        return 'Discord Webhook URL'
      case 'email':
        return '電子郵件地址'
      default:
        return '推送目標'
    }
  }

  return (
    <ProtectedLayout>
      <div className="p-6 space-y-6">
        {/* 頁面標題 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              訂閱管理
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {hasSubscription 
                ? '管理您的財經新聞訂閱設置' 
                : '創建您的第一個財經新聞訂閱'
              }
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={refresh}
              disabled={loading}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              刷新
            </Button>
            {hasSubscription && (
              <Button onClick={handleEditSubscription}>
                <Edit3 className="h-4 w-4 mr-2" />
                編輯訂閱
              </Button>
            )}
          </div>
        </div>

        {/* 載入狀態 */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">載入中...</p>
            </div>
          </div>
        )}

        {/* 訂閱狀態 */}
        {!loading && (
          <>
            {hasSubscription ? (
              <div className="space-y-6">
                {/* 當前訂閱狀態 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Settings className="h-5 w-5 mr-2" />
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
                  <CardContent className="space-y-4">
                    {/* 基本信息 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          推送平台
                        </label>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {getPlatformDisplayName(subscription?.delivery_platform || '')}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          推送頻率
                        </label>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {getFrequencyText(subscription?.push_frequency_type || '')}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          摘要語言
                        </label>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {subscription?.summary_language === 'zh-TW' ? '繁體中文' : subscription?.summary_language}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          最後推送
                        </label>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {subscription?.last_pushed_at 
                            ? new Date(subscription.last_pushed_at).toLocaleString('zh-TW')
                            : '尚未推送'
                          }
                        </p>
                      </div>
                    </div>

                    {/* 關鍵字 */}
                    {subscription?.keywords && subscription.keywords.length > 0 && (
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          監控關鍵字
                        </label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {subscription.keywords.map((keyword, index) => (
                            <Badge key={index} variant="outline">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 新聞來源 */}
                    {subscription?.news_sources && subscription.news_sources.length > 0 && (
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          新聞來源
                        </label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {subscription.news_sources.map((source, index) => (
                            <Badge key={index} variant="secondary">
                              {source === 'all' ? '全部來源' : source}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 推送目標 */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {getPlatformTargetLabel(subscription?.delivery_platform || '')}
                      </label>
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-mono break-all">
                        {subscription?.delivery_target ? 
                          `${subscription.delivery_target.substring(0, 50)}...` : 
                          '未設置'
                        }
                      </p>
                    </div>

                    {/* 操作按鈕 */}
                    <div className="flex space-x-3 pt-4 border-t">
                      <Button
                        onClick={handleToggleSubscription}
                        disabled={actionLoading === 'toggle'}
                        variant={subscription?.is_active ? "outline" : "default"}
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
                      >
                        <Edit3 className="h-4 w-4 mr-2" />
                        編輯設置
                      </Button>
                      
                      <Button
                        onClick={handleDeleteSubscription}
                        disabled={actionLoading === 'delete'}
                        variant="destructive"
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

                {/* 狀態提醒 */}
                {!subscription?.is_active && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      您的訂閱目前處於停用狀態，將不會收到任何推送通知。
                      點擊「啟用推送」按鈕重新開始接收新聞推送。
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            ) : (
              /* 無訂閱狀態 */
              <Card className="border-dashed border-2 border-gray-300 dark:border-gray-600">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Settings className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    尚未設置訂閱
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-center mb-4 max-w-md">
                    創建您的第一個財經新聞訂閱，設置關鍵字和推送偏好，
                    開始接收個人化的 AI 摘要推送。
                  </p>
                  <Button onClick={handleCreateSubscription}>
                    <Plus className="h-4 w-4 mr-2" />
                    創建訂閱
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* 訂閱表單 */}
        {showForm && (
          <SubscriptionForm
            mode={formMode}
            onSuccess={handleFormSuccess}
            onCancel={() => setShowForm(false)}
          />
        )}
      </div>
    </ProtectedLayout>
  )
} 
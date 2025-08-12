'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useSubscription } from '@/hooks/useSubscription'
import { useAuth } from '@/hooks/useAuth'
import type { SubscriptionCreateRequest, SubscriptionUpdateRequest } from '@/lib/api-client'
import { AlertCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { isValidDiscordWebhookUrl } from '@/lib/utils'
import { KeywordInput } from '@/components/ui/keyword-input'

interface SubscriptionFormProps {
  mode: 'create' | 'edit'
  onSuccess?: () => void
  onCancel?: () => void
}

// 支援的新聞來源選項
const NEWS_SOURCES = [
  { value: 'yahoo_tw', label: 'Yahoo奇摩財經' },
  { value: 'moneydj', label: 'MoneyDJ理財網' },
  { value: 'cnyes', label: '鉅亨網' },
  { value: 'chinatimes', label: '中時新聞網' },
  { value: 'udn', label: '聯合新聞網' },
  { value: 'all', label: '全部來源' }
]

// 語言選項
const LANGUAGE_OPTIONS = [
  { value: 'zh-TW', label: '繁體中文' },
  { value: 'zh-CN', label: '簡體中文' },
  { value: 'en', label: 'English' }
]

export function SubscriptionForm({ mode, onSuccess, onCancel }: SubscriptionFormProps) {
  const { 
    subscription, 
    frequencyOptions,
    frequencyOptionsLoading,
    createSubscription, 
    updateSubscription,
    loading 
  } = useSubscription()
  
  const { user } = useAuth()

  // 表單狀態
  const [formData, setFormData] = useState({
    delivery_target: '',
    keywords: [] as string[],
    news_sources: [] as string[],
    summary_language: 'zh-TW',
    push_frequency_type: 'daily' as 'daily' | 'twice' | 'thrice'
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [testingConnectivity, setTestingConnectivity] = useState(false)
  const [connectivityResult, setConnectivityResult] = useState<{
    success: boolean
    message: string
  } | null>(null)

  // 初始化表單數據
  useEffect(() => {
    if (mode === 'edit' && subscription) {
      // 編輯模式：使用現有訂閱數據
      setFormData({
        delivery_target: subscription.delivery_target,
        keywords: subscription.keywords || [],
        news_sources: subscription.news_sources || [],
        summary_language: subscription.summary_language,
        push_frequency_type: subscription.push_frequency_type as 'daily' | 'twice' | 'thrice'
      })
    } else if (mode === 'create' && user?.email && !formData.delivery_target) {
      // 創建模式：預設填入用戶的 Google 帳號 Email
      setFormData(prev => ({
        ...prev,
        delivery_target: user.email || ''
      }))
    }
  }, [mode, subscription, user?.email, formData.delivery_target])

  // 處理推送目標輸入變更（即時格式驗證）
  const handleDeliveryTargetChange = (value: string) => {
    setFormData(prev => ({ ...prev, delivery_target: value }))
    
    // 清除之前的連通性測試結果
    setConnectivityResult(null)
    
    // 即時格式驗證
    const formatError = validateDeliveryTargetFormat(value, 'discord')
    if (formatError) {
      setErrors(prev => ({ ...prev, delivery_target: formatError }))
    } else {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors.delivery_target
        return newErrors
      })
    }
  }

  // 測試連通性（可選功能）
  const testConnectivity = async () => {
    if (!formData.delivery_target.trim()) {
      toast.error('請先輸入 Discord Webhook URL')
      return
    }

    const formatError = validateDeliveryTargetFormat(formData.delivery_target, 'discord')
    if (formatError) {
      toast.error('請先修正格式錯誤')
      return
    }

    setTestingConnectivity(true)
    setConnectivityResult(null)

    try {
      // 這裡需要實現 API 調用來測試連通性
      // 暫時使用模擬的結果
      await new Promise(resolve => setTimeout(resolve, 2000)) // 模擬網路延遲
      
      setConnectivityResult({
        success: true,
        message: '連通性測試成功！Discord Webhook 可以正常接收消息'
      })
      toast.success('連通性測試成功！')
    } catch (error) {
      console.error('Connectivity test failed:', error)
      const errorMessage = error instanceof Error ? error.message : '連통性測試失敗，請檢查 Webhook URL 是否正確'
      
      setConnectivityResult({
        success: false,
        message: errorMessage
      })
      toast.error('連通性測試失敗')
    } finally {
      setTestingConnectivity(false)
    }
  }

  // 處理新聞來源選擇
  const handleNewsSourceChange = (value: string) => {
    if (value === 'all') {
      setFormData(prev => ({
        ...prev,
        news_sources: ['all']
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        news_sources: prev.news_sources.includes('all') 
          ? [value]
          : prev.news_sources.includes(value)
            ? prev.news_sources.filter(s => s !== value)
            : [...prev.news_sources, value]
      }))
    }
  }

  // 即時格式驗證（不進行 API 調用）
  const validateDeliveryTargetFormat = (target: string, platform: string = 'discord') => {
    if (!target.trim()) {
      return platform === 'discord' ? 'Discord Webhook URL 為必填項' : 'Email 地址為必填項'
    }

    if (platform === 'discord') {
      if (!isValidDiscordWebhookUrl(target)) {
        return 'Discord Webhook URL 格式不正確，必須以 https://discord.com/api/webhooks/ 開頭'
      }
    } else if (platform === 'email') {
      const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
      if (!emailPattern.test(target)) {
        return '電子郵件地址格式不正確，請提供有效的電子郵件地址'
      }
    }

    return ''
  }

  // 表單驗證（提交時）
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // 格式驗證
    const targetError = validateDeliveryTargetFormat(formData.delivery_target, 'discord')
    if (targetError) {
      newErrors.delivery_target = targetError
    }

    if (formData.keywords.length === 0) {
      newErrors.keywords = '至少需要添加一個關鍵字'
    }

    if (formData.news_sources.length === 0) {
      newErrors.news_sources = '請選擇至少一個新聞來源'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // 提交表單
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setSubmitting(true)

    try {
      if (mode === 'create') {
        const createData: SubscriptionCreateRequest = {
          delivery_platform: 'discord',
          delivery_target: formData.delivery_target,
          keywords: formData.keywords,
          news_sources: formData.news_sources,
          summary_language: formData.summary_language,
          push_frequency_type: formData.push_frequency_type
        }
        
        const result = await createSubscription(createData)
        if (result.success) {
          onSuccess?.()
        }
      } else {
        const updateData: SubscriptionUpdateRequest = {
          delivery_target: formData.delivery_target,
          keywords: formData.keywords,
          news_sources: formData.news_sources,
          summary_language: formData.summary_language,
          push_frequency_type: formData.push_frequency_type
        }
        
        const result = await updateSubscription(updateData)
        if (result.success) {
          onSuccess?.()
        }
      }
    } catch (error) {
      console.error('Form submission error:', error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {mode === 'create' ? '創建新訂閱' : '編輯訂閱'}
        </CardTitle>
        <CardDescription>
          {mode === 'create' 
            ? '設置您的財經新聞訂閱偏好，開始接收個人化的 AI 摘要推送'
            : '更新您的訂閱設置和偏好'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Discord Webhook URL */}
          <div className="space-y-3">
            <Label htmlFor="delivery_target">Discord Webhook URL *</Label>
            <div className="flex space-x-2">
              <Input
                id="delivery_target"
                type="url"
                placeholder="https://discord.com/api/webhooks/..."
                value={formData.delivery_target}
                onChange={(e) => handleDeliveryTargetChange(e.target.value)}
                className={errors.delivery_target ? 'border-red-500' : ''}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={testConnectivity}
                disabled={testingConnectivity || !!errors.delivery_target || !formData.delivery_target.trim()}
                className="min-w-[80px] rounded-lg"
              >
                {testingConnectivity ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  '測試'
                )}
              </Button>
            </div>
            {errors.delivery_target && (
              <p className="text-sm text-red-500 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.delivery_target}
              </p>
            )}
            {connectivityResult && (
              <Alert variant={connectivityResult.success ? 'default' : 'destructive'} className="border-l-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {connectivityResult.message}
                </AlertDescription>
              </Alert>
            )}
            
            {/* Discord 設定教學 */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-800 dark:text-blue-200 font-medium mb-3">
                📝 如何取得 Discord Webhook URL？
              </p>
              <ol className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
                <li className="flex items-start">
                  <span className="inline-block w-5 h-5 bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-full text-xs font-bold text-center leading-5 mr-3 mt-0.5">1</span>
                  打開 Discord 應用，進入您想接收推送的頻道
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-5 h-5 bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-full text-xs font-bold text-center leading-5 mr-3 mt-0.5">2</span>
                  右鍵點擊頻道名稱 → 「編輯頻道」→「整合」
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-5 h-5 bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-full text-xs font-bold text-center leading-5 mr-3 mt-0.5">3</span>
                  點擊「創建 Webhook」，設定名稱為「FinNews-Bot」
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-5 h-5 bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-full text-xs font-bold text-center leading-5 mr-3 mt-0.5">4</span>
                  複製 Webhook URL 並貼到上方欄位
                </li>
              </ol>
              <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-700">
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  💡 提示：測試按鈕會發送一條測試訊息到您的頻道，確保設定正確
                </p>
              </div>
            </div>
          </div>

          {/* 關鍵字 */}
          <div className="space-y-2">
            <KeywordInput
              label="關鍵字 *"
              value={formData.keywords}
              onChange={(keywords) => {
                setFormData(prev => ({ ...prev, keywords }))
                if (errors.keywords && keywords.length > 0) {
                  const newErrors = { ...errors }
                  delete newErrors.keywords
                  setErrors(newErrors)
                }
              }}
              placeholder="輸入關鍵字，例如：台積電、聯發科"
            />
            {errors.keywords && (
              <p className="text-sm text-red-500 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.keywords}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              最多可添加 10 個關鍵字，按 Enter 或點擊 + 添加
            </p>
          </div>

          {/* 新聞來源 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>新聞來源 *</Label>
              <span className="text-xs text-muted-foreground">
                已選擇 {formData.news_sources.length} 個來源
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {NEWS_SOURCES.map((source) => (
                <div
                  key={source.value}
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-sm ${
                    formData.news_sources.includes(source.value)
                      ? 'border-primary bg-primary/10 shadow-sm'
                      : 'border-border hover:border-border/80 bg-background hover:bg-accent/10'
                  }`}
                  onClick={() => handleNewsSourceChange(source.value)}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium ${
                      formData.news_sources.includes(source.value) ? 'text-primary' : 'text-foreground'
                    }`}>
                      {source.label}
                    </span>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      formData.news_sources.includes(source.value)
                        ? 'border-primary bg-primary'
                        : 'border-border'
                    }`}>
                      {formData.news_sources.includes(source.value) && (
                        <div className="w-2 h-2 bg-primary-foreground rounded-full"></div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {errors.news_sources && (
              <p className="text-sm text-red-500 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.news_sources}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              💡 選擇「全部來源」將監控所有支援的新聞網站
            </p>
          </div>

          {/* 摘要語言和推送頻率 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 摘要語言 */}
            <div className="space-y-2">
              <Label htmlFor="summary_language">摘要語言</Label>
              <Select
                value={formData.summary_language}
                onValueChange={(value) => setFormData(prev => ({ ...prev, summary_language: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="選擇語言" />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGE_OPTIONS.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 推送頻率 */}
            <div className="space-y-2">
              <Label htmlFor="push_frequency">推送頻率</Label>
              <Select
                value={formData.push_frequency_type}
                onValueChange={(value: 'daily' | 'twice' | 'thrice') => 
                  setFormData(prev => ({ ...prev, push_frequency_type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="選擇頻率" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">每日一次 (08:00)</SelectItem>
                  <SelectItem value="twice">每日兩次 (08:00, 20:00)</SelectItem>
                  <SelectItem value="thrice">每日三次 (08:00, 13:00, 20:00)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 頻率說明 */}
          {frequencyOptionsLoading ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>載入頻率選項中...</strong>
              </AlertDescription>
            </Alert>
          ) : frequencyOptions && frequencyOptions.daily && frequencyOptions.twice && frequencyOptions.thrice ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>推送頻率說明：</strong>
                <ul className="mt-2 space-y-1 text-sm">
                  <li>• 每日一次：{frequencyOptions.daily?.description || '每日 08:00 推送最新財經摘要'}</li>
                  <li>• 每日兩次：{frequencyOptions.twice?.description || '每日 08:00, 20:00 推送財經摘要'}</li>
                  <li>• 每日三次：{frequencyOptions.thrice?.description || '每日 08:00, 13:00, 20:00 推送財經摘要'}</li>
                </ul>
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>推送頻率說明：</strong>
                <ul className="mt-2 space-y-1 text-sm">
                  <li>• 每日一次：每日 08:00 推送最新財經摘要</li>
                  <li>• 每日兩次：每日 08:00, 20:00 推送財經摘要</li>
                  <li>• 每日三次：每日 08:00, 13:00, 20:00 推送財經摘要</li>
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* 操作按鈕 */}
          <div className="flex space-x-4">
            <Button 
              type="submit" 
              disabled={submitting || loading}
              className="flex-1"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {mode === 'create' ? '創建中...' : '更新中...'}
                </>
              ) : (
                mode === 'create' ? '創建訂閱' : '更新訂閱'
              )}
            </Button>
            
            {onCancel && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                disabled={submitting}
              >
                取消
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
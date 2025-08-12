'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ProtectedLayout } from '@/components/layout/ProtectedLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useSubscription } from '@/hooks/useSubscription'
import type { SubscriptionCreateRequest } from '@/lib/api-client'
import { 
  Zap, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  Loader2, 
  Clock,
  AlertCircle,
  Sparkles
} from 'lucide-react'
import { toast } from 'sonner'
import { isValidDiscordWebhookUrl } from '@/lib/utils'

// 預設關鍵字選項
const PRESET_KEYWORDS = [
  { 
    category: '科技股',
    keywords: ['台積電', 'TSMC', '聯發科', 'MediaTek', '廣達', '鴻海']
  },
  {
    category: '金融股',
    keywords: ['台塑', '中華電', '台銀', '國泰金', '富邦金', '玉山金']
  },
  {
    category: '傳產股',
    keywords: ['台塑', '中鋼', '長榮', '陽明', '統一', '台塑化']
  },
  {
    category: '生技醫療',
    keywords: ['台康生技', '中天', '生華科', '藥華藥', '智擎', '浩鼎']
  },
  {
    category: '國際市場',
    keywords: ['Apple', 'Tesla', 'NVIDIA', 'Microsoft', '美股', '道瓊']
  }
]

const STEPS = [
  { id: 1, title: '選擇關鍵字', description: '快速選擇您感興趣的關鍵字' },
  { id: 2, title: 'Discord 設定', description: '設定推送目標' },
  { id: 3, title: '完成設定', description: '開始接收新聞' }
]

export default function QuickSetupPage() {
  const router = useRouter()
  const { hasSubscription, createSubscription, loading } = useSubscription()
  
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([])
  const [discordUrl, setDiscordUrl] = useState('')
  const [customKeyword, setCustomKeyword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [urlError, setUrlError] = useState('')

  // 如果已有訂閱，重定向到儀表板
  useEffect(() => {
    if (hasSubscription && !loading) {
      router.push('/dashboard')
    }
  }, [hasSubscription, loading, router])

  const progress = (currentStep / STEPS.length) * 100

  // 處理關鍵字選擇
  const handleKeywordToggle = (keyword: string) => {
    setSelectedKeywords(prev => 
      prev.includes(keyword)
        ? prev.filter(k => k !== keyword)
        : [...prev, keyword]
    )
  }

  // 添加自定義關鍵字
  const handleAddCustomKeyword = () => {
    if (customKeyword.trim() && !selectedKeywords.includes(customKeyword.trim())) {
      setSelectedKeywords(prev => [...prev, customKeyword.trim()])
      setCustomKeyword('')
    }
  }

  // Discord URL 驗證
  const handleDiscordUrlChange = (value: string) => {
    setDiscordUrl(value)
    
    if (value.trim() === '') {
      setUrlError('')
      return
    }
    
    if (!isValidDiscordWebhookUrl(value)) {
      setUrlError('Discord Webhook URL 格式不正確')
    } else {
      setUrlError('')
    }
  }

  // 下一步
  const handleNext = () => {
    if (currentStep === 1 && selectedKeywords.length === 0) {
      toast.error('請至少選擇一個關鍵字')
      return
    }
    
    if (currentStep === 2 && (discordUrl.trim() === '' || urlError)) {
      toast.error('請輸入有效的 Discord Webhook URL')
      return
    }
    
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1)
    } else {
      handleSubmit()
    }
  }

  // 上一步
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  // 提交設定
  const handleSubmit = async () => {
    setSubmitting(true)
    
    try {
      const createData: SubscriptionCreateRequest = {
        delivery_platform: 'discord',
        delivery_target: discordUrl,
        keywords: selectedKeywords,
        news_sources: ['all'],
        summary_language: 'zh-TW',
        push_frequency_type: 'daily'
      }
      
      const result = await createSubscription(createData)
      if (result.success) {
        toast.success('快速設定完成！')
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Quick setup submission error:', error)
      toast.error('設定失敗，請重試')
    } finally {
      setSubmitting(false)
    }
  }

  // 跳過設定
  const handleSkipSetup = () => {
    router.push('/settings')
  }

  if (loading) {
    return (
      <ProtectedLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">載入中...</p>
          </div>
        </div>
      </ProtectedLayout>
    )
  }

  return (
    <ProtectedLayout>
      <div className="p-4 md:p-6 max-w-2xl mx-auto">
        <Card className="border-border/40 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl md:text-2xl">快速設定</CardTitle>
                  <CardDescription>
                    30 秒完成基本配置，立即開始接收新聞
                  </CardDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkipSetup}
                className="text-muted-foreground hover:text-foreground"
              >
                稍後設定
              </Button>
            </div>
            
            {/* 進度指示器 */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  步驟 {currentStep} / {STEPS.length}
                </span>
                <span className="text-muted-foreground">
                  {Math.round(progress)}% 完成
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
            
            <div className="text-center mt-4">
              <h3 className="font-medium text-lg">
                {STEPS[currentStep - 1].title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {STEPS[currentStep - 1].description}
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* 步驟 1: 選擇關鍵字 */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="p-3 bg-primary/10 rounded-2xl inline-flex mb-4">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-muted-foreground mb-6">
                    選擇您感興趣的財經主題，我們會為您推送相關新聞
                  </p>
                </div>

                <div className="space-y-4">
                  {PRESET_KEYWORDS.map((category) => (
                    <div key={category.category}>
                      <h4 className="font-medium mb-3 text-sm text-muted-foreground uppercase tracking-wide">
                        {category.category}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {category.keywords.map((keyword) => (
                          <Badge
                            key={keyword}
                            variant={selectedKeywords.includes(keyword) ? "default" : "outline"}
                            className="cursor-pointer px-3 py-1.5 text-sm hover:shadow-sm transition-all"
                            onClick={() => handleKeywordToggle(keyword)}
                          >
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* 自定義關鍵字 */}
                <div className="border-t border-border/30 pt-4">
                  <Label htmlFor="custom-keyword" className="text-sm font-medium">
                    或新增自定義關鍵字
                  </Label>
                  <div className="flex space-x-2 mt-2">
                    <Input
                      id="custom-keyword"
                      placeholder="例如：比特幣、房地產"
                      value={customKeyword}
                      onChange={(e) => setCustomKeyword(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddCustomKeyword()}
                      className="flex-1"
                    />
                    <Button 
                      onClick={handleAddCustomKeyword}
                      variant="outline"
                      disabled={!customKeyword.trim()}
                    >
                      新增
                    </Button>
                  </div>
                </div>

                {selectedKeywords.length > 0 && (
                  <div className="bg-accent/10 rounded-xl p-4 border border-border/30">
                    <p className="text-sm font-medium mb-2">已選擇 {selectedKeywords.length} 個關鍵字：</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedKeywords.map((keyword) => (
                        <Badge key={keyword} variant="secondary" className="px-2 py-1">
                          {keyword}
                          <button
                            onClick={() => handleKeywordToggle(keyword)}
                            className="ml-1 hover:text-destructive"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 步驟 2: Discord 設定 */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="p-3 bg-primary/10 rounded-2xl inline-flex mb-4">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-muted-foreground mb-6">
                    設定您的 Discord Webhook URL 來接收新聞推送
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="discord-url" className="text-sm font-medium">
                      Discord Webhook URL *
                    </Label>
                    <Input
                      id="discord-url"
                      type="url"
                      placeholder="https://discord.com/api/webhooks/..."
                      value={discordUrl}
                      onChange={(e) => handleDiscordUrlChange(e.target.value)}
                      className={urlError ? 'border-red-500' : ''}
                    />
                    {urlError && (
                      <p className="text-sm text-red-500 flex items-center mt-1">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {urlError}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      在 Discord 頻道設置中創建 Webhook 並複製 URL
                    </p>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-blue-800 dark:text-blue-200 font-medium mb-2">
                      如何取得 Discord Webhook URL？
                    </p>
                    <ol className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                      <li>1. 在 Discord 頻道設置中點擊「整合」</li>
                      <li>2. 選擇「Webhooks」並創建新的 Webhook</li>
                      <li>3. 複製 Webhook URL 並貼上</li>
                    </ol>
                  </div>

                  {/* 預設設定說明 */}
                  <div className="bg-accent/10 rounded-xl p-4 border border-border/30">
                    <p className="text-sm font-medium mb-2">預設設定：</p>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div>• 推送頻率：每日一次 (08:00)</div>
                      <div>• 摘要語言：繁體中文</div>
                      <div>• 新聞來源：全部來源</div>
                      <div>• 已選關鍵字：{selectedKeywords.length} 個</div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      完成設定後可在「設定」頁面進行詳細調整
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 步驟 3: 完成設定 */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-2xl inline-flex mb-4">
                    <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">準備完成！</h3>
                  <p className="text-muted-foreground mb-6">
                    檢查您的設定，確認無誤後即可開始接收新聞推送
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="bg-accent/10 rounded-xl p-4 border border-border/30">
                    <h4 className="font-medium mb-3">設定摘要：</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">關鍵字：</span>
                        <span className="font-medium">{selectedKeywords.length} 個</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">推送平台：</span>
                        <span className="font-medium">Discord</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">推送頻率：</span>
                        <span className="font-medium">每日一次</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">語言：</span>
                        <span className="font-medium">繁體中文</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-blue-800 dark:text-blue-200 font-medium mb-2">
                      🎉 設定完成後您將收到：
                    </p>
                    <div className="space-y-1 text-xs text-blue-700 dark:text-blue-300">
                      <div>• 每日 08:00 的財經新聞摘要</div>
                      <div>• 基於您關鍵字的精準內容</div>
                      <div>• AI 生成的中文新聞摘要</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 操作按鈕 */}
            <div className="flex justify-between pt-6 border-t border-border/30">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1 || submitting}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>上一步</span>
              </Button>

              <Button
                onClick={handleNext}
                disabled={submitting}
                className="flex items-center space-x-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>設定中...</span>
                  </>
                ) : currentStep === STEPS.length ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    <span>完成設定</span>
                  </>
                ) : (
                  <>
                    <span>下一步</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedLayout>
  )
}
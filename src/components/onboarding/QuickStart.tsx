'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Mail, 
  MessageSquare, 
  CheckCircle, 
  ArrowLeft, 
  Loader2,
  ExternalLink,
  Info,
  Zap,
  Star
} from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import { toast } from 'sonner'

interface QuickStartProps {
  onBack: () => void
  onComplete: () => void
}

interface QuickTemplate {
  id: string
  name: string
  name_en: string
  description: string
  description_en: string
  icon: string
  keywords: string[]
  sample_news: string
  focus_score: number
}

interface PlatformInfo {
  name: string
  description: string
  icon: string
  setup_required: boolean
  setup_steps: string[]
  target_format: string
  pros: string[]
  cons: string[]
}

export function QuickStart({ onBack, onComplete }: QuickStartProps) {
  const [step, setStep] = useState<'template' | 'delivery' | 'complete'>('template')
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [deliveryPlatform, setDeliveryPlatform] = useState<'email' | 'discord'>('email')
  const [deliveryTarget, setDeliveryTarget] = useState('')
  const [loading, setLoading] = useState(false)
  const [templates, setTemplates] = useState<QuickTemplate[]>([])
  const [platformInfo, setPlatformInfo] = useState<Record<string, PlatformInfo>>({})
  const [validationLoading, setValidationLoading] = useState(false)
  const [targetValid, setTargetValid] = useState<boolean | null>(null)
  const [validationError, setValidationError] = useState('')

  // 獲取模板和平台資料
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [templatesRes, platformRes] = await Promise.all([
          apiClient.quickOnboarding.getTemplates(),
          apiClient.quickOnboarding.getPlatformInfo()
        ])
        
        setTemplates(templatesRes.templates || [])
        setPlatformInfo(platformRes.platforms || {})
      } catch (error) {
        console.error('Failed to fetch quick start data:', error)
        toast.error('載入設定選項失敗')
      }
    }
    
    fetchData()
  }, [])

  // 驗證推送目標
  const validateTarget = async (platform: string, target: string) => {
    if (!target.trim()) {
      setTargetValid(null)
      setValidationError('')
      return
    }

    setValidationLoading(true)
    try {
      const result = await apiClient.quickOnboarding.validateTarget(platform, target)
      setTargetValid(result.is_valid)
      setValidationError(result.error || '')
    } catch (error) {
      setTargetValid(false)
      setValidationError('驗證失敗，請稍後重試')
    } finally {
      setValidationLoading(false)
    }
  }

  // 處理推送目標變更
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (deliveryTarget) {
        validateTarget(deliveryPlatform, deliveryTarget)
      }
    }, 500)

    return () => clearTimeout(debounceTimer)
  }, [deliveryTarget, deliveryPlatform])

  const handleSubmit = async () => {
    if (!selectedTemplate || !deliveryTarget || targetValid === false) return

    setLoading(true)
    try {
      const result = await apiClient.quickOnboarding.quickSetup({
        interest_category: selectedTemplate as 'tech' | 'crypto' | 'market',
        delivery_platform: deliveryPlatform,
        delivery_target: deliveryTarget,
        summary_language: 'zh-tw'
      })
      
      if (result.success) {
        setStep('complete')
        toast.success(result.message)
      } else {
        toast.error('設定失敗，請檢查推送設定')
      }
    } catch (error) {
      console.error('Quick setup failed:', error)
      toast.error('設定失敗，請檢查您的輸入並重試')
    } finally {
      setLoading(false)
    }
  }

  // 模板選擇步驟
  if (step === 'template') {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2 text-2xl">
                <Zap className="h-6 w-6 text-green-600" />
                <span>選擇您感興趣的領域</span>
              </CardTitle>
              <p className="text-gray-600 mt-2">我們將為您推薦相關的財經新聞</p>
            </div>
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            {templates.map(template => (
              <Card key={template.id} 
                    className={`cursor-pointer transition-all duration-200 ${
                      selectedTemplate === template.id 
                        ? 'border-2 border-blue-500 bg-blue-50 shadow-lg' 
                        : 'hover:border-gray-300 hover:shadow-md'
                    }`}
                    onClick={() => setSelectedTemplate(template.id)}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className="text-3xl">{template.icon}</span>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">{template.name}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              聚焦度 {Math.round(template.focus_score * 100)}%
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {template.keywords.length} 個關鍵字
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 mb-4 leading-relaxed">{template.description}</p>
                      
                      <div className="space-y-3">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">包含關鍵字：</h4>
                          <div className="flex flex-wrap gap-2">
                            {template.keywords.map(keyword => (
                              <Badge key={keyword} variant="secondary" className="text-xs">
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 rounded-lg p-3">
                          <h4 className="text-sm font-medium text-gray-700 mb-1">新聞示例：</h4>
                          <p className="text-sm text-gray-600">{template.sample_news}</p>
                        </div>
                      </div>
                    </div>
                    
                    {selectedTemplate === template.id && (
                      <div className="ml-4">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <CheckCircle className="h-5 w-5 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="mt-8 text-center">
            <Button 
              className="px-8 py-3 text-lg" 
              onClick={() => setStep('delivery')}
              disabled={!selectedTemplate}
            >
              下一步：設定推送方式
              <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // 推送設定步驟
  if (step === 'delivery') {
    const currentPlatform = platformInfo[deliveryPlatform]
    
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-xl">設定推送方式</CardTitle>
          <p className="text-gray-600">選擇您希望接收新聞的方式</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 推送平台選擇 */}
          <div>
            <Label className="text-base font-medium">選擇推送平台</Label>
            <div className="grid grid-cols-2 gap-4 mt-3">
              <Card className={`cursor-pointer transition-all ${
                deliveryPlatform === 'email' ? 'border-2 border-blue-500 bg-blue-50' : 'hover:border-gray-300'
              }`} onClick={() => setDeliveryPlatform('email')}>
                <CardContent className="p-4 text-center">
                  <Mail className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <h4 className="font-medium">📧 Email</h4>
                  <p className="text-xs text-gray-600 mt-1">推薦新手使用</p>
                  <Badge variant="secondary" className="mt-2 text-xs">設定簡單</Badge>
                </CardContent>
              </Card>
              
              <Card className={`cursor-pointer transition-all ${
                deliveryPlatform === 'discord' ? 'border-2 border-purple-500 bg-purple-50' : 'hover:border-gray-300'
              }`} onClick={() => setDeliveryPlatform('discord')}>
                <CardContent className="p-4 text-center">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                  <h4 className="font-medium">💬 Discord</h4>
                  <p className="text-xs text-gray-600 mt-1">即時推送</p>
                  <Badge variant="outline" className="mt-2 text-xs">需要設定</Badge>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* 平台資訊 */}
          {currentPlatform && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>{currentPlatform.name}：</strong>
                {currentPlatform.description}
                {currentPlatform.setup_required && (
                  <span className="text-amber-600 ml-2">（需要進行設定）</span>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* 推送目標設定 */}
          <div>
            <Label className="text-base font-medium">
              {deliveryPlatform === 'email' ? '📧 Email 地址' : '💬 Discord Webhook URL'}
            </Label>
            <div className="mt-2">
              <Input
                placeholder={
                  deliveryPlatform === 'email' 
                    ? 'your@email.com' 
                    : 'https://discord.com/api/webhooks/...'
                }
                value={deliveryTarget}
                onChange={(e) => setDeliveryTarget(e.target.value)}
                className={`${
                  targetValid === false ? 'border-red-500 focus:border-red-500' :
                  targetValid === true ? 'border-green-500 focus:border-green-500' : ''
                }`}
              />
              
              {/* 驗證狀態 */}
              {validationLoading && (
                <div className="flex items-center mt-2 text-sm text-gray-600">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  驗證中...
                </div>
              )}
              
              {targetValid === true && (
                <div className="flex items-center mt-2 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  格式正確
                </div>
              )}
              
              {targetValid === false && validationError && (
                <div className="mt-2 text-sm text-red-600">
                  {validationError}
                </div>
              )}
            </div>
            
            {/* Discord 設定說明 */}
            {deliveryPlatform === 'discord' && (
              <Alert className="mt-3">
                <AlertDescription className="text-sm">
                  <strong>Discord 設定步驟：</strong>
                  <ol className="list-decimal list-inside mt-2 space-y-1 text-xs">
                    <li>進入您的 Discord 伺服器</li>
                    <li>右鍵點擊頻道 → 編輯頻道</li>
                    <li>左側選單「整合」→「Webhook」→「建立 Webhook」</li>
                    <li>複製 Webhook URL 並貼上</li>
                  </ol>
                  <Button variant="link" size="sm" className="p-0 h-auto mt-2" asChild>
                    <a href="#" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      詳細教學
                    </a>
                  </Button>
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* 優缺點說明 */}
          {currentPlatform && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-green-700 mb-2">✅ 優點</h4>
                <ul className="space-y-1 text-green-600">
                  {currentPlatform.pros.map((pro, index) => (
                    <li key={index}>• {pro}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-amber-700 mb-2">⚠️ 注意</h4>
                <ul className="space-y-1 text-amber-600">
                  {currentPlatform.cons.map((con, index) => (
                    <li key={index}>• {con}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* 操作按鈕 */}
          <div className="flex space-x-3 pt-4">
            <Button variant="outline" onClick={() => setStep('template')} className="flex-1">
              <ArrowLeft className="h-4 w-4 mr-2" />
              上一步
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={!deliveryTarget || targetValid === false || loading}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  設定中...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  完成設定
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // 完成步驟
  return (
    <Card className="max-w-lg mx-auto">
      <CardContent className="p-8 text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-10 w-10 text-white" />
        </div>
        
        <h2 className="text-2xl font-bold mb-3">🎉 設定完成！</h2>
        <p className="text-gray-600 mb-6 leading-relaxed">
          您已成功設定財經新聞推送！
          <br />
          我們將為您推送 <strong>{templates.find(t => t.id === selectedTemplate)?.name}</strong> 相關新聞。
        </p>
        
        <div className="bg-blue-50 rounded-lg p-4 mb-6 text-left">
          <h3 className="font-semibold text-blue-800 mb-2">📋 設定摘要</h3>
          <div className="space-y-1 text-sm text-blue-700">
            <div>領域：{templates.find(t => t.id === selectedTemplate)?.name}</div>
            <div>推送方式：{deliveryPlatform === 'email' ? '📧 Email' : '💬 Discord'}</div>
            <div>頻率：每日推送</div>
            <div>語言：繁體中文</div>
          </div>
        </div>
        
        <div className="space-y-3 text-sm text-gray-600 mb-6">
          <div className="flex items-center justify-center">
            <Star className="h-4 w-4 text-yellow-500 mr-2" />
            首次推送將在下個排程時間進行
          </div>
          {deliveryPlatform === 'email' && (
            <div>📬 請檢查信箱垃圾郵件資料夾</div>
          )}
        </div>
        
        <Button onClick={onComplete} className="w-full py-3 text-lg">
          <CheckCircle className="h-5 w-5 mr-2" />
          前往儀表板
        </Button>
      </CardContent>
    </Card>
  )
}
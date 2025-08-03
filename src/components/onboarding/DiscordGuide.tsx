'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  ExternalLink, 
  Copy, 
  CheckCircle, 
  Info, 
  MessageSquare,
  ArrowRight,
  PlayCircle,
  Lightbulb
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface DiscordGuideProps {
  onWebhookValidated?: (webhook: string) => void
  currentWebhook?: string
  isEmbedded?: boolean
}

export function DiscordGuide({ onWebhookValidated, currentWebhook = '', isEmbedded = false }: DiscordGuideProps) {
  const [copiedStep, setCopiedStep] = useState<number | null>(null)
  const [webhookUrl, setWebhookUrl] = useState(currentWebhook)
  const [activeStep, setActiveStep] = useState(1)

  const copyToClipboard = (text: string, step: number) => {
    navigator.clipboard.writeText(text)
    setCopiedStep(step)
    toast.success('已複製到剪貼板')
    setTimeout(() => setCopiedStep(null), 2000)
  }

  const validateWebhook = () => {
    if (webhookUrl.startsWith('https://discord.com/api/webhooks/')) {
      onWebhookValidated?.(webhookUrl)
      toast.success('Webhook URL 格式正確！')
    } else {
      toast.error('請輸入正確的 Discord Webhook URL')
    }
  }

  const steps = [
    {
      id: 1,
      title: "打開 Discord 並選擇伺服器",
      description: "進入您想接收財經新聞的 Discord 伺服器",
      detail: "如果您還沒有 Discord 伺服器，可以創建一個私人伺服器專門用來接收新聞推送。",
      action: null,
      image: "🔘",
      tips: ["建議創建專門的「財經新聞」頻道", "確保您有該伺服器的管理員權限"]
    },
    {
      id: 2,
      title: "選擇或創建接收頻道",
      description: "右鍵點擊頻道列表空白處，選擇「創建頻道」",
      detail: "為新聞推送創建專門的頻道，這樣不會與其他訊息混雜。",
      action: { text: "財經新聞", type: "copy" },
      image: "➕",
      tips: ["頻道名稱建議：#財經新聞 或 #投資資訊", "設為文字頻道即可"]
    },
    {
      id: 3,
      title: "進入頻道設定",
      description: "右鍵點擊您的新聞頻道，選擇「編輯頻道」",
      detail: "這將打開頻道的設定選單，我們需要在這裡設定 Webhook。",
      action: null,
      image: "⚙️",
      tips: ["確保您有「管理Webhook」權限", "如果看不到編輯選項，請聯繫伺服器管理員"]
    },
    {
      id: 4,
      title: "建立 Webhook",
      description: "在左側選單點擊「整合」→「Webhook」→「建立 Webhook」",
      detail: "Webhook 是讓外部應用程式發送訊息到 Discord 頻道的機制。",
      action: { text: "FinNews-Bot", type: "copy" },
      image: "🔗",
      tips: ["Webhook 名稱建議使用：FinNews-Bot", "可以設定專門的頭像圖片"]
    },
    {
      id: 5,
      title: "複製 Webhook URL",
      description: "點擊「複製 Webhook URL」按鈕，然後貼到下方欄位",
      detail: "這個 URL 就是 FinNews-Bot 發送新聞的目標地址，請妥善保管。",
      action: null,
      image: "📋",
      tips: ["URL 格式：https://discord.com/api/webhooks/...", "不要與他人分享這個 URL"]
    }
  ]

  const StepCard = ({ step, isActive }: { step: typeof steps[0], isActive: boolean }) => (
    <Card className={`transition-all duration-300 ${
      isActive ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-gray-200'
    }`}>
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          {/* 步驟編號 */}
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0 ${
            isActive ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
          }`}>
            {step.id}
          </div>
          
          <div className="flex-1">
            {/* 標題和圖示 */}
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-2xl">{step.image}</span>
              <h4 className="font-semibold text-gray-900">{step.title}</h4>
            </div>
            
            {/* 描述 */}
            <p className="text-gray-700 mb-3">{step.description}</p>
            
            {/* 詳細說明 */}
            <p className="text-sm text-gray-600 mb-3">{step.detail}</p>
            
            {/* 操作按鈕 */}
            {step.action && (
              <Button
                variant="outline"
                size="sm"
                className="mb-3"
                onClick={() => copyToClipboard(step.action.text, step.id)}
              >
                {copiedStep === step.id ? (
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4 mr-2" />
                )}
                {copiedStep === step.id ? '已複製' : `複製「${step.action.text}」`}
              </Button>
            )}
            
            {/* 提示 */}
            <div className="space-y-1">
              {step.tips.map((tip, index) => (
                <div key={index} className="flex items-start text-xs text-blue-600">
                  <Lightbulb className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {isActive && step.id < steps.length && (
          <div className="mt-4 text-center">
            <Button
              size="sm"
              onClick={() => setActiveStep(step.id + 1)}
              className="bg-blue-500 hover:bg-blue-600"
            >
              下一步
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )

  if (isEmbedded) {
    return (
      <div className="space-y-4">
        <Alert className="border-blue-200 bg-blue-50">
          <MessageSquare className="h-4 w-4" />
          <AlertDescription>
            <strong>Discord 設定教學</strong><br />
            按照以下步驟設定 Discord Webhook，即可接收新聞推送。
          </AlertDescription>
        </Alert>
        
        <div className="space-y-4">
          {steps.map((step) => (
            <StepCard key={step.id} step={step} isActive={activeStep === step.id} />
          ))}
        </div>
        
        {/* Webhook URL 輸入 */}
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <Label className="text-sm font-medium">貼上您的 Webhook URL</Label>
            <div className="flex space-x-2 mt-2">
              <Input
                placeholder="https://discord.com/api/webhooks/..."
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="flex-1"
              />
              <Button onClick={validateWebhook} disabled={!webhookUrl}>
                驗證
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-3">
          <MessageSquare className="h-6 w-6 text-purple-600" />
          <span>Discord Webhook 設定教學</span>
          <Badge variant="outline" className="ml-2">5分鐘</Badge>
        </CardTitle>
        <p className="text-gray-600">
          按照以下步驟設定，讓 FinNews-Bot 直接推送新聞到您的 Discord 頻道
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* 重要提示 */}
        <Alert className="border-amber-200 bg-amber-50">
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>開始前請確認：</strong>
            <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
              <li>您有 Discord 帳號並已加入至少一個伺服器</li>
              <li>您在該伺服器有「管理Webhook」權限</li>
              <li>如果沒有權限，請聯繫伺服器管理員協助設定</li>
            </ul>
          </AlertDescription>
        </Alert>

        {/* 快速上手影片 */}
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-purple-800">🎥 觀看設定教學影片</h3>
                <p className="text-sm text-purple-600">2分鐘快速學會 Discord Webhook 設定</p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <a href="https://support.discord.com/hc/zh-tw/articles/228383668" target="_blank" rel="noopener noreferrer">
                  <PlayCircle className="h-4 w-4 mr-2" />
                  觀看影片
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 步驟說明 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">詳細設定步驟</h3>
            <div className="text-sm text-gray-500">
              進度：{activeStep}/{steps.length}
            </div>
          </div>
          
          {steps.map((step) => (
            <StepCard key={step.id} step={step} isActive={activeStep === step.id} />
          ))}
        </div>

        {/* Webhook URL 驗證區域 */}
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-lg">📋 測試您的 Webhook</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>Webhook URL</Label>
                <div className="flex space-x-2 mt-1">
                  <Input
                    placeholder="https://discord.com/api/webhooks/..."
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={validateWebhook} disabled={!webhookUrl}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    驗證
                  </Button>
                </div>
              </div>
              
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Webhook URL 安全提醒：</strong>
                  <br />
                  • 請勿與他人分享您的 Webhook URL
                  <br />
                  • 如果 URL 洩露，請在 Discord 中重新生成
                  <br />
                  • FinNews-Bot 只會用於發送新聞，不會讀取頻道訊息
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>

        {/* 常見問題 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">❓ 常見問題</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900">Q: 找不到「整合」選項？</h4>
                <p className="text-sm text-gray-600 mt-1">
                  A: 這表示您沒有管理權限。請聯繫伺服器管理員，或考慮使用 Email 推送方式。
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900">Q: Webhook 設定後沒有收到新聞？</h4>
                <p className="text-sm text-gray-600 mt-1">
                  A: 請檢查：1) Webhook URL 是否正確 2) 頻道權限是否正常 3) 等待下一個推送時間
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900">Q: 可以設定多個頻道接收嗎？</h4>
                <p className="text-sm text-gray-600 mt-1">
                  A: 目前每個帳號只能設定一個推送目標。您可以在設定中隨時更換。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 額外資源 */}
        <div className="flex justify-center space-x-4">
          <Button variant="outline" asChild>
            <a 
              href="https://support.discord.com/hc/zh-tw/articles/228383668" 
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Discord 官方教學
            </a>
          </Button>
          
          <Button variant="outline" asChild>
            <a href="mailto:support@finnews-bot.com">
              <MessageSquare className="h-4 w-4 mr-2" />
              需要協助？
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
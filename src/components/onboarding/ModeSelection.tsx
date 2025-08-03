'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Zap, Settings, Clock, Target, ArrowRight, CheckCircle } from 'lucide-react'

interface ModeSelectionProps {
  onSelectMode: (mode: 'quick' | 'custom') => void
}

export function ModeSelection({ onSelectMode }: ModeSelectionProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          開始您的財經新聞之旅
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          選擇最適合您的設定方式，立即開始接收個人化財經新聞
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* 快速開始模式 */}
        <Card className="relative border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 transition-all duration-300 cursor-pointer transform hover:scale-105 hover:shadow-xl"
              onClick={() => onSelectMode('quick')}>
          <CardContent className="p-8">
            {/* 推薦標籤 */}
            <div className="absolute -top-3 left-6">
              <Badge className="bg-green-500 text-white px-4 py-1 text-sm font-medium">
                🌟 推薦新手
              </Badge>
            </div>
            
            {/* 標題區域 */}
            <div className="flex items-center justify-between mb-6 mt-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">🚀 快速開始</h3>
                  <p className="text-green-600 font-medium">30秒完成設定</p>
                </div>
              </div>
              <Clock className="h-8 w-8 text-green-500" />
            </div>
            
            {/* 描述 */}
            <p className="text-gray-700 mb-6 text-lg leading-relaxed">
              選擇投資領域，立即開始接收個人化財經新聞。
              <span className="font-semibold text-green-700">無需複雜設定，一鍵搞定！</span>
            </p>
            
            {/* 特色列表 */}
            <div className="space-y-3 mb-8">
              <div className="flex items-center text-gray-700">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                <span>預設關鍵字模板，智能推薦</span>
              </div>
              <div className="flex items-center text-gray-700">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                <span>支援 Email 和 Discord 推送</span>
              </div>
              <div className="flex items-center text-gray-700">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                <span>立即生效，無需等待分析</span>
              </div>
              <div className="flex items-center text-gray-700">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                <span>可隨時升級到進階模式</span>
              </div>
            </div>
            
            {/* 適合對象 */}
            <div className="bg-green-100 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-green-800 mb-2">適合對象：</h4>
              <p className="text-green-700 text-sm">
                新手用戶、想要快速體驗的用戶、明確知道關注領域的用戶
              </p>
            </div>
            
            <Button className="w-full bg-green-600 hover:bg-green-700 text-white text-lg py-6 rounded-xl font-semibold transition-all duration-200">
              <Zap className="h-5 w-5 mr-2" />
              30秒快速開始
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </CardContent>
        </Card>

        {/* 自訂設定模式 */}
        <Card className="relative border-2 border-blue-200 hover:border-blue-300 transition-all duration-300 cursor-pointer transform hover:scale-105 hover:shadow-xl"
              onClick={() => onSelectMode('custom')}>
          <CardContent className="p-8">
            {/* 進階標籤 */}
            <div className="absolute -top-3 left-6">
              <Badge variant="outline" className="border-blue-300 text-blue-700 bg-white px-4 py-1 text-sm font-medium">
                ⚙️ 進階用戶
              </Badge>
            </div>
            
            {/* 標題區域 */}
            <div className="flex items-center justify-between mb-6 mt-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <Settings className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">🛠️ 自訂設定</h3>
                  <p className="text-blue-600 font-medium">2-3分鐘深度設定</p>
                </div>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
            
            {/* 描述 */}
            <p className="text-gray-700 mb-6 text-lg leading-relaxed">
              深度個人化設定，AI智能分析您的投資偏好。
              <span className="font-semibold text-blue-700">獲得最精準的新聞推送！</span>
            </p>
            
            {/* 特色列表 */}
            <div className="space-y-3 mb-8">
              <div className="flex items-center text-gray-700">
                <CheckCircle className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0" />
                <span>多領域投資興趣選擇</span>
              </div>
              <div className="flex items-center text-gray-700">
                <CheckCircle className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0" />
                <span>自訂關鍵字 + AI聚焦度分析</span>
              </div>
              <div className="flex items-center text-gray-700">
                <CheckCircle className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0" />
                <span>智能語義聚類與優化建議</span>
              </div>
              <div className="flex items-center text-gray-700">
                <CheckCircle className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0" />
                <span>專業投資洞察與分析</span>
              </div>
            </div>
            
            {/* 適合對象 */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-blue-800 mb-2">適合對象：</h4>
              <p className="text-blue-700 text-sm">
                投資專家、希望深度客製化的用戶、重視數據分析的用戶
              </p>
            </div>
            
            <Button variant="outline" className="w-full border-2 border-blue-500 text-blue-700 hover:bg-blue-50 text-lg py-6 rounded-xl font-semibold transition-all duration-200">
              <Settings className="h-5 w-5 mr-2" />
              深度自訂設定
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
      
      {/* 底部說明 */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-600">
          💡 您可以隨時在設定中切換模式或調整偏好
        </div>
        
        <div className="flex justify-center items-center space-x-8 text-sm text-gray-500">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            快速模式：立即可用
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
            自訂模式：精準度更高
          </div>
        </div>
      </div>
    </div>
  )
}
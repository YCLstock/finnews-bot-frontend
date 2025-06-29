'use client'

import { ProtectedLayout } from '@/components/layout/ProtectedLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart3, 
  TrendingUp, 
  PieChart,
  LineChart,
  Calendar,
  Clock,
  Target,
  Sparkles
} from 'lucide-react'

export default function AnalyticsPage() {
  return (
    <ProtectedLayout>
      <div className="p-6 space-y-6">
        {/* 頁面標題 */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-bold text-gray-400">
                統計分析
              </h1>
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                即將推出
              </Badge>
            </div>
            <p className="text-gray-500 mt-2">
              深度數據分析和視覺化圖表功能正在開發中
            </p>
          </div>
        </div>

        {/* 即將推出的功能預覽 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 功能預覽卡片 */}
          <Card className="border-dashed border-2 border-gray-300 dark:border-gray-600 opacity-60">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-500">
                <TrendingUp className="h-5 w-5 mr-2" />
                推送趨勢分析
              </CardTitle>
              <CardDescription className="text-gray-400">
                查看您的新聞推送活動趨勢和模式
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-32 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                  <LineChart className="h-8 w-8 text-gray-400" />
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>• 日推送量變化</span>
                  <span>• 週期性分析</span>
                  <span>• 成長趨勢</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-dashed border-2 border-gray-300 dark:border-gray-600 opacity-60">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-500">
                <PieChart className="h-5 w-5 mr-2" />
                關鍵字分佈
              </CardTitle>
              <CardDescription className="text-gray-400">
                分析不同關鍵字的推送頻率和熱度
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-32 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                  <PieChart className="h-8 w-8 text-gray-400" />
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>• 關鍵字熱度</span>
                  <span>• 來源分佈</span>
                  <span>• 匹配率</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-dashed border-2 border-gray-300 dark:border-gray-600 opacity-60">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-500">
                <Calendar className="h-5 w-5 mr-2" />
                時間分析
              </CardTitle>
              <CardDescription className="text-gray-400">
                分析推送時間分佈和最佳推送時段
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-32 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-8 w-8 text-gray-400" />
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>• 小時分佈</span>
                  <span>• 工作日模式</span>
                  <span>• 最佳時段</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-dashed border-2 border-gray-300 dark:border-gray-600 opacity-60">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-500">
                <Target className="h-5 w-5 mr-2" />
                效能報告
              </CardTitle>
              <CardDescription className="text-gray-400">
                推送效能和系統健康度監控
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-32 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-8 w-8 text-gray-400" />
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>• 成功率</span>
                  <span>• 響應時間</span>
                  <span>• 系統狀態</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 即將推出的功能列表 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-gray-600">
              <Sparkles className="h-5 w-5 mr-2" />
              即將推出的功能
            </CardTitle>
            <CardDescription>
              我們正在開發以下統計分析功能，敬請期待！
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-medium text-gray-700 dark:text-gray-300">數據視覺化</h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-center">
                    <Clock className="h-3 w-3 mr-2 text-gray-400" />
                    推送時間熱力圖
                  </li>
                  <li className="flex items-center">
                    <TrendingUp className="h-3 w-3 mr-2 text-gray-400" />
                    趨勢分析圖表
                  </li>
                  <li className="flex items-center">
                    <PieChart className="h-3 w-3 mr-2 text-gray-400" />
                    關鍵字分佈圓餅圖
                  </li>
                  <li className="flex items-center">
                    <BarChart3 className="h-3 w-3 mr-2 text-gray-400" />
                    來源統計柱狀圖
                  </li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium text-gray-700 dark:text-gray-300">進階分析</h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-center">
                    <Target className="h-3 w-3 mr-2 text-gray-400" />
                    個人化推薦
                  </li>
                  <li className="flex items-center">
                    <Calendar className="h-3 w-3 mr-2 text-gray-400" />
                    自定義時間範圍
                  </li>
                  <li className="flex items-center">
                    <TrendingUp className="h-3 w-3 mr-2 text-gray-400" />
                    預測性分析
                  </li>
                  <li className="flex items-center">
                    <BarChart3 className="h-3 w-3 mr-2 text-gray-400" />
                    匯出報告功能
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  開發進度
                </span>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                統計分析功能預計在下個版本推出。我們正在努力為您提供更豐富的數據洞察和視覺化體驗。
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 替代方案 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-gray-600">當前可用功能</CardTitle>
            <CardDescription>
              在統計分析功能推出前，您可以使用以下現有功能
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" size="sm" asChild>
                <a href="/dashboard">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  基礎統計
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href="/history">
                  <Clock className="h-4 w-4 mr-2" />
                  推送歷史
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href="/subscriptions">
                  <Target className="h-4 w-4 mr-2" />
                  訂閱管理
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedLayout>
  )
} 
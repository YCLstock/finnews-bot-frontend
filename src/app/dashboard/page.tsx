'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ProtectedLayout } from '@/components/layout/ProtectedLayout'
import { StatCard } from '@/components/ui/stat-card'
import { OptimizationBanner } from '@/components/guidance/OptimizationBanner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/useAuth'
import { useSubscription } from '@/hooks/useSubscription'
import { useGuidance } from '@/hooks/useGuidance'
import { apiClient, ApiError } from '@/lib/api-client'
import type { PushHistoryResponse, PushStatsResponse } from '@/lib/api-client'
import { 
  Settings, 
  TrendingUp, 
  Bell, 
  Clock, 
  Activity,
  ExternalLink,
  RefreshCw,
  Plus,
  Target
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { toast } from 'sonner'

export default function DashboardPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { 
    subscription, 
    hasSubscription,
    toggleSubscription 
  } = useSubscription()
  const { focusScore, needsGuidance } = useGuidance()

  const [stats, setStats] = useState<PushStatsResponse | null>(null)
  const [recentHistory, setRecentHistory] = useState<PushHistoryResponse[]>([])
  const [statsLoading, setStatsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // 獲取推送統計和歷史
  const fetchData = async () => {
    try {
      setStatsLoading(true)
      const [statsData, historyData] = await Promise.all([
        apiClient.history.getStats(),
        apiClient.history.get(5) // 獲取最近 5 條記錄
      ])
      setStats(statsData)
      setRecentHistory(historyData)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
      if (error instanceof ApiError && error.status !== 404) {
        toast.error('載入數據失敗')
      }
    } finally {
      setStatsLoading(false)
    }
  }

  // 刷新數據
  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchData()
    setRefreshing(false)
    toast.success('數據已更新')
  }

  // 切換訂閱狀態
  const handleToggleSubscription = async () => {
    await toggleSubscription()
  }

  useEffect(() => {
    if (hasSubscription) {
      fetchData()
    }
  }, [hasSubscription])

  const getFrequencyText = (frequency: string) => {
    switch (frequency) {
      case 'daily':
        return '每日一次'
      case 'twice':
        return '每日兩次'
      case 'thrice':
        return '每日三次'
      default:
        return frequency
    }
  }

  return (
    <ProtectedLayout>
      <div className="p-6 space-y-6">
        {/* 頁面標題 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              儀表板
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              歡迎回來，{user?.user_metadata?.full_name || user?.email}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              刷新
            </Button>
          </div>
        </div>

        {/* 引導橫幅 */}
        <OptimizationBanner 
          onStartOptimization={() => router.push('/guidance')}
          className="mb-6"
        />

        {/* 訂閱狀態區域 */}
        {!hasSubscription ? (
          <Card className="border-dashed border-2 border-gray-300 dark:border-gray-600">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <TrendingUp className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                尚未設置訂閱
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
                開始設置您的財經新聞訂閱，獲得個人化的 AI 摘要推送
              </p>
              <Link href="/subscriptions">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  創建訂閱
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* 統計卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="訂閱狀態"
                value={subscription?.is_active ? "已啟用" : "已停用"}
                status={subscription?.is_active ? "active" : "inactive"}
                icon={Bell}
                description={`推送頻率：${getFrequencyText(subscription?.push_frequency_type || '')}`}
              />
              
              <StatCard
                title="總推送次數"
                value={stats?.total_pushes || 0}
                icon={Activity}
                description="累計推送的新聞數量"
              />
              
              <StatCard
                title="近 7 天推送"
                value={stats?.recent_pushes_7_days || 0}
                icon={Clock}
                description="最近一週的推送活動"
                trend={
                  stats?.recent_pushes_7_days && stats?.total_pushes 
                    ? {
                        value: Math.round((stats.recent_pushes_7_days / stats.total_pushes) * 100),
                        label: "佔總數比例",
                        isPositive: true
                      }
                    : undefined
                }
              />
              
              <StatCard
                title="關鍵字數量"
                value={subscription?.keywords?.length || 0}
                icon={TrendingUp}
                description="正在監控的關鍵字"
              />
            </div>

            {/* 訂閱詳情卡片 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 訂閱配置 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="h-5 w-5 mr-2" />
                    訂閱配置
                  </CardTitle>
                  <CardDescription>
                    當前的訂閱設置和配置
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">狀態</span>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant={subscription?.is_active ? "default" : "secondary"}
                      >
                        {subscription?.is_active ? "已啟用" : "已停用"}
                      </Badge>
                      <Button
                        onClick={handleToggleSubscription}
                        size="sm"
                        variant="outline"
                      >
                        {subscription?.is_active ? "停用" : "啟用"}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">推送頻率</span>
                    <span className="text-sm text-gray-600">
                      {getFrequencyText(subscription?.push_frequency_type || '')}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">推送平台</span>
                    <span className="text-sm text-gray-600">Discord</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">摘要語言</span>
                    <span className="text-sm text-gray-600">
                      {subscription?.summary_language === 'zh-TW' ? '繁體中文' : subscription?.summary_language}
                    </span>
                  </div>

                  {subscription?.keywords && subscription.keywords.length > 0 && (
                    <div>
                      <span className="text-sm font-medium">關鍵字</span>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {subscription.keywords.map((keyword, index) => (
                          <Badge key={index} variant="secondary">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-4">
                    <Link href="/subscriptions">
                      <Button variant="outline" className="w-full">
                        <Settings className="h-4 w-4 mr-2" />
                        管理訂閱
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* 最近推送 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 mr-2" />
                      最近推送
                    </div>
                    <Link href="/history">
                      <Button variant="ghost" size="sm">
                        查看全部
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </Button>
                    </Link>
                  </CardTitle>
                  <CardDescription>
                    最近的推送記錄
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {statsLoading ? (
                    <div className="space-y-3">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      ))}
                    </div>
                  ) : recentHistory.length > 0 ? (
                    <div className="space-y-3">
                      {recentHistory.map((item) => (
                        <div key={item.id} className="border-l-2 border-primary pl-3">
                          <p className="text-sm font-medium">
                            {item.news_articles?.title || `新聞 #${item.article_id}`}
                          </p>
                          <p className="text-xs text-gray-500">
                            {format(new Date(item.pushed_at), 'yyyy/MM/dd HH:mm')}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">
                      暫無推送記錄
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </ProtectedLayout>
  )
} 
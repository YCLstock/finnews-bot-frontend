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
  Plus
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
  const { } = useGuidance()

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
      // 避免在冷啟動/網路錯誤時顯示錯誤彈窗，因為重試機制可能會成功
      if (error instanceof ApiError && error.status !== 404 && 
          !(error.message && error.message.includes('Network error'))) {
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
      <div className="p-4 md:p-8 space-y-6 md:space-y-8 max-w-7xl mx-auto">
        {/* 頁面標題 */}
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="space-y-1 md:space-y-2">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-medium tracking-tight">
              儀表板
            </h1>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              歡迎回來，{user?.user_metadata?.full_name || user?.email?.split('@')[0]}
            </p>
          </div>
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              variant="outline"
              size="default"
              className="rounded-xl flex-1 sm:flex-initial h-11 md:h-10"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              刷新數據
            </Button>
          </div>
        </div>

        {/* 引導橫幅 */}
        <OptimizationBanner 
          onStartOptimization={() => router.push('/guidance')}
          className="mb-6 md:mb-8"
        />

        {/* 訂閱狀態區域 */}
        {!hasSubscription ? (
          <Card className="border-dashed border-2 border-border/50 bg-accent/10">
            <CardContent className="flex flex-col items-center justify-center py-12 md:py-16 px-4 md:px-8">
              <div className="p-3 md:p-4 bg-primary/10 rounded-3xl mb-4 md:mb-6">
                <TrendingUp className="h-10 w-10 md:h-12 md:w-12 text-primary" />
              </div>
              <h3 className="text-xl md:text-2xl font-medium mb-2 md:mb-3 text-center">
                開始您的財經資訊之旅
              </h3>
              <p className="text-muted-foreground text-center mb-6 md:mb-8 max-w-md leading-relaxed text-sm md:text-base">
                設置您的財經新聞訂閱，讓 AI 為您篩選和摘要最重要的市場資訊
              </p>
              <Link href="/subscriptions">
                <Button size="lg" className="rounded-xl h-12 px-6 text-base">
                  <Plus className="h-5 w-5 mr-2" />
                  創建訂閱
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* 統計卡片 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
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
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8">
              {/* 訂閱配置 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <div className="p-2 bg-primary/10 rounded-lg mr-3">
                      <Settings className="h-5 w-5 text-primary" />
                    </div>
                    訂閱配置
                  </CardTitle>
                  <CardDescription>
                    當前的訂閱設置和配置詳情
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-accent/20 rounded-xl gap-3 sm:gap-0">
                    <span className="font-medium">狀態</span>
                    <div className="flex items-center space-x-3 w-full sm:w-auto">
                      <Badge 
                        variant={subscription?.is_active ? "default" : "secondary"}
                        className="px-3 py-1"
                      >
                        {subscription?.is_active ? "已啟用" : "已停用"}
                      </Badge>
                      <Button
                        onClick={handleToggleSubscription}
                        size="sm"
                        variant="outline"
                        className="rounded-lg flex-1 sm:flex-initial"
                      >
                        {subscription?.is_active ? "停用" : "啟用"}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 gap-2 sm:gap-0">
                      <span className="font-medium">推送頻率</span>
                      <span className="text-muted-foreground text-sm sm:text-base">
                        {getFrequencyText(subscription?.push_frequency_type || '')}
                      </span>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 gap-2 sm:gap-0">
                      <span className="font-medium">推送平台</span>
                      <span className="text-muted-foreground text-sm sm:text-base">Discord</span>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 gap-2 sm:gap-0">
                      <span className="font-medium">摘要語言</span>
                      <span className="text-muted-foreground text-sm sm:text-base">
                        {subscription?.summary_language === 'zh-TW' ? '繁體中文' : subscription?.summary_language}
                      </span>
                    </div>
                  </div>

                  {subscription?.keywords && subscription.keywords.length > 0 && (
                    <div className="space-y-3">
                      <span className="font-medium">監控關鍵字</span>
                      <div className="flex flex-wrap gap-2">
                        {subscription.keywords.map((keyword, index) => (
                          <Badge key={index} variant="secondary" className="px-3 py-1 rounded-lg">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-2">
                    <Link href="/subscriptions">
                      <Button variant="outline" className="w-full rounded-xl h-12" size="lg">
                        <Settings className="h-4 w-4 mr-2" />
                        管理訂閱設置
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
                      <div className="p-2 bg-primary/10 rounded-lg mr-3">
                        <Clock className="h-5 w-5 text-primary" />
                      </div>
                      最近推送
                    </div>
                    <Link href="/history">
                      <Button variant="ghost" size="sm" className="rounded-lg">
                        查看全部
                        <ExternalLink className="h-3 w-3 ml-2" />
                      </Button>
                    </Link>
                  </CardTitle>
                  <CardDescription>
                    最近的新聞推送記錄和活動
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {statsLoading ? (
                    <div className="space-y-3 md:space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="animate-pulse p-3 md:p-4 bg-accent/10 rounded-xl">
                          <div className="h-4 bg-accent/30 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-accent/20 rounded w-1/2"></div>
                        </div>
                      ))}
                    </div>
                  ) : recentHistory.length > 0 ? (
                    <div className="space-y-3 md:space-y-4">
                      {recentHistory.map((item) => (
                        <div key={item.id} className="p-3 md:p-4 bg-accent/10 rounded-xl border-l-4 border-primary/50">
                          <p className="font-medium leading-tight mb-2 text-sm md:text-base">
                            {item.news_articles?.title || `新聞 #${item.article_id}`}
                          </p>
                          <p className="text-xs md:text-sm text-muted-foreground">
                            {format(new Date(item.pushed_at), 'yyyy年MM月dd日 HH:mm')}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 md:py-12">
                      <div className="p-3 bg-accent/10 rounded-2xl inline-flex mb-4">
                        <Clock className="h-5 w-5 md:h-6 md:w-6 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground text-sm md:text-base">
                        暫無推送記錄
                      </p>
                    </div>
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
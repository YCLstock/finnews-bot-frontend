'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ProtectedLayout } from '@/components/layout/ProtectedLayout'
import { StatCard } from '@/components/ui/stat-card'
import { OptimizationBanner } from '@/components/guidance/OptimizationBanner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
                歡迎使用 FinNews-Bot
              </h3>
              <p className="text-muted-foreground text-center mb-6 md:mb-8 max-w-md leading-relaxed text-sm md:text-base">
                透過 AI 智能篩選，為您推送最重要的財經資訊
              </p>
              <div className="mobile-button-group sm:flex-row">
                <Link href="/quick-setup" className="flex">
                  <Button size="lg" className="rounded-xl h-12 px-6 text-base flex-1">
                    <Plus className="h-5 w-5 mr-2" />
                    快速設定 (30秒)
                  </Button>
                </Link>
                <Link href="/settings" className="flex">
                  <Button variant="outline" size="lg" className="rounded-xl h-12 px-6 text-base flex-1">
                    <Settings className="h-5 w-5 mr-2" />
                    詳細設定
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* 核心狀態概覽 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              <StatCard
                title="推送狀態"
                value={subscription?.is_active ? "運作中" : "已暫停"}
                status={subscription?.is_active ? "active" : "inactive"}
                icon={Bell}
                description={subscription?.is_active 
                  ? `${getFrequencyText(subscription?.push_frequency_type || '')}` 
                  : "點擊下方按鈕啟用推送"
                }
              />
              
              <StatCard
                title="總推送數"
                value={stats?.total_pushes || 0}
                icon={Activity}
                description="已接收的新聞推送"
                trend={
                  stats?.recent_pushes_7_days && stats?.recent_pushes_7_days > 0
                    ? {
                        value: stats.recent_pushes_7_days,
                        label: "近7天",
                        isPositive: true
                      }
                    : undefined
                }
              />
              
              <StatCard
                title="監控關鍵字"
                value={subscription?.keywords?.length || 0}
                icon={TrendingUp}
                description="個設定主題"
              />
            </div>

            {/* 快速操作區域 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 主要控制 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="p-2 bg-primary/10 rounded-lg mr-3">
                        <Settings className="h-5 w-5 text-primary" />
                      </div>
                      快速控制
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* 推送開關 */}
                  <div className="flex items-center justify-between p-4 bg-accent/10 rounded-xl border border-border/30">
                    <div className="flex items-center space-x-3">
                      <Bell className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">推送通知</p>
                        <p className="text-sm text-muted-foreground">
                          {subscription?.is_active ? '正在運作' : '已暫停'}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={handleToggleSubscription}
                      variant={subscription?.is_active ? "outline" : "default"}
                      size="sm"
                      className="rounded-xl"
                    >
                      {subscription?.is_active ? "暫停" : "啟用"}
                    </Button>
                  </div>

                  {/* 關鍵字預覽 */}
                  {subscription?.keywords && subscription.keywords.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">監控關鍵字</span>
                        <span className="text-xs text-muted-foreground">{subscription.keywords.length} 個</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {subscription.keywords.slice(0, 6).map((keyword, index) => (
                          <Badge key={index} variant="secondary" className="text-xs px-2 py-0.5 rounded-md">
                            {keyword}
                          </Badge>
                        ))}
                        {subscription.keywords.length > 6 && (
                          <Badge variant="outline" className="text-xs px-2 py-0.5 rounded-md">
                            +{subscription.keywords.length - 6}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 操作按鈕 */}
                  <div className="mobile-button-group sm:grid sm:grid-cols-2 sm:gap-3 pt-2">
                    <Link href="/settings" className="flex">
                      <Button variant="outline" className="w-full rounded-xl h-12 text-base">
                        <Settings className="h-4 w-4 mr-2" />
                        管理設定
                      </Button>
                    </Link>
                    <Link href="/records" className="flex">
                      <Button variant="outline" className="w-full rounded-xl h-12 text-base">
                        <Clock className="h-4 w-4 mr-2" />
                        查看記錄
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
                    <Link href="/records">
                      <Button variant="ghost" size="sm" className="rounded-lg text-xs">
                        查看全部
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </Button>
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {statsLoading ? (
                    <div className="space-y-3">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="animate-pulse p-3 bg-accent/10 rounded-xl">
                          <div className="h-4 bg-accent/30 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-accent/20 rounded w-1/2"></div>
                        </div>
                      ))}
                    </div>
                  ) : recentHistory.length > 0 ? (
                    <div className="space-y-3">
                      {recentHistory.slice(0, 3).map((item) => (
                        <div key={item.id} className="p-3 bg-accent/10 rounded-xl hover:bg-accent/15 transition-colors">
                          <p className="font-medium leading-tight mb-1 text-sm line-clamp-2">
                            {item.news_articles?.title || `新聞 #${item.article_id}`}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(item.pushed_at), 'MM/dd HH:mm')}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="p-3 bg-accent/10 rounded-2xl inline-flex mb-3">
                        <Clock className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground text-sm">
                        暫無推送記錄
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        啟用推送後記錄會顯示在這裡
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
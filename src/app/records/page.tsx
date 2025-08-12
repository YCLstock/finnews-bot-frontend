'use client'

import { useState, useEffect } from 'react'
import { ProtectedLayout } from '@/components/layout/ProtectedLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StatCard } from '@/components/ui/stat-card'
import { LoadingIndicator } from '@/components/ui/loading-indicator'
import { useSubscription } from '@/hooks/useSubscription'
import { apiClient, ApiError } from '@/lib/api-client'
import type { PushHistoryResponse, PushStatsResponse } from '@/lib/api-client'
import { 
  History, 
  BarChart3, 
  Activity, 
  Clock, 
  Bell, 
  RefreshCw,
  Calendar,
  TrendingUp,
} from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'

export default function RecordsPage() {
  const { hasSubscription } = useSubscription()

  const [stats, setStats] = useState<PushStatsResponse | null>(null)
  const [history, setHistory] = useState<PushHistoryResponse[]>([])
  const [statsLoading, setStatsLoading] = useState(true)
  const [historyLoading, setHistoryLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // 獲取推送統計
  const fetchStats = async () => {
    try {
      setStatsLoading(true)
      const data = await apiClient.history.getStats()
      setStats(data)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
      if (error instanceof ApiError && error.status !== 404 && 
          !(error.message && error.message.includes('Network error'))) {
        toast.error('載入統計數據失敗')
      }
    } finally {
      setStatsLoading(false)
    }
  }

  // 獲取推送歷史
  const fetchHistory = async () => {
    try {
      setHistoryLoading(true)
      const data = await apiClient.history.get(50) // 獲取最近 50 條記錄
      setHistory(data)
    } catch (error) {
      console.error('Failed to fetch history:', error)
      if (error instanceof ApiError && error.status !== 404 && 
          !(error.message && error.message.includes('Network error'))) {
        toast.error('載入歷史記錄失敗')
      }
    } finally {
      setHistoryLoading(false)
    }
  }

  // 刷新數據
  const handleRefresh = async () => {
    setRefreshing(true)
    await Promise.all([fetchStats(), fetchHistory()])
    setRefreshing(false)
    toast.success('數據已更新')
  }

  // 初始化數據
  useEffect(() => {
    if (hasSubscription) {
      fetchStats()
      fetchHistory()
    }
  }, [hasSubscription])

  if (!hasSubscription) {
    return (
      <ProtectedLayout>
        <div className="p-4 md:p-6 space-y-4 md:space-y-6 max-w-6xl mx-auto">
          <Card className="border-dashed border-2 border-border/50 bg-accent/10">
            <CardContent className="flex flex-col items-center justify-center py-12 md:py-16 px-4 md:px-8">
              <div className="p-3 md:p-4 bg-primary/10 rounded-3xl mb-4 md:mb-6">
                <History className="h-10 w-10 md:h-12 md:w-12 text-primary" />
              </div>
              <h3 className="text-xl md:text-2xl font-medium mb-2 md:mb-3 text-center">
                尚未有推送記錄
              </h3>
              <p className="text-muted-foreground text-center mb-6 md:mb-8 max-w-md leading-relaxed text-sm md:text-base">
                請先創建您的財經新聞訂閱，開始接收推送後即可在此查看記錄和統計分析
              </p>
              <Button onClick={() => window.location.href = '/settings'} size="lg" className="rounded-xl h-12 px-6 text-base">
                <Bell className="h-5 w-5 mr-2" />
                前往設定
              </Button>
            </CardContent>
          </Card>
        </div>
      </ProtectedLayout>
    )
  }

  return (
    <ProtectedLayout>
      <div className="p-4 md:p-6 space-y-4 md:space-y-6 max-w-6xl mx-auto">
        {/* 頁面標題 */}
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-medium tracking-tight">
              記錄
            </h1>
            <p className="text-muted-foreground text-sm md:text-base">
              查看推送歷史記錄和使用統計分析
            </p>
          </div>
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              variant="outline"
              size="default"
              className="flex-1 sm:flex-initial h-11 md:h-10 rounded-xl"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              刷新數據
            </Button>
          </div>
        </div>

        <Tabs defaultValue="history" className="w-full">
          <TabsList className="grid w-full grid-cols-2 rounded-xl">
            <TabsTrigger value="history" className="rounded-lg">
              <History className="h-4 w-4 mr-2" />
              推送歷史
            </TabsTrigger>
            <TabsTrigger value="analytics" className="rounded-lg">
              <BarChart3 className="h-4 w-4 mr-2" />
              統計分析
            </TabsTrigger>
          </TabsList>

          {/* 推送歷史頁簽 */}
          <TabsContent value="history" className="space-y-6 mt-6">
            {historyLoading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingIndicator />
              </div>
            ) : (
              <>
                {history.length > 0 ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <div className="p-2 bg-primary/10 rounded-lg mr-3">
                          <Clock className="h-5 w-5 text-primary" />
                        </div>
                        推送記錄
                      </CardTitle>
                      <CardDescription>
                        最近的新聞推送記錄，共 {history.length} 條
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 md:space-y-4">
                        {history.map((item) => (
                          <div key={item.id} className="p-4 bg-accent/10 rounded-xl border border-border/30 hover:border-border/60 transition-colors">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium leading-tight mb-2 text-sm md:text-base">
                                  {item.news_articles?.title || `新聞 #${item.article_id}`}
                                </h4>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs md:text-sm text-muted-foreground">
                                  <div className="flex items-center">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    {format(new Date(item.pushed_at), 'yyyy年MM月dd日 HH:mm')}
                                  </div>
                                  <div className="flex items-center">
                                    <Badge variant="outline" className="text-xs">
                                      新聞
                                    </Badge>
                                  </div>
                                </div>
                                {item.news_articles?.summary && (
                                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                    {item.news_articles.summary}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center">
                                <Badge variant="secondary" className="text-xs">
                                  已推送
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="border-dashed border-2 border-border/50 bg-accent/10">
                    <CardContent className="flex flex-col items-center justify-center py-12 px-4">
                      <div className="p-3 bg-accent/10 rounded-2xl mb-4">
                        <Clock className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">暫無推送記錄</h3>
                      <p className="text-muted-foreground text-center text-sm">
                        您的訂閱開始運作後，推送記錄會顯示在這裡
                      </p>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>

          {/* 統計分析頁簽 */}
          <TabsContent value="analytics" className="space-y-6 mt-6">
            {statsLoading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingIndicator />
              </div>
            ) : (
              <>
                {/* 統計卡片 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
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
                    title="本週推送"
                    value={stats?.recent_pushes_7_days || 0}
                    icon={TrendingUp}
                    description="本週累計推送數量"
                  />
                  
                  <StatCard
                    title="平均每日"
                    value={stats?.total_pushes && stats?.total_pushes > 7 
                      ? Math.round(stats.total_pushes / 7)
                      : stats?.total_pushes || 0
                    }
                    icon={Bell}
                    description="每日平均推送數量"
                  />
                </div>

                {/* 詳細統計 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <div className="p-2 bg-primary/10 rounded-lg mr-3">
                        <BarChart3 className="h-5 w-5 text-primary" />
                      </div>
                      使用分析
                    </CardTitle>
                    <CardDescription>
                      您的財經新聞訂閱使用統計
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {stats && stats.total_pushes > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium mb-3">推送活動</h4>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">總推送次數</span>
                              <span className="text-sm font-medium">
                                {stats.total_pushes || 0} 次
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">近7天推送</span>
                              <span className="text-sm font-medium">
                                {stats.recent_pushes_7_days || 0} 次
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">推送狀態</span>
                              <span className="text-sm font-medium">
                                {stats.total_pushes && stats.total_pushes > 0 ? '正常' : '暫無'}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-3">推送效率</h4>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">本週活躍度</span>
                              <Badge variant={
                                (stats.recent_pushes_7_days || 0) > 0 ? "default" : "secondary"
                              }>
                                {(stats.recent_pushes_7_days || 0) > 0 ? "活躍" : "低活躍"}
                              </Badge>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">週增長率</span>
                              <span className="text-sm font-medium">
                                {stats.recent_pushes_7_days && stats.total_pushes 
                                  ? `${Math.round((stats.recent_pushes_7_days / stats.total_pushes) * 100)}%`
                                  : '0%'
                                }
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="p-3 bg-accent/10 rounded-2xl inline-flex mb-4">
                          <BarChart3 className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h4 className="font-medium mb-2">暫無統計數據</h4>
                        <p className="text-sm text-muted-foreground">
                          開始接收推送後，您的使用統計會顯示在這裡
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedLayout>
  )
}
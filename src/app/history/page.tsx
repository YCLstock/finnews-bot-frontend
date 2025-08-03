'use client'

import { useEffect, useState } from 'react'
import { ProtectedLayout } from '@/components/layout/ProtectedLayout'
import { StatCard } from '@/components/ui/stat-card'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useHistory } from '@/hooks/useHistory'
import { ColdStartAlert } from '@/components/ui/cold-start-alert'
import { 
  History, 
  ExternalLink, 
  RefreshCw, 
  Clock, 
  TrendingUp,
  FileText,
  Calendar,
  MoreHorizontal,
  AlertCircle
} from 'lucide-react'
import { format, isToday, isYesterday, subDays } from 'date-fns'
import { zhTW } from 'date-fns/locale'

export default function HistoryPage() {
  const {
    history,
    historyLoading,
    stats,
    statsLoading,
    hasMore,
    isEmpty,
    hasError,
    hasLoadedSuccessfully,
    totalItems,
    isRetrying,
    retryAttempt,  
    maxRetries,
    fetchAllData,
    loadMore,
    refresh
  } = useHistory()

  const [refreshing, setRefreshing] = useState(false)

  // 初始載入數據 (使用序列化請求避免並發)
  useEffect(() => {
    fetchAllData(20, true)
  }, [fetchAllData])

  // 刷新數據
  const handleRefresh = async () => {
    setRefreshing(true)
    await refresh()
    setRefreshing(false)
  }

  // 格式化日期顯示
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    
    if (isToday(date)) {
      return `今天 ${format(date, 'HH:mm')}`
    }
    
    if (isYesterday(date)) {
      return `昨天 ${format(date, 'HH:mm')}`
    }
    
    if (date >= subDays(new Date(), 7)) {
      return format(date, 'EEEE HH:mm', { locale: zhTW })
    }
    
    return format(date, 'MM/dd HH:mm')
  }

  // 獲取推送狀態顏色
  const getStatusColor = (pushedAt: string) => {
    const date = new Date(pushedAt)
    const now = new Date()
    const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffHours < 1) return 'text-green-600'
    if (diffHours < 24) return 'text-blue-600'
    if (diffHours < 168) return 'text-gray-600'
    return 'text-gray-400'
  }

  return (
    <ProtectedLayout>
      <div className="p-6 space-y-6">
        {/* 頁面標題 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              推送歷史
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              查看您的財經新聞推送記錄和統計數據
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

        {/* 冷啟動提示 */}
        <ColdStartAlert
          isRetrying={isRetrying}
          retryAttempt={retryAttempt}
          maxRetries={maxRetries}
          onRetry={() => fetchAllData(20, true)}
          className="mb-6"
        />

        {/* 統計卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="總推送次數"
            value={statsLoading ? "載入中..." : (stats?.total_pushes || 0)}
            icon={TrendingUp}
            description="累計發送的新聞推送"
            status={stats?.total_pushes ? "active" : "inactive"}
          />
          
          <StatCard
            title="近 7 天推送"
            value={statsLoading ? "載入中..." : (stats?.recent_pushes_7_days || 0)}
            icon={Clock}
            description="最近一週的推送活動"
            trend={
              !statsLoading && stats?.recent_pushes_7_days && stats?.total_pushes 
                ? {
                    value: Math.round((stats.recent_pushes_7_days / stats.total_pushes) * 100),
                    label: "佔總數比例",
                    isPositive: stats.recent_pushes_7_days > 0
                  }
                : undefined
            }
          />
          
          <StatCard
            title="最活躍日期"
            value={stats?.most_active_day?.[1] || 0}
            icon={Calendar}
            description={
              statsLoading 
                ? "載入中..." 
                : stats?.most_active_day?.[0] 
                  ? (() => {
                      try {
                        const date = new Date(stats.most_active_day[0])
                        if (isNaN(date.getTime())) {
                          return "日期格式錯誤"
                        }
                        return `${format(date, 'MM/dd')} 當日推送`
                      } catch (error) {
                        console.error('Date formatting error:', error)
                        return "日期解析失敗"
                      }
                    })()
                  : "暫無數據"
            }
          />
          
          <StatCard
            title="歷史記錄"
            value={totalItems}
            icon={FileText}
            description="當前載入的記錄數量"
          />
        </div>

        {/* 推送歷史列表 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <History className="h-5 w-5 mr-2" />
              推送記錄
            </CardTitle>
            <CardDescription>
              按時間順序顯示的推送歷史記錄
            </CardDescription>
          </CardHeader>
          <CardContent>
            {historyLoading && isEmpty ? (
              /* 初始載入狀態 */
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse border rounded-lg p-4">
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                      <div className="h-6 w-16 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : isEmpty ? (
              /* 空狀態 */
              <div className="text-center py-12">
                <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  暫無推送記錄
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  當您的訂閱開始推送新聞時，記錄將會顯示在這裡
                </p>
                <Button variant="outline" onClick={handleRefresh}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  重新載入
                </Button>
              </div>
            ) : (
              /* 歷史記錄列表 */
              <div className="space-y-4">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-start space-x-4">
                      {/* 狀態指示器 */}
                      <div className="flex-shrink-0">
                        <div className={`w-3 h-3 rounded-full mt-2 ${
                          getStatusColor(item.pushed_at).includes('green') ? 'bg-green-400' :
                          getStatusColor(item.pushed_at).includes('blue') ? 'bg-blue-400' :
                          getStatusColor(item.pushed_at).includes('gray-6') ? 'bg-gray-400' :
                          'bg-gray-300'
                        }`}></div>
                      </div>
                      
                      {/* 內容區域 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                              {item.news_articles?.title || `新聞推送 #${item.article_id}`}
                            </h4>
                            
                            {item.news_articles?.summary && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-3">
                                {item.news_articles.summary}
                              </p>
                            )}
                            
                            <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500">
                              <span className="flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {formatDate(item.pushed_at)}
                              </span>
                              
                              {item.news_articles?.published_date && (
                                <span className="flex items-center">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  發布於 {(() => {
                                    try {
                                      const date = new Date(item.news_articles.published_date)
                                      if (isNaN(date.getTime())) {
                                        return "日期錯誤"
                                      }
                                      return format(date, 'MM/dd HH:mm')
                                    } catch (error) {
                                      console.error('Published date formatting error:', error)
                                      return "日期錯誤"
                                    }
                                  })()}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {/* 操作按鈕 */}
                          <div className="flex items-center space-x-2 ml-4">
                            <Badge variant="outline" className="text-xs">
                              推送完成
                            </Badge>
                            
                            {item.news_articles?.url && (
                              <Button
                                variant="ghost"
                                size="sm"
                                asChild
                                className="p-1 h-auto"
                              >
                                <a
                                  href={item.news_articles.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="查看原文"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* 載入更多按鈕 */}
                {hasMore && (
                  <div className="text-center pt-4">
                    <Button
                      onClick={loadMore}
                      disabled={historyLoading}
                      variant="outline"
                    >
                      {historyLoading ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          載入中...
                        </>
                      ) : (
                        <>
                          <MoreHorizontal className="h-4 w-4 mr-2" />
                          載入更多
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {/* 已載入全部提示 */}
                {!hasMore && totalItems > 0 && (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500">
                      已顯示全部 {totalItems} 條記錄
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 載入和錯誤狀態提示 */}
        {(historyLoading || statsLoading) && !isRetrying && (
          <Alert className="border-blue-200 bg-blue-50">
            <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <span className="text-blue-800">
                  正在載入數據，請稍候...
                </span>
                <span className="text-xs text-blue-600">
                  {historyLoading && statsLoading ? '載入歷史記錄和統計' : 
                   historyLoading ? '載入歷史記錄' : '載入統計數據'}
                </span>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* 錯誤狀態提示 - 只有在真正載入失敗時才顯示 */}
        {hasError && !isRetrying && !hasLoadedSuccessfully && (
          <Alert className="border-amber-200 bg-amber-50">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-amber-800">載入遇到問題</h4>
                  <p className="text-sm text-amber-700 mt-1">
                    可能是網路連線問題或伺服器暫時無法回應
                  </p>
                </div>
                <Button 
                  onClick={() => fetchAllData(20, true)}
                  variant="outline"
                  size="sm"
                  className="border-amber-300 text-amber-700 hover:bg-amber-100"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  重試
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </div>
    </ProtectedLayout>
  )
} 
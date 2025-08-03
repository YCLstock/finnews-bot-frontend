'use client'

import { useState, useCallback } from 'react'
import { apiClient, ApiError } from '@/lib/api-client'
import type { PushHistoryResponse, PushStatsResponse } from '@/lib/api-client'
import { toast } from 'sonner'

interface HistoryState {
  history: PushHistoryResponse[]
  loading: boolean
  error: string | null
  hasMore: boolean
  hasLoadedSuccessfully: boolean
}

interface StatsState {
  stats: PushStatsResponse | null
  loading: boolean
  error: string | null
  hasLoadedSuccessfully: boolean
}

interface ColdStartState {
  isRetrying: boolean
  retryAttempt: number
  maxRetries: number
}

export function useHistory() {
  const [historyState, setHistoryState] = useState<HistoryState>({
    history: [],
    loading: false,
    error: null,
    hasMore: true,
    hasLoadedSuccessfully: false
  })

  const [statsState, setStatsState] = useState<StatsState>({
    stats: null,
    loading: false,
    error: null,
    hasLoadedSuccessfully: false
  })

  const [coldStartState, setColdStartState] = useState<ColdStartState>({
    isRetrying: false,
    retryAttempt: 0,
    maxRetries: 5
  })

  // 檢測是否為冷啟動錯誤
  const isColdStartError = useCallback((error: ApiError): boolean => {
    return (
      error.status === 0 ||
      error.status === 503 ||
      error.status === 504 ||
      error.status === 524 ||
      (!!error.message && (
        error.message.includes('timeout') ||
        error.message.includes('ECONNREFUSED') ||
        error.message.includes('fetch failed') ||
        error.message.includes('ERR_INSUFFICIENT_RESOURCES') ||
        error.message.includes('Network error')
      ))
    )
  }, [])

  // 獲取推送歷史
  const fetchHistory = useCallback(async (limit = 20, reset = false) => {
    try {
      setHistoryState(prev => ({ ...prev, loading: true, error: null }))
      
      const data = await apiClient.history.get(limit)
      
      setHistoryState(prev => ({
        ...prev,
        history: reset ? data : [...prev.history, ...data],
        loading: false,
        error: null,
        hasMore: data.length === limit,
        hasLoadedSuccessfully: true
      }))
      
      return data
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : '獲取推送歷史失敗'
      
      // 冷啟動錯誤特殊處理
      if (error instanceof ApiError && isColdStartError(error)) {
        setColdStartState(prev => ({
          ...prev,
          isRetrying: true,
          retryAttempt: prev.retryAttempt + 1
        }))
        
        if (!error.message.includes('ERR_INSUFFICIENT_RESOURCES')) {
          toast.error('伺服器正在啟動中，請稍等片刻...', {
            duration: 5000
          })
        }
      } else {
        toast.error(errorMessage)
      }
      
      setHistoryState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }))
      
      console.error('Failed to fetch history:', error)
      return []
    }
  }, [isColdStartError])

  // 獲取統計數據
  const fetchStats = useCallback(async () => {
    try {
      setStatsState(prev => ({ ...prev, loading: true, error: null }))
      
      const stats = await apiClient.history.getStats()
      
      setStatsState({
        stats,
        loading: false,
        error: null,
        hasLoadedSuccessfully: true
      })
      
      return stats
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : '獲取統計數據失敗'
      
      // 冷啟動錯誤特殊處理
      if (error instanceof ApiError && isColdStartError(error)) {
        setColdStartState(prev => ({
          ...prev,
          isRetrying: true,
          retryAttempt: prev.retryAttempt + 1
        }))
        
        if (!error.message.includes('ERR_INSUFFICIENT_RESOURCES')) {
          toast.error('伺服器正在啟動中，統計資料載入中...', {
            duration: 5000
          })
        }
      } else if (error instanceof ApiError && error.status !== 404) {
        toast.error(errorMessage)
      }
      
      setStatsState({
        stats: null,
        loading: false,
        error: errorMessage,
        hasLoadedSuccessfully: false
      })
      
      console.error('Failed to fetch stats:', error)
      return null
    }
  }, [isColdStartError])

  // 載入更多歷史記錄
  const loadMore = useCallback(async () => {
    if (!historyState.hasMore || historyState.loading) {
      return
    }
    
    await fetchHistory(20, false)
  }, [fetchHistory, historyState.hasMore, historyState.loading])

  // 序列化獲取所有數據 (避免並發請求導致資源不足)
  const fetchAllData = useCallback(async (limit: number = 20, reset: boolean = true) => {
    try {
      setColdStartState(prev => ({ ...prev, isRetrying: false, retryAttempt: 0 }))
      
      // 序列化請求，先獲取歷史記錄
      console.log('🔄 開始序列化載入數據，避免並發請求...')
      const historyData = await fetchHistory(limit, reset)
      
      // 再獲取統計數據
      const statsData = await fetchStats()
      
      console.log('✅ 數據載入完成')
      return { historyData, statsData }
    } catch (error) {
      console.error('❌ 序列化數據載入失敗:', error)
      throw error
    }
  }, [fetchHistory, fetchStats])

  // 刷新所有數據
  const refresh = useCallback(async () => {
    setHistoryState(prev => ({ ...prev, history: [], hasMore: true }))
    return await fetchAllData(20, true)
  }, [fetchAllData])

  // 重置狀態
  const reset = useCallback(() => {
    setHistoryState({
      history: [],
      loading: false,
      error: null,
      hasMore: true,
      hasLoadedSuccessfully: false
    })
    setStatsState({
      stats: null,
      loading: false,
      error: null,
      hasLoadedSuccessfully: false
    })
  }, [])

  return {
    // 歷史記錄狀態
    history: historyState.history,
    historyLoading: historyState.loading,
    historyError: historyState.error,
    hasMore: historyState.hasMore,
    
    // 統計數據狀態
    stats: statsState.stats,
    statsLoading: statsState.loading,
    statsError: statsState.error,
    
    // 冷啟動狀態
    isRetrying: coldStartState.isRetrying,
    retryAttempt: coldStartState.retryAttempt,
    maxRetries: coldStartState.maxRetries,
    
    // 操作方法
    fetchHistory: (limit?: number) => fetchHistory(limit, true),
    fetchStats,
    fetchAllData,
    loadMore,
    refresh,
    reset,
    
    // 工具方法
    isEmpty: historyState.history.length === 0 && !historyState.loading,
    hasError: !!(historyState.error || statsState.error) && !coldStartState.isRetrying,
    hasLoadedSuccessfully: historyState.hasLoadedSuccessfully && statsState.hasLoadedSuccessfully,
    totalItems: historyState.history.length,
    isColdStartError
  }
} 
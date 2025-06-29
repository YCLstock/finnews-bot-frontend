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
}

interface StatsState {
  stats: PushStatsResponse | null
  loading: boolean
  error: string | null
}

export function useHistory() {
  const [historyState, setHistoryState] = useState<HistoryState>({
    history: [],
    loading: false,
    error: null,
    hasMore: true
  })

  const [statsState, setStatsState] = useState<StatsState>({
    stats: null,
    loading: false,
    error: null
  })

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
        hasMore: data.length === limit
      }))
      
      return data
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : '獲取推送歷史失敗'
      setHistoryState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }))
      
      if (error instanceof ApiError && error.status !== 404) {
        toast.error(errorMessage)
      }
      
      console.error('Failed to fetch history:', error)
      return []
    }
  }, [])

  // 獲取統計數據
  const fetchStats = useCallback(async () => {
    try {
      setStatsState(prev => ({ ...prev, loading: true, error: null }))
      
      const stats = await apiClient.history.getStats()
      
      setStatsState({
        stats,
        loading: false,
        error: null
      })
      
      return stats
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : '獲取統計數據失敗'
      setStatsState({
        stats: null,
        loading: false,
        error: errorMessage
      })
      
      if (error instanceof ApiError && error.status !== 404) {
        toast.error(errorMessage)
      }
      
      console.error('Failed to fetch stats:', error)
      return null
    }
  }, [])

  // 載入更多歷史記錄
  const loadMore = useCallback(async () => {
    if (!historyState.hasMore || historyState.loading) {
      return
    }
    
    await fetchHistory(20, false)
  }, [fetchHistory, historyState.hasMore, historyState.loading])

  // 刷新所有數據
  const refresh = useCallback(async () => {
    setHistoryState(prev => ({ ...prev, history: [], hasMore: true }))
    await Promise.all([
      fetchHistory(20, true),
      fetchStats()
    ])
  }, [fetchHistory, fetchStats])

  // 重置狀態
  const reset = useCallback(() => {
    setHistoryState({
      history: [],
      loading: false,
      error: null,
      hasMore: true
    })
    setStatsState({
      stats: null,
      loading: false,
      error: null
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
    
    // 操作方法
    fetchHistory: (limit?: number) => fetchHistory(limit, true),
    fetchStats,
    loadMore,
    refresh,
    reset,
    
    // 工具方法
    isEmpty: historyState.history.length === 0 && !historyState.loading,
    totalItems: historyState.history.length
  }
} 
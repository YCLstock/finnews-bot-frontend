'use client'

import { useState, useEffect, useCallback } from 'react'
import { apiClient, ApiError } from '@/lib/api-client'
import { useAuth } from '@/hooks/useAuth'
import type { 
  SubscriptionResponse, 
  SubscriptionCreateRequest, 
  SubscriptionUpdateRequest,
  FrequencyOptionsResponse
} from '@/lib/api-client'
import { toast } from 'sonner'

interface SubscriptionState {
  subscription: SubscriptionResponse | null
  loading: boolean
  error: string | null
}

interface FrequencyOptionsState {
  options: FrequencyOptionsResponse | null
  loading: boolean
  error: string | null
}

export function useSubscription() {
  const { loading: authLoading, isAuthenticated } = useAuth()
  const [isInitialized, setIsInitialized] = useState(false)
  
  const [state, setState] = useState<SubscriptionState>({
    subscription: null,
    loading: true,
    error: null
  })

  const [frequencyOptions, setFrequencyOptions] = useState<FrequencyOptionsState>({
    options: null,
    loading: true,
    error: null
  })

  // 獲取用戶訂閱
  const fetchSubscription = useCallback(async () => {
    try {
      console.log('📋 Fetching subscription...')
      setState(prev => ({ ...prev, loading: true, error: null }))
      const subscription = await apiClient.subscriptions.get()
      console.log('✅ Subscription fetched successfully:', subscription)
      setState({
        subscription,
        loading: false,
        error: null
      })
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : '獲取訂閱資料失敗'
      setState({
        subscription: null,
        loading: false,
        error: errorMessage
      })
      console.error('Failed to fetch subscription:', error)
    }
  }, [])

  // 獲取頻率選項
  const fetchFrequencyOptions = useCallback(async () => {
    try {
      console.log('⚙️ Fetching frequency options...')
      setFrequencyOptions(prev => ({ ...prev, loading: true, error: null }))
      const options = await apiClient.subscriptions.getFrequencyOptions()
      console.log('✅ Frequency options fetched successfully:', options)
      setFrequencyOptions({
        options,
        loading: false,
        error: null
      })
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : '獲取頻率選項失敗'
      setFrequencyOptions({
        options: null,
        loading: false,
        error: errorMessage
      })
      console.error('Failed to fetch frequency options:', error)
    }
  }, [])

  // 創建訂閱
  const createSubscription = useCallback(async (data: SubscriptionCreateRequest) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      const subscription = await apiClient.subscriptions.create(data)
      setState({
        subscription,
        loading: false,
        error: null
      })
      toast.success('訂閱創建成功！')
      return { success: true, subscription }
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : '創建訂閱失敗'
      setState(prev => ({ ...prev, loading: false, error: errorMessage }))
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [])

  // 更新訂閱
  const updateSubscription = useCallback(async (data: SubscriptionUpdateRequest) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      const subscription = await apiClient.subscriptions.update(data)
      setState({
        subscription,
        loading: false,
        error: null
      })
      toast.success('訂閱更新成功！')
      return { success: true, subscription }
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : '更新訂閱失敗'
      setState(prev => ({ ...prev, loading: false, error: errorMessage }))
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [])

  // 刪除訂閱
  const deleteSubscription = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      await apiClient.subscriptions.delete()
      setState({
        subscription: null,
        loading: false,
        error: null
      })
      toast.success('訂閱已刪除')
      return { success: true }
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : '刪除訂閱失敗'
      setState(prev => ({ ...prev, loading: false, error: errorMessage }))
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [])

  // 切換訂閱狀態
  const toggleSubscription = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      const subscription = await apiClient.subscriptions.toggle()
      setState({
        subscription,
        loading: false,
        error: null
      })
      toast.success(`訂閱已${subscription.is_active ? '啟用' : '停用'}`)
      return { success: true, subscription }
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : '切換訂閱狀態失敗'
      setState(prev => ({ ...prev, loading: false, error: errorMessage }))
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [])

  // 初始化數據載入 - 等待認證完成
  useEffect(() => {
    if (authLoading) {
      console.log('🔄 [useSubscription] Waiting for auth to complete...')
      return
    }
    
    if (!isAuthenticated) {
      console.log('⚠️ [useSubscription] Not authenticated, skipping subscription initialization')
      setState(prev => ({ ...prev, loading: false, error: '需要登入' }))
      setFrequencyOptions(prev => ({ ...prev, loading: false, error: '需要登入' }))
      setIsInitialized(false)
      return
    }
    
    if (isInitialized) {
      console.log('🔄 [useSubscription] Already initialized, skipping...')
      return
    }
    
    console.log('🚀 [useSubscription] Auth complete, initializing subscription...')
    setIsInitialized(true)
    fetchSubscription()
    fetchFrequencyOptions()
  }, [authLoading, isAuthenticated, isInitialized, fetchSubscription, fetchFrequencyOptions])

  return {
    // 訂閱狀態
    subscription: state.subscription,
    loading: state.loading,
    error: state.error,
    hasSubscription: !!state.subscription,
    
    // 頻率選項
    frequencyOptions: frequencyOptions.options,
    frequencyOptionsLoading: frequencyOptions.loading,
    frequencyOptionsError: frequencyOptions.error,
    
    // 操作方法
    fetchSubscription,
    createSubscription,
    updateSubscription,
    deleteSubscription,
    toggleSubscription,
    
    // 工具方法
    refresh: () => {
      if (isAuthenticated) {
        fetchSubscription()
        fetchFrequencyOptions()
      }
    }
  }
} 
'use client'

import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@/lib/api-client'
import { useAuth } from '@/hooks/useAuth'
import type { 
  GuidanceStatusResponse
} from '@/lib/api-client'
// Removed import of deleted guidance types file
import { toast } from 'sonner'

// Type definitions
interface InvestmentFocusArea {
  code: string
  name_zh: string
  name_en: string
  description: string
  sample_keywords: string[]
}

interface KeywordAnalysisResponse {
  user_id: string
  original_keywords: string[]
  clustering_result: {
    clusters: string[][]
    focus_score: number
    primary_topics: string[]
    method: string
  }
  guidance: {
    type: string
    title: string
    message: string
    recommendations: string[]
  }
  timestamp: string
}

interface GuidanceState {
  status: GuidanceStatusResponse | null
  investmentAreas: InvestmentFocusArea[]
  currentStep: string
  loading: boolean
  error: string | null
}

interface OnboardingFlow {
  selectedAreas: string[]
  baseKeywords: string[]
  customKeywords: string[]
  analysisResult: KeywordAnalysisResponse | null
  finalKeywords: string[]
  selectedTopics: string[]
}

export function useGuidance() {
  const {loading: authLoading, isAuthenticated } = useAuth()
  const [isInitialized, setIsInitialized] = useState(false)
  
  const [state, setState] = useState<GuidanceState>({
    status: null,
    investmentAreas: [],
    currentStep: 'none',
    loading: true,
    error: null
  })

  // 步驟歷史管理
  const [stepHistory, setStepHistory] = useState<string[]>([])
  const [canGoBack, setCanGoBack] = useState(false)

  const [onboardingFlow, setOnboardingFlow] = useState<OnboardingFlow>({
    selectedAreas: [],
    baseKeywords: [],
    customKeywords: [],
    analysisResult: null,
    finalKeywords: [],
    selectedTopics: []
  })

  // 獲取引導狀態 - 不含認證檢查邏輯
  const fetchGuidanceStatus = useCallback(async () => {
    try {
      console.log('📊 Fetching guidance status...')
      setState(prev => ({ ...prev, loading: true, error: null }))
      const status = await apiClient.guidance.getStatus()
      console.log('✅ Guidance status fetched successfully:', status)
      setState(prev => ({
        ...prev,
        status,
        loading: false,
        error: null
      }))
      return status
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '獲取引導狀態失敗'
      setState(prev => ({
        ...prev,
        status: null,
        loading: false,
        error: errorMessage
      }))
      console.error('Failed to fetch guidance status:', error)
      return null
    }
  }, [])

  // 獲取投資領域選項
  const fetchInvestmentAreas = useCallback(async () => {
    try {
      const response = await apiClient.guidance.getInvestmentFocusAreas()
      setState(prev => ({
        ...prev,
        investmentAreas: response.data
      }))
      return response.data
    } catch (error: unknown) {
      console.error('Failed to fetch investment areas:', error)
      toast.error('獲取投資領域失敗')
      return []
    }
  }, [])

  // 開始引導流程
  const startOnboarding = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      const result = await apiClient.guidance.startOnboarding()
      console.log('✅ Start onboarding response:', result)
      
      // 重置引導流程狀態
      setOnboardingFlow({
        selectedAreas: [],
        baseKeywords: [],
        customKeywords: [],
        analysisResult: null,
        finalKeywords: [],
        selectedTopics: []
      })
      
      // 重置步驟歷史並導航到第一步
      resetStepHistory()
      navigateToStep('investment_focus_selection', false)
      
      setState(prev => ({ ...prev, loading: false }))
      toast.success('引導流程已開始')
      return { success: true, data: result }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '啟動引導流程失敗'
      setState(prev => ({ ...prev, loading: false, error: errorMessage }))
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [])

  // 選擇投資領域
  const selectInvestmentFocus = useCallback(async (selectedAreas: string[]) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      const result = await apiClient.guidance.selectInvestmentFocus({ selected_options: selectedAreas })
      
      setOnboardingFlow(prev => ({
        ...prev,
        selectedAreas,
        baseKeywords: result.recommended_keywords || [],
        selectedTopics: result.recommended_topics || []
      }))
      
      // 導航到下一步
      navigateToStep(result.step || 'keyword_customization')
      
      setState(prev => ({ ...prev, loading: false }))
      toast.success(result.message || '投資領域選擇完成')
      return { success: true, data: result }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '投資領域選擇失敗'
      setState(prev => ({ ...prev, loading: false, error: errorMessage }))
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [])

  // 分析關鍵字
  const analyzeKeywords = useCallback(async (keywords: string[]) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      const result = await apiClient.guidance.analyzeKeywords({ keywords })
      
      setOnboardingFlow(prev => ({
        ...prev,
        customKeywords: keywords,
        analysisResult: result
      }))
      
      // 導航到分析結果步驟
      navigateToStep('analysis')
      
      setState(prev => ({ ...prev, loading: false }))
      return { success: true, data: result }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '關鍵字分析失敗'
      setState(prev => ({ ...prev, loading: false, error: errorMessage }))
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [])

  // 完成引導流程
  const finalizeOnboarding = useCallback(async (finalKeywords: string[], selectedTopics?: string[]) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      const result = await apiClient.guidance.finalizeOnboarding({
        final_keywords: finalKeywords
      })
      
      setOnboardingFlow(prev => ({
        ...prev,
        finalKeywords,
        selectedTopics: selectedTopics || prev.selectedTopics
      }))
      
      // 導航到完成步驟
      navigateToStep('completed')
      
      // 重新獲取引導狀態
      await fetchGuidanceStatus()
      
      setState(prev => ({ ...prev, loading: false }))
      toast.success(result.message || '引導設定完成')
      return { success: true, data: result }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '完成引導失敗'
      setState(prev => ({ ...prev, loading: false, error: errorMessage }))
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [fetchGuidanceStatus])

  // 獲取優化建議
  const getOptimizationSuggestions = useCallback(async () => {
    try {
      const result = await apiClient.guidance.getOptimizationSuggestions()
      return { success: true, data: result }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '獲取優化建議失敗'
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [])

  // 獲取聚焦度評分
  const getFocusScore = useCallback(async () => {
    try {
      const result = await apiClient.guidance.getFocusScore()
      return { success: true, data: result }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '獲取聚焦度失敗'
      console.error('Failed to get focus score:', error)
      return { success: false, error: errorMessage }
    }
  }, [])

  // 為現有用戶提供優化
  const optimizeExistingUser = useCallback(async () => {
    try {
      const result = await apiClient.guidance.optimizeExistingUser()
      if (result.success) {
        toast.success('優化分析完成')
        return { success: true, data: result }
      } else {
        throw new Error('優化分析失敗')
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '優化分析失敗'
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [])

  // 重置引導流程
  const resetOnboarding = useCallback(() => {
    setOnboardingFlow({
      selectedAreas: [],
      baseKeywords: [],
      customKeywords: [],
      analysisResult: null,
      finalKeywords: [],
      selectedTopics: []
    })
    setState(prev => ({
      ...prev,
      currentStep: 'none'
    }))
  }, [])

  // 重置分析結果
  const resetAnalysisResult = useCallback(() => {
    setOnboardingFlow(prev => ({
      ...prev,
      analysisResult: null
    }))
  }, [])

  // 步驟導航方法
  const navigateToStep = useCallback((step: string, addToHistory: boolean = true) => {
    setState(prev => {
      const currentStep = prev.currentStep
      
      // 如果需要添加到歷史記錄
      if (addToHistory && currentStep !== 'none' && currentStep !== step) {
        setStepHistory(prev => [...prev, currentStep])
        setCanGoBack(true)
      }
      
      return {
        ...prev,
        currentStep: step
      }
    })
  }, [])

  // 返回上一步
  const goToPreviousStep = useCallback(() => {
    if (stepHistory.length > 0) {
      const previousStep = stepHistory[stepHistory.length - 1]
      const newHistory = stepHistory.slice(0, -1)
      
      setStepHistory(newHistory)
      setCanGoBack(newHistory.length > 0)
      
      setState(prev => ({
        ...prev,
        currentStep: previousStep
      }))
      
      return true
    }
    return false
  }, [stepHistory])

  // 重置步驟歷史
  const resetStepHistory = useCallback(() => {
    setStepHistory([])
    setCanGoBack(false)
  }, [])

  // 初始化數據載入 - 等待認證完成
  useEffect(() => {
    if (authLoading) {
      console.log('🔄 Waiting for auth to complete...')
      return
    }
    
    if (!isAuthenticated) {
      console.log('⚠️ Not authenticated, skipping guidance initialization')
      setState(prev => ({ ...prev, loading: false, error: '需要登入' }))
      setIsInitialized(false)
      return
    }
    
    if (isInitialized) {
      console.log('🔄 Already initialized, skipping...')
      return
    }
    
    console.log('🚀 Auth complete, initializing guidance...')
    setIsInitialized(true)
    fetchGuidanceStatus()
    fetchInvestmentAreas()
  }, [authLoading, isAuthenticated, isInitialized, fetchGuidanceStatus, fetchInvestmentAreas])

  return {
    // 狀態
    guidanceStatus: state.status,
    investmentAreas: state.investmentAreas,
    currentStep: state.currentStep,
    loading: state.loading,
    error: state.error,
    onboardingFlow,
    
    // 計算屬性
    needsGuidance: state.status?.needs_guidance ?? true,
    isGuidanceCompleted: state.status?.guidance_completed ?? false,
    focusScore: state.status?.focus_score ?? 0,
    
    // 操作方法
    fetchGuidanceStatus,
    startOnboarding,
    selectInvestmentFocus,
    analyzeKeywords,
    finalizeOnboarding,
    getOptimizationSuggestions,
    getFocusScore,
    optimizeExistingUser,
    resetOnboarding,
    resetAnalysisResult,
    
    // 步驟導航方法
    navigateToStep,
    goToPreviousStep,
    resetStepHistory,
    canGoBack,
    
    // 工具方法
    refresh: () => {
      fetchGuidanceStatus()
      fetchInvestmentAreas()
    }
  }
}

// 導出型別供其他文件使用
export type { InvestmentFocusArea, KeywordAnalysisResponse }
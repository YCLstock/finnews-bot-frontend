'use client'

import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@/lib/api-client-guidance'
import type { 
  GuidanceStatusResponse,
  InvestmentFocusArea,
  OnboardingStartResponse,
  InvestmentFocusResponse,
  KeywordAnalysisResponse,
  OnboardingFinalizeResponse,
  OptimizationSuggestionsResponse
} from '@/lib/api-client-guidance'
import { toast } from 'sonner'

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
  const [state, setState] = useState<GuidanceState>({
    status: null,
    investmentAreas: [],
    currentStep: 'none',
    loading: true,
    error: null
  })

  const [onboardingFlow, setOnboardingFlow] = useState<OnboardingFlow>({
    selectedAreas: [],
    baseKeywords: [],
    customKeywords: [],
    analysisResult: null,
    finalKeywords: [],
    selectedTopics: []
  })

  // 獲取引導狀態
  const fetchGuidanceStatus = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      const status = await apiClient.guidance.getStatus()
      setState(prev => ({
        ...prev,
        status,
        loading: false,
        error: null
      }))
      return status
    } catch (error: any) {
      const errorMessage = error?.message || '獲取引導狀態失敗'
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
    } catch (error: any) {
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
      
      if (result.success) {
        setState(prev => ({
          ...prev,
          currentStep: result.current_step,
          investmentAreas: result.investment_focus_areas,
          loading: false
        }))
        
        // 重置引導流程狀態
        setOnboardingFlow({
          selectedAreas: [],
          baseKeywords: [],
          customKeywords: [],
          analysisResult: null,
          finalKeywords: [],
          selectedTopics: []
        })
        
        toast.success(result.message)
        return { success: true, data: result }
      } else {
        throw new Error('引導啟動失敗')
      }
    } catch (error: any) {
      const errorMessage = error?.message || '啟動引導流程失敗'
      setState(prev => ({ ...prev, loading: false, error: errorMessage }))
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [])

  // 選擇投資領域
  const selectInvestmentFocus = useCallback(async (selectedAreas: string[]) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      const result = await apiClient.guidance.selectInvestmentFocus({ selected_areas: selectedAreas })
      
      if (result.success) {
        setState(prev => ({
          ...prev,
          currentStep: result.current_step,
          loading: false
        }))
        
        setOnboardingFlow(prev => ({
          ...prev,
          selectedAreas,
          baseKeywords: result.base_keywords,
          selectedTopics: result.suggested_topics
        }))
        
        toast.success(result.message)
        return { success: true, data: result }
      } else {
        throw new Error('投資領域選擇失敗')
      }
    } catch (error: any) {
      const errorMessage = error?.message || '投資領域選擇失敗'
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
      
      if (result.success) {
        setState(prev => ({ ...prev, loading: false }))
        
        setOnboardingFlow(prev => ({
          ...prev,
          customKeywords: keywords,
          analysisResult: result
        }))
        
        return { success: true, data: result }
      } else {
        throw new Error('關鍵字分析失敗')
      }
    } catch (error: any) {
      const errorMessage = error?.message || '關鍵字分析失敗'
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
        final_keywords: finalKeywords,
        selected_topics: selectedTopics
      })
      
      if (result.success) {
        setState(prev => ({
          ...prev,
          currentStep: 'completed',
          loading: false
        }))
        
        setOnboardingFlow(prev => ({
          ...prev,
          finalKeywords,
          selectedTopics: selectedTopics || prev.selectedTopics
        }))
        
        // 重新獲取引導狀態
        await fetchGuidanceStatus()
        
        toast.success(result.message)
        return { success: true, data: result }
      } else {
        throw new Error('完成引導失敗')
      }
    } catch (error: any) {
      const errorMessage = error?.message || '完成引導失敗'
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
    } catch (error: any) {
      const errorMessage = error?.message || '獲取優化建議失敗'
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [])

  // 獲取聚焦度評分
  const getFocusScore = useCallback(async () => {
    try {
      const result = await apiClient.guidance.getFocusScore()
      return { success: true, data: result.data }
    } catch (error: any) {
      const errorMessage = error?.message || '獲取聚焦度失敗'
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
        return { success: true, data: result.data }
      } else {
        throw new Error('優化分析失敗')
      }
    } catch (error: any) {
      const errorMessage = error?.message || '優化分析失敗'
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

  // 初始化數據載入
  useEffect(() => {
    fetchGuidanceStatus()
    fetchInvestmentAreas()
  }, [fetchGuidanceStatus, fetchInvestmentAreas])

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
    
    // 工具方法
    refresh: () => {
      fetchGuidanceStatus()
      fetchInvestmentAreas()
    }
  }
}
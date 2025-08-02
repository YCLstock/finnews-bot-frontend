// 用戶引導系統 API 客戶端擴展
import { apiClient } from './api-client'

// 引導系統數據類型定義
interface InvestmentFocusArea {
  code: string
  name_zh: string
  name_en: string
  description: string
  sample_keywords: string[]
}

interface GuidanceStatusResponse {
  user_id: string
  guidance_completed: boolean
  focus_score: number
  last_guidance_at?: string
  clustering_method: string
  keywords: string[]
  original_keywords: string[]
  needs_guidance: boolean
}

interface OnboardingStartResponse {
  success: boolean
  message: string
  current_step: string
  investment_focus_areas: InvestmentFocusArea[]
  guidance_id: string
}

interface InvestmentFocusRequest {
  selected_areas: string[]
}

interface InvestmentFocusResponse {
  success: boolean
  message: string
  current_step: string
  base_keywords: string[]
  suggested_topics: string[]
  selected_areas: { code: string; name: string }[]
}

interface KeywordAnalysisRequest {
  keywords: string[]
}

interface KeywordAnalysisResponse {
  success: boolean
  analysis: {
    focus_score: number
    clusters: string[][]
    primary_topics: string[]
    clustering_method: string
    keyword_count: number
  }
  guidance: {
    type: string
    title: string
    message: string
    icon?: string
    recommendations: string[]
  }
  optimization_suggestions: Array<{
    type: string
    title: string
    description: string
    action: string
  }>
}

interface OnboardingFinalizeRequest {
  final_keywords: string[]
  selected_topics?: string[]
}

interface OnboardingFinalizeResponse {
  success: boolean
  message: string
  summary: {
    keywords: string[]
    topics: string[]
    focus_score: number
    clustering_method: string
  }
  next_steps: string[]
}

interface OptimizationSuggestionsResponse {
  success: boolean
  current_status: {
    focus_score: number
    keywords: string[]
    clustering_method: string
  }
  analysis: KeywordAnalysisResponse['analysis']
  optimization_recommendations: Array<{
    priority: 'high' | 'medium' | 'low'
    type: string
    title: string
    description: string
    action: string
    impact?: string
    suggested_keywords?: string[]
  }>
}

interface GuidanceHistoryResponse {
  success: boolean
  data: {
    history: Array<{
      id: number
      guidance_type: string
      focus_score?: number
      clustering_result?: Record<string, unknown>
      recommendations?: Record<string, unknown>
      keywords_analyzed: string[]
      topics_mapped: string[]
      created_at: string
    }>
    total_count: number
  }
}

// 擴展 API 客戶端
const guidanceApi = {
  // 獲取引導狀態
  getStatus: () => 
    apiClient.request<GuidanceStatusResponse>('/guidance/status'),

  // 開始引導流程
  startOnboarding: () =>
    apiClient.request<OnboardingStartResponse>('/guidance/start-onboarding', {
      method: 'POST'
    }),

  // 投資領域選擇
  selectInvestmentFocus: (data: InvestmentFocusRequest) =>
    apiClient.request<InvestmentFocusResponse>('/guidance/investment-focus', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // 關鍵字分析
  analyzeKeywords: (data: KeywordAnalysisRequest) =>
    apiClient.request<KeywordAnalysisResponse>('/guidance/analyze-keywords', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // 完成引導
  finalizeOnboarding: (data: OnboardingFinalizeRequest) =>
    apiClient.request<OnboardingFinalizeResponse>('/guidance/finalize-onboarding', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // 獲取聚焦度評分
  getFocusScore: () =>
    apiClient.request<{ success: boolean; data: { focus_score: number; clustering_method: string; keywords_count: number; topics_count: number } }>('/guidance/focus-score'),

  // 獲取優化建議
  getOptimizationSuggestions: () =>
    apiClient.request<OptimizationSuggestionsResponse>('/guidance/optimization-suggestions'),

  // 獲取引導歷史
  getHistory: (limit = 10) =>
    apiClient.request<GuidanceHistoryResponse>(`/guidance/history?limit=${limit}`),

  // 獲取投資領域選項
  getInvestmentFocusAreas: () =>
    apiClient.request<{ success: boolean; data: InvestmentFocusArea[] }>('/guidance/investment-focus-areas'),

  // 為現有用戶提供優化
  optimizeExistingUser: () =>
    apiClient.request<{ success: boolean; data: Record<string, unknown> }>('/guidance/optimize-existing-user', {
      method: 'POST'
    })
}

// 擴展原有 API 客戶端
const extendedApiClient = {
  ...apiClient,
  guidance: guidanceApi
}

export { extendedApiClient as apiClient }
export type {
  InvestmentFocusArea,
  GuidanceStatusResponse,
  OnboardingStartResponse,
  InvestmentFocusRequest,
  InvestmentFocusResponse,
  KeywordAnalysisRequest,
  KeywordAnalysisResponse,
  OnboardingFinalizeRequest,
  OnboardingFinalizeResponse,
  OptimizationSuggestionsResponse,
  GuidanceHistoryResponse
}
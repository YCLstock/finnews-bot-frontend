// API 錯誤處理器
class ApiError extends Error {
  constructor(
    public message: string,
    public status: number,
    public details?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// API 數據類型定義
interface SubscriptionCreateRequest {
  delivery_platform: 'discord'
  delivery_target: string
  keywords: string[]
  news_sources: string[]
  summary_language: string
  push_frequency_type: 'daily' | 'twice' | 'thrice'
}

interface SubscriptionUpdateRequest {
  delivery_target?: string
  keywords?: string[]
  news_sources?: string[]
  summary_language?: string
  push_frequency_type?: 'daily' | 'twice' | 'thrice'
  is_active?: boolean
}

interface SubscriptionResponse {
  user_id: string
  delivery_platform: string
  delivery_target: string
  keywords: string[]
  news_sources: string[]
  summary_language: string
  push_frequency_type: string
  is_active: boolean
  last_pushed_at?: string
  updated_at?: string
  last_push_window?: string
}

interface PushHistoryResponse {
  id: number
  user_id: string
  article_id: number
  pushed_at: string
  news_articles?: {
    title: string
    url: string
    summary: string
    published_date: string
  }
}

interface PushStatsResponse {
  total_pushes: number
  recent_pushes_7_days: number
  daily_stats: Record<string, number>
  most_active_day?: [string, number]
}

interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy'
  database: 'connected' | 'disconnected'
  timestamp: boolean
}

interface ConfigResponse {
  supabase_url: string
  supabase_anon_key: string
  supported_languages: string[]
  supported_news_sources: string[]
  max_keywords: number
}

interface FrequencyOptionsResponse {
  daily: {
    description: string
    schedule: string[]
    max_articles_per_push: number
  }
  twice: {
    description: string
    schedule: string[]
    max_articles_per_push: number
  }
  thrice: {
    description: string
    schedule: string[]
    max_articles_per_push: number
  }
}

// Tags API 相關類型
interface Tag {
  id: number
  tag_code: string
  tag_name_zh: string
  tag_name_en?: string
  is_active: boolean
  priority: number
}

interface TagCategory {
  category: string
  tags: Tag[]
  count: number
}

interface TagPreferences {
  user_id: string
  subscribed_tags: string[]
  excluded_tags: string[]
  last_updated: string
}

interface TagStatsResponse {
  total_tags: number
  active_tags: number
  user_subscribed_tags: number
  recent_matches: number
}

interface KeywordConversionPreview {
  original_keywords: string[]
  matched_tags: Tag[]
  unmatched_keywords: string[]
  recommendations: string[]
}

// Guidance API 擴展類型  
interface GuidanceStatusResponse {
  user_id: string
  guidance_completed: boolean
  focus_score: number
  last_guidance_at?: string
  clustering_method: string
  needs_guidance: boolean
  keywords: string[]
  original_keywords: string[]
}

interface FocusScoreResponse {
  user_id: string
  focus_score: number
  clustering_method: string
  last_updated: string
  analysis_details: Record<string, unknown>
}

interface ClusteringAnalysisResponse {
  clusters: string[][]
  focus_score: number
  similarity_matrix: number[][]
  method_used: string
  recommendations: string[]
}

// API 客戶端類別
class ApiClient {
  private baseURL: string
  private defaultHeaders: Record<string, string>

  constructor() {
    this.baseURL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1`
    this.defaultHeaders = {
      'Content-Type': 'application/json'
    }
    
    // 如果使用占位符值，顯示警告
    if (!process.env.NEXT_PUBLIC_API_URL) {
      console.warn('⚠️  使用預設 API URL (localhost:8000) - 請設置 NEXT_PUBLIC_API_URL 環境變數')
    }
  }

  public async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...options.headers
      }
    }
    
    // 調試資訊
    const hasAuth = !!(config.headers as Record<string, string>)?.['Authorization']
    console.log(`🚀 API Request: ${config.method || 'GET'} ${endpoint}, Auth: ${hasAuth ? '✅' : '❌'}`)

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new ApiError(
          error.detail || 'Request failed',
          response.status,
          error
        )
      }

      // 處理空響應（如 DELETE 請求）
      if (response.status === 204) {
        return {} as T
      }

      return await response.json()
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      
      // 網路錯誤或其他錯誤
      throw new ApiError(
        'Network error - please check your connection',
        0,
        error
      )
    }
  }

  // 認證方法
  setAuthToken(token: string) {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`
    console.log('🔑 API Client: Auth token set, length:', token.length)
  }

  clearAuthToken() {
    delete this.defaultHeaders['Authorization']
    console.log('🚫 API Client: Auth token cleared')
  }

  // 訂閱管理 API
  subscriptions = {
    get: () => this.request<SubscriptionResponse | null>('/subscriptions/'),
    
    create: (data: SubscriptionCreateRequest) => 
      this.request<SubscriptionResponse>('/subscriptions/', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    
    update: (data: SubscriptionUpdateRequest) =>
      this.request<SubscriptionResponse>('/subscriptions/', {
        method: 'PUT',
        body: JSON.stringify(data)
      }),
    
    delete: () => this.request('/subscriptions/', { method: 'DELETE' }),
    
    toggle: () => this.request<SubscriptionResponse>('/subscriptions/toggle', {
      method: 'PATCH'
    }),
    
    getFrequencyOptions: () => 
      this.request<FrequencyOptionsResponse>('/subscriptions/frequency-options')
  }

  // 推送歷史 API
  history = {
    get: (limit = 50) => 
      this.request<PushHistoryResponse[]>(`/history/?limit=${limit}`),
    
    getStats: () => this.request<PushStatsResponse>('/history/stats')
  }

  // Tags API
  tags = {
    getAll: () => this.request<Tag[]>('/tags/'),
    
    getCategories: () => this.request<TagCategory[]>('/tags/categories'),
    
    previewKeywordConversion: (keywords: string[]) =>
      this.request<KeywordConversionPreview>('/tags/preview-keyword-conversion', {
        method: 'POST',
        body: JSON.stringify({ keywords })
      }),
    
    getUserPreferences: () => this.request<TagPreferences>('/tags/user-preferences'),
    
    updateUserPreferences: (data: { subscribed_tags: string[], excluded_tags?: string[] }) =>
      this.request<TagPreferences>('/tags/user-preferences', {
        method: 'PUT',
        body: JSON.stringify(data)
      }),
    
    explainArticleMatch: (articleId: number) =>
      this.request<{ matches: Array<{ tag: Tag, confidence: number, reason: string }> }>(`/tags/explain-match/${articleId}`),
    
    getStats: () => this.request<TagStatsResponse>('/tags/stats'),
    
    getCacheStats: () => this.request<Record<string, unknown>>('/tags/cache-stats'),
    
    addKeywordMapping: (data: { tag_code: string, keywords: string[], mapping_type: string }) =>
      this.request<{ success: boolean, message: string }>('/tags/keyword-mapping', {
        method: 'POST',
        body: JSON.stringify(data)
      })
  }

  // 完整的 Guidance API
  guidance = {
    // 基本狀態與資訊
    getStatus: () => this.request<GuidanceStatusResponse>('/guidance/status'),
    
    getFocusScore: () => this.request<FocusScoreResponse>('/guidance/focus-score'),
    
    // 引導流程相關
    getInvestmentFocusAreas: () => 
      this.request<{ success: boolean; data: Array<{ code: string, name_zh: string, name_en: string, description: string, sample_keywords: string[] }> }>('/guidance/investment-focus-areas'),
    
    startOnboarding: () => 
      this.request<{ user_id: string, step: string, progress: number, total_steps: number, content: Record<string, unknown>, next_action: string }>('/guidance/start-onboarding', {
        method: 'POST'
      }),
    
    selectInvestmentFocus: (data: { selected_options: string[] }) =>
      this.request<{ status: string, step: string, progress: number, recommended_keywords: string[], recommended_topics: string[], selected_focus: Array<{code: string, name: string}>, customization_template: Record<string, unknown>, message?: string }>('/guidance/investment-focus', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    
    analyzeKeywords: (data: { keywords: string[] }) =>
      this.request<{ user_id: string, original_keywords: string[], clustering_result: { clusters: string[][], focus_score: number, primary_topics: string[], method: string }, guidance: { type: string, title: string, message: string, recommendations: string[] }, timestamp: string }>('/guidance/analyze-keywords', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    
    finalizeOnboarding: (data: { final_keywords: string[] }) =>
      this.request<{ status: string, step: string, progress: number, user_id: string, final_keywords: string[], analysis: Record<string, unknown>, message: string, next_steps: string[] }>('/guidance/finalize-onboarding', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    
    // 優化與建議
    getOptimizationSuggestions: () => 
      this.request<{ suggestions: Array<{ type: string, message: string, action: string }>, focus_score: number }>('/guidance/optimization-suggestions'),
    
    optimizeExistingUser: () =>
      this.request<{ success: boolean, message: string, optimization_applied: boolean }>('/guidance/optimize-existing-user', {
        method: 'POST'
      }),
    
    // 分析與工具
    performClusteringAnalysis: (keywords: string[]) =>
      this.request<ClusteringAnalysisResponse>('/guidance/clustering-analysis', {
        method: 'POST',
        body: JSON.stringify({ keywords })
      }),
    
    getEnhancedTopics: () => 
      this.request<{ topics: Array<{ code: string, name: string, keywords: string[] }> }>('/guidance/enhanced-topics'),
    
    getGuidanceHistory: (limit = 10) =>
      this.request<Array<{ id: string, guidance_type: string, created_at: string, focus_score: number }>>(`/guidance/history?limit=${limit}`),
    
    updateUserKeywords: (data: { keywords: string[], force_update?: boolean }) =>
      this.request<{ success: boolean, updated_keywords: string[], focus_score: number }>('/guidance/user-keywords', {
        method: 'PUT',
        body: JSON.stringify(data)
      }),
    
    getUsersNeedingGuidance: () => 
      this.request<Array<{ user_id: string, focus_score: number, last_guidance_at?: string }>>('/guidance/users-needing-guidance'),
    
    getUsersWithLowFocus: (threshold = 0.5) =>
      this.request<Array<{ user_id: string, focus_score: number }>>(`/guidance/users-low-focus?threshold=${threshold}`)
  }

  // 系統 API
  system = {
    health: () => this.request<HealthCheckResponse>('/health'),
    config: () => this.request<ConfigResponse>('/config')
  }
}

// 導出 API 客戶端實例和類型
export const apiClient = new ApiClient()
export { ApiError }
export type {
  SubscriptionCreateRequest,
  SubscriptionUpdateRequest,
  SubscriptionResponse,
  PushHistoryResponse,
  PushStatsResponse,
  HealthCheckResponse,
  ConfigResponse,
  FrequencyOptionsResponse,
  // Tags API 類型
  Tag,
  TagCategory,
  TagPreferences,
  TagStatsResponse,
  KeywordConversionPreview,
  // Guidance API 類型
  GuidanceStatusResponse,
  FocusScoreResponse,
  ClusteringAnalysisResponse
} 
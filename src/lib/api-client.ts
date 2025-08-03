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
}

// Quick Onboarding 類型
interface QuickSetupRequest {
  interest_category: 'tech' | 'crypto' | 'market'
  delivery_platform: 'discord' | 'email'
  delivery_target: string
  summary_language: string
  push_frequency_type?: string
}

interface QuickSetupResponse {
  success: boolean
  subscription_id: string
  template_used: string
  keywords: string[]
  focus_score: number
  message: string
  next_steps: string[]
}

interface QuickTemplate {
  id: string
  name: string
  name_en: string
  description: string
  description_en: string
  icon: string
  keywords: string[]
  sample_news: string
  focus_score: number
}

interface PlatformInfo {
  name: string
  description: string
  icon: string
  setup_required: boolean
  setup_steps: string[]
  target_format: string
  pros: string[]
  cons: string[]
}

interface PlatformInfoRecord {
  [key: string]: PlatformInfo
}

interface ValidationResponse {
  platform: string
  target: string
  is_valid: boolean
  error?: string
  help?: string
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
  private requestTimeouts = {
    default: 30000,    // 30 秒
    extended: 60000,   // 60 秒（用於可能有冷啟動的請求）
    guidance: 90000    // 90 秒（用於引導流程的 AI 分析）
  }

  constructor() {
    this.baseURL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1`
    this.defaultHeaders = {
      'Content-Type': 'application/json'
    }
    
    // 檢測是否是 Render 部署環境
    this.isRenderDeployment = this.baseURL.includes('onrender.com')
    
    // 如果使用占位符值，顯示警告
    if (!process.env.NEXT_PUBLIC_API_URL) {
      console.warn('⚠️  使用預設 API URL (localhost:8000) - 請設置 NEXT_PUBLIC_API_URL 環境變數')
    }
  }

  private isRenderDeployment: boolean

  // 冷啟動檢測
  private isColdStartError(error: ApiError): boolean {
    return (
      error.status === 0 || // 網路錯誤
      error.status === 503 || // 服務不可用
      error.status === 504 || // 網關超時
      (!!error.message && (
        error.message.includes('timeout') ||
        error.message.includes('ECONNREFUSED') ||
        error.message.includes('fetch failed')
      ))
    )
  }

  // 重試請求
  private async retryRequest<T>(
    fn: () => Promise<T>, 
    maxRetries: number = 3,
    delay: number = 2000
  ): Promise<T> {
    let lastError: Error
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn()
      } catch (error) {
        lastError = error as Error
        
        if (error instanceof ApiError && this.isColdStartError(error)) {
          console.log(`🔄 API 請求失敗 (嘗試 ${attempt}/${maxRetries})，可能是冷啟動，${delay}ms 後重試...`)
          
          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, delay))
            delay *= 1.5 // 指數退避
            continue
          }
        }
        
        throw error
      }
    }
    
    throw lastError!
  }

  public async request<T>(
    endpoint: string,
    options: RequestInit = {},
    timeoutMs?: number
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    
    // 決定使用的超時時間
    const timeout = timeoutMs || this.getTimeoutForEndpoint(endpoint)
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...options.headers
      },
      signal: AbortSignal.timeout(timeout)
    }
    
    // 調試資訊
    const hasAuth = !!(config.headers as Record<string, string>)?.['Authorization']
    console.log(`🚀 API Request: ${config.method || 'GET'} ${endpoint}, Auth: ${hasAuth ? '✅' : '❌'}, Timeout: ${timeout}ms`)

    const requestFn = async (): Promise<T> => {
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

    // 如果是 Render 部署且可能是首次請求，使用重試機制
    if (this.isRenderDeployment && this.shouldRetryForEndpoint(endpoint)) {
      return this.retryRequest(requestFn, 3, 3000)
    }
    
    return requestFn()
  }

  private getTimeoutForEndpoint(endpoint: string): number {
    if (endpoint.includes('/guidance/') && (
        endpoint.includes('analyze-keywords') ||
        endpoint.includes('finalize-onboarding') ||
        endpoint.includes('optimization-suggestions')
      )) {
      return this.requestTimeouts.guidance
    }
    
    if (this.isRenderDeployment) {
      return this.requestTimeouts.extended
    }
    
    return this.requestTimeouts.default
  }

  private shouldRetryForEndpoint(endpoint: string): boolean {
    // 對所有引導和關鍵功能啟用重試
    return (
      endpoint.includes('/guidance/') ||
      endpoint.includes('/subscriptions/') ||
      endpoint.includes('/status')
    )
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

  // Quick Onboarding API
  quickOnboarding = {
    getTemplates: () => 
      this.request<{ success: boolean, templates: QuickTemplate[], supported_platforms: string[], platform_info: PlatformInfoRecord }>('/quick-onboarding/templates'),
    
    quickSetup: (data: QuickSetupRequest) =>
      this.request<QuickSetupResponse>('/quick-onboarding/setup', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    
    getPlatformInfo: () =>
      this.request<{ supported_platforms: string[], platforms: Record<string, PlatformInfo> }>('/quick-onboarding/platform-info'),
    
    validateTarget: (platform: string, target: string) =>
      this.request<ValidationResponse>('/quick-onboarding/validate-target', {
        method: 'POST',
        body: JSON.stringify({ platform, target })
      }),
    
    checkMigration: () =>
      this.request<{ has_subscription: boolean, current_method?: string, is_quick_setup?: boolean, can_migrate_to_quick?: boolean, message: string }>('/quick-onboarding/migration-check')
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
  // Quick Onboarding 類型
  QuickSetupRequest,
  QuickSetupResponse,
  QuickTemplate,
  PlatformInfo,
  PlatformInfoRecord,
  ValidationResponse,
  ClusteringAnalysisResponse
} 
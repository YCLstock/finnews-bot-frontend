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
  }

  clearAuthToken() {
    delete this.defaultHeaders['Authorization']
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
  FrequencyOptionsResponse
} 
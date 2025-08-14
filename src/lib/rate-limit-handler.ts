// 速率限制處理模組
interface RateLimitInfo {
  remaining: number
  resetTime: number
  retryAfter?: number
}

class RateLimitTracker {
  private static instance: RateLimitTracker
  private rateLimitInfo: Map<string, RateLimitInfo> = new Map()

  static getInstance(): RateLimitTracker {
    if (!RateLimitTracker.instance) {
      RateLimitTracker.instance = new RateLimitTracker()
    }
    return RateLimitTracker.instance
  }

  // 從響應標頭中解析速率限制信息
  parseRateLimitHeaders(headers: Headers, endpoint: string): RateLimitInfo | null {
    const remaining = headers.get('x-ratelimit-remaining') || headers.get('ratelimit-remaining')
    const reset = headers.get('x-ratelimit-reset') || headers.get('ratelimit-reset')
    const retryAfter = headers.get('retry-after')

    if (!remaining && !reset && !retryAfter) {
      return null
    }

    const info: RateLimitInfo = {
      remaining: remaining ? parseInt(remaining, 10) : 0,
      resetTime: reset ? parseInt(reset, 10) * 1000 : Date.now() + 60000, // 預設 1 分鐘後重置
      retryAfter: retryAfter ? parseInt(retryAfter, 10) * 1000 : undefined
    }

    this.rateLimitInfo.set(endpoint, info)
    return info
  }

  // 檢查端點是否被速率限制
  isRateLimited(endpoint: string): { limited: boolean; waitTime?: number } {
    const info = this.rateLimitInfo.get(endpoint)
    
    if (!info) {
      return { limited: false }
    }

    const now = Date.now()
    
    // 如果重置時間已過，清除限制信息
    if (now >= info.resetTime) {
      this.rateLimitInfo.delete(endpoint)
      return { limited: false }
    }

    // 如果請求次數已用完
    if (info.remaining <= 0) {
      const waitTime = Math.max(info.resetTime - now, info.retryAfter || 0)
      return { limited: true, waitTime }
    }

    return { limited: false }
  }

  // 獲取速率限制狀態
  getRateLimitStatus(endpoint: string): RateLimitInfo | null {
    const info = this.rateLimitInfo.get(endpoint)
    
    if (!info) {
      return null
    }

    // 檢查是否已過期
    if (Date.now() >= info.resetTime) {
      this.rateLimitInfo.delete(endpoint)
      return null
    }

    return info
  }

  // 清理過期的速率限制信息
  cleanup(): void {
    const now = Date.now()
    for (const [endpoint, info] of this.rateLimitInfo.entries()) {
      if (now >= info.resetTime) {
        this.rateLimitInfo.delete(endpoint)
      }
    }
  }

  // 獲取友好的等待時間描述
  getWaitTimeDescription(waitTimeMs: number): string {
    const seconds = Math.ceil(waitTimeMs / 1000)
    
    if (seconds < 60) {
      return `${seconds} 秒`
    }
    
    const minutes = Math.ceil(seconds / 60)
    return `${minutes} 分鐘`
  }
}

// 速率限制錯誤
export class RateLimitError extends Error {
  constructor(
    message: string,
    public waitTime: number,
    public resetTime: number
  ) {
    super(message)
    this.name = 'RateLimitError'
  }
}

export const rateLimitTracker = RateLimitTracker.getInstance()

// 定期清理過期的速率限制信息（每 5 分鐘）
if (typeof window !== 'undefined') {
  setInterval(() => {
    rateLimitTracker.cleanup()
  }, 5 * 60 * 1000)
}
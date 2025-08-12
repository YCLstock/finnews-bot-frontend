'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'
import { AlertCircle } from 'lucide-react'

// 將使用 useSearchParams 的邏輯分離到單獨的組件
function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signInWithGoogle, loading, isAuthenticated } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  // 檢查是否已登入
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, router])

  // 檢查 URL 參數中的錯誤信息
  useEffect(() => {
    const error = searchParams.get('error')
    if (error === 'auth_failed') {
      toast.error('登入失敗，請重試')
    }
  }, [searchParams])

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true)
      const { error } = await signInWithGoogle()
      
      if (error) {
        toast.error(error.message || '登入失敗，請重試')
      } else {
        toast.success('正在跳轉到 Google 認證...')
      }
    } catch (err) {
      console.error('Google sign in error:', err)
      toast.error('登入過程中發生錯誤')
    } finally {
      setIsLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">載入中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 md:p-6">
      <div className="w-full max-w-lg space-y-6 md:space-y-8">
        {/* 標題區域 */}
        <div className="text-center space-y-3 md:space-y-4">
          <div className="flex items-center justify-center">
            <Image 
              src="/logos/findyai-logo-medium.png" 
              alt="FindyAI" 
              width={300}
              height={90}
              className="h-12 md:h-16 lg:h-20 w-auto"
              priority
            />
          </div>
          <p className="text-muted-foreground leading-relaxed max-w-sm mx-auto text-sm md:text-base px-2 md:px-0">
            自動化財經新聞摘要推送系統 — 透過 AI 為您篩選和摘要最重要的財經資訊
          </p>
        </div>

        {/* 登入卡片 */}
        <Card className="shadow-lg border-border/40 bg-card/90 backdrop-blur-xl mx-2 md:mx-0">
          <CardHeader className="space-y-2 text-center pb-6">
            <CardTitle className="text-xl md:text-2xl">歡迎回來</CardTitle>
            <CardDescription className="text-sm md:text-base leading-relaxed px-2 md:px-0">
              使用 Google 帳號登入，開始接收個人化財經新聞
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full h-14 text-base rounded-xl shadow-lg hover:shadow-xl transition-all"
              size="lg"
            >
              {isLoading ? (
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                  <span className="font-medium">登入中...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span className="font-medium">使用 Google 帳號登入</span>
                </div>
              )}
            </Button>

            {/* 簡化的安全承諾 */}
            <div className="text-center">
              <div className="inline-flex items-center space-x-2 px-3 py-1.5 bg-accent/20 rounded-xl">
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">安全登入・隱私保護</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Loading fallback 組件
function LoginLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">載入中...</p>
      </div>
    </div>
  )
}

// 主要的登入頁面組件
export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginContent />
    </Suspense>
  )
} 
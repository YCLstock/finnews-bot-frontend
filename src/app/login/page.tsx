'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'
import { AlertCircle, TrendingUp } from 'lucide-react'

export default function LoginPage() {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* 標題區域 */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <TrendingUp className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">FinNews-Bot 2.0</h1>
          </div>
          <p className="text-muted-foreground">
            自動化財經新聞摘要推送系統
          </p>
        </div>

        {/* 登入卡片 */}
        <Card className="shadow-lg border-0 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-xl">歡迎使用</CardTitle>
            <CardDescription>
              使用 Google 帳號快速登入，開始您的財經資訊之旅
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full h-11 bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 shadow-sm"
              variant="outline"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                  <span>登入中...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
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
                  <span>使用 Google 帳號登入</span>
                </div>
              )}
            </Button>

            {/* 功能說明 */}
            <div className="text-center text-sm text-muted-foreground">
              <p>登入後您可以：</p>
              <ul className="mt-2 space-y-1 text-xs">
                <li>• 設置個人化的財經新聞關鍵字</li>
                <li>• 選擇推送頻率和時間</li>
                <li>• 查看推送歷史和統計</li>
                <li>• 獲得 AI 精準摘要的新聞內容</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* 隱私說明 */}
        <div className="text-center text-xs text-muted-foreground">
          <div className="flex items-center justify-center space-x-1 mb-2">
            <AlertCircle className="h-3 w-3" />
            <span>隱私保護</span>
          </div>
          <p>
            我們僅使用您的 Google 帳號進行身份驗證，不會存取您的個人資料。
            <br />
            您的訂閱設置和偏好將安全儲存在我們的系統中。
          </p>
        </div>
      </div>
    </div>
  )
} 
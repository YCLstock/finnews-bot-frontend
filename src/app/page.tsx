'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

export default function HomePage() {
  const router = useRouter()
  const { isAuthenticated, loading } = useAuth()

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        // 已登入，重定向到儀表板
        router.push('/dashboard')
      } else {
        // 未登入，重定向到登入頁面
        router.push('/login')
      }
    }
  }, [isAuthenticated, loading, router])

  // 顯示載入狀態
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">載入中...</p>
      </div>
    </div>
  )
}

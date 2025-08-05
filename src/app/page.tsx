'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { LoadingIndicator } from '@/components/ui/loading-indicator'

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
  return <LoadingIndicator />
}

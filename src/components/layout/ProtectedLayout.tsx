'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Sidebar } from './Sidebar'

interface ProtectedLayoutProps {
  children: React.ReactNode
  className?: string
}

export function ProtectedLayout({ children, className }: ProtectedLayoutProps) {
  const router = useRouter()
  const { isAuthenticated, loading, session } = useAuth()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      console.log('🚫 Not authenticated, redirecting to login')
      router.push('/login')
    } else if (!loading && isAuthenticated && session) {
      console.log('✅ Protected layout: User authenticated')
    }
  }, [isAuthenticated, loading, session, router])

  // 顯示載入狀態
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

  // 未認證時返回空內容（重定向中）
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* 側邊欄 */}
      <Sidebar />
      
      {/* 主內容區域 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 主內容 */}
        <main className={`flex-1 overflow-y-auto ${className || ''}`}>
          {children}
        </main>
      </div>
    </div>
  )
} 
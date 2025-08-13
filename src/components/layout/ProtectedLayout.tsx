'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Sidebar } from './Sidebar'
import { LoadingIndicator } from '@/components/ui/loading-indicator'
import { Logo } from '@/components/ui/logo'

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
    return <LoadingIndicator />
  }

  // 未認證時返回空內容（重定向中）
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="flex h-screen bg-background">
      {/* 側邊欄 */}
      <Sidebar />
      
      {/* 行動版固定 Header - 只在行動版顯示 */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-background/90 backdrop-blur-xl border-b border-border/50 z-40 flex items-center justify-between px-4">
        <Logo 
          variant="icon" 
          size="sm" 
          className="opacity-80 hover:opacity-100 transition-opacity"
        />
        <div className="text-sm text-muted-foreground">
          FindyAI 2.0
        </div>
      </div>
      
      {/* 主內容區域 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 主內容 - 修復行動版 padding 問題 */}
        <main className={`flex-1 overflow-y-auto bg-background ${className || ''} pt-20 md:pt-0 pl-0 md:pl-0`}>
          {children}
        </main>
      </div>
    </div>
  )
} 
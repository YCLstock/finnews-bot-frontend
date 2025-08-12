'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { 
  LayoutDashboard, 
  Settings, 
  History, 
  LogOut, 
  TrendingUp,
  Menu,
  X,
  User
} from 'lucide-react'

const navigation = [
  {
    name: '首頁',
    href: '/dashboard',
    icon: LayoutDashboard,
    description: '概覽和快速操作'
  },
  {
    name: '設定',
    href: '/settings',
    icon: Settings,
    description: '訂閱管理和個人化設定'
  },
  {
    name: '記錄',
    href: '/records',
    icon: History,
    description: '推送歷史和統計分析'
  }
]

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  // 檢測螢幕尺寸，自動調整行動裝置模式
  useEffect(() => {
    const checkScreenSize = () => {
      const isMobile = window.innerWidth < 768
      if (isMobile) {
        setIsCollapsed(false) // 行動裝置不使用collapsed模式
        setIsMobileOpen(false) // 預設關閉
      }
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  // 行動裝置點擊遮罩關閉側邊欄
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMobileOpen])

  const handleSignOut = async () => {
    await signOut()
  }

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen)
  }

  return (
    <>
      {/* 行動裝置漢堡選單按鈕 */}
      <div className="md:hidden">
        <Button
          onClick={toggleMobileSidebar}
          variant="outline"
          size="icon"
          className="mobile-hamburger h-12 w-12 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* 行動裝置遮罩 - 修復 z-index 和點擊問題 */}
      {isMobileOpen && (
        <div 
          className="md:hidden mobile-sidebar-overlay"
          onClick={toggleMobileSidebar}
          aria-hidden="true"
        />
      )}

      {/* 側邊欄主體 */}
      <div className={cn(
        "flex flex-col h-full bg-sidebar/90 backdrop-blur-xl border-r border-sidebar-border/50 transition-all duration-300",
        // 桌面模式
        "hidden md:flex",
        isCollapsed ? "w-16" : "w-64",
        // 行動裝置模式 - 使用新的 CSS 類別
        "md:relative mobile-sidebar",
        isMobileOpen ? "open" : "",
        className
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-sidebar-border/30">
          {!isCollapsed ? (
            <div className="flex items-center justify-center flex-1">
              <img 
                src="/logos/findyai-logo-small.png" 
                alt="FindyAI" 
                className="h-8 w-auto"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center w-full">
              <img 
                src="/logos/findyai-icon-32.png" 
                alt="FindyAI" 
                className="h-6 w-6"
              />
            </div>
          )}
          
          {/* 桌面模式：折疊按鈕，行動裝置模式：關閉按鈕 */}
          {!isCollapsed && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                // 檢查是否為行動裝置（安全地處理 window）
                const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
                if (isMobile) {
                  setIsMobileOpen(false)
                } else {
                  setIsCollapsed(!isCollapsed)
                }
              }}
              className="h-8 w-8 rounded-lg hover:bg-sidebar-accent/50"
            >
              {/* 使用 CSS 媒體查詢來處理圖示顯示 */}
              <X className="h-4 w-4 block md:hidden" />
              <X className="h-4 w-4 hidden md:block" />
            </Button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            
            return (
              <Link key={item.name} href={item.href}>
                <div 
                  className={cn(
                    "group flex items-center space-x-3 px-3 py-4 md:py-3 rounded-xl text-sm transition-all duration-200",
                    "min-h-[48px] md:min-h-[auto]", // 行動裝置最小觸控高度
                    isActive 
                      ? "bg-primary/15 text-primary border border-primary/20 shadow-sm" 
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:shadow-sm"
                  )}
                  onClick={() => {
                    // 行動裝置點擊導航項目後關閉側邊欄
                    if (typeof window !== 'undefined' && window.innerWidth < 768) {
                      setIsMobileOpen(false)
                    }
                  }}
                >
                  <div className={cn(
                    "flex-shrink-0 p-1.5 rounded-lg transition-colors",
                    isActive ? "bg-primary/20" : "group-hover:bg-sidebar-accent/50",
                    isCollapsed ? "mx-auto" : ""
                  )}>
                    <Icon className={cn(
                      "h-5 w-5 md:h-4 md:w-4", // 行動裝置稍大圖示
                      isActive ? "text-primary" : "text-sidebar-foreground"
                    )} />
                  </div>
                  {!isCollapsed && (
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={cn(
                          "font-medium truncate text-base md:text-sm", // 行動裝置稍大字體
                          isActive ? "text-primary" : "text-sidebar-foreground"
                        )}>
                          {item.name}
                        </span>
                      </div>
                      <p className={cn(
                        "text-sm md:text-xs mt-0.5 truncate", // 行動裝置稍大描述文字
                        isActive ? "text-primary/70" : "text-muted-foreground"
                      )}>
                        {item.description}
                      </p>
                    </div>
                  )}
                </div>
              </Link>
            )
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-sidebar-border/30">
          {!isCollapsed && user && (
            <div className="mb-4 p-4 md:p-3 bg-sidebar-accent/30 rounded-xl border border-sidebar-border/20">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  {user.user_metadata?.avatar_url ? (
                    <Image
                      src={user.user_metadata.avatar_url}
                      alt="頭像"
                      width={40}
                      height={40}
                      className="h-10 w-10 md:h-8 md:w-8 rounded-full ring-2 ring-primary/20"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                      }}
                    />
                  ) : (
                    <div className="h-10 w-10 md:h-8 md:w-8 bg-primary/20 rounded-full flex items-center justify-center ring-2 ring-primary/20">
                      <User className="h-5 w-5 md:h-4 md:w-4 text-primary" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base md:text-sm font-medium text-sidebar-foreground truncate">
                    {user.user_metadata?.full_name || user.email}
                  </p>
                  <p className="text-sm md:text-xs text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <Button
            onClick={handleSignOut}
            variant="outline"
            className={cn(
              "w-full h-12 md:h-10 rounded-xl border-sidebar-border/50 hover:bg-sidebar-accent/50 hover:border-sidebar-border transition-all duration-200",
              isCollapsed ? "px-2" : "justify-start text-base md:text-sm"
            )}
          >
            <LogOut className={cn("h-5 w-5 md:h-4 md:w-4", isCollapsed ? "" : "mr-2")} />
            {!isCollapsed && "登出"}
          </Button>
        </div>
      </div>
    </>
  )
} 
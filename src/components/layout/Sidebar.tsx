'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { Logo } from '@/components/ui/logo'
import { 
  LayoutDashboard, 
  Settings, 
  History, 
  LogOut, 
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

  // ESC 鍵關閉行動版側邊欄
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMobileOpen) {
        setIsMobileOpen(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isMobileOpen])

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

      {/* 行動裝置遮罩 - 修復覆蓋問題 */}
      {isMobileOpen && (
        <div 
          className="md:hidden fixed top-0 right-0 bottom-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={toggleMobileSidebar}
          aria-hidden="true"
          style={{ left: '288px' }}
        />
      )}

      {/* 桌面版側邊欄 - 始終顯示 */}
      <div className={cn(
        "hidden md:flex md:relative flex-col h-full bg-sidebar/90 backdrop-blur-xl border-r border-sidebar-border/50 transition-all duration-300",
        isCollapsed ? "md:w-16" : "md:w-64",
        className
      )}>
        {/* Header - 桌面版 */}
        <div className="flex items-center justify-between p-6 border-b border-sidebar-border/30">
          {/* 桌面模式 logo 顯示 */}
          <div className="flex items-center justify-center flex-1">
            {!isCollapsed ? (
              <Logo variant="full" size="md" className="h-8" />
            ) : (
              <div className="flex items-center justify-between w-full">
                <Logo variant="icon" size="sm" className="h-6" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCollapsed(false)}
                  className="h-8 w-8 rounded-lg hover:bg-sidebar-accent/50"
                >
                  <Menu className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          
          {/* 桌面模式折疊按鈕 */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8 rounded-lg hover:bg-sidebar-accent/50"
          >
            {!isCollapsed ? (
              <X className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation - 桌面版 */}
        <nav className="flex-1 p-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            
            return (
              <Link key={item.name} href={item.href}>
                <div 
                  className={cn(
                    "group flex items-center space-x-3 px-3 py-3 rounded-xl text-sm transition-all duration-200",
                    isActive 
                      ? "bg-primary/15 text-primary border border-primary/20 shadow-sm" 
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:shadow-sm"
                  )}
                >
                  <div className={cn(
                    "flex-shrink-0 p-1.5 rounded-lg transition-colors",
                    isActive ? "bg-primary/20" : "group-hover:bg-sidebar-accent/50",
                    isCollapsed ? "mx-auto" : ""
                  )}>
                    <Icon className={cn(
                      "h-4 w-4",
                      isActive ? "text-primary" : "text-sidebar-foreground"
                    )} />
                  </div>
                  {!isCollapsed && (
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={cn(
                          "font-medium truncate text-sm",
                          isActive ? "text-primary" : "text-sidebar-foreground"
                        )}>
                          {item.name}
                        </span>
                      </div>
                      <p className={cn(
                        "text-xs mt-0.5 truncate",
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

        {/* User Info & Logout - 桌面版 */}
        <div className="p-4 border-t border-sidebar-border/30">
          {!isCollapsed && user && (
            <div className="mb-4 p-3 bg-sidebar-accent/30 rounded-xl border border-sidebar-border/20">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  {user.user_metadata?.avatar_url ? (
                    <Image
                      src={user.user_metadata.avatar_url}
                      alt="頭像"
                      width={32}
                      height={32}
                      className="h-8 w-8 rounded-full ring-2 ring-primary/20"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                      }}
                    />
                  ) : (
                    <div className="h-8 w-8 bg-primary/20 rounded-full flex items-center justify-center ring-2 ring-primary/20">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">
                    {user.user_metadata?.full_name || user.email}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
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
              "w-full h-10 rounded-xl border-sidebar-border/50 hover:bg-sidebar-accent/50 hover:border-sidebar-border transition-all duration-200",
              isCollapsed ? "px-2" : "justify-start text-sm"
            )}
          >
            <LogOut className={cn("h-4 w-4", isCollapsed ? "" : "mr-2")} />
            {!isCollapsed && "登出"}
          </Button>
        </div>
      </div>

      {/* 行動版側邊欄 - 條件顯示 */}
      {isMobileOpen && (
        <div className={cn(
          "md:hidden fixed top-0 left-0 bottom-0 w-72 z-50 flex flex-col h-full bg-sidebar/90 backdrop-blur-xl border-r border-sidebar-border/50",
          className
        )}>
          {/* Header - 行動版 */}
          <div className="flex items-center justify-between p-6 border-b border-sidebar-border/30">
            {/* 手機版 logo 顯示 */}
            <div className="flex items-center justify-center flex-1">
              <Logo variant="full" size="lg" className="h-8 sm:h-10" />
            </div>
            
            {/* 關閉按鈕 */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileSidebar}
              className="h-8 w-8 rounded-lg hover:bg-sidebar-accent/50"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation - 行動版 */}
          <nav className="flex-1 p-4 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              
              return (
                <Link key={item.name} href={item.href}>
                  <div 
                    className={cn(
                      "group flex items-center space-x-3 px-3 py-4 rounded-xl text-sm transition-all duration-200",
                      "min-h-[48px]", // 行動裝置最小觸控高度
                      isActive 
                        ? "bg-primary/15 text-primary border border-primary/20 shadow-sm" 
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:shadow-sm"
                    )}
                    onClick={() => {
                      // 行動裝置點擊導航項目後關閉側邊欄
                      setIsMobileOpen(false)
                    }}
                  >
                    <div className={cn(
                      "flex-shrink-0 p-1.5 rounded-lg transition-colors",
                      isActive ? "bg-primary/20" : "group-hover:bg-sidebar-accent/50"
                    )}>
                      <Icon className={cn(
                        "h-5 w-5", // 行動裝置稍大圖示
                        isActive ? "text-primary" : "text-sidebar-foreground"
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={cn(
                          "font-medium truncate text-base", // 行動裝置稍大字體
                          isActive ? "text-primary" : "text-sidebar-foreground"
                        )}>
                          {item.name}
                        </span>
                      </div>
                      <p className={cn(
                        "text-sm mt-0.5 truncate", // 行動裝置稍大描述文字
                        isActive ? "text-primary/70" : "text-muted-foreground"
                      )}>
                        {item.description}
                      </p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </nav>

          {/* User Info & Logout - 行動版 */}
          <div className="p-4 border-t border-sidebar-border/30">
            {user && (
              <div className="mb-4 p-4 bg-sidebar-accent/30 rounded-xl border border-sidebar-border/20">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {user.user_metadata?.avatar_url ? (
                      <Image
                        src={user.user_metadata.avatar_url}
                        alt="頭像"
                        width={40}
                        height={40}
                        className="h-10 w-10 rounded-full ring-2 ring-primary/20"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                        }}
                      />
                    ) : (
                      <div className="h-10 w-10 bg-primary/20 rounded-full flex items-center justify-center ring-2 ring-primary/20">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-medium text-sidebar-foreground truncate">
                      {user.user_metadata?.full_name || user.email}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="w-full h-12 rounded-xl border-sidebar-border/50 hover:bg-sidebar-accent/50 hover:border-sidebar-border transition-all duration-200 justify-start text-base"
            >
              <LogOut className="h-5 w-5 mr-2" />
              登出
            </Button>
          </div>
        </div>
      )}
    </>
  )
} 
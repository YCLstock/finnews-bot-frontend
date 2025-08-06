'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/useAuth'
import { 
  LayoutDashboard, 
  Settings, 
  History, 
  BarChart3, 
  LogOut, 
  TrendingUp,
  Menu,
  X,
  User,
  Target
} from 'lucide-react'

const navigation = [
  {
    name: '儀表板',
    href: '/dashboard',
    icon: LayoutDashboard,
    description: '系統概覽和快速操作'
  },
  {
    name: '個人化設定',
    href: '/guidance',
    icon: Target,
    description: '用戶引導和關鍵字優化'
  },
  {
    name: '訂閱管理',
    href: '/subscriptions',
    icon: Settings,
    description: '設置關鍵字和推送頻率'
  },
  {
    name: '推送歷史',
    href: '/history',
    icon: History,
    description: '查看推送記錄'
  },
  {
    name: '統計分析',
    href: '/analytics',
    icon: BarChart3,
    description: '數據視覺化分析',
    comingSoon: true
  }
]

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <div className={cn(
      "flex flex-col h-full bg-sidebar/50 backdrop-blur-xl border-r border-sidebar-border/50",
      isCollapsed ? "w-16" : "w-64",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-sidebar-border/30">
        {!isCollapsed && (
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <span className="font-medium text-lg tracking-tight">FinNews-Bot</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8 rounded-lg hover:bg-sidebar-accent/50"
        >
          {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          const isComingSoon = item.comingSoon
          
          return (
            <Link key={item.name} href={item.href}>
              <div className={cn(
                "group flex items-center space-x-3 px-3 py-3 rounded-xl text-sm transition-all duration-200",
                isActive 
                  ? "bg-primary/15 text-primary border border-primary/20 shadow-sm" 
                  : isComingSoon
                    ? "text-muted-foreground hover:bg-sidebar-accent/30 cursor-default"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:shadow-sm"
              )}>
                <div className={cn(
                  "flex-shrink-0 p-1.5 rounded-lg transition-colors",
                  isActive ? "bg-primary/20" : "group-hover:bg-sidebar-accent/50",
                  isCollapsed ? "mx-auto" : ""
                )}>
                  <Icon className={cn(
                    "h-4 w-4",
                    isActive ? "text-primary" : isComingSoon ? "text-muted-foreground" : "text-sidebar-foreground"
                  )} />
                </div>
                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={cn(
                        "font-medium truncate",
                        isActive ? "text-primary" : isComingSoon ? "text-muted-foreground" : "text-sidebar-foreground"
                      )}>
                        {item.name}
                      </span>
                      {isComingSoon && (
                        <Badge variant="outline" className="ml-2 bg-muted/50 text-muted-foreground border-border/50 text-xs px-2 py-0.5">
                          即將推出
                        </Badge>
                      )}
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

      {/* User Info & Logout */}
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
            "w-full rounded-xl border-sidebar-border/50 hover:bg-sidebar-accent/50 hover:border-sidebar-border transition-all duration-200",
            isCollapsed ? "px-2" : "justify-start"
          )}
        >
          <LogOut className={cn("h-4 w-4", isCollapsed ? "" : "mr-2")} />
          {!isCollapsed && "登出"}
        </Button>
      </div>
    </div>
  )
} 
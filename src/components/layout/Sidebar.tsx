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
      "flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800",
      isCollapsed ? "w-16" : "w-64",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">FinNews-Bot</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2"
        >
          {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          const isComingSoon = item.comingSoon
          
          return (
            <Link key={item.name} href={item.href}>
              <div className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive 
                  ? "bg-primary text-primary-foreground" 
                  : isComingSoon
                    ? "text-gray-400 dark:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-900 cursor-default"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              )}>
                <Icon className={cn(
                  "h-5 w-5", 
                  isCollapsed ? "mx-auto" : "",
                  isComingSoon ? "text-gray-400" : ""
                )} />
                {!isCollapsed && (
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className={isComingSoon ? "text-gray-400" : ""}>
                        {item.name}
                      </span>
                      {isActive && <Badge variant="secondary" className="ml-2">當前</Badge>}
                      {isComingSoon && (
                        <Badge variant="outline" className="ml-2 bg-yellow-50 text-yellow-700 border-yellow-200 text-xs">
                          即將推出
                        </Badge>
                      )}
                    </div>
                    <p className={cn(
                      "text-xs mt-1",
                      isComingSoon ? "text-gray-400" : "text-muted-foreground"
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
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        {!isCollapsed && user && (
          <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                {user.user_metadata?.avatar_url ? (
                  <Image
                    src={user.user_metadata.avatar_url}
                    alt="頭像"
                    width={32}
                    height={32}
                    className="h-8 w-8 rounded-full"
                  />
                ) : (
                  <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user.user_metadata?.full_name || user.email}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
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
            "w-full",
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
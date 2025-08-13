'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LoadingIndicator } from '@/components/ui/loading-indicator'
import { 
  Sparkles, 
  Target, 
  Bell, 
  ArrowRight,
  CheckCircle,
  Zap,
  BarChart3
} from 'lucide-react'
import { Logo } from '@/components/ui/logo'

export default function HomePage() {
  const router = useRouter()
  const { isAuthenticated, loading } = useAuth()

  // 如果已登入，自動跳轉到儀表板
  useEffect(() => {
    if (isAuthenticated && !loading) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, loading, router])

  // 載入中顯示
  if (loading) {
    return <LoadingIndicator />
  }

  // 已登入用戶會自動跳轉，這裡主要給未登入用戶看
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      {/* Navigation Header */}
      <header className="border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Logo 
              variant="icon-text" 
              size="md" 
              className="hover:opacity-80 transition-opacity"
            />
            <div className="flex items-center space-x-3">
              <Link href="/login">
                <Button variant="outline" className="rounded-xl">
                  登入
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8">
            {/* Main Hero */}
            <div className="space-y-6">
              <Badge variant="secondary" className="px-4 py-1.5 text-sm rounded-full">
                <Sparkles className="h-4 w-4 mr-2" />
                AI 驅動的智能財經新聞
              </Badge>
              
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                <span className="text-foreground">精準掌握</span>
                <br />
                <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  財經資訊脈動
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                讓 AI 為您篩選和摘要最重要的財經新聞，
                <br className="hidden md:block" />
                精準推送到您的信箱或 Discord，不錯過任何投資機會
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/login">
                <Button size="lg" className="h-14 px-8 text-base rounded-xl shadow-lg hover:shadow-xl transition-all">
                  <Zap className="h-5 w-5 mr-2" />
                  立即開始使用
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto pt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">30秒</div>
                <div className="text-muted-foreground">完成設定</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">24/7</div>
                <div className="text-muted-foreground">智能監控</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">AI</div>
                <div className="text-muted-foreground">精準摘要</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              為什麼選擇 FindyAI？
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              專為投資者設計的智能新聞推送系統
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card className="border-border/40 hover:border-border/80 transition-all duration-200 hover:shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Target className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-4">精準關鍵字監控</h3>
                <p className="text-muted-foreground leading-relaxed">
                  設定您關注的股票、產業或主題，AI 智能篩選相關新聞，確保不錯過重要資訊
                </p>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="border-border/40 hover:border-border/80 transition-all duration-200 hover:shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Bell className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-4">即時智能推送</h3>
                <p className="text-muted-foreground leading-relaxed">
                  新聞發生的第一時間，透過 Email 或 Discord 接收 AI 生成的精要摘要，掌握市場動態
                </p>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="border-border/40 hover:border-border/80 transition-all duration-200 hover:shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <BarChart3 className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-4">個人化優化</h3>
                <p className="text-muted-foreground leading-relaxed">
                  基於您的閱讀習慣和反饋，持續優化推送內容，打造專屬的財經資訊體驗
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16 md:py-20 bg-accent/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              簡單三步驟，開始使用
            </h2>
            <p className="text-xl text-muted-foreground">
              不到一分鐘即可完成設定
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-primary-foreground text-xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-lg font-semibold mb-3">登入帳號</h3>
              <p className="text-muted-foreground">使用 Google 帳號快速登入</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-primary-foreground text-xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-lg font-semibold mb-3">設定偏好</h3>
              <p className="text-muted-foreground">選擇關注的關鍵字和推送頻率</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-primary-foreground text-xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-lg font-semibold mb-3">開始接收</h3>
              <p className="text-muted-foreground">在 Discord 接收精準的新聞摘要</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
            <CardContent className="p-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                準備好掌握財經資訊了嗎？
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                立即開始使用 FindyAI，讓 AI 為您篩選最重要的財經新聞
              </p>
              <Link href="/login">
                <Button size="lg" className="h-14 px-8 text-base rounded-xl shadow-lg hover:shadow-xl">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  免費開始使用
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-background/50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-muted-foreground">
            <p>&copy; 2024 FindyAI. 智能財經新聞推送系統</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

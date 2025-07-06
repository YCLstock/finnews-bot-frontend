import { createClient } from '@supabase/supabase-js'

// Supabase 配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

// 如果使用占位符值，顯示警告
if (supabaseUrl === 'https://placeholder.supabase.co' || supabaseAnonKey === 'placeholder-anon-key') {
  console.warn('⚠️  使用占位符 Supabase 配置 - 請設置正確的環境變數')
}

// 創建 Supabase 客戶端
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// 認證相關函數
export const auth = {
  // Google OAuth 登入
  signInWithGoogle: async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    return { data, error }
  },

  // 登出
  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // 獲取當前會話
  getSession: async () => {
    const { data: { session }, error } = await supabase.auth.getSession()
    return { session, error }
  },

  // 獲取當前用戶
  getUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  // 刷新 Token
  refreshSession: async () => {
    const { data, error } = await supabase.auth.refreshSession()
    return { data, error }
  }
} 
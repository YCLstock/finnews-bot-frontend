'use client'

import { useState, useEffect, useCallback } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase, auth } from '@/lib/supabase'
import { apiClient } from '@/lib/api-client'

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  error: string | null
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null
  })

  // 更新 API 客戶端的認證 Token
  const updateApiToken = useCallback((session: Session | null) => {
    if (session?.access_token) {
      apiClient.setAuthToken(session.access_token)
    } else {
      apiClient.clearAuthToken()
    }
  }, [])

  // 初始化用戶狀態
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { session, error } = await auth.getSession()
        
        if (error) {
          console.error('Auth initialization error:', error)
          setAuthState(prev => ({ ...prev, error: error.message, loading: false }))
          return
        }

        const user = session?.user || null
        updateApiToken(session)
        
        setAuthState({
          user,
          session,
          loading: false,
          error: null
        })
      } catch (error) {
        console.error('Auth initialization error:', error)
        setAuthState(prev => ({ 
          ...prev, 
          error: error instanceof Error ? error.message : 'Unknown error',
          loading: false 
        }))
      }
    }

    initializeAuth()
  }, [updateApiToken])

  // 監聽認證狀態變化
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email)
        
        const user = session?.user || null
        updateApiToken(session)
        
        setAuthState({
          user,
          session,
          loading: false,
          error: null
        })
      }
    )

    return () => subscription.unsubscribe()
  }, [updateApiToken])

  // 登入方法
  const signInWithGoogle = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }))
      const { error } = await auth.signInWithGoogle()
      
      if (error) {
        setAuthState(prev => ({ ...prev, error: error.message, loading: false }))
        return { error }
      }
      
      return { error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed'
      setAuthState(prev => ({ ...prev, error: errorMessage, loading: false }))
      return { error: { message: errorMessage } }
    }
  }, [])

  // 登出方法
  const signOut = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }))
      const { error } = await auth.signOut()
      
      if (error) {
        setAuthState(prev => ({ ...prev, error: error.message, loading: false }))
        return { error }
      }
      
      return { error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Logout failed'
      setAuthState(prev => ({ ...prev, error: errorMessage, loading: false }))
      return { error: { message: errorMessage } }
    }
  }, [])

  // 刷新會話
  const refreshSession = useCallback(async () => {
    try {
      const { data, error } = await auth.refreshSession()
      
      if (error) {
        console.error('Session refresh error:', error)
        return { error }
      }
      
      updateApiToken(data.session)
      return { error: null }
    } catch (error) {
      console.error('Session refresh error:', error)
      return { error: error instanceof Error ? error : new Error('Session refresh failed') }
    }
  }, [updateApiToken])

  return {
    // 狀態
    user: authState.user,
    session: authState.session,
    loading: authState.loading,
    error: authState.error,
    isAuthenticated: !!authState.user,
    
    // 方法
    signInWithGoogle,
    signOut,
    refreshSession
  }
} 
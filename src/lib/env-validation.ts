// 環境變數驗證模組
interface RequiredEnvVars {
  NEXT_PUBLIC_API_URL: string
  NEXT_PUBLIC_SUPABASE_URL: string
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string
}

interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

class EnvValidationError extends Error {
  constructor(message: string, public errors: string[]) {
    super(message)
    this.name = 'EnvValidationError'
  }
}

// 驗證必要的環境變數
export function validateRequiredEnvVars(): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // 檢查必要的環境變數
  const requiredVars: (keyof RequiredEnvVars)[] = [
    'NEXT_PUBLIC_API_URL',
    'NEXT_PUBLIC_SUPABASE_URL', 
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ]

  for (const varName of requiredVars) {
    const value = process.env[varName]
    
    if (!value) {
      errors.push(`缺少必要環境變數: ${varName}`)
      continue
    }

    // 驗證環境變數格式
    switch (varName) {
      case 'NEXT_PUBLIC_API_URL':
        if (!value.startsWith('http')) {
          errors.push(`${varName} 必須是有效的 HTTP URL`)
        }
        if (value === 'http://localhost:8000') {
          warnings.push(`${varName} 使用本地開發 URL，生產環境請設置正確的 API 地址`)
        }
        break

      case 'NEXT_PUBLIC_SUPABASE_URL':
        if (!value.includes('supabase.co') && !value.includes('localhost')) {
          warnings.push(`${varName} 可能不是有效的 Supabase URL`)
        }
        break

      case 'NEXT_PUBLIC_SUPABASE_ANON_KEY':
        if (value.length < 100) {
          warnings.push(`${varName} 長度過短，可能不是有效的 Supabase 匿名金鑰`)
        }
        break
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

// 在生產環境中驗證環境變數
export function validateProductionEnv(): void {
  const result = validateRequiredEnvVars()
  
  if (!result.isValid) {
    throw new EnvValidationError(
      '環境變數驗證失敗',
      result.errors
    )
  }

  // 在開發環境中顯示警告
  if (process.env.NODE_ENV === 'development' && result.warnings.length > 0) {
    console.warn('⚠️  環境變數警告:')
    result.warnings.forEach(warning => console.warn(`  - ${warning}`))
  }
}

// 獲取驗證後的環境變數
export function getValidatedEnv(): RequiredEnvVars {
  validateProductionEnv()
  
  return {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL!,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  }
}

export { EnvValidationError }
export type { RequiredEnvVars, ValidationResult }
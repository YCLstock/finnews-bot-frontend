import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

interface LogoProps {
  variant?: 'full' | 'icon' | 'icon-text'
  size?: 'sm' | 'md' | 'lg'
  clickable?: boolean
  className?: string
  onClick?: () => void
}

export function Logo({ 
  variant = 'full', 
  size = 'md', 
  clickable = true, 
  className,
  onClick 
}: LogoProps) {
  const { isAuthenticated } = useAuth()
  
  // 根據登入狀態決定跳轉目標
  const href = isAuthenticated ? '/dashboard' : '/'
  
  // 尺寸映射
  const sizeClasses = {
    sm: {
      full: 'h-6 w-auto',
      icon: 'h-6 w-6',
      text: 'text-lg font-semibold'
    },
    md: {
      full: 'h-8 w-auto',
      icon: 'h-8 w-8', 
      text: 'text-xl font-semibold'
    },
    lg: {
      full: 'h-10 w-auto',
      icon: 'h-10 w-10',
      text: 'text-2xl font-semibold'
    }
  }
  
  // Logo 文件映射
  const logoFiles = {
    full: {
      sm: '/logos/findyai-logo-small.png',
      md: '/logos/findyai-logo-medium.png',
      lg: '/logos/findyai-logo-large.png'
    },
    icon: {
      sm: '/logos/findyai-icon-32.png',
      md: '/logos/findyai-icon-64.png', 
      lg: '/logos/findyai-icon-64.png'
    }
  }
  
  // Logo 尺寸
  const logoSizes = {
    full: {
      sm: { width: 120, height: 36 },
      md: { width: 160, height: 48 },
      lg: { width: 200, height: 60 }
    },
    icon: {
      sm: { width: 32, height: 32 },
      md: { width: 64, height: 64 },
      lg: { width: 64, height: 64 }
    }
  }

  const renderLogo = () => {
    switch (variant) {
      case 'full':
        return (
          <Image
            src={logoFiles.full[size]}
            alt="FindyAI"
            width={logoSizes.full[size].width}
            height={logoSizes.full[size].height}
            className={cn(sizeClasses[size].full, "transition-opacity hover:opacity-80")}
            priority
          />
        )
      
      case 'icon':
        return (
          <Image
            src={logoFiles.icon[size]}
            alt="FindyAI"
            width={logoSizes.icon[size].width}
            height={logoSizes.icon[size].height}
            className={cn(sizeClasses[size].icon, "transition-opacity hover:opacity-80")}
            priority
          />
        )
      
      case 'icon-text':
        return (
          <div className="flex items-center space-x-3">
            <Image
              src={logoFiles.icon[size]}
              alt="FindyAI"
              width={logoSizes.icon[size].width}
              height={logoSizes.icon[size].height}
              className={cn(sizeClasses[size].icon, "transition-opacity hover:opacity-80")}
              priority
            />
            <div>
              <span className={cn(sizeClasses[size].text, "tracking-tight text-foreground")}>
                FindyAI
              </span>
              <p className="text-xs text-muted-foreground">2.0</p>
            </div>
          </div>
        )
      
      default:
        return null
    }
  }

  const logoElement = (
    <div className={cn("inline-flex items-center", className)}>
      {renderLogo()}
    </div>
  )

  if (clickable && !onClick) {
    return (
      <Link href={href} className="inline-flex items-center">
        {logoElement}
      </Link>
    )
  }

  if (onClick) {
    return (
      <button 
        onClick={onClick}
        className="inline-flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg"
      >
        {logoElement}
      </button>
    )
  }

  return logoElement
}
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FindyAI Frontend is a Next.js 15 application that provides an AI-powered financial news aggregation and push notification system. The app uses a Claude-inspired design system with warm orange color schemes, modern typography, and clean layouts.

## Development Commands

```bash
# Development
npm run dev          # Start development server on localhost:3000
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint (ALWAYS run after making changes)

# Environment setup
cp env.example .env.local  # Copy environment template

# Essential pre-commit checks
npm run lint         # Must pass before committing
```

## Architecture & Key Patterns

### Authentication & API Integration
- **Supabase Auth**: Google OAuth integration via `useAuth` hook
- **API Client**: Centralized HTTP client (`src/lib/api-client.ts`) with automatic retry logic for Render.com cold starts
- **Token Management**: Automatic JWT token injection for authenticated requests

### State Management Pattern
Custom hooks for domain-specific state:
- `useAuth()` - Authentication state and methods
- `useSubscription()` - Financial news subscription management
- `useGuidance()` - User onboarding and keyword optimization
- `useHistory()` - Push notification history

### Component Architecture
```
src/components/
├── ui/              # Reusable UI components (Button, Card, Input, etc.)
├── layout/          # Layout components (Sidebar, ProtectedLayout)
├── guidance/        # User onboarding flow
├── subscription/    # News subscription management
└── onboarding/      # Quick setup components
```

### API Client Structure
The API client (`apiClient`) is organized into logical namespaces:
- `apiClient.subscriptions.*` - News subscription CRUD
- `apiClient.history.*` - Push notification history
- `apiClient.guidance.*` - AI-powered user guidance
- `apiClient.tags.*` - Keyword/tag management
- `apiClient.quickOnboarding.*` - Rapid setup flow

### Error Handling Strategy
- **Cold Start Handling**: Automatic retries for Render.com deployments with exponential backoff
- **Network Resilience**: Timeout handling and graceful degradation
- **User Feedback**: Toast notifications via Sonner for all API operations

### Design System
- **Colors**: Claude-inspired warm orange primary (`oklch(0.65 0.15 35.6)`)
- **Typography**: IBM Plex Sans + Inter fallback with optimized line heights
- **Components**: Radix UI primitives with custom styling
- **Styling**: Tailwind CSS v4 with CSS custom properties
- **Logo System**: Unified Logo component supports 3 variants:
  - `full`: Complete logo with text (long format)
  - `icon`: Pure icon (square format) 
  - `icon-text`: Icon + separate text combination

### Route Structure
```
/                    # Auto-redirect based on auth status
/login              # Google OAuth login
/dashboard          # Main app dashboard
/subscriptions      # Manage news subscriptions
/guidance           # AI-guided onboarding
/history            # Push notification history
/analytics          # Usage analytics (coming soon)
```

### Key Data Flow
1. **Authentication**: `useAuth` → Supabase → API token injection
2. **Subscriptions**: User creates/updates → API validation → Background processing
3. **Guidance**: Multi-step onboarding → AI keyword analysis → Optimized subscriptions

## Environment Variables
```bash
NEXT_PUBLIC_API_URL=            # Backend API base URL
NEXT_PUBLIC_SUPABASE_URL=       # Supabase project URL  
NEXT_PUBLIC_SUPABASE_ANON_KEY=  # Supabase anonymous key
```

## Development Notes

### Cold Start Handling
The app includes special logic for handling Render.com cold starts in the API client. Requests that fail due to cold starts are automatically retried with exponential backoff.

### TypeScript Integration
All API responses have strongly-typed interfaces. When adding new API endpoints, update the types in `api-client.ts` and ensure hooks return properly typed data.

### Style Customization
The design system follows Claude's visual principles. When adding new components:
- Use existing color tokens from `globals.css`
- Apply consistent border radius (typically `rounded-xl`)
- Maintain proper spacing using the defined spacing scale
- Use backdrop-blur effects for overlays and cards

### Authentication Flow
All pages except `/login` require authentication. The `ProtectedLayout` component handles auth checks and redirects. API requests automatically include JWT tokens when the user is authenticated.

### Testing Backend Integration
Use the cold start alert component (`<ColdStartAlert />`) during development to help users understand potential delays when connecting to Render.com deployments.

## Component Development Guidelines

### Logo Component Usage
The unified `<Logo />` component should be used across all pages:
- **Homepage**: Use `variant="icon-text"` for brand identity
- **Login**: Use `variant="full"` for main logo display  
- **Sidebar**: Use `variant="full"` when expanded, `variant="icon"` when collapsed
- **Mobile**: Use `variant="icon"` for space-constrained areas

### Sidebar Behavior
- **Desktop**: Single fold/expand button (X to collapse, logo click to expand when collapsed)
- **Mobile**: Hamburger menu with overlay, ESC key support for closing
- **Logo transition**: Smooth animation between full ↔ icon variants
- **Width**: `w-64` expanded, `w-20` collapsed (not w-16 - too narrow)

### Responsive Design Patterns  
- **Font scaling**: Conservative approach for 2xl breakpoint (text-xl, not text-2xl)
- **Touch targets**: Minimum 44px height for mobile buttons
- **Backdrop blur**: Consistent `backdrop-blur-sm` across all overlays
- **Transitions**: Use `transition-all duration-300` for smooth UX

## Critical Implementation Notes

### Authentication Flow
- Pages redirect based on auth status: `/` → `/dashboard` (authenticated), `/login` (not authenticated)
- `ProtectedLayout` handles auth checks and provides sidebar to all authenticated pages
- No duplicate headers - sidebar provides all navigation and branding

### Logo Asset Management
Available logo files in `/public/logos/`:
- **Long format**: `findyai-logo-{small,medium,large}.png`
- **Square format**: `findyai-icon-{32,64,128}.png`
- Logo component automatically selects appropriate asset based on variant and size

### CSS Architecture
- Custom design tokens in `globals.css` with OKLCH color space
- Responsive typography with mobile-first approach
- Tailwind v4 with CSS custom properties for theme variables
- Mobile typography locked to 16px minimum to prevent zoom
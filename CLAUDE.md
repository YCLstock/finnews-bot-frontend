# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FinNews-Bot Frontend is a Next.js 15 application that provides an AI-powered financial news aggregation and push notification system. The app uses a Claude-inspired design system with warm orange color schemes, modern typography, and clean layouts.

## Development Commands

```bash
# Development
npm run dev          # Start development server on localhost:3000
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Environment setup
cp env.example .env.local  # Copy environment template
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
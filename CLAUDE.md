# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Development**: `npm run dev` - Start development server on port 3000
- **Build**: `npm run build` - Build for production
- **Start**: `npm start` - Start production server on port 3000
- **Lint**: `npm run lint` - Run ESLint code quality checks

## Project Architecture

This is a Next.js 15 application that serves as an AI-powered crypto news aggregator called "HODLer". The app presents news in a swipeable card interface similar to dating apps.

### Core Components Structure

- **News Feed System**: Built around a swipeable card interface (`/components/swipe-card.tsx`) that displays news articles
- **Data Flow**: News articles are fetched from external APIs (Mediastack, Exa) and cached in Upstash Redis
- **AI Integration**: Uses OpenAI GPT-4o-mini for generating AI insights about news articles

### Key Architectural Patterns

1. **API Route Structure**: 
   - `/api/news/route.ts` - Main news fetching endpoint
   - `/api/news/populate/route.ts` - Cron endpoint for populating news data
   - `/api/news/ai-insights/route.ts` - AI analysis endpoint

2. **State Management**: Uses React hooks and browser cookies for user preferences (followed topics)

3. **Card Stack Architecture**: News cards are positioned absolutely and use CSS transforms for smooth swipe animations

4. **Progressive Web App**: Configured with manifest.json and iOS-specific meta tags for mobile app-like experience

### Environment Configuration

Required environment variables:
```
MEDIASTACK_API_KEY=your_mediastack_api_key
EXA_API_KEY=your_exa_api_key
OPENAI_API_KEY=your_openai_key
UPSTASH_REDIS_REST_URL=your_upstash_redis_rest_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_rest_token
PER_TOPIC_NEWS_LIMIT=5
EPIGRAM_SECRET_HEADER_NAME=X-Epigram-Secret
EPIGRAM_CRON_SECRET=your_cron_secret
```

Optional environment variables:
```
BASE_URL=http://localhost:3000  # Only needed for custom deployments
NEXT_PUBLIC_GA_ID=your_google_analytics_id
```

### Smart URL Detection System

The application features an intelligent URL detection system that automatically adapts to different deployment environments:

#### Architecture
- **Smart URL Detection**: Automatically detects the correct base URL across environments
- **Vercel Integration**: Prioritizes `VERCEL_PROJECT_PRODUCTION_URL` and `VERCEL_URL`
- **Fallback Mechanism**: Uses `BASE_URL` as fallback, defaults to localhost for development
- **Error Handling**: Provides robust error handling and logging for troubleshooting

#### URL Priority Order
1. `VERCEL_PROJECT_PRODUCTION_URL` - Custom domain on Vercel (highest priority)
2. `VERCEL_URL` - Default Vercel domain (*.vercel.app)
3. `BASE_URL` - Manual configuration (backward compatibility)
4. `http://localhost:3000` - Development fallback (lowest priority)

#### Key Functions (src/lib/url-utils.ts)
- `getBaseUrl()` - Get the appropriate base URL for the current environment
- `buildApiUrl()` - Build complete API URLs with query parameters
- `getPublicUrl()` - Get public-facing URL for SEO and social sharing
- `getEnvironment()` - Detect current environment (development/preview/production)
- `validateEnvironmentConfig()` - Validate environment variable setup

### Data Population

To populate news data during development:
```bash
curl --header "X-Epigram-Secret: <your-secret>" http://localhost:3000/api/news/populate
```

### Mobile-First Design

- Uses `dvh` units for mobile viewport handling
- Implements iOS safe area insets with `env(safe-area-inset-*)`
- Configured for PWA installation on mobile devices
- Touch gestures handled via `react-swipeable` library

### Key Dependencies

- **UI**: Radix UI components with Tailwind CSS and shadcn/ui
- **Images**: Next.js Image component with external domain optimization
- **Gestures**: react-swipeable for card swiping
- **AI**: Vercel AI SDK with OpenAI integration
- **Caching**: Upstash Redis for data caching and rate limiting
- **Markdown**: marked library for AI insight rendering

### File Structure Notes

- `/src/app/` - Next.js 13+ app router pages
- `/src/components/` - Reusable React components
- `/src/lib/` - Utility libraries and helper functions (including url-utils.ts)
- `/src/modules/` - Utility modules for external services (Redis, Exa)
- `/src/types/` - TypeScript type definitions
- `/public/static/images/` - Static assets including default images

## Vercel Deployment Guide

### Quick Deployment Steps

1. **Connect Repository**: Link your GitHub repository to Vercel
2. **Configure Environment Variables**: Add required variables in Vercel Dashboard
3. **Deploy**: Vercel automatically builds and deploys your application

### Environment Variables Setup

In Vercel Dashboard → Settings → Environment Variables, add:

**Required Variables:**
```
MEDIASTACK_API_KEY=your_actual_key
EXA_API_KEY=your_actual_key
OPENAI_API_KEY=your_actual_key
UPSTASH_REDIS_REST_URL=your_actual_url
UPSTASH_REDIS_REST_TOKEN=your_actual_token
EPIGRAM_CRON_SECRET=your_secret_string
```

**Optional Variables:**
```
NEXT_PUBLIC_GA_ID=your_google_analytics_id
PER_TOPIC_NEWS_LIMIT=5
EPIGRAM_SECRET_HEADER_NAME=X-Epigram-Secret
```

**⚠️ Important:** Do NOT set `BASE_URL` in Vercel - the smart URL detection will handle this automatically!

### URL Detection Behavior on Vercel

- **Custom Domain**: Uses `VERCEL_PROJECT_PRODUCTION_URL` (set automatically when you add a custom domain)
- **Default Domain**: Uses `VERCEL_URL` (your-app.vercel.app)
- **Preview Deployments**: Each preview gets its own URL automatically detected

### Post-Deployment Steps

1. **Initialize Data**: Call the populate endpoint to load initial news data:
   ```bash
   curl --header "X-Epigram-Secret: your_secret" https://your-app.vercel.app/api/news/populate
   ```

2. **Set Up Cron Job**: Configure a cron job service (like GitHub Actions or Vercel Cron) to regularly update news:
   ```bash
   # Run every hour
   curl --header "X-Epigram-Secret: your_secret" https://your-app.vercel.app/api/news/populate
   ```

### Troubleshooting

#### URL Detection Issues
- Check browser console for URL-related errors
- Use `validateEnvironmentConfig()` function to debug configuration
- Verify that Vercel environment variables are correctly set

#### Build Failures
- Ensure all required environment variables are set in Vercel
- Check build logs for missing dependencies or TypeScript errors
- Verify API keys are valid and have necessary permissions

#### Runtime Issues
- Check Vercel Function logs for API errors
- Verify Redis connection and rate limiting configuration
- Ensure external APIs (Mediastack, Exa, OpenAI) are accessible

### Best Practices

1. **Environment Variables**: Never commit API keys to the repository
2. **Monitoring**: Set up monitoring for API endpoints and error tracking
3. **Caching**: Leverage Redis caching to minimize API calls and costs
4. **Rate Limiting**: Monitor API usage to stay within quota limits
5. **Custom Domain**: Configure a custom domain for better SEO and branding

The codebase uses Chinese comments extensively and is designed for crypto/finance news consumption with a focus on mobile user experience.
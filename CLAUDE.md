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
OPENAI_API_KEY=your_openai_api_key
BASE_URL=http://localhost:3000
UPSTASH_REDIS_REST_URL=your_upstash_redis_rest_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_rest_token
PER_TOPIC_NEWS_LIMIT=5
EPIGRAM_SECRET_HEADER_NAME=X-Epigram-Secret
EPIGRAM_CRON_SECRET=your_cron_secret
```

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
- `/src/modules/` - Utility modules for external services (Redis, Exa)
- `/src/types/` - TypeScript type definitions
- `/public/static/images/` - Static assets including default images

The codebase uses Chinese comments extensively and is designed for crypto/finance news consumption with a focus on mobile user experience.
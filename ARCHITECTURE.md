# System Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                             │
│                     http://localhost:3000                        │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ HTTP/HTTPS
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                      NEXT.JS FRONTEND                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Pages/Routes:                                            │  │
│  │  • / (Home - Auto redirect)                              │  │
│  │  • /login                                                 │  │
│  │  • /register                                              │  │
│  │  • /dashboard (Protected)                                │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Components:                                              │  │
│  │  • ExtractionForm                                         │  │
│  │  • ExtractionHistory                                      │  │
│  │  • ResultsTable                                           │  │
│  │  • QuotaDisplay                                           │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ REST API (Axios)
                             │ JWT Token in Headers
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                      NESTJS BACKEND                              │
│                  http://localhost:3001/api                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Modules:                                                 │  │
│  │                                                            │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │  │
│  │  │    Auth     │  │   Users     │  │ Extraction  │     │  │
│  │  │   Module    │  │   Module    │  │   Module    │     │  │
│  │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘     │  │
│  │         │                 │                 │            │  │
│  │         │                 │                 │            │  │
│  │  ┌──────▼─────────────────▼─────────────────▼──────┐   │  │
│  │  │           Common (Guards, Decorators)            │   │  │
│  │  └──────────────────────────────────────────────────┘   │  │
│  │                                                            │  │
│  │  ┌──────────────────────────────────────────────────┐   │  │
│  │  │         Scraper Module (Puppeteer)               │   │  │
│  │  │  • Launch headless Chrome                        │   │  │
│  │  │  • Navigate to Google Maps                       │   │  │
│  │  │  • Extract business data                         │   │  │
│  │  │  • Filter & deduplicate                          │   │  │
│  │  └──────────────────────────────────────────────────┘   │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────┬────────────────────────────┬───────────────────────┘
             │                            │
             │                            │
     ┌───────▼────────┐          ┌────────▼─────────┐
     │   MongoDB      │          │   Puppeteer      │
     │   Database     │          │  (Headless       │
     │                │          │   Chrome)        │
     │  • Users       │          │                  │
     │  • Extractions │          │  Scrapes Google  │
     └────────────────┘          │  Maps Website    │
                                 └──────────────────┘
```

## Data Flow

### 1. User Registration/Login Flow

```
User → Frontend → POST /api/auth/register
                     ↓
                  NestJS Auth Controller
                     ↓
                  Auth Service
                     ↓
                  Hash Password (bcrypt)
                     ↓
                  Users Service
                     ↓
                  MongoDB (Save User)
                     ↓
                  Generate JWT Token
                     ↓
                  Return Token + User Data
                     ↓
                  Frontend (Store in localStorage)
```

### 2. Extraction Flow

```
User enters keyword → Frontend Form
                          ↓
                   POST /api/extraction/start
                   (with JWT token)
                          ↓
                   JWT Auth Guard (verify token)
                          ↓
                   Extraction Controller
                          ↓
                   Check User Quota
                          ↓
                   Create Extraction Record (status: processing)
                          ↓
                   Scraper Service
                          ↓
        ┌─────────────────┴─────────────────┐
        │                                    │
   Launch Puppeteer                    Update Status
        │                                    │
   Navigate to Google Maps                  │
        │                                    │
   Search for keyword                       │
        │                                    │
   Scroll & Load Results                    │
        │                                    │
   Extract Data for Each Business           │
        │                                    │
   • Name, Category, Address                │
   • Phone, Email, Website                  │
   • Rating, Reviews                        │
        │                                    │
   Apply Filters                             │
   • Remove duplicates                      │
   • Skip without phone                     │
        │                                    │
   Close Browser                             │
        │                                    │
        └─────────────────┬─────────────────┘
                          │
                   Save Results to MongoDB
                   (status: completed)
                          ↓
                   Update User Quota
                          ↓
                   Return Results to Frontend
```

### 3. View & Export Flow

```
User clicks "View Results" → GET /api/extraction/:id
                                      ↓
                              Check User Ownership
                                      ↓
                              Retrieve from MongoDB
                                      ↓
                              Display in ResultsTable

User clicks "Export CSV" → GET /api/extraction/:id/export
                                      ↓
                              Retrieve Extraction Data
                                      ↓
                              Convert to CSV (json2csv)
                                      ↓
                              Send as File Download
                                      ↓
                              Browser Downloads CSV
```

## Component Interaction Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                    FRONTEND COMPONENTS                        │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────┐          ┌──────────────┐                  │
│  │   Login/    │          │  Dashboard   │                  │
│  │  Register   │ ────────▶│    Page      │                  │
│  │   Pages     │          └──────┬───────┘                  │
│  └─────────────┘                 │                           │
│                                   │                           │
│                    ┌──────────────┼──────────────┐           │
│                    │              │              │           │
│            ┌───────▼──────┐  ┌───▼────────┐ ┌──▼─────────┐ │
│            │ Extraction   │  │ Extraction │ │   Quota    │ │
│            │    Form      │  │  History   │ │  Display   │ │
│            └───────┬──────┘  └───┬────────┘ └────────────┘ │
│                    │             │                           │
│                    │             │                           │
│                    │      ┌──────▼────────┐                 │
│                    │      │  Results      │                 │
│                    │      │    Table      │                 │
│                    │      └───────────────┘                 │
│                    │                                         │
└────────────────────┼─────────────────────────────────────────┘
                     │
                     │ API Client (lib/api.ts)
                     │
┌────────────────────▼─────────────────────────────────────────┐
│                    BACKEND MODULES                            │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────┐    ┌──────────┐    ┌────────────┐            │
│  │   Auth   │◀──▶│  Users   │◀──▶│ Extraction │            │
│  │  Module  │    │  Module  │    │   Module   │            │
│  └────┬─────┘    └────┬─────┘    └─────┬──────┘            │
│       │               │                 │                    │
│       │               │                 │                    │
│       └───────────────┴─────────────────┘                    │
│                       │                                       │
│                       │                                       │
│                ┌──────▼───────┐                              │
│                │   Scraper    │                              │
│                │   Module     │                              │
│                └──────────────┘                              │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

## Database Schema Relationships

```
┌─────────────────────────┐
│        Users            │
│─────────────────────────│
│ _id: ObjectId (PK)      │
│ email: string           │
│ password: string        │
│ name: string            │
│ dailyQuota: number      │
│ usedQuotaToday: number  │
│ quotaResetDate: Date    │
│ isActive: boolean       │
│ role: string            │
│ createdAt: Date         │
│ updatedAt: Date         │
└────────┬────────────────┘
         │
         │ 1:N
         │
┌────────▼────────────────┐
│     Extractions         │
│─────────────────────────│
│ _id: ObjectId (PK)      │
│ userId: ObjectId (FK)   │───┐
│ keyword: string         │   │
│ status: string          │   │
│ results: Array[]        │   │ References User
│ totalResults: number    │   │
│ duplicatesSkipped: num  │   │
│ withoutPhoneSkipped: n  │   │
│ skipDuplicates: bool    │   │
│ skipWithoutPhone: bool  │   │
│ errorMessage: string    │   │
│ startedAt: Date         │   │
│ completedAt: Date       │   │
│ createdAt: Date         │   │
│ updatedAt: Date         │   │
└─────────────────────────┘   │
                              │
                              │
        ┌─────────────────────┘
        │
        ▼
   One user can have
   many extractions
```

## Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     SECURITY LAYERS                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. FRONTEND SECURITY                                        │
│     • Client-side route protection                           │
│     • Token storage in localStorage                          │
│     • Automatic token inclusion in requests                  │
│                                                              │
│  2. NETWORK SECURITY                                         │
│     • CORS configuration                                     │
│     • HTTPS in production                                    │
│     • JWT token in Authorization header                      │
│                                                              │
│  3. BACKEND SECURITY                                         │
│     ┌──────────────────────────────────────────────────┐   │
│     │ a) Authentication Layer                           │   │
│     │    • JWT Strategy (Passport.js)                  │   │
│     │    • Token verification on each request          │   │
│     │    • Password hashing (bcrypt)                   │   │
│     └──────────────────────────────────────────────────┘   │
│                                                              │
│     ┌──────────────────────────────────────────────────┐   │
│     │ b) Authorization Layer                            │   │
│     │    • JwtAuthGuard on protected routes            │   │
│     │    • User ownership verification                 │   │
│     │    • Role-based access (future)                  │   │
│     └──────────────────────────────────────────────────┘   │
│                                                              │
│     ┌──────────────────────────────────────────────────┐   │
│     │ c) Validation Layer                               │   │
│     │    • DTO validation (class-validator)            │   │
│     │    • Input sanitization                          │   │
│     │    • Type checking (TypeScript)                  │   │
│     └──────────────────────────────────────────────────┘   │
│                                                              │
│     ┌──────────────────────────────────────────────────┐   │
│     │ d) Rate Limiting                                  │   │
│     │    • Throttler module                            │   │
│     │    • Per-user quota system                       │   │
│     │    • Daily limits enforcement                    │   │
│     └──────────────────────────────────────────────────┘   │
│                                                              │
│  4. DATABASE SECURITY                                        │
│     • MongoDB authentication                                 │
│     • Mongoose schema validation                            │
│     • Indexed queries for performance                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack Details

### Frontend Stack
```
┌─────────────────────────────────────────────┐
│            Next.js 14+ (App Router)         │
│  ┌───────────────────────────────────────┐ │
│  │         React 18.2                    │ │
│  │  • Server Components                  │ │
│  │  • Client Components                  │ │
│  │  • Hooks (useState, useEffect)        │ │
│  └───────────────────────────────────────┘ │
│  ┌───────────────────────────────────────┐ │
│  │         TypeScript 5.3                │ │
│  │  • Type safety                        │ │
│  │  • Interfaces                         │ │
│  │  • Enums                              │ │
│  └───────────────────────────────────────┘ │
│  ┌───────────────────────────────────────┐ │
│  │         Tailwind CSS 3.4              │ │
│  │  • Utility-first CSS                  │ │
│  │  • Custom components                  │ │
│  │  • Responsive design                  │ │
│  └───────────────────────────────────────┘ │
│  ┌───────────────────────────────────────┐ │
│  │         Libraries                     │ │
│  │  • Axios (HTTP client)                │ │
│  │  • React Hot Toast (notifications)    │ │
│  │  • Lucide React (icons)               │ │
│  │  • date-fns (date formatting)         │ │
│  └───────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

### Backend Stack
```
┌─────────────────────────────────────────────┐
│            NestJS 10.3                      │
│  ┌───────────────────────────────────────┐ │
│  │         Core Features                 │ │
│  │  • Dependency Injection               │ │
│  │  • Modular architecture               │ │
│  │  • Decorators                         │ │
│  │  • Middleware/Guards                  │ │
│  └───────────────────────────────────────┘ │
│  ┌───────────────────────────────────────┐ │
│  │         Database                      │ │
│  │  • MongoDB (Mongoose ODM)             │ │
│  │  • Schema validation                  │ │
│  │  • Indexes                            │ │
│  └───────────────────────────────────────┘ │
│  ┌───────────────────────────────────────┐ │
│  │         Authentication                │ │
│  │  • JWT (@nestjs/jwt)                  │ │
│  │  • Passport.js strategies             │ │
│  │  • bcrypt (password hashing)          │ │
│  └───────────────────────────────────────┘ │
│  ┌───────────────────────────────────────┐ │
│  │         Web Scraping                  │ │
│  │  • Puppeteer (headless browser)       │ │
│  │  • Puppeteer Extra (stealth)          │ │
│  └───────────────────────────────────────┘ │
│  ┌───────────────────────────────────────┐ │
│  │         Other Tools                   │ │
│  │  • json2csv (CSV export)              │ │
│  │  • class-validator (validation)       │ │
│  │  • @nestjs/throttler (rate limit)     │ │
│  │  • @nestjs/config (env vars)          │ │
│  └───────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

## Deployment Architecture (Production)

```
                    ┌────────────────┐
                    │   CloudFlare   │
                    │   DNS & CDN    │
                    └────────┬───────┘
                             │
                    ┌────────▼───────┐
                    │   Load         │
                    │   Balancer     │
                    └────┬──────┬────┘
                         │      │
            ┌────────────┘      └────────────┐
            │                                │
    ┌───────▼────────┐            ┌─────────▼────────┐
    │   Frontend     │            │    Backend       │
    │   (Vercel/     │            │   (Railway/      │
    │    Netlify)    │            │    Render)       │
    │                │            │                  │
    │  Next.js App   │◀──────────▶│   NestJS API     │
    └────────────────┘    API     │                  │
                         Calls    │  • Rate Limiting │
                                  │  • Job Queue     │
                                  └─────────┬────────┘
                                            │
                            ┌───────────────┴───────────────┐
                            │                               │
                    ┌───────▼────────┐          ┌──────────▼────────┐
                    │   MongoDB      │          │   Redis           │
                    │   Atlas        │          │   (Rate Limiting) │
                    │   (Cloud)      │          │   (Caching)       │
                    └────────────────┘          └───────────────────┘
```

---

This architecture provides:
- **Scalability**: Modular design allows horizontal scaling
- **Security**: Multi-layered security approach
- **Maintainability**: Clear separation of concerns
- **Performance**: Optimized data flow and caching strategies
- **Reliability**: Error handling and status tracking

# Google Maps Data Extractor - Project Summary

## Overview

A full-stack web application for extracting business data from Google Maps based on user-inputted keywords. Built with Next.js (frontend) and NestJS (backend), featuring JWT authentication, MongoDB database, and web scraping using Puppeteer.

## Project Status: ✅ COMPLETE

All core features have been implemented and are ready for deployment.

---

## Architecture

### Technology Stack

**Frontend:**
- Next.js 14+ (React 18, App Router)
- TypeScript
- Tailwind CSS
- Axios (API client)
- React Hot Toast (notifications)
- Lucide React (icons)
- date-fns (date formatting)

**Backend:**
- NestJS 10+
- TypeScript
- MongoDB with Mongoose
- Puppeteer (web scraping)
- JWT (authentication)
- Passport.js (auth strategies)
- json2csv (CSV export)
- Throttler (rate limiting)

---

## Key Features Implemented

### 1. Authentication System ✅
- Email/password registration
- JWT-based authentication
- Protected routes
- Automatic token refresh
- Session management

### 2. Data Extraction ✅
- Keyword-based Google Maps scraping
- Extracts:
  - Category
  - Business name
  - Address
  - Phone number
  - Email (when available)
  - Website
  - Rating (1-5 stars)
  - Review count
- Real-time status updates
- Background processing

### 3. Smart Filtering ✅
- **Skip duplicates**: Automatically identifies and removes duplicate entries based on business name
- **Skip without phone**: Excludes businesses without phone numbers
- **Configurable max results**: 10-100 results per extraction
- **Custom search**: Filter results by name, address, category, or phone

### 4. Data Display ✅
- Clean, responsive tabular format
- Sortable columns
- Search functionality
- Business information cards
- Contact details (phone, email)
- Ratings and reviews display
- Direct links to websites

### 5. CSV Export ✅
- One-click export to CSV
- Properly formatted columns
- All extracted data included
- Automatic filename generation

### 6. User Quota System ✅
- Configurable daily extraction limits
- Default: 100 extractions per day
- Automatic quota reset
- Real-time quota display
- Visual progress indicator

### 7. Extraction History ✅
- View past extractions
- Status tracking (pending, processing, completed, failed)
- Timestamp display
- Result statistics
- Quick access to results

---

## Project Structure

```
google-map-extractor-webapp/
│
├── backend/                          # NestJS Backend
│   ├── src/
│   │   ├── auth/                     # Authentication module
│   │   │   ├── auth.controller.ts    # Auth endpoints
│   │   │   ├── auth.service.ts       # Auth business logic
│   │   │   ├── auth.module.ts
│   │   │   ├── dto/
│   │   │   │   ├── login.dto.ts
│   │   │   │   └── register.dto.ts
│   │   │   └── strategies/
│   │   │       └── jwt.strategy.ts
│   │   │
│   │   ├── users/                    # Users module
│   │   │   ├── users.service.ts
│   │   │   ├── users.module.ts
│   │   │   └── schemas/
│   │   │       └── user.schema.ts
│   │   │
│   │   ├── extraction/               # Extraction module
│   │   │   ├── extraction.controller.ts
│   │   │   ├── extraction.service.ts
│   │   │   ├── extraction.module.ts
│   │   │   ├── dto/
│   │   │   │   └── start-extraction.dto.ts
│   │   │   └── schemas/
│   │   │       └── extraction.schema.ts
│   │   │
│   │   ├── scraper/                  # Google Maps scraper
│   │   │   ├── scraper.service.ts    # Core scraping logic
│   │   │   └── scraper.module.ts
│   │   │
│   │   ├── common/                   # Shared utilities
│   │   │   ├── guards/
│   │   │   │   └── jwt-auth.guard.ts
│   │   │   └── decorators/
│   │   │       └── current-user.decorator.ts
│   │   │
│   │   ├── app.module.ts
│   │   └── main.ts
│   │
│   ├── package.json
│   ├── tsconfig.json
│   ├── nest-cli.json
│   └── .env.example
│
├── frontend/                         # Next.js Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx           # Root layout
│   │   │   ├── page.tsx             # Home (redirects)
│   │   │   ├── login/
│   │   │   │   └── page.tsx         # Login page
│   │   │   ├── register/
│   │   │   │   └── page.tsx         # Registration page
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx         # Main dashboard
│   │   │   └── globals.css
│   │   │
│   │   ├── components/              # Reusable components
│   │   │   ├── ExtractionForm.tsx   # New extraction form
│   │   │   ├── ExtractionHistory.tsx # History list
│   │   │   ├── ResultsTable.tsx     # Results display
│   │   │   └── QuotaDisplay.tsx     # Quota indicator
│   │   │
│   │   └── lib/
│   │       ├── api.ts               # API client & types
│   │       └── auth.ts              # Auth utilities
│   │
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.js
│   ├── tailwind.config.ts
│   ├── postcss.config.js
│   └── .env.example
│
├── .gitignore
└── README.md
```

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (protected)

### Extraction
- `POST /api/extraction/start` - Start new extraction (protected)
- `GET /api/extraction/history?limit=20` - Get extraction history (protected)
- `GET /api/extraction/:id` - Get specific extraction (protected)
- `GET /api/extraction/:id/export` - Export to CSV (protected)
- `DELETE /api/extraction/:id` - Delete extraction (protected)
- `GET /api/extraction/quota` - Get remaining quota (protected)

---

## Database Schema

### User Collection
```typescript
{
  email: string (unique, required)
  password: string (hashed, required)
  name: string
  dailyQuota: number (default: 100)
  usedQuotaToday: number (default: 0)
  quotaResetDate: Date
  isActive: boolean (default: true)
  role: string (default: 'user')
  createdAt: Date
  updatedAt: Date
}
```

### Extraction Collection
```typescript
{
  userId: ObjectId (ref: User)
  keyword: string (required)
  status: string (pending|processing|completed|failed)
  results: ExtractedPlace[]
  totalResults: number
  duplicatesSkipped: number
  withoutPhoneSkipped: number
  skipDuplicates: boolean
  skipWithoutPhone: boolean
  errorMessage: string
  startedAt: Date
  completedAt: Date
  createdAt: Date
  updatedAt: Date
}
```

---

## Installation & Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or cloud)
- npm or yarn

### Backend Setup

1. Navigate to backend:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Configure `.env`:
```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/google-maps-extractor
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=86400000
MAX_RESULTS_PER_KEYWORD=50
SCRAPER_TIMEOUT=60000
HEADLESS_BROWSER=true
CORS_ORIGIN=http://localhost:3000
```

5. Start backend:
```bash
npm run start:dev
```

Backend runs at: `http://localhost:3001/api`

### Frontend Setup

1. Navigate to frontend:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file:
```bash
cp .env.example .env.local
```

4. Configure `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

5. Start frontend:
```bash
npm run dev
```

Frontend runs at: `http://localhost:3000`

---

## Usage Flow

1. **Register/Login**
   - Create account or login
   - Receive JWT token
   - Redirected to dashboard

2. **Start Extraction**
   - Enter keyword (e.g., "restaurants in New York")
   - Configure options (skip duplicates, skip without phone, max results)
   - Click "Start Extraction"
   - Wait for completion (30-60+ seconds)

3. **View Results**
   - Switch to "Extraction History" tab
   - Click "View Results" on completed extraction
   - Browse results in table format
   - Search/filter results

4. **Export Data**
   - Click "Export CSV" button
   - CSV file downloads automatically
   - Open in Excel, Google Sheets, etc.

---

## Important Notes

### Legal & Compliance ⚠️

**Web Scraping Disclaimer:**
- This application uses web scraping to extract data from Google Maps
- Web scraping may violate Google's Terms of Service
- Use this tool responsibly and at your own risk
- Consider using Google Places API for production applications
- Ensure compliance with data privacy regulations (GDPR, CCPA, etc.)
- Do not use extracted data for unauthorized purposes

### Performance Considerations

- **Extraction Time**: 30-60 seconds or more per extraction
- **Browser Usage**: Puppeteer launches headless Chrome (resource-intensive)
- **Concurrent Extractions**: Not supported (sequential processing)
- **Production Recommendation**: Implement job queue (Bull, BullMQ) for background processing

### Rate Limiting

- Default: 100 extractions per day per user
- Automatic quota reset every 24 hours
- Configurable per user in database
- Prevents API abuse and controls costs

---

## Security Features

1. **Password Hashing**: bcrypt with salt rounds
2. **JWT Tokens**: Secure authentication
3. **Protected Routes**: All extraction endpoints require authentication
4. **Input Validation**: class-validator for DTO validation
5. **CORS**: Configured for frontend origin
6. **Rate Limiting**: Throttler module prevents abuse

---

## Future Enhancements

- [ ] Background job processing with Bull Queue
- [ ] Email notifications for completed extractions
- [ ] Advanced filtering and search capabilities
- [ ] Bulk keyword processing
- [ ] Data deduplication across multiple extractions
- [ ] Integration with Google Places API as alternative
- [ ] Export to Excel (XLSX) format
- [ ] User roles and permissions
- [ ] Admin dashboard
- [ ] Docker containerization
- [ ] CI/CD pipeline
- [ ] Comprehensive test coverage

---

## Troubleshooting

### Puppeteer Installation Issues
```bash
npm install puppeteer --legacy-peer-deps
```

### MongoDB Connection Issues
Ensure MongoDB is running:
```bash
mongod --dbpath /path/to/data
```

### Port Already in Use
Change ports in `.env` files

### CORS Errors
Verify `CORS_ORIGIN` in backend `.env` matches frontend URL

---

## File Checklist

### Backend Files ✅
- [x] `package.json`
- [x] `tsconfig.json`
- [x] `nest-cli.json`
- [x] `.env.example`
- [x] `src/main.ts`
- [x] `src/app.module.ts`
- [x] `src/auth/*` (controller, service, module, dto, strategies)
- [x] `src/users/*` (service, module, schemas)
- [x] `src/extraction/*` (controller, service, module, dto, schemas)
- [x] `src/scraper/*` (service, module)
- [x] `src/common/*` (guards, decorators)

### Frontend Files ✅
- [x] `package.json`
- [x] `tsconfig.json`
- [x] `next.config.js`
- [x] `tailwind.config.ts`
- [x] `postcss.config.js`
- [x] `.env.example`
- [x] `src/app/layout.tsx`
- [x] `src/app/page.tsx`
- [x] `src/app/login/page.tsx`
- [x] `src/app/register/page.tsx`
- [x] `src/app/dashboard/page.tsx`
- [x] `src/app/globals.css`
- [x] `src/components/*` (all UI components)
- [x] `src/lib/*` (api, auth utilities)

### Documentation ✅
- [x] `README.md`
- [x] `PROJECT_SUMMARY.md`
- [x] `.gitignore`

---

## Support

For issues, questions, or contributions, please refer to the repository documentation or create an issue.

---

## License

MIT License - Use at your own risk

---

**Project Created:** November 23, 2025
**Status:** Production Ready (with legal disclaimer)
**Maintainer:** Development Team

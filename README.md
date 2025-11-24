# Google Maps Data Extractor Web Application

A full-stack web application for extracting business data from Google Maps based on user-inputted keywords.

## Features

- **User Authentication**: Secure email/password authentication with JWT tokens
- **Smart Data Extraction**: Extract business information including:
  - Category
  - Name
  - Address
  - Phone number
  - Email
  - Website
  - Ratings
  - Reviews
- **Data Filtering**:
  - Skip duplicate records automatically
  - Exclude entries without phone numbers
- **Data Export**: Export extracted data to CSV format
- **Rate Limiting**: Configurable per-user extraction quotas
- **Extraction History**: Track and view past extraction jobs

## Tech Stack

### Frontend
- **Next.js 14+** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Axios** for API calls
- **React Table** for data display

### Backend
- **NestJS**
- **MongoDB** with Mongoose
- **Puppeteer** for web scraping
- **JWT** for authentication
- **Redis** for rate limiting
- **Passport.js** for auth strategy

## Project Structure

```
google-map-extractor-webapp/
├── frontend/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/             # App router pages
│   │   ├── components/      # Reusable components
│   │   ├── lib/             # Utilities and API client
│   │   └── types/           # TypeScript types
│   ├── public/
│   └── package.json
│
├── backend/                  # NestJS backend application
│   ├── src/
│   │   ├── auth/            # Authentication module
│   │   ├── users/           # Users module
│   │   ├── extraction/      # Extraction module
│   │   ├── scraper/         # Google Maps scraper
│   │   └── common/          # Shared utilities
│   └── package.json
│
└── README.md
```

## Installation

### Prerequisites
- Node.js 18+ and npm/yarn
- MongoDB (local or cloud instance)
- Redis (optional, for rate limiting)

### Backend Setup

1. Navigate to backend directory:
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

4. Configure environment variables:
```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/google-maps-extractor
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d
REDIS_HOST=localhost
REDIS_PORT=6379
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=86400000
```

5. Start the backend server:
```bash
npm run start:dev
```

### Frontend Setup

1. Navigate to frontend directory:
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

4. Configure environment variables:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

5. Start the frontend development server:
```bash
npm run dev
```

6. Open browser at `http://localhost:3000`

## Usage

1. **Register**: Create a new account with email and password
2. **Login**: Sign in to access the dashboard
3. **Extract Data**:
   - Enter keywords (e.g., "restaurants in New York")
   - Configure extraction options
   - Click "Extract Data"
4. **View Results**: Data displayed in a table format
5. **Export**: Download results as CSV file
6. **History**: View past extraction jobs

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/profile` - Get user profile

### Extraction
- `POST /extraction/start` - Start new extraction job
- `GET /extraction/history` - Get extraction history
- `GET /extraction/:id` - Get specific extraction results
- `GET /extraction/:id/export` - Export to CSV

### Users
- `GET /users/quota` - Get remaining extraction quota
- `PATCH /users/profile` - Update user profile

## Configuration

### Rate Limiting
Edit user quotas in the backend:
- Default: 100 extractions per day
- Configurable per user in the database

### Scraping Settings
Adjust scraping parameters in `backend/src/scraper/scraper.service.ts`:
- Max results per keyword
- Timeout settings
- Headless browser options

## Important Notes

### Legal & Compliance
⚠️ **Web Scraping Disclaimer**: This application uses web scraping to extract data from Google Maps. Please note:
- Web scraping may violate Google's Terms of Service
- Use this tool responsibly and at your own risk
- Consider using Google Places API for production applications
- Ensure compliance with data privacy regulations (GDPR, CCPA, etc.)
- Do not use extracted data for unauthorized purposes

### Performance
- Extraction time depends on keyword complexity and number of results
- Each extraction may take 30-60 seconds or more
- Consider implementing background job processing for production use

## Troubleshooting

### Puppeteer Installation Issues
If Puppeteer fails to install:
```bash
npm install puppeteer --legacy-peer-deps
```

### MongoDB Connection Issues
Ensure MongoDB is running:
```bash
mongod --dbpath /path/to/data
```

### Port Already in Use
Change ports in `.env` files if default ports are occupied.

## Future Enhancements

- [ ] Background job processing with Bull Queue
- [ ] Email notifications for completed extractions
- [ ] Advanced filtering and search capabilities
- [ ] Data deduplication across multiple extractions
- [ ] Integration with Google Places API as alternative
- [ ] Docker containerization
- [ ] CI/CD pipeline setup

## License

MIT License - Use at your own risk

## Support

For issues and questions, please create an issue in the repository.

# Environment Setup Guide

## Quick Start

### Backend Setup

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Copy the example environment file:

   ```bash
   cp .env.example .env
   ```

3. Update the `.env` file with your configuration:
   - **Required**: Update `JWT_SECRET` with a secure random string
   - **Required**: Update `MONGODB_URI` if using a different MongoDB instance
   - **Optional**: Configure Redis for job queue and caching (recommended for production)
   - **Optional**: Add Sentry DSN for error tracking (recommended for production)

### Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Copy the example environment file:

   ```bash
   cp .env.example .env.local
   ```

3. Update the `.env.local` file:
   - **Required**: Ensure `NEXT_PUBLIC_API_URL` points to your backend API
   - **Optional**: Add Google Analytics ID for tracking
   - **Optional**: Add Sentry DSN for error tracking

## Environment Variables Reference

### Backend Variables

| Variable                  | Required | Default               | Description                                          |
| ------------------------- | -------- | --------------------- | ---------------------------------------------------- |
| `PORT`                    | No       | 3001                  | Server port                                          |
| `NODE_ENV`                | No       | development           | Environment (development/production)                 |
| `MONGODB_URI`             | Yes      | -                     | MongoDB connection string                            |
| `JWT_SECRET`              | Yes      | -                     | Secret key for JWT tokens (use strong random string) |
| `JWT_EXPIRES_IN`          | No       | 7d                    | JWT token expiration time                            |
| `HEADLESS_BROWSER`        | No       | true                  | Run Puppeteer in headless mode                       |
| `MAX_RESULTS_PER_KEYWORD` | No       | 50                    | Maximum results per extraction                       |
| `SCRAPER_TIMEOUT`         | No       | 60000                 | Scraper timeout in milliseconds                      |
| `RATE_LIMIT_MAX_REQUESTS` | No       | 100                   | Max requests per user per day                        |
| `RATE_LIMIT_WINDOW_MS`    | No       | 86400000              | Rate limit window (24 hours)                         |
| `CORS_ORIGIN`             | No       | http://localhost:3000 | Allowed CORS origin                                  |
| `REDIS_HOST`              | No       | localhost             | Redis host (for job queue)                           |
| `REDIS_PORT`              | No       | 6379                  | Redis port                                           |
| `SENTRY_DSN`              | No       | -                     | Sentry DSN for error tracking                        |
| `LOG_LEVEL`               | No       | info                  | Logging level (error/warn/info/debug)                |

### Frontend Variables

| Variable                 | Required | Default     | Description                   |
| ------------------------ | -------- | ----------- | ----------------------------- |
| `NEXT_PUBLIC_API_URL`    | Yes      | -           | Backend API URL               |
| `NEXT_PUBLIC_GA_ID`      | No       | -           | Google Analytics tracking ID  |
| `NEXT_PUBLIC_SENTRY_DSN` | No       | -           | Sentry DSN for error tracking |
| `NEXT_PUBLIC_ENV`        | No       | development | Environment identifier        |

## Security Best Practices

### ⚠️ Important Security Notes

1. **Never commit `.env` files to version control**

   - `.env` files are already in `.gitignore`
   - Only commit `.env.example` files

2. **Generate a strong JWT secret**

   ```bash
   # Generate a random JWT secret
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

3. **Use different secrets for different environments**

   - Development, staging, and production should have different JWT secrets
   - Never use the example values in production

4. **Protect sensitive credentials**
   - Use environment-specific secrets
   - Consider using secret management tools (AWS Secrets Manager, HashiCorp Vault, etc.)

## Production Deployment

### Recommended Production Settings

**Backend `.env`:**

```bash
NODE_ENV=production
HEADLESS_BROWSER=true
JWT_EXPIRES_IN=15m  # Shorter expiration for production
RATE_LIMIT_MAX_REQUESTS=50  # Stricter rate limiting
LOG_LEVEL=warn  # Less verbose logging
```

**Frontend `.env.local`:**

```bash
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
NEXT_PUBLIC_ENV=production
```

### Using Redis (Recommended for Production)

Install Redis:

```bash
# Ubuntu/Debian
sudo apt-get install redis-server

# macOS
brew install redis

# Windows
# Download from https://redis.io/download
```

Enable Redis in `.env`:

```bash
REDIS_HOST=localhost
REDIS_PORT=6379
```

### Error Tracking with Sentry (Recommended for Production)

1. Create a Sentry account at https://sentry.io
2. Create a new project
3. Copy the DSN
4. Add to both backend and frontend `.env` files:

   ```bash
   # Backend
   SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

   # Frontend
   NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
   ```

## Troubleshooting

### Common Issues

**MongoDB Connection Failed:**

- Ensure MongoDB is running: `sudo systemctl status mongod`
- Check connection string format
- Verify network access and firewall rules

**CORS Errors:**

- Ensure `CORS_ORIGIN` matches your frontend URL exactly
- Include protocol (http/https) and port

**JWT Token Issues:**

- Verify `JWT_SECRET` is set and matches across restarts
- Check token expiration time
- Ensure secret is at least 32 characters

**Puppeteer Issues:**

- Install required dependencies (Linux):
  ```bash
  sudo apt-get install -y chromium-browser
  ```
- Set `HEADLESS_BROWSER=false` for debugging

## Environment File Locations

```
google-map-extractor-webapp/
├── backend/
│   ├── .env.example          ← Template (committed to git)
│   └── .env                  ← Your config (NOT committed)
└── frontend/
    ├── .env.example          ← Template (committed to git)
    └── .env.local            ← Your config (NOT committed)
```

## Next Steps

After setting up your environment:

1. Install dependencies:

   ```bash
   # Backend
   cd backend && npm install

   # Frontend
   cd frontend && npm install
   ```

2. Start the development servers:

   ```bash
   # Backend (in backend directory)
   npm run start:dev

   # Frontend (in frontend directory)
   npm run dev
   ```

3. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001/api

## Support

For issues or questions:

- Check the main [README.md](../README.md)
- Review [PROJECT_IMPROVEMENT_RECOMMENDATIONS.md](../PROJECT_IMPROVEMENT_RECOMMENDATIONS.md)
- Create an issue on GitHub

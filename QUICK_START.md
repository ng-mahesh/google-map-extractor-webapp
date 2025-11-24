# Quick Start Guide

Get the Google Maps Data Extractor up and running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- MongoDB installed and running
- Terminal/Command Prompt

## Step 1: Install Dependencies

### Backend
```bash
cd backend
npm install
```

### Frontend
```bash
cd frontend
npm install
```

## Step 2: Configure Environment Variables

### Backend (.env)
Create `backend/.env`:
```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/google-maps-extractor
JWT_SECRET=change-this-to-a-random-secret-string
JWT_EXPIRES_IN=7d
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=86400000
CORS_ORIGIN=http://localhost:3000
```

### Frontend (.env.local)
Create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## Step 3: Start MongoDB

```bash
# Windows
mongod

# Mac/Linux
sudo mongod
```

## Step 4: Start Applications

### Terminal 1 - Backend
```bash
cd backend
npm run start:dev
```

Wait for: `🚀 Backend server is running on: http://localhost:3001/api`

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

Wait for: `Ready on http://localhost:3000`

## Step 5: Use the Application

1. Open browser: `http://localhost:3000`
2. Click "Register here" to create an account
3. Fill in your details and register
4. You'll be redirected to the dashboard
5. Enter a keyword like "coffee shops in London"
6. Click "Start Extraction"
7. Wait 30-60 seconds for results
8. View and export your data!

## Troubleshooting

### MongoDB Connection Failed
- Make sure MongoDB is running
- Check `MONGODB_URI` in `backend/.env`

### Port Already in Use
- Change `PORT=3001` to another port in `backend/.env`
- Update `NEXT_PUBLIC_API_URL` in `frontend/.env.local` accordingly

### Puppeteer Installation Failed
```bash
cd backend
npm install puppeteer --legacy-peer-deps
```

### CORS Error
- Verify `CORS_ORIGIN` in `backend/.env` matches your frontend URL

## Default User Quota

- **Daily Extractions**: 100 per day
- **Resets**: Automatically every 24 hours
- **Configurable**: Update in MongoDB users collection

## Example Keywords to Try

- "restaurants in New York"
- "coffee shops in London"
- "dentists in Los Angeles"
- "hotels in Paris"
- "gyms near me"
- "plumbers in Chicago"

## Need Help?

Check the full `README.md` or `PROJECT_SUMMARY.md` for detailed documentation.

---

Happy extracting! 🚀

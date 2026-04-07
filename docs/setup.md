# Setup Guide

## Local Environment

### Prerequisites
- Node.js >= 18
- PostgreSQL >= 14
- npm

### Installation
1. Clone this repository or download the source.
2. In the `blindbox-app` root directory, install dependencies:
   ```bash
   npm install
   ```

### Backend (`app/`) Setup
1. Duplicate `.env.example` to `.env` based on standard configurations:
   ```bash
   cp .env.example .env
   ```
2. Set up the Prisma Database:
   ```bash
   cd app
   npx prisma generate
   npx prisma db push
   ```
3. Start the backend developer server:
   ```bash
   npm run dev
   ```

### Frontend (`web/`) Setup
1. Provide `.env` using `.env.example`. Make sure `VITE_API_BASE_URL` points to the backend (e.g. `http://localhost:3000`).
2. Run backend dev server.
3. In another terminal, start the frontend developer server (Vite):
   ```bash
   cd web
   npm run dev
   ```

## Production Deployment
(To be added for staging/prod environments)

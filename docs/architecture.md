# Architecture

## Overview
This application powers Blind Box products for a SHOPLINE store. It consists of:
- **Backend (`app/`)**: Node.js + Fastify + Prisma + PostgreSQL schema running as a REST API. It handles authentication, database CRUD for blind-boxes, webhook processing (idempotent), and the probability-based assignment system.
- **Frontend Admin (`web/`)**: React + Vite admin dashboard designed to be opened within the SHOPLINE Admin portal for merchants.

## Database (PostgreSQL)
We chose PostgreSQL to provide Row-Level Locking and ACID compliance when allocating blind box inventory during high-concurrency peak drops. This eliminates the chance of overselling a specific item pool.

## Application Structure (Monorepo)
```
blindbox-app/
├── app/                  # Fastify backend
│   ├── src/
│   │   ├── config/       # Env + setup
│   │   ├── modules/      # Feature modules
│   │   ├── core/         # Shared utilities (errors, plugins)
│   ├── prisma/           # Schema & migrations
├── web/                  # React dashboard
│   ├── src/
│   │   ├── features/     # Feature components & API slices
│   │   ├── components/   # Shared UI components
│   │   ├── pages/        # Route components
```

## Security & Reliability
- Request input validation using `zod`.
- Idempotency built around SHOPLINE webhook event tracking.

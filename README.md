# Crypto Email Notification App

## Overview
This repository now includes production-oriented monitoring and operational features:

- Error tracking with Sentry
- Structured logging with Winston
- Email audit logging to SQLite
- Retry backoff for transient email failures
- Health and readiness endpoints
- OpenAPI documentation endpoint
- Jest test infrastructure
- Docker support

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Test

```bash
npm test
```

## Health checks

- `/api/health`
- `/api/ready`
- `/api/docs`

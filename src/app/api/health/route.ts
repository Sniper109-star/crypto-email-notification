import { NextRequest, NextResponse } from 'next/server';
import logger from '@/lib/logger';

export async function GET() {
  const status = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION || '1.1.0',
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    services: {
      resend: Boolean(process.env.RESEND_API_KEY),
      database: true,
      sentry: Boolean(process.env.SENTRY_DSN),
    },
  };

  logger.info('Health check successful', status);
  return NextResponse.json(status, { status: 200 });
}

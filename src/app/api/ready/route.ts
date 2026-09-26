import { NextResponse } from 'next/server';
import logger from '@/lib/logger';

export async function GET() {
  const readiness = {
    status: 'ready',
    timestamp: new Date().toISOString(),
    checks: {
      resend_api_key: Boolean(process.env.RESEND_API_KEY),
      resend_from_email: Boolean(process.env.RESEND_FROM_EMAIL),
      database: true,
      sentry: Boolean(process.env.SENTRY_DSN),
    },
  };

  const hasRequiredEnv = readiness.checks.resend_api_key && readiness.checks.resend_from_email;
  if (!hasRequiredEnv) {
    readiness.status = 'not_ready';
  }

  logger.info('Readiness check completed', readiness);
  return NextResponse.json(readiness, { status: hasRequiredEnv ? 200 : 503 });
}

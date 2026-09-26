import { NextResponse } from 'next/server';

export const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Crypto Email Notification API',
    version: '1.1.0',
    description: 'API documentation for crypto transaction email notifications',
  },
  paths: {
    '/api/send': {
      post: {
        summary: 'Send a crypto transaction email',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'amount', 'cryptoType', 'network', 'receiverEmail', 'referenceId'],
                properties: {
                  name: { type: 'string' },
                  amount: { type: 'string' },
                  cryptoType: { type: 'string', enum: ['BTC', 'ETH', 'USDT', 'SOL'] },
                  network: { type: 'string', enum: ['Bitcoin', 'Ethereum', 'Solana', 'Polygon'] },
                  receiverEmail: { type: 'string', format: 'email' },
                  referenceId: { type: 'string' },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Email sent successfully' },
          400: { description: 'Validation error' },
          429: { description: 'Rate limited' },
          500: { description: 'Internal error' },
        },
      },
    },
    '/api/health': {
      get: {
        summary: 'Application health status',
        responses: {
          200: { description: 'Healthy service' },
        },
      },
    },
    '/api/ready': {
      get: {
        summary: 'Readiness and dependency checks',
        responses: {
          200: { description: 'Ready' },
          503: { description: 'Not ready' },
        },
      },
    },
  },
};

export async function GET() {
  return NextResponse.json(openApiSpec, { status: 200 });
}

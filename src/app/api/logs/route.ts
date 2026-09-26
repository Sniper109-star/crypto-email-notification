import { NextResponse } from 'next/server';
import { getAllEmailLogs, getFailedEmailLogs } from '@/lib/database';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const filter = searchParams.get('filter') || 'all';
  const limit = Math.min(Number(searchParams.get('limit') || '50'), 500);

  const logs = filter === 'failed' ? getFailedEmailLogs(limit) : getAllEmailLogs(limit);

  return NextResponse.json(
    {
      success: true,
      data: logs,
      count: logs.length,
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}

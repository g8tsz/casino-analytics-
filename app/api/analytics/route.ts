import { NextResponse } from 'next/server';
import { getAnalyticsSummary } from '@/lib/dataSource';

export async function GET() {
  try {
    const summary = await getAnalyticsSummary();
    return NextResponse.json(summary);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to load analytics' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { getWinLoss } from '@/lib/dataSource';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get('limit') || '100', 10), 500);
  try {
    const records = await getWinLoss(limit);
    return NextResponse.json(records);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to load win/loss data' }, { status: 500 });
  }
}

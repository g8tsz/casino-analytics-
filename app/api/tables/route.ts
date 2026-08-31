import { NextResponse } from 'next/server';
import { getTableSummaries } from '@/lib/dataSource';

export async function GET() {
  try {
    const tables = await getTableSummaries();
    return NextResponse.json(tables);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to load table data' }, { status: 500 });
  }
}

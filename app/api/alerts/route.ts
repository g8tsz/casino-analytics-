import { NextResponse } from 'next/server';
import { getAlerts } from '@/lib/dataSource';

export async function GET() {
  try {
    const alerts = await getAlerts();
    return NextResponse.json(alerts);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to load alerts' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const db = getDb();
    const { searchParams } = req.nextUrl;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const offset = (page - 1) * limit;

    // Total count for pagination
    const total = db.prepare('SELECT COUNT(*) as count FROM consumers').get().count;

    // Fetch only current page rows
    const consumers = db
      .prepare('SELECT * FROM consumers ORDER BY created_at DESC LIMIT ? OFFSET ?')
      .all(limit, offset);

    return NextResponse.json({ consumers, total });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

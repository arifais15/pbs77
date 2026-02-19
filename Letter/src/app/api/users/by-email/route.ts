import { getDb } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return Response.json({ error: 'Email is required' }, { status: 400 });
    }

    const db = getDb();
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    const user = stmt.get(email);

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    return Response.json(user);
  } catch (error: any) {
    console.error('Database error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

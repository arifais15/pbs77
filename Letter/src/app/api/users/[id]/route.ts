import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(params.id);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const db = getDb();

    // Build dynamic update query
    const updates: string[] = [];
    const values: any[] = [];

    if (body.email !== undefined) {
      updates.push('email = ?');
      values.push(body.email);
    }
    if (body.role !== undefined) {
      updates.push('role = ?');
      values.push(body.role);
    }
    if (body.status !== undefined) {
      updates.push('status = ?');
      values.push(body.status);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    values.push(params.id);
    const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
    
    db.prepare(query).run(...values);

    const updated = db.prepare('SELECT * FROM users WHERE id = ?').get(params.id);
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = getDb();
    db.prepare('DELETE FROM users WHERE id = ?').run(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}

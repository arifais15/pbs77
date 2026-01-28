import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { normalizeToEnglish, toBanglaNumeral } from '@/lib/numeral-converter';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ accNo: string }> }
) {
  try {
    const { accNo } = await params;
    const db = getDb();
    // Normalize the accNo to English numerals for database lookup
    const normalizedAccNo = normalizeToEnglish(accNo);
    const consumer = db.prepare('SELECT * FROM consumers WHERE accNo = ?').get(normalizedAccNo);
    
    if (!consumer) {
      return NextResponse.json({ error: 'Consumer not found' }, { status: 404 });
    }

    // Convert accNo to Bangla numerals for display
    const consumerWithBangla = {
      ...consumer,
      accNo: toBanglaNumeral((consumer as any).accNo),
    };

    return NextResponse.json(consumerWithBangla);
  } catch (error) {
    console.error('Error fetching consumer:', error);
    return NextResponse.json({ error: 'Failed to fetch consumer' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ accNo: string }> }
) {
  try {
    const { accNo } = await params;
    const body = await req.json();
    const db = getDb();
    
    // Normalize the accNo for database lookup
    const normalizedAccNo = normalizeToEnglish(accNo);

    const updates: string[] = [];
    const values: any[] = [];

    if (body.name !== undefined) {
      updates.push('name = ?');
      values.push(body.name);
    }
    if (body.guardian !== undefined) {
      updates.push('guardian = ?');
      values.push(body.guardian);
    }
    if (body.meterNo !== undefined) {
      updates.push('meterNo = ?');
      values.push(body.meterNo);
    }
    if (body.mobile !== undefined) {
      updates.push('mobile = ?');
      values.push(body.mobile);
    }
    if (body.address !== undefined) {
      updates.push('address = ?');
      values.push(body.address);
    }
    if (body.tarrif !== undefined) {
      updates.push('tarrif = ?');
      values.push(body.tarrif);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    values.push(normalizedAccNo);
    const query = `UPDATE consumers SET ${updates.join(', ')} WHERE accNo = ?`;
    
    db.prepare(query).run(...values);

    const updated = db.prepare('SELECT * FROM consumers WHERE accNo = ?').get(normalizedAccNo) as any;
    
    // Convert accNo to Bangla numerals for display
    const updatedWithBangla = {
      ...updated,
      accNo: toBanglaNumeral(updated.accNo),
    };

    return NextResponse.json(updatedWithBangla);
  } catch (error) {
    console.error('Error updating consumer:', error);
    return NextResponse.json({ error: 'Failed to update consumer' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { accNo: string } }
) {
  try {
    const { accNo } = await params;
    const db = getDb();
    // Normalize the accNo for database lookup
    const normalizedAccNo = normalizeToEnglish(accNo);
    db.prepare('DELETE FROM consumers WHERE accNo = ?').run(normalizedAccNo);
    return NextResponse.json({ success: true, message: 'Consumer deleted successfully' });
  } catch (error) {
    console.error('Error deleting consumer:', error);
    return NextResponse.json({ error: 'Failed to delete consumer' }, { status: 500 });
  }
}

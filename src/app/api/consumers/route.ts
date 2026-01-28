import { NextRequest, NextResponse } from 'next/server';
import { getDb, initializeDatabase } from '@/lib/db';
import { toBanglaNumeral } from '@/lib/numeral-converter';

initializeDatabase();

export async function GET(req: NextRequest) {
  try {
    const db = getDb();
    const consumers = db.prepare('SELECT * FROM consumers ORDER BY created_at DESC').all();
    
    // Convert accNo to Bangla numerals for display
    const consumersWithBangla = consumers.map((consumer: any) => ({
      ...consumer,
      accNo: toBanglaNumeral(consumer.accNo),
    }));
    
    return NextResponse.json(consumersWithBangla);
  } catch (error) {
    console.error('Error fetching consumers:', error);
    return NextResponse.json({ error: 'Failed to fetch consumers' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, accNo, name, guardian, meterNo, mobile, address, tarrif } = body;

    if (!accNo || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const db = getDb();
    db.prepare(
      'INSERT INTO consumers (id, accNo, name, guardian, meterNo, mobile, address, tarrif) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(id, accNo, name, guardian, meterNo, mobile, address, tarrif);

    return NextResponse.json({ id, accNo: toBanglaNumeral(accNo), name, guardian, meterNo, mobile, address, tarrif }, { status: 201 });
  } catch (error) {
    console.error('Error creating consumer:', error);
    return NextResponse.json({ error: 'Failed to create consumer' }, { status: 500 });
  }
}

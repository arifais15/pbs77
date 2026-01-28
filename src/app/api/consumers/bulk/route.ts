import { NextRequest, NextResponse } from 'next/server';
import { getDb, initializeDatabase } from '@/lib/db';
import { normalizeToEnglish } from '@/lib/numeral-converter';
import { v4 as uuidv4 } from 'uuid';

initializeDatabase();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { consumers } = body;

    console.log('Bulk import received:', consumers.length, 'records');
    console.log('Sample consumer:', consumers[0]);

    if (!Array.isArray(consumers) || consumers.length === 0) {
      return NextResponse.json(
        { error: 'consumers array is required and must not be empty' },
        { status: 400 }
      );
    }

    const db = getDb();
    const inserted: any[] = [];
    const errors: any[] = [];

    consumers.forEach((consumer, index) => {
      try {
        let { accNo, name, guardian, meterNo, mobile, address, tarrif } = consumer;

        if (!accNo || !name) {
          errors.push({ index, error: 'Missing required fields: accNo, name', received: { accNo, name } });
          return;
        }

        // Normalize all numeral fields to English
        accNo = normalizeToEnglish(accNo);
        meterNo = normalizeToEnglish(meterNo || '');
        mobile = normalizeToEnglish(mobile || '');

        const id = uuidv4();
        db.prepare(
          `INSERT INTO consumers (id, accNo, name, guardian, meterNo, mobile, address, tarrif) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
        ).run(id, accNo, name, guardian || '', meterNo, mobile, address || '', tarrif || '');

        inserted.push({ id, accNo, name });
      } catch (error: any) {
        errors.push({
          index,
          accNo: consumer.accNo,
          error: error.message || 'Failed to insert',
        });
      }
    });

    console.log('Bulk import result - Inserted:', inserted.length, 'Failed:', errors.length);

    return NextResponse.json({
      success: true,
      inserted: inserted.length,
      failed: errors.length,
      details: {
        insertedConsumers: inserted,
        errors: errors.length > 0 ? errors : undefined,
      },
    });
  } catch (error) {
    console.error('Error in bulk import:', error);
    return NextResponse.json(
      { error: 'Failed to process bulk import' },
      { status: 500 }
    );
  }
}

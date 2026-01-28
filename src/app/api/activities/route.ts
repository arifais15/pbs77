import { NextRequest, NextResponse } from 'next/server';
import { getDb, initializeDatabase } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

initializeDatabase();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const createdBy = searchParams.get('createdBy');
    const date = searchParams.get('date');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 100;

    const db = getDb();
    let query = 'SELECT * FROM letter_activities WHERE 1=1';
    const params: any[] = [];

    if (createdBy) {
      query += ' AND createdBy = ?';
      params.push(createdBy);
    }

    if (date) {
      query += ' AND date = ?';
      params.push(date);
    }

    query += ` ORDER BY created_at DESC LIMIT ${limit}`;

    const activities = db.prepare(query).all(...params);
    return NextResponse.json(activities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      accountNumber,
      consumerName,
      subject,
      createdBy,
      date,
      letterType,
      formData,
    } = body;

    if (!accountNumber || !consumerName || !subject || !createdBy || !date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const db = getDb();
    const id = uuidv4();

    db.prepare(
      `INSERT INTO letter_activities 
       (id, accountNumber, consumerName, subject, createdBy, date, letterType, formData) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      id,
      accountNumber,
      consumerName,
      subject,
      createdBy,
      date,
      letterType,
      formData ? JSON.stringify(formData) : null
    );

    return NextResponse.json({
      id,
      accountNumber,
      consumerName,
      subject,
      createdBy,
      date,
      letterType,
      formData,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating activity:', error);
    return NextResponse.json({ error: 'Failed to create activity' }, { status: 500 });
  }
}

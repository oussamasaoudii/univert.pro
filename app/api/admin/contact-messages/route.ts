import { NextResponse, NextRequest } from 'next/server';
import { getMySQLPool } from '@/lib/mysql/pool';

export async function GET(req: NextRequest) {
  try {
    const pool = getMySQLPool();
    const [messages] = await pool.query(
      `SELECT id, name, email, inquiry_type, message, status, created_at, admin_reply, admin_replied_at 
       FROM contact_messages 
       ORDER BY created_at DESC 
       LIMIT 1000`
    );

    return NextResponse.json({
      success: true,
      messages: messages || [],
    });
  } catch (error) {
    console.error('Error fetching contact messages:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch messages',
      },
      { status: 500 }
    );
  }
}

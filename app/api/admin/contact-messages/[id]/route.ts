import { NextResponse, NextRequest } from 'next/server';
import { getMySQLPool } from '@/lib/mysql/pool';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();

    const pool = getMySQLPool();

    // Update message status
    await pool.query(
      `UPDATE contact_messages SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [body.status, id]
    );

    // Fetch updated message
    const [messages] = await pool.query(
      `SELECT id, name, email, inquiry_type, message, status, created_at 
       FROM contact_messages WHERE id = ?`,
      [id]
    );

    return NextResponse.json({
      success: true,
      message: messages?.[0] || null,
    });
  } catch (error) {
    console.error('Error updating contact message:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update message',
      },
      { status: 500 }
    );
  }
}

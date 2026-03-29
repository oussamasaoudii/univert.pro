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

    const updates = [];
    const values = [];

    if (body.status) {
      updates.push('status = ?');
      values.push(body.status);
    }

    if (body.admin_reply !== undefined) {
      updates.push('admin_reply = ?');
      updates.push('admin_replied_at = CURRENT_TIMESTAMP');
      values.push(body.admin_reply);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'no_updates' }, { status: 400 });
    }

    values.push(id);

    await pool.query(
      `UPDATE contact_messages SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );

    // Fetch updated message
    const [messages] = await pool.query(
      `SELECT id, name, email, inquiry_type, message, status, created_at, admin_reply, admin_replied_at 
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

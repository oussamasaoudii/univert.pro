import { NextResponse } from 'next/server';
import { getAuthenticatedRequestUser } from '@/lib/api-auth';
import {
  assertTrustedOrigin,
  enforceRouteRateLimit,
  getRequestIp,
  parseJsonBody,
  toApiErrorResponse,
} from '@/lib/security/request';
import { db } from '@/lib/db';
import { z } from 'zod';

const updateMessageSchema = z
  .object({
    status: z.enum(['received', 'in_review', 'responded']).optional(),
    notes: z.string().max(5000).optional(),
  })
  .strict();

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedRequestUser();
    if (!user || user.source === 'local_admin_fallback' || user.sessionType !== 'user') {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    await enforceRouteRateLimit({
      scope: 'contact-messages-update',
      key: `${user.id}:${getRequestIp(request)}`,
      limit: 30,
      windowMs: 10 * 60 * 1000,
      blockDurationMs: 15 * 60 * 1000,
    });

    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'invalid_id' }, { status: 400 });
    }

    const body = await parseJsonBody(request, updateMessageSchema, { maxBytes: 8 * 1024 });

    const updates: string[] = [];
    const values: unknown[] = [];

    if (body.status) {
      updates.push('status = ?');
      values.push(body.status);
    }

    if (body.notes !== undefined) {
      updates.push('notes = ?');
      values.push(body.notes || null);
    }

    if (body.status === 'responded') {
      updates.push('responded_at = CURRENT_TIMESTAMP');
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'no_updates' }, { status: 400 });
    }

    values.push(id);

    await db.query(
      `UPDATE contact_messages SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );

    const [messages] = await db.query(
      'SELECT id, name, email, inquiry_type, message, status, created_at FROM contact_messages WHERE id = ?',
      [id]
    );

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 });
    }

    return NextResponse.json({ message: messages[0] }, { status: 200 });
  } catch (error) {
    console.error('[v0] Contact message update error:', error);
    return toApiErrorResponse(error, { action: 'contact.messages.update' });
  }
}

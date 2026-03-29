import { z } from 'zod';
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

export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedRequestUser();
    if (!user || user.source === 'local_admin_fallback' || user.sessionType !== 'user') {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    await enforceRouteRateLimit({
      scope: 'contact-messages-read',
      key: `${user.id}:${getRequestIp(request)}`,
      limit: 60,
      windowMs: 10 * 60 * 1000,
      blockDurationMs: 15 * 60 * 1000,
    });

    const [messages] = await db.query(
      `SELECT id, name, email, inquiry_type, message, status, created_at 
       FROM contact_messages 
       ORDER BY created_at DESC 
       LIMIT 1000`
    );

    return NextResponse.json({ messages }, { status: 200 });
  } catch (error) {
    console.error('[v0] Contact messages read error:', error);
    return toApiErrorResponse(error, { action: 'contact.messages.read' });
  }
}

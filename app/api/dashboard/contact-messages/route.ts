import { NextResponse } from 'next/server';
import { getAuthenticatedRequestUser } from '@/lib/api-auth';
import {
  enforceRouteRateLimit,
  getRequestIp,
  toApiErrorResponse,
} from '@/lib/security/request';
import { getMySQLPool } from '@/lib/mysql/pool';
import { isPreviewMode } from '@/lib/preview-mode';

export async function GET(request: Request) {
  try {
    if (isPreviewMode()) {
      return NextResponse.json({ messages: [] }, { status: 200 });
    }

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

    const pool = getMySQLPool();
    const [messages] = await pool.query(
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

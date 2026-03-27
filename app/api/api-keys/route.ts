import { NextResponse, NextRequest } from 'next/server';
import { getAuthenticatedRequestUser } from '@/lib/api-auth';
import { createAPIKey } from '@/lib/api-keys/db';
import { getMySQLPool } from '@/lib/mysql/pool';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedRequestUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const pool = getMySQLPool();
    const [rows] = await pool.query<any[]>(
      `SELECT id, user_id, name, key_prefix, scopes, rate_limit, last_used_at, expires_at, is_active, created_at
       FROM api_keys WHERE user_id = ? ORDER BY created_at DESC`,
      [user.id]
    );

    return NextResponse.json({ apiKeys: rows });
  } catch (error) {
    console.error('Error fetching API keys:', error);
    return NextResponse.json({ error: 'Failed to fetch API keys' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedRequestUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { name, scopes, expiresAt } = body;

    const expiresDate = expiresAt ? new Date(expiresAt) : null;
    const { key, apiKey } = await createAPIKey(user.id, name, scopes || [], expiresDate);

    return NextResponse.json({ key, apiKey }, { status: 201 });
  } catch (error) {
    console.error('Error creating API key:', error);
    return NextResponse.json({ error: 'Failed to create API key' }, { status: 500 });
  }
}

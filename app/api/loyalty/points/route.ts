import { NextResponse, NextRequest } from 'next/server';
import { getAuthenticatedRequestUser } from '@/lib/api-auth';
import { getUserPoints } from '@/lib/loyalty/db';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedRequestUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const points = await getUserPoints(user.id);
    if (!points) {
      return NextResponse.json({ 
        id: '', 
        user_id: user.id, 
        total_points: 0, 
        available_points: 0, 
        tier: 'bronze',
        lifetime_points: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({ points });
  } catch (error) {
    console.error('Error fetching loyalty points:', error);
    return NextResponse.json({ error: 'Failed to fetch points' }, { status: 500 });
  }
}

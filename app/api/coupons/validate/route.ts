import { NextResponse, NextRequest } from 'next/server';
import { getAuthenticatedRequestUser } from '@/lib/api-auth';
import { validateCoupon } from '@/lib/coupons/db';

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedRequestUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { code, amount } = body;

    if (!code || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const result = await validateCoupon(code, user.id, amount);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error validating coupon:', error);
    return NextResponse.json({ error: 'Failed to validate coupon' }, { status: 500 });
  }
}

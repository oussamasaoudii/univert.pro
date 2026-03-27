import { getMySQLPool } from '@/lib/mysql/pool';

export interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  max_uses: number | null;
  current_uses: number;
  usage_per_user: number;
  applicable_plans: string[] | null;
  min_amount: number | null;
  max_amount: number | null;
  valid_from: string | null;
  valid_until: string | null;
  is_active: boolean;
  created_at: string;
}

export async function validateCoupon(code: string, userId: string, amount: number): Promise<{ valid: boolean; discount: number; message: string }> {
  const pool = getMySQLPool();
  
  const [rows] = await pool.query<any[]>(
    `SELECT * FROM coupons WHERE code = ? AND is_active = TRUE`,
    [code]
  );
  
  if (rows.length === 0) {
    return { valid: false, discount: 0, message: 'Coupon not found' };
  }
  
  const coupon = rows[0];
  
  if (coupon.max_uses && coupon.current_uses >= coupon.max_uses) {
    return { valid: false, discount: 0, message: 'Coupon usage limit reached' };
  }
  
  if (coupon.valid_from && new Date(coupon.valid_from) > new Date()) {
    return { valid: false, discount: 0, message: 'Coupon not yet valid' };
  }
  
  if (coupon.valid_until && new Date(coupon.valid_until) < new Date()) {
    return { valid: false, discount: 0, message: 'Coupon has expired' };
  }
  
  if (coupon.min_amount && amount < coupon.min_amount) {
    return { valid: false, discount: 0, message: `Minimum amount ${coupon.min_amount} required` };
  }
  
  if (coupon.max_amount && amount > coupon.max_amount) {
    return { valid: false, discount: 0, message: `Maximum amount ${coupon.max_amount} allowed` };
  }
  
  // Check user usage limit
  const [userUsage] = await pool.query<any[]>(
    `SELECT COUNT(*) as count FROM coupon_usage WHERE coupon_id = ? AND user_id = ?`,
    [coupon.id, userId]
  );
  
  if (userUsage[0].count >= coupon.usage_per_user) {
    return { valid: false, discount: 0, message: 'You have already used this coupon' };
  }
  
  let discount = 0;
  if (coupon.discount_type === 'percentage') {
    discount = (amount * coupon.discount_value) / 100;
  } else {
    discount = coupon.discount_value;
  }
  
  return { valid: true, discount, message: 'Coupon valid' };
}

export async function applyCoupon(couponId: string, userId: string, subscriptionId: string, discountAmount: number): Promise<void> {
  const pool = getMySQLPool();
  
  await pool.query(
    `INSERT INTO coupon_usage (coupon_id, user_id, subscription_id, discount_amount)
     VALUES (?, ?, ?, ?)`,
    [couponId, userId, subscriptionId, discountAmount]
  );
  
  await pool.query(
    `UPDATE coupons SET current_uses = current_uses + 1 WHERE id = ?`,
    [couponId]
  );
}

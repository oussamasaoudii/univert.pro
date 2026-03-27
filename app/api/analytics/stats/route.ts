import { NextResponse, NextRequest } from 'next/server';
import { getAuthenticatedRequestUser } from '@/lib/api-auth';
import { getMySQLPool } from '@/lib/mysql/pool';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedRequestUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const websiteId = searchParams.get('websiteId');
    const days = parseInt(searchParams.get('days') || '30');

    const pool = getMySQLPool();
    const [stats] = await pool.query<any[]>(
      `SELECT * FROM analytics_daily_stats 
       WHERE website_id = ? AND date >= DATE_SUB(NOW(), INTERVAL ? DAY)
       ORDER BY date DESC`,
      [websiteId, days]
    );

    const totals = {
      totalPageViews: stats.reduce((sum, s) => sum + s.page_views, 0),
      totalSessions: stats.reduce((sum, s) => sum + s.sessions, 0),
      totalUniqueVisitors: stats.reduce((sum, s) => sum + s.unique_visitors, 0),
      avgBounceRate: stats.length > 0 ? (stats.reduce((sum, s) => sum + (s.bounce_rate || 0), 0) / stats.length) : 0,
    };

    return NextResponse.json({ stats, totals });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}

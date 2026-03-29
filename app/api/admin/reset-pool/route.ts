import { NextResponse } from 'next/server';
import { resetMySQLPool } from '@/lib/mysql/pool';

export async function POST() {
  try {
    // Reset the connection pool to force reconnection
    // This is useful after schema changes to refresh cached metadata
    await resetMySQLPool();
    
    console.log('[v0] MySQL pool reset successfully');
    
    return NextResponse.json({ 
      success: true, 
      message: 'MySQL pool reset successfully. New connections will be created on next query.'
    });
  } catch (error) {
    console.error('[v0] Error resetting pool:', error);
    return NextResponse.json(
      { error: 'Failed to reset pool' },
      { status: 500 }
    );
  }
}

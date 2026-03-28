import { getMySQLPool } from '@/lib/mysql/pool';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { sql, type = 'all' } = await request.json();
    
    if (!sql || typeof sql !== 'string') {
      return NextResponse.json({ error: 'No SQL provided' }, { status: 400 });
    }

    const pool = getMySQLPool();
    
    // Split SQL into individual statements
    let statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    // Filter statements based on type
    if (type === 'tables') {
      statements = statements.filter(s => s.toUpperCase().includes('CREATE TABLE'));
    } else if (type === 'columns') {
      statements = statements.filter(s => s.toUpperCase().includes('ALTER TABLE') && s.toUpperCase().includes('ADD COLUMN'));
    } else if (type === 'indexes') {
      statements = statements.filter(s => s.toUpperCase().includes('CREATE INDEX') || s.toUpperCase().includes('ADD INDEX'));
    }
    
    const results: { statement: string; success: boolean; error?: string }[] = [];
    
    for (const statement of statements) {
      try {
        await pool.execute(statement);
        results.push({ 
          statement: statement.substring(0, 100) + (statement.length > 100 ? '...' : ''), 
          success: true 
        });
      } catch (err: any) {
        // Skip "already exists" errors for idempotent operations
        const errorMessage = err.message || '';
        const isIgnorableError = 
          errorMessage.includes('already exists') ||
          errorMessage.includes('Duplicate column name') ||
          errorMessage.includes('Duplicate key name') ||
          errorMessage.includes('SQLSTATE[42S01]') || // Table already exists
          errorMessage.includes('SQLSTATE[42S21]'); // Column already exists
        
        results.push({ 
          statement: statement.substring(0, 100) + (statement.length > 100 ? '...' : ''), 
          success: isIgnorableError,
          error: isIgnorableError ? 'Already exists (skipped)' : err.message
        });
      }
    }
    
    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;
    
    return NextResponse.json({
      success: failCount === 0,
      message: `Executed ${successCount}/${statements.length} statements successfully`,
      results,
      summary: {
        total: statements.length,
        success: successCount,
        failed: failCount
      }
    });
  } catch (error: any) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to run migration' },
      { status: 500 }
    );
  }
}

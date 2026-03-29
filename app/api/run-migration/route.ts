import { getMySQLPool } from '@/lib/mysql/pool';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { sql, type = 'all' } = await request.json();
    
    if (!sql || typeof sql !== 'string') {
      return NextResponse.json({ error: 'No SQL provided' }, { status: 400 });
    }

    const pool = getMySQLPool();
    
    // Split SQL into individual statements by double newlines (how inspect-db joins them)
    // Each statement from generateMigrationSQL includes a comment header like "-- Create table: xxx"
    // We need to strip the comment line and keep the actual SQL
    let statements = sql
      .split(/\n\n+/)
      .map(s => s.trim())
      .filter(s => s.length > 0)
      .map(s => {
        // Remove comment lines at the start of each statement
        const lines = s.split('\n');
        const nonCommentLines = lines.filter(line => !line.trim().startsWith('--'));
        return nonCommentLines.join('\n').trim();
      })
      .filter(s => s.length > 0);
    
    console.log('[v0] Total statements parsed:', statements.length);
    console.log('[v0] First few statements:', statements.slice(0, 3).map(s => s.substring(0, 80)));
    
    // Filter statements based on type
    if (type === 'tables') {
      statements = statements.filter(s => s.toUpperCase().startsWith('CREATE TABLE'));
      console.log('[v0] Filtered to CREATE TABLE statements:', statements.length);
    } else if (type === 'columns') {
      statements = statements.filter(s => {
        const upper = s.toUpperCase();
        return upper.startsWith('ALTER TABLE') && upper.includes('ADD COLUMN');
      });
      console.log('[v0] Filtered to ADD COLUMN statements:', statements.length);
    } else if (type === 'indexes') {
      statements = statements.filter(s => {
        const upper = s.toUpperCase();
        return upper.startsWith('CREATE INDEX') || (upper.startsWith('ALTER TABLE') && upper.includes('ADD INDEX'));
      });
      console.log('[v0] Filtered to INDEX statements:', statements.length);
    }
    
    const results: { statement: string; success: boolean; error?: string }[] = [];
    
    for (const statement of statements) {
      // Clean up the statement - remove trailing semicolon if present for execute
      const cleanStatement = statement.replace(/;[\s]*$/, '').trim();
      
      if (!cleanStatement) continue;
      
      try {
        console.log('[v0] Executing:', cleanStatement.substring(0, 100) + '...');
        await pool.execute(cleanStatement);
        results.push({ 
          statement: cleanStatement.substring(0, 100) + (cleanStatement.length > 100 ? '...' : ''), 
          success: true 
        });
        console.log('[v0] Success');
      } catch (err: any) {
        console.log('[v0] Error:', err.message);
        // Skip "already exists" errors for idempotent operations
        const errorMessage = err.message || '';
        const isIgnorableError = 
          errorMessage.includes('already exists') ||
          errorMessage.includes('Duplicate column name') ||
          errorMessage.includes('Duplicate key name') ||
          errorMessage.includes('Table') && errorMessage.includes('already exists') ||
          err.code === 'ER_TABLE_EXISTS_ERROR' ||
          err.code === 'ER_DUP_FIELDNAME' ||
          err.code === 'ER_DUP_KEYNAME';
        
        results.push({ 
          statement: cleanStatement.substring(0, 100) + (cleanStatement.length > 100 ? '...' : ''), 
          success: isIgnorableError,
          error: isIgnorableError ? 'Already exists (skipped)' : err.message
        });
      }
    }
    
    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;
    
    return NextResponse.json({
      success: failCount === 0,
      message: `Executed ${successCount}/${results.length} statements successfully`,
      results,
      summary: {
        total: results.length,
        success: successCount,
        failed: failCount
      }
    });
  } catch (error: any) {
    console.error('[v0] Migration error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to run migration' },
      { status: 500 }
    );
  }
}

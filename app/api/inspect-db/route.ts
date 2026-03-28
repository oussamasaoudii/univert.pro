import { getMySQLPool } from '@/lib/mysql/pool';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const pool = getMySQLPool();
    
    if (!pool) {
      return NextResponse.json({ error: 'MySQL not configured' }, { status: 500 });
    }

    // Get all tables
    const [tables] = await pool.query('SHOW TABLES') as any;
    
    if (!tables || tables.length === 0) {
      return NextResponse.json({
        database: process.env.DB_DATABASE || 'unknown',
        totalTables: 0,
        schema: []
      });
    }
    
    const tableKey = Object.keys(tables[0])[0];

    const schema: any[] = [];

    for (const table of tables) {
      const tableName = table[tableKey];
      
      // Get columns for each table
      const [columns] = await pool.query(`DESCRIBE \`${tableName}\``) as any;
      
      // Get row count
      const [countResult] = await pool.query(`SELECT COUNT(*) as count FROM \`${tableName}\``) as any;
      
      schema.push({
        tableName,
        columns: columns.map((col: any) => ({
          field: col.Field,
          type: col.Type,
          nullable: col.Null === 'YES',
          key: col.Key || null,
          default: col.Default,
          extra: col.Extra || null
        })),
        rowCount: countResult[0].count
      });
    }

    return NextResponse.json({
      database: process.env.DB_DATABASE || 'ovmon_db',
      totalTables: tables.length,
      schema
    });
  } catch (error: any) {
    console.error('[v0] Database inspection error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

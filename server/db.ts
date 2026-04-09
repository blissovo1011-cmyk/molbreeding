import pg from 'pg';

const { Pool } = pg;

let pool: pg.Pool | null = null;

export function getPool(): pg.Pool {
  if (pool) return pool;

  const connectionString = process.env.DATABASE_URL || 'postgresql://localhost:5432/molbreeding';

  pool = new Pool({ connectionString });
  return pool;
}

// Helper: run a query and return rows
export async function query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const result = await getPool().query(sql, params);
  return result.rows as T[];
}

// Helper: run a query and return first row or null
export async function queryOne<T = any>(sql: string, params: any[] = []): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows[0] ?? null;
}

// Helper: run a query (INSERT/UPDATE/DELETE) and return row count
export async function execute(sql: string, params: any[] = []): Promise<number> {
  const result = await getPool().query(sql, params);
  return result.rowCount ?? 0;
}

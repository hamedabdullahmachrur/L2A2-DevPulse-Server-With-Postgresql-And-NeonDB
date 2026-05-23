import { pool } from "../db"

export const queryMany = async <T>(
    sql: string,
    params: unknown[] = []
): Promise<T[]> => {
    const result = await pool.query(sql, params.length ? params : []);
    return result.rows as T[];
};
export const queryOne = async <T>( sql: string, params: unknown[]=[] ) : Promise<T | null> =>{
    const result = await pool.query(sql, params);
    return (result.rows[0] ?? null) as T | null
}
export const queryRun = async (sql: string, params: unknown[] = []): Promise<number> => {
  const result = await pool.query(sql, params);
  return result.rowCount ?? 0;
};
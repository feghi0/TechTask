import { Pool, type PoolClient, type QueryResultRow } from "pg";
import { PGlite } from "@electric-sql/pglite";

export interface Database {
  query<T extends QueryResultRow = QueryResultRow>(
    sql: string,
    params?: unknown[],
  ): Promise<{ rows: T[] }>;
  transaction<T>(operation: (database: Database) => Promise<T>): Promise<T>;
  close(): Promise<void>;
}

export async function connectDatabase(options: {
  databaseUrl?: string;
  dataDir?: string;
}): Promise<Database> {
  if (options.databaseUrl) {
    const pool = new Pool({ connectionString: options.databaseUrl, max: 10 });
    const wrap = (client: Pool | PoolClient): Database => ({
      query: (sql, params) => client.query(sql, params),
      transaction: async (operation) => {
        if (client !== pool)
          throw new Error("Nested transactions are not supported.");
        const connection = await pool.connect();
        try {
          await connection.query("BEGIN");
          const result = await operation(wrap(connection));
          await connection.query("COMMIT");
          return result;
        } catch (error) {
          await connection.query("ROLLBACK");
          throw error;
        } finally {
          connection.release();
        }
      },
      close: () => pool.end(),
    });
    await pool.query("SELECT 1");
    return wrap(pool);
  }
  const engine = new PGlite(options.dataDir ?? "data/postgres");
  await engine.waitReady;
  const database: Database = {
    query: (sql, params) => engine.query(sql, params),
    transaction: (operation) =>
      engine.transaction((tx) =>
        operation({
          query: (sql, params) => tx.query(sql, params),
          transaction: async () => {
            throw new Error("Nested transactions are not supported.");
          },
          close: async () => {},
        }),
      ),
    close: () => engine.close(),
  };
  return database;
}

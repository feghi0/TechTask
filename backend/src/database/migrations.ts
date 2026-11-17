import type { Database } from "./db";

const initialSchema = [
  `CREATE TABLE IF NOT EXISTS app_users (
    id UUID PRIMARY KEY, email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT PRIMARY KEY, user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    expires_at TIMESTAMPTZ NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS sessions_expiry ON sessions(expires_at)`,
  `CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY, owner_id UUID NOT NULL REFERENCES app_users(id),
    name TEXT NOT NULL CHECK(char_length(name) BETWEEN 3 AND 80), description TEXT NOT NULL DEFAULT '',
    version INTEGER NOT NULL DEFAULT 1 CHECK(version>0), created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP, deleted_at TIMESTAMPTZ
  )`,
  `CREATE INDEX IF NOT EXISTS projects_owner ON projects(owner_id)`,
  `CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY, project_id UUID NOT NULL REFERENCES projects(id),
    title TEXT NOT NULL CHECK(char_length(title) BETWEEN 3 AND 60), description TEXT NOT NULL DEFAULT '',
    subject TEXT NOT NULL CHECK(char_length(trim(subject)) BETWEEN 1 AND 100),
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','in_progress','blocked','delivered')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK(priority IN ('low','medium','high')),
    is_favorite BOOLEAN NOT NULL DEFAULT FALSE, due_date DATE,
    version INTEGER NOT NULL DEFAULT 1 CHECK(version>0), created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ
  )`,
  `CREATE INDEX IF NOT EXISTS tasks_project_active ON tasks(project_id) WHERE deleted_at IS NULL`,
  `CREATE TABLE IF NOT EXISTS task_dependencies (
    task_id UUID NOT NULL REFERENCES tasks(id), dependency_id UUID NOT NULL REFERENCES tasks(id),
    PRIMARY KEY(task_id,dependency_id), CHECK(task_id<>dependency_id)
  )`,
  `CREATE INDEX IF NOT EXISTS dependencies_reverse ON task_dependencies(dependency_id)`,
  `CREATE TABLE IF NOT EXISTS task_history (
    id UUID PRIMARY KEY, task_id UUID NOT NULL REFERENCES tasks(id),
    from_status TEXT NOT NULL CHECK(from_status IN ('pending','in_progress','blocked','delivered')),
    to_status TEXT NOT NULL CHECK(to_status IN ('pending','in_progress','blocked','delivered')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE INDEX IF NOT EXISTS history_task_date ON task_history(task_id,created_at)`,
];

export async function migrate(database: Database): Promise<void> {
  await database.transaction(async (db) => {
    await db.query("SELECT pg_advisory_xact_lock(723416)");
    await db.query(
      "CREATE TABLE IF NOT EXISTS schema_migrations (version INTEGER PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP)",
    );
    const existing = await db.query(
      "SELECT version FROM schema_migrations WHERE version=1",
    );
    if (existing.rows.length) return;
    for (const statement of initialSchema) await db.query(statement);
    await db.query("INSERT INTO schema_migrations(version) VALUES (1)");
  });
}

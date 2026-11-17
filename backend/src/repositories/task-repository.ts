import type {
  History,
  Project,
  Task,
  TaskStatus,
  User,
} from "../../../shared/contracts";
import { AppError } from "../middleware/errors";
import type { Database } from "../database/db";
import { urgency } from "../services/calendar";

type Row = Record<string, unknown>;
const iso = (value: unknown) =>
  value instanceof Date
    ? value.toISOString()
    : new Date(String(value)).toISOString();
const projectFrom = (row: Row): Project => ({
  id: String(row.id),
  name: String(row.name),
  description: String(row.description),
  version: Number(row.version),
  createdAt: iso(row.created_at),
});
const taskFrom = (row: Row): Task => ({
  id: String(row.id),
  projectId: String(row.project_id),
  title: String(row.title),
  description: String(row.description),
  subject: String(row.subject),
  status: row.status as TaskStatus,
  priority: row.priority as Task["priority"],
  isFavorite: Boolean(row.is_favorite),
  dueDate: row.due_date === null ? null : String(row.due_date),
  version: Number(row.version),
  createdAt: iso(row.created_at),
  dependencyIds: (row.dependency_ids ?? []) as string[],
  urgency: urgency(
    row.due_date === null ? null : String(row.due_date),
    row.status as TaskStatus,
  ),
});
const selectTask = `SELECT t.*, t.due_date::text AS due_date,
  COALESCE((SELECT array_agg(d.dependency_id::text ORDER BY d.dependency_id) FROM task_dependencies d JOIN tasks required ON required.id=d.dependency_id WHERE d.task_id=t.id AND required.deleted_at IS NULL),ARRAY[]::text[]) AS dependency_ids
  FROM tasks t JOIN projects p ON p.id=t.project_id`;
export class TaskRepository {
  constructor(public readonly db: Database) {}
  transaction<T>(operation: (repository: TaskRepository) => Promise<T>) {
    return this.db.transaction((db) => operation(new TaskRepository(db)));
  }
  async project(owner: string, id: string, lock = false): Promise<Project> {
    const result = await this.db.query(
      `SELECT * FROM projects WHERE owner_id=$1 AND id=$2 AND deleted_at IS NULL ${lock ? "FOR UPDATE" : ""}`,
      [owner, id],
    );
    if (!result.rows[0])
      throw new AppError(404, "NOT_FOUND", "Proyecto no encontrado.");
    return projectFrom(result.rows[0]);
  }
  async projects(owner: string): Promise<Project[]> {
    return (
      await this.db.query(
        "SELECT * FROM projects WHERE owner_id=$1 AND deleted_at IS NULL ORDER BY created_at DESC,id",
        [owner],
      )
    ).rows.map(projectFrom);
  }
  async createProject(
    owner: string,
    id: string,
    name: string,
    description: string,
  ): Promise<Project> {
    return projectFrom(
      (
        await this.db.query(
          "INSERT INTO projects(id,owner_id,name,description) VALUES ($1,$2,$3,$4) RETURNING *",
          [id, owner, name, description],
        )
      ).rows[0],
    );
  }
  async updateProject(id: string, name: string, description: string) {
    await this.db.query(
      "UPDATE projects SET name=$2,description=$3,version=version+1 WHERE id=$1",
      [id, name, description],
    );
  }
  async deleteProject(id: string) {
    await this.db.query(
      "UPDATE projects SET deleted_at=CURRENT_TIMESTAMP,version=version+1 WHERE id=$1",
      [id],
    );
  }
  async projectHasActiveTasks(id: string) {
    return (
      (
        await this.db.query(
          "SELECT 1 FROM tasks WHERE project_id=$1 AND deleted_at IS NULL LIMIT 1",
          [id],
        )
      ).rows.length > 0
    );
  }
  async task(owner: string, id: string): Promise<Task> {
    const result = await this.db.query(
      `${selectTask} WHERE p.owner_id=$1 AND t.id=$2 AND t.deleted_at IS NULL AND p.deleted_at IS NULL`,
      [owner, id],
    );
    if (!result.rows[0])
      throw new AppError(404, "NOT_FOUND", "Tarea no encontrada.");
    return taskFrom(result.rows[0]);
  }
  async tasks(owner: string, projectId?: string): Promise<Task[]> {
    const result = await this.db.query(
      `${selectTask} WHERE p.owner_id=$1 AND p.deleted_at IS NULL AND t.deleted_at IS NULL ${projectId ? "AND p.id=$2" : ""} ORDER BY t.created_at DESC,t.id`,
      projectId ? [owner, projectId] : [owner],
    );
    return result.rows.map(taskFrom);
  }
  async insertTask(
    task: Omit<Task, "createdAt" | "version" | "dependencyIds" | "urgency">,
  ) {
    await this.db.query(
      "INSERT INTO tasks(id,project_id,title,description,subject,status,priority,is_favorite,due_date) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)",
      [
        task.id,
        task.projectId,
        task.title,
        task.description,
        task.subject,
        task.status,
        task.priority,
        task.isFavorite,
        task.dueDate,
      ],
    );
  }
  async updateTask(task: Task) {
    await this.db.query(
      "UPDATE tasks SET title=$2,description=$3,subject=$4,priority=$5,is_favorite=$6,due_date=$7,version=version+1 WHERE id=$1",
      [
        task.id,
        task.title,
        task.description,
        task.subject,
        task.priority,
        task.isFavorite,
        task.dueDate,
      ],
    );
  }
  async bumpTask(id: string) {
    await this.db.query("UPDATE tasks SET version=version+1 WHERE id=$1", [id]);
  }
  async deleteTask(id: string) {
    await this.db.query(
      "UPDATE tasks SET deleted_at=CURRENT_TIMESTAMP,version=version+1 WHERE id=$1",
      [id],
    );
  }
  async setStatus(id: string, status: TaskStatus) {
    await this.db.query(
      "UPDATE tasks SET status=$2,version=version+1 WHERE id=$1",
      [id, status],
    );
  }
  async addDependency(task: string, dependency: string) {
    await this.db.query(
      "INSERT INTO task_dependencies(task_id,dependency_id) VALUES ($1,$2)",
      [task, dependency],
    );
  }
  async removeDependency(task: string, dependency: string) {
    await this.db.query(
      "DELETE FROM task_dependencies WHERE task_id=$1 AND dependency_id=$2",
      [task, dependency],
    );
  }
  async dependents(taskId: string, deliveredOnly = false): Promise<boolean> {
    return (
      (
        await this.db.query(
          `SELECT 1 FROM task_dependencies d JOIN tasks t ON t.id=d.task_id WHERE d.dependency_id=$1 AND t.deleted_at IS NULL ${deliveredOnly ? "AND t.status='delivered'" : ""} LIMIT 1`,
          [taskId],
        )
      ).rows.length > 0
    );
  }
  async hasCycle(taskId: string, dependencyId: string): Promise<boolean> {
    const result = await this.db.query(
      `WITH RECURSIVE reachable(id) AS (
      SELECT dependency_id FROM task_dependencies WHERE task_id=$1
      UNION SELECT d.dependency_id FROM task_dependencies d JOIN reachable r ON d.task_id=r.id
    ) SELECT 1 FROM reachable WHERE id=$2 LIMIT 1`,
      [dependencyId, taskId],
    );
    return result.rows.length > 0;
  }
  async addHistory(
    id: string,
    taskId: string,
    from: TaskStatus,
    to: TaskStatus,
  ) {
    await this.db.query(
      "INSERT INTO task_history(id,task_id,from_status,to_status) VALUES ($1,$2,$3,$4)",
      [id, taskId, from, to],
    );
  }
  async history(taskId: string): Promise<History[]> {
    return (
      await this.db.query(
        "SELECT * FROM task_history WHERE task_id=$1 ORDER BY created_at,id",
        [taskId],
      )
    ).rows.map((row) => ({
      id: String(row.id),
      taskId: String(row.task_id),
      fromStatus: row.from_status as TaskStatus,
      toStatus: row.to_status as TaskStatus,
      createdAt: iso(row.created_at),
    }));
  }
  async findUser(
    email: string,
  ): Promise<(User & { passwordHash: string }) | null> {
    const row = (
      await this.db.query(
        "SELECT id,email,password_hash FROM app_users WHERE email=$1",
        [email],
      )
    ).rows[0];
    return row
      ? {
          id: String(row.id),
          email: String(row.email),
          passwordHash: String(row.password_hash),
        }
      : null;
  }
  async addUser(id: string, email: string, passwordHash: string) {
    await this.db.query(
      "INSERT INTO app_users(id,email,password_hash) VALUES ($1,$2,$3)",
      [id, email, passwordHash],
    );
  }
  async addSession(tokenHash: string, userId: string) {
    await this.db.query(
      "DELETE FROM sessions WHERE expires_at<CURRENT_TIMESTAMP",
    );
    await this.db.query(
      "INSERT INTO sessions(token_hash,user_id,expires_at) VALUES ($1,$2,CURRENT_TIMESTAMP + INTERVAL '7 days')",
      [tokenHash, userId],
    );
  }
  async session(tokenHash: string): Promise<User | null> {
    const row = (
      await this.db.query(
        "SELECT u.id,u.email FROM sessions s JOIN app_users u ON u.id=s.user_id WHERE s.token_hash=$1 AND s.expires_at>CURRENT_TIMESTAMP",
        [tokenHash],
      )
    ).rows[0];
    return row ? { id: String(row.id), email: String(row.email) } : null;
  }
  async removeSession(tokenHash: string) {
    await this.db.query("DELETE FROM sessions WHERE token_hash=$1", [
      tokenHash,
    ]);
  }
}

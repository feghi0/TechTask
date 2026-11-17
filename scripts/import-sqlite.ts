/** Importación explícita y transaccional; nunca modifica el SQLite de origen. */
import { DatabaseSync } from "node:sqlite";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { randomUUID } from "node:crypto";
import { connectDatabase } from "../backend/src/database/db";
import { migrate } from "../backend/src/database/migrations";
import { TaskRepository } from "../backend/src/repositories/task-repository";
import { AuthService, sessionHash } from "../backend/src/services/auth-service";
import { date, text, uuid } from "../backend/src/services/validation";
import { taskPriorities, taskStatuses } from "../shared/contracts";

export async function importSqlite(
  source: string,
  email: string,
  password: string,
  options: { databaseUrl?: string; dataDir?: string; backupDir?: string } = {},
) {
  const legacy = new DatabaseSync(resolve(source), { readOnly: true });
  let rows: Record<string, unknown>[];
  try {
    legacy.exec("BEGIN");
    rows = legacy.prepare("SELECT * FROM tasks ORDER BY id").all();
    legacy.exec("COMMIT");
  } finally {
    legacy.close();
  }
  const backups = resolve(options.backupDir ?? "data/backups");
  mkdirSync(backups, { recursive: true });
  const backupPath = resolve(
    backups,
    `techtask-tasks-${Date.now()}-${randomUUID().slice(0, 8)}.json`,
  );
  writeFileSync(
    backupPath,
    JSON.stringify(
      {
        source: resolve(source),
        exportedAt: new Date().toISOString(),
        tasks: rows,
      },
      null,
      2,
    ),
    { flag: "wx" },
  );
  const db = await connectDatabase(options);
  try {
    await migrate(db);
    const repository = new TaskRepository(db);
    const auth = new AuthService(repository);
    const session = await auth.login({ email, password });
    try {
      return await db.transaction(async (transaction) => {
        const repo = new TaskRepository(transaction);
        const project = await repo.createProject(
          session.user.id,
          randomUUID(),
          "Legado TP 4",
          "Importación explícita de SQLite: conserva IDs y fechas originales.",
        );
        for (const row of rows) {
          const id = uuid(row.id);
          const title = text(row.title, "Título", 3, 60);
          const subject = text(row.subject, "Materia", 1, 100);
          const description = text(
            row.description ?? "",
            "Descripción",
            0,
            10000,
          );
          if (
            !taskStatuses.some((value) => value === row.status) ||
            !taskPriorities.some((value) => value === row.priority)
          )
            throw new Error(`Registro ${id}: estado o prioridad inválidos.`);
          if (row.isFavorite !== 0 && row.isFavorite !== 1)
            throw new Error(`Registro ${id}: favorita inválida.`);
          const createdAt = new Date(String(row.createdAt));
          if (!Number.isFinite(createdAt.getTime()))
            throw new Error(`Registro ${id}: fecha de creación inválida.`);
          await transaction.query(
            "INSERT INTO tasks (id,project_id,title,description,subject,status,priority,is_favorite,due_date,created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)",
            [
              id,
              project.id,
              title,
              description,
              subject,
              row.status,
              row.priority,
              row.isFavorite === 1,
              date(row.dueDate),
              createdAt.toISOString(),
            ],
          );
        }
        const saved = await repo.tasks(session.user.id, project.id);
        const ids = new Set(saved.map((task) => task.id));
        if (
          saved.length !== rows.length ||
          rows.some((row) => !ids.has(String(row.id)))
        )
          throw new Error(
            "No coincide la verificación de cantidad e identificadores.",
          );
        return { projectId: project.id, count: saved.length, backupPath };
      });
    } finally {
      await repository.removeSession(sessionHash(session.token));
    }
  } finally {
    await db.close();
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  if (!process.env.TT_EMAIL || !process.env.TT_PASSWORD || !process.argv[2])
    throw new Error(
      "Uso: npm run import:sqlite -- ruta.sqlite; definir TT_EMAIL y TT_PASSWORD de la cuenta destino existente.",
    );
  importSqlite(process.argv[2], process.env.TT_EMAIL, process.env.TT_PASSWORD, {
    databaseUrl: process.env.DATABASE_URL,
    dataDir: process.env.PGLITE_DATA_DIR,
  })
    .then((result) =>
      console.log(
        `Importadas ${result.count} tareas conservando IDs. Proyecto: ${result.projectId}. Respaldo en data/backups.`,
      ),
    )
    .catch((error) => {
      console.error(
        error instanceof Error
          ? error.message
          : "Importación rechazada; origen conservado.",
      );
      process.exitCode = 1;
    });
}

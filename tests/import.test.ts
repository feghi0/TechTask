import { describe, expect, it } from "vitest";
import request from "supertest";
import { DatabaseSync } from "node:sqlite";
import { createHash } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { createApp } from "../backend/src/app";
import { importSqlite } from "../scripts/import-sqlite";

describe("RN11: migración explícita sin pérdida de datos", () => {
  it("preserva IDs, contenido y origen; colisión revierte el proyecto entero", async () => {
    const directory = mkdtempSync(join(tmpdir(), "techtask-import-"));
    const source = join(directory, "legacy.sqlite");
    const dataDir = join(directory, "postgres");
    const backupDir = join(directory, "backups");
    const ids = [
      "10000000-0000-4000-8000-000000000001",
      "10000000-0000-4000-8000-000000000002",
    ];
    const createdAt = "2026-11-01T12:30:00.000Z";
    const legacy = new DatabaseSync(source);
    legacy.exec(
      "CREATE TABLE tasks(id TEXT PRIMARY KEY,title TEXT,description TEXT,subject TEXT,status TEXT,priority TEXT,isFavorite INTEGER,dueDate TEXT,createdAt TEXT)",
    );
    const insert = legacy.prepare(
      "INSERT INTO tasks VALUES (?,?,?,?,?,?,?,?,?)",
    );
    insert.run(
      ids[0],
      "TP de Redes",
      "Descripción original",
      "Redes",
      "pending",
      "high",
      1,
      "2026-12-01",
      createdAt,
    );
    insert.run(
      ids[1],
      "Entrega de Programación",
      "",
      "Programación",
      "delivered",
      "medium",
      0,
      null,
      createdAt,
    );
    legacy.close();
    const digest = () =>
      createHash("sha256").update(readFileSync(source)).digest("hex");
    const originalHash = digest();
    const email = `legado-${Date.now()}@example.test`;
    const password = "Legado-seguro-2026";
    let context: Awaited<ReturnType<typeof createApp>> | undefined;
    try {
      context = await createApp({ dataDir });
      await request(context.app)
        .post("/api/auth/register")
        .send({ email, password })
        .expect(201);
      await context.close();
      context = undefined;
      const result = await importSqlite(source, email, password, {
        dataDir,
        backupDir,
      });
      expect(result.count).toBe(2);
      expect(readdirSync(backupDir)).toHaveLength(1);
      expect(digest()).toBe(originalHash);
      context = await createApp({ dataDir });
      const actor = request.agent(context.app);
      await actor.post("/api/auth/login").send({ email, password }).expect(200);
      const tasks = (await actor.get("/api/tasks").expect(200)).body.data;
      expect(tasks).toHaveLength(2);
      expect(
        tasks.find((task: { id: string }) => task.id === ids[0]),
      ).toMatchObject({
        title: "TP de Redes",
        description: "Descripción original",
        status: "pending",
        priority: "high",
        isFavorite: true,
        createdAt,
      });
      expect(
        tasks.find((task: { id: string }) => task.id === ids[1]),
      ).toMatchObject({
        title: "Entrega de Programación",
        status: "delivered",
        dueDate: null,
        createdAt,
      });
      await context.close();
      context = undefined;
      await expect(
        importSqlite(source, email, password, { dataDir, backupDir }),
      ).rejects.toThrow();
      context = await createApp({ dataDir });
      const after = request.agent(context.app);
      await after.post("/api/auth/login").send({ email, password }).expect(200);
      expect(
        (await after.get("/api/projects").expect(200)).body.data,
      ).toHaveLength(1);
      expect(
        (await after.get("/api/tasks").expect(200)).body.data,
      ).toHaveLength(2);
      expect(digest()).toBe(originalHash);
    } finally {
      await context?.close();
      rmSync(directory, { recursive: true, force: true });
    }
  }, 60000);
});

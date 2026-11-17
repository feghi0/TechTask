import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createApp } from "../backend/src/app";
import type { Task, Project, ProjectDetail } from "../shared/contracts";

// Original TP4 tests are preserved in tests/legacy and the baseline Git commit.
// These tests specify the approved private-account and PostgreSQL contracts.
type Context = Awaited<ReturnType<typeof createApp>>;
type Agent = ReturnType<typeof request.agent>;
let context: Context;
let actor: Agent;
let sequence = 0;
const runTag = Date.now().toString(36);
const password = "Prueba-segura-2026";
const input = { title: "TP de Redes", subject: "Redes" };
const email = () => `prueba-${runTag}-${++sequence}@example.test`;
async function account(app = context.app) {
  const agent = request.agent(app);
  await agent
    .post("/api/auth/register")
    .send({ email: email(), password })
    .expect(201);
  return agent;
}
async function project(agent = actor): Promise<Project> {
  return (
    await agent
      .post("/api/projects")
      .send({
        name: "Proyecto técnico",
        description: "Datos ficticios de prueba",
      })
      .expect(201)
  ).body.data;
}
async function task(
  projectId: string,
  title = "TP de Redes",
  agent = actor,
): Promise<Task> {
  return (
    await agent
      .post(`/api/projects/${projectId}/tasks`)
      .send({ ...input, title })
      .expect(201)
  ).body.data;
}
async function state(
  value: Task,
  status: Task["status"],
  agent = actor,
): Promise<Task> {
  return (
    await agent
      .patch(`/api/tasks/${value.id}/status`)
      .send({ version: value.version, status })
      .expect(200)
  ).body.data;
}
async function delivered(value: Task): Promise<Task> {
  return state(await state(value, "in_progress"), "delivered");
}
async function dependency(value: Task, required: Task): Promise<Task> {
  return (
    await actor
      .post(`/api/tasks/${value.id}/dependencies`)
      .send({ version: value.version, dependencyId: required.id })
      .expect(200)
  ).body.data;
}
beforeAll(async () => {
  context = await createApp({
    dataDir: "memory://",
    databaseUrl: process.env.TEST_DATABASE_URL,
  });
}, 60000);
beforeEach(async () => {
  actor = await account();
});
afterAll(async () => {
  await context?.close();
});

describe("Autenticación y cuentas privadas", () => {
  it("requiere sesión y nunca devuelve contraseñas", async () => {
    await request(context.app).get("/api/projects").expect(401);
    const me = await actor.get("/api/auth/me").expect(200);
    expect(Object.keys(me.body.data).sort()).toEqual(["email", "id"]);
    expect(JSON.stringify(me.body)).not.toMatch(/password|scrypt|salt/);
  });
  it("normaliza correo y configura cookie HttpOnly/SameSite", async () => {
    const response = await request(context.app)
      .post("/api/auth/register")
      .send({ email: `  Cookie-${runTag}@Test.Example  `, password })
      .expect(201);
    expect(response.body.data.email).toBe(`cookie-${runTag}@test.example`);
    expect(String(response.headers["set-cookie"])).toMatch(/HttpOnly/i);
    expect(String(response.headers["set-cookie"])).toMatch(/SameSite=Lax/i);
  });
  it("login correcto, contraseña incorrecta y logout invalidan sesión", async () => {
    const address = email();
    const agent = request.agent(context.app);
    await agent
      .post("/api/auth/register")
      .send({ email: address, password })
      .expect(201);
    await agent.post("/api/auth/logout").send({}).expect(204);
    await agent.get("/api/auth/me").expect(401);
    await agent
      .post("/api/auth/login")
      .send({ email: address, password: "Contraseña-incorrecta" })
      .expect(401);
    await agent
      .post("/api/auth/login")
      .send({ email: address, password })
      .expect(200);
    await agent.get("/api/auth/me").expect(200);
  });
  it("rechaza correo duplicado y contraseña corta", async () => {
    const address = email();
    await request(context.app)
      .post("/api/auth/register")
      .send({ email: address, password })
      .expect(201);
    await request(context.app)
      .post("/api/auth/register")
      .send({ email: address, password })
      .expect(409);
    await request(context.app)
      .post("/api/auth/register")
      .send({ email: email(), password: "corta" })
      .expect(400);
  });
  it("rechaza mutaciones desde un origen externo", async () => {
    await actor
      .post("/api/projects")
      .set("Origin", "https://origen-no-autorizado.example")
      .send({ name: "Proyecto" })
      .expect(403);
  });
  it("aísla proyectos y tareas de otra cuenta", async () => {
    const owned = await project();
    const ownedTask = await task(owned.id);
    const stranger = await account();
    expect((await stranger.get("/api/projects").expect(200)).body.data).toEqual(
      [],
    );
    await stranger.get(`/api/projects/${owned.id}`).expect(404);
    await stranger.get(`/api/tasks/${ownedTask.id}`).expect(404);
    await stranger.get(`/api/tasks/${ownedTask.id}/history`).expect(404);
    await stranger
      .patch(`/api/tasks/${ownedTask.id}`)
      .send({ version: ownedTask.version, title: "Cambio ajeno" })
      .expect(404);
    await stranger
      .patch(`/api/tasks/${ownedTask.id}/status`)
      .send({ version: ownedTask.version, status: "in_progress" })
      .expect(404);
    await stranger
      .delete(`/api/tasks/${ownedTask.id}`)
      .send({ version: ownedTask.version })
      .expect(404);
    await stranger
      .post(`/api/projects/${owned.id}/tasks`)
      .send(input)
      .expect(404);
  });
});
describe("Contratos, validación y proyectos", () => {
  it("crea proyecto y tarea pendiente con campos del servidor", async () => {
    const owned = await project();
    const value = await task(owned.id);
    expect(value).toMatchObject({
      projectId: owned.id,
      status: "pending",
      priority: "medium",
      isFavorite: false,
      dependencyIds: [],
    });
    expect(value.id).toMatch(/^[a-f\d-]{36}$/);
    expect(Number.isFinite(Date.parse(value.createdAt))).toBe(true);
    expect(
      (await actor.get("/api/tasks").expect(200)).body.data,
    ).toContainEqual(value);
  });
  it.each([2, 61])("rechaza título con %i caracteres", async (length) => {
    const owned = await project();
    await actor
      .post(`/api/projects/${owned.id}/tasks`)
      .send({ ...input, title: "a".repeat(length) })
      .expect(400);
  });
  it.each([3, 60])("acepta límite de %i caracteres", async (length) => {
    const owned = await project();
    await actor
      .post(`/api/projects/${owned.id}/tasks`)
      .send({ ...input, title: ` ${"a".repeat(length)} ` })
      .expect(201);
  });
  it("cuenta Unicode igual que PostgreSQL y devuelve 400, no 500", async () => {
    const owned = await project();
    await actor
      .post(`/api/projects/${owned.id}/tasks`)
      .send({ ...input, title: "😀😀" })
      .expect(400);
    await actor
      .post(`/api/projects/${owned.id}/tasks`)
      .send({ ...input, title: "😀😀😀" })
      .expect(201);
  });
  it.each([
    { subject: "" },
    { subject: "  " },
    { priority: "urgent" },
    { isFavorite: "yes" },
    { dueDate: "2026-02-30" },
    { dueDate: "2026-11-16T00:00:00Z" },
    { id: "inyectado" },
    { createdAt: "inyectado" },
    { status: "delivered" },
    { title: "Título\u0000inválido" },
    { subject: "Redes\u0000" },
    { description: "Descripción\u0000inválida" },
  ])("rechaza entrada inválida %j", async (override) => {
    const owned = await project();
    await actor
      .post(`/api/projects/${owned.id}/tasks`)
      .send({ ...input, ...override })
      .expect(400);
  });
  it("rechaza estrictamente la clave desconocida __proto__", async () => {
    const owned = await project();
    const raw = JSON.stringify(input).replace(/}$/, ',"__proto__":{}}');
    await actor
      .post(`/api/projects/${owned.id}/tasks`)
      .set("Content-Type", "application/json")
      .send(raw)
      .expect(400);
  });
  it("rechaza NUL en correo y textos de proyecto antes de llegar a PostgreSQL", async () => {
    await request(context.app)
      .post("/api/auth/register")
      .send({ email: `nul-${runTag}\u0000@example.test`, password })
      .expect(400);
    await actor
      .post("/api/projects")
      .send({ name: "Proyecto\u0000inválido" })
      .expect(400);
    await actor
      .post("/api/projects")
      .send({
        name: "Proyecto válido",
        description: "Descripción\u0000inválida",
      })
      .expect(400);
  });
  it("acepta 10000 puntos Unicode de descripción dentro del límite JSON", async () => {
    const owned = await project();
    const description = "😀".repeat(10000);
    const response = await actor
      .post(`/api/projects/${owned.id}/tasks`)
      .send({ ...input, description })
      .expect(201);
    expect(response.body.data.description).toBe(description);
  });
  it("controla JSON inválido, tamaño y formato sin cerrar el servidor", async () => {
    const owned = await project();
    const url = `/api/projects/${owned.id}/tasks`;
    const broken = await actor
      .post(url)
      .set("Content-Type", "application/json")
      .send("{broken")
      .expect(400);
    expect(JSON.stringify(broken.body)).not.toMatch(/stack|node_modules/);
    await actor.post(url).send("title=Tarea").expect(415);
    await actor
      .post(url)
      .send({ ...input, description: "x".repeat(150000) })
      .expect(413);
    await actor.get("/api/projects").expect(200);
  });
  it("distingue UUID inválido y registro inexistente", async () => {
    await actor.get("/api/tasks/no-es-uuid").expect(400);
    await actor
      .get("/api/tasks/00000000-0000-4000-8000-000000000000")
      .expect(404);
  });
  it("edita con versión y rechaza versión obsoleta", async () => {
    const owned = await project();
    const value = await task(owned.id);
    const update = await actor
      .patch(`/api/tasks/${value.id}`)
      .send({
        version: value.version,
        title: "Título actualizado",
        isFavorite: true,
      })
      .expect(200);
    expect(update.body.data.version).toBe(value.version + 1);
    await actor
      .patch(`/api/tasks/${value.id}`)
      .send({ version: value.version, title: "Edición obsoleta" })
      .expect(409);
    expect((await actor.get(`/api/tasks/${value.id}`)).body.data.title).toBe(
      "Título actualizado",
    );
  });
  it("edita proyecto y elimina solamente proyectos vacíos", async () => {
    const empty = await project();
    const updated = await actor
      .patch(`/api/projects/${empty.id}`)
      .send({ version: empty.version, name: "Nuevo nombre" })
      .expect(200);
    await actor
      .delete(`/api/projects/${empty.id}`)
      .send({ version: updated.body.data.version })
      .expect(204);
    const occupied = await project();
    await task(occupied.id);
    await actor
      .delete(`/api/projects/${occupied.id}`)
      .send({ version: occupied.version })
      .expect(409);
  });
});
describe("Estados, dependencias y concurrencia", () => {
  it("impide saltar pendiente a entregada y registra transiciones válidas", async () => {
    const owned = await project();
    let value = await task(owned.id);
    await actor
      .patch(`/api/tasks/${value.id}/status`)
      .send({ version: value.version, status: "delivered" })
      .expect(409);
    value = await delivered(value);
    const history = (
      await actor.get(`/api/tasks/${value.id}/history`).expect(200)
    ).body.data;
    expect(
      history.map((h: { fromStatus: string; toStatus: string }) => [
        h.fromStatus,
        h.toStatus,
      ]),
    ).toEqual(
      expect.arrayContaining([
        ["pending", "in_progress"],
        ["in_progress", "delivered"],
      ]),
    );
  });
  it("rechaza mismo estado y entrega bloqueada sin contaminar historial", async () => {
    const owned = await project();
    let value = await task(owned.id);
    await actor
      .patch(`/api/tasks/${value.id}/status`)
      .send({ version: value.version, status: "pending" })
      .expect(409);
    value = await state(value, "blocked");
    const before = (await actor.get(`/api/tasks/${value.id}/history`)).body
      .data;
    await actor
      .patch(`/api/tasks/${value.id}/status`)
      .send({ version: value.version, status: "delivered" })
      .expect(409);
    const after = (await actor.get(`/api/tasks/${value.id}/history`)).body.data;
    expect(after).toEqual(before);
    expect((await actor.get(`/api/tasks/${value.id}`)).body.data.status).toBe(
      "blocked",
    );
  });
  it("rechaza dependencia propia, duplicada y de otro proyecto", async () => {
    const owned = await project();
    const other = await project();
    const a = await task(owned.id, "Primera tarea");
    const b = await task(owned.id, "Segunda tarea");
    const foreign = await task(other.id);
    await actor
      .post(`/api/tasks/${a.id}/dependencies`)
      .send({ version: a.version, dependencyId: a.id })
      .expect(409);
    await actor
      .post(`/api/tasks/${a.id}/dependencies`)
      .send({ version: a.version, dependencyId: foreign.id })
      .expect(409);
    const linked = await dependency(a, b);
    await actor
      .post(`/api/tasks/${a.id}/dependencies`)
      .send({ version: linked.version, dependencyId: b.id })
      .expect(409);
  });
  it("detecta ciclos indirectos A→B→C→A", async () => {
    const owned = await project();
    const a = await task(owned.id, "Primera tarea");
    const b = await task(owned.id, "Segunda tarea");
    const c = await task(owned.id, "Tercera tarea");
    await dependency(a, b);
    await dependency(b, c);
    const rejected = await actor
      .post(`/api/tasks/${c.id}/dependencies`)
      .send({ version: c.version, dependencyId: a.id })
      .expect(409);
    expect(rejected.body.error.code).toBe("DEPENDENCY_CYCLE");
  });
  it("bloquea entrega pendiente, permite resolverla y protege reapertura", async () => {
    const owned = await project();
    let a = await task(owned.id, "Entrega final");
    let b = await task(owned.id, "Actividad previa");
    a = await dependency(a, b);
    a = await state(a, "in_progress");
    const blocked = await actor
      .patch(`/api/tasks/${a.id}/status`)
      .send({ version: a.version, status: "delivered" })
      .expect(409);
    expect(blocked.body.error.code).toBe("DEPENDENCY_PENDING");
    b = await delivered(b);
    a = await state(a, "delivered");
    await actor
      .patch(`/api/tasks/${b.id}/status`)
      .send({ version: b.version, status: "in_progress" })
      .expect(409);
    expect(
      (await actor.get(`/api/projects/${owned.id}/progress`).expect(200)).body
        .data,
    ).toMatchObject({ total: 2, delivered: 2, percentage: 100 });
  });
  it("no agrega dependencias a tareas entregadas", async () => {
    const owned = await project();
    const a = await delivered(await task(owned.id));
    const b = await task(owned.id, "Otra actividad");
    await actor
      .post(`/api/tasks/${a.id}/dependencies`)
      .send({ version: a.version, dependencyId: b.id })
      .expect(409);
  });
  it("quitar una dependencia de una tarea entregada preserva su estado", async () => {
    const owned = await project();
    let value = await task(owned.id, "Entrega completa");
    const prerequisite = await delivered(
      await task(owned.id, "Requisito completo"),
    );
    value = await dependency(value, prerequisite);
    value = await delivered(value);
    const historyBefore = (await actor.get(`/api/tasks/${value.id}/history`))
      .body.data;
    const result = await actor
      .delete(`/api/tasks/${value.id}/dependencies/${prerequisite.id}`)
      .send({ version: value.version })
      .expect(200);
    expect(result.body.data).toMatchObject({
      status: "delivered",
      dependencyIds: [],
      version: value.version + 1,
    });
    expect(
      (await actor.get(`/api/tasks/${value.id}/history`)).body.data,
    ).toEqual(historyBefore);
  });
  it("protege referenciadas y entregadas; elimina tareas permitidas", async () => {
    const owned = await project();
    let a = await task(owned.id);
    const b = await task(owned.id, "Tarea requerida");
    a = await dependency(a, b);
    await actor
      .delete(`/api/tasks/${b.id}`)
      .send({ version: b.version })
      .expect(409);
    a = (
      await actor
        .delete(`/api/tasks/${a.id}/dependencies/${b.id}`)
        .send({ version: a.version })
        .expect(200)
    ).body.data;
    await actor
      .delete(`/api/tasks/${a.id}`)
      .send({ version: a.version })
      .expect(204);
    await actor.get(`/api/tasks/${a.id}`).expect(404);
    const completed = await delivered(b);
    await actor
      .delete(`/api/tasks/${b.id}`)
      .send({ version: completed.version })
      .expect(409);
  });
  it("dos ediciones simultáneas no sobrescriben silenciosamente", async () => {
    const owned = await project();
    const value = await task(owned.id);
    const responses = await Promise.all(
      ["Edición primera", "Edición segunda"].map((title) =>
        actor
          .patch(`/api/tasks/${value.id}`)
          .send({ version: value.version, title }),
      ),
    );
    expect(responses.map((r) => r.status).sort()).toEqual([200, 409]);
    expect((await actor.get(`/api/tasks/${value.id}`)).body.data.version).toBe(
      value.version + 1,
    );
  });
  it("dos enlaces concurrentes no pueden crear un ciclo", async () => {
    const owned = await project();
    const a = await task(owned.id, "Tarea alfa");
    const b = await task(owned.id, "Tarea beta");
    const responses = await Promise.all([
      actor
        .post(`/api/tasks/${a.id}/dependencies`)
        .send({ version: a.version, dependencyId: b.id }),
      actor
        .post(`/api/tasks/${b.id}/dependencies`)
        .send({ version: b.version, dependencyId: a.id }),
    ]);
    expect(responses.map((r) => r.status).sort()).toEqual([200, 409]);
  });
  it("entregar y reabrir requisito simultáneamente conserva la regla", async () => {
    const owned = await project();
    let a = await task(owned.id, "Entrega dependiente");
    let b = await task(owned.id, "Requisito de entrega");
    a = await dependency(a, b);
    a = await state(a, "in_progress");
    b = await delivered(b);
    const responses = await Promise.all([
      actor
        .patch(`/api/tasks/${a.id}/status`)
        .send({ version: a.version, status: "delivered" }),
      actor
        .patch(`/api/tasks/${b.id}/status`)
        .send({ version: b.version, status: "in_progress" }),
    ]);
    expect(responses.map((r) => r.status).sort()).toEqual([200, 409]);
    const finalA: Task = (await actor.get(`/api/tasks/${a.id}`)).body.data;
    const finalB: Task = (await actor.get(`/api/tasks/${b.id}`)).body.data;
    expect(finalA.status !== "delivered" || finalB.status === "delivered").toBe(
      true,
    );
  });
});
describe("Cálculos y persistencia", () => {
  it("controla un fallo real de almacenamiento sin exponer detalles internos", async () => {
    const unavailable = await createApp({ dataDir: "memory://" });
    const agent = await account(unavailable.app);
    await unavailable.close();
    const response = await agent.get("/api/projects").expect(500);
    expect(response.body.error.code).toBe("INTERNAL_ERROR");
    expect(JSON.stringify(response.body)).not.toMatch(
      /stack|node_modules|SELECT|database is closed/i,
    );
    // Health probes check the database too: an unavailable database must remain unhealthy.
    const health = await request(unavailable.app).get("/api/health").expect(500);
    expect(health.body.error.code).toBe("INTERNAL_ERROR");
  });
  it("proyecto vacío tiene progreso cero; conflictos requieren tres tareas", async () => {
    const owned = await project();
    const empty: ProjectDetail = (
      await actor.get(`/api/projects/${owned.id}`).expect(200)
    ).body.data;
    expect(empty.progress).toEqual({ total: 0, delivered: 0, percentage: 0 });
    for (const [index, date] of [
      "2026-12-01",
      "2026-12-02",
      "2026-12-03",
    ].entries()) {
      await actor
        .post(`/api/projects/${owned.id}/tasks`)
        .send({ ...input, title: `Entrega ${index + 1}`, dueDate: date })
        .expect(201);
      const detail: ProjectDetail = (
        await actor.get(`/api/projects/${owned.id}`)
      ).body.data;
      expect(detail.conflicts.length > 0).toBe(index === 2);
    }
  });
  it("proyectos y tareas persisten al cerrar/reabrir PostgreSQL local", async () => {
    const directory = mkdtempSync(join(tmpdir(), "techtask-pg-"));
    let local: Context | undefined;
    try {
      local = await createApp({ dataDir: directory });
      const agent = await account(local.app);
      const owned = await project(agent);
      const value = await task(owned.id, "Tarea persistente", agent);
      const me = await agent.get("/api/auth/me");
      await local.close();
      local = await createApp({ dataDir: directory });
      const login = request.agent(local.app);
      await login
        .post("/api/auth/login")
        .send({ email: me.body.data.email, password })
        .expect(200);
      expect(
        (await login.get(`/api/tasks/${value.id}`).expect(200)).body.data.title,
      ).toBe("Tarea persistente");
    } finally {
      await local?.close();
      rmSync(directory, { recursive: true, force: true });
    }
  }, 60000);
});

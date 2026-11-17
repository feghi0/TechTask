import express from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { connectDatabase } from "./database/db";
import { migrate } from "./database/migrations";
import { TaskRepository } from "./repositories/task-repository";
import { TaskService } from "./services/task-service";
import { AuthService } from "./services/auth-service";
import { TaskController } from "./controllers/task-controller";
import { AppError, errorHandler } from "./middleware/errors";

export interface AppOptions {
  dataDir?: string;
  databaseUrl?: string;
  secureCookies?: boolean;
  allowedOrigins?: string[];
  trustProxy?: boolean;
  serveFrontend?: boolean;
}
export async function createApp(options: AppOptions = {}) {
  const db = await connectDatabase({
    dataDir: options.dataDir,
    databaseUrl: options.databaseUrl,
  });
  try {
    await migrate(db);
  } catch (error) {
    await db.close();
    throw error;
  }
  const repository = new TaskRepository(db),
    auth = new AuthService(repository);
  const controller = new TaskController(new TaskService(repository));
  const app = express();
  app.disable("x-powered-by");
  if (options.trustProxy) app.set("trust proxy", 1);
  app.use(helmet({ hsts: options.secureCookies ? undefined : false }));
  const allowed = new Set(
    options.allowedOrigins ??
      (options.secureCookies
        ? []
        : [
            "http://127.0.0.1:5173",
            "http://127.0.0.1:5180",
            "http://127.0.0.1:4173",
            "http://localhost:5173",
          ]),
  );
  app.use("/api", (req, res, next) => {
    res.setHeader("Cache-Control", "no-store");
    const origin = req.get("Origin");
    const own = `${req.protocol}://${req.get("host")}`;
    if (origin && origin !== own && !allowed.has(origin))
      return next(
        new AppError(
          403,
          "ORIGIN_NOT_ALLOWED",
          "El origen de la solicitud no está permitido.",
        ),
      );
    if (origin && (origin === own || allowed.has(origin))) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.vary("Origin");
    }
    if (req.method === "OPTIONS") {
      res.setHeader(
        "Access-Control-Allow-Methods",
        "GET,POST,PATCH,DELETE,OPTIONS",
      );
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");
      res.sendStatus(204);
      return;
    }
    if (
      !["GET", "HEAD", "OPTIONS"].includes(req.method) &&
      req.get("Sec-Fetch-Site") === "cross-site" &&
      !origin
    )
      return next(
        new AppError(403, "ORIGIN_NOT_ALLOWED", "Solicitud cruzada rechazada."),
      );
    next();
  });
  app.use(express.json({ limit: "128kb" }));
  app.use(
    "/api",
    rateLimit({
      windowMs: 60 * 1000,
      limit: process.env.NODE_ENV === "test" ? 5000 : 120,
      standardHeaders: "draft-8",
      legacyHeaders: false,
      message: {
        error: {
          code: "RATE_LIMITED",
          message: "Demasiadas solicitudes. Intentá nuevamente en un minuto.",
        },
      },
    }),
  );
  app.use(cookieParser());
  app.use("/api", (req, _res, next) => {
    if (
      ["POST", "PATCH", "DELETE"].includes(req.method) &&
      req.path !== "/auth/logout" &&
      !req.is("application/json")
    )
      return next(
        new AppError(
          415,
          "UNSUPPORTED_MEDIA_TYPE",
          "Se requiere application/json.",
        ),
      );
    next();
  });
  app.get("/api/health", async (_req, res) => {
    await db.query("SELECT 1");
    res.json({ data: { status: "ok" } });
  });
  const authLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: process.env.NODE_ENV === "test" ? 500 : 30,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
      error: {
        code: "RATE_LIMITED",
        message: "Demasiados intentos. Intentá más tarde.",
      },
    },
  });
  const cookie = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: options.secureCookies ?? false,
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
  app.post("/api/auth/register", authLimit, async (req, res) => {
    const result = await auth.register(req.body as unknown);
    res
      .cookie("techtask_session", result.token, cookie)
      .status(201)
      .json({ data: result.user });
  });
  app.post("/api/auth/login", authLimit, async (req, res) => {
    const result = await auth.login(req.body as unknown);
    res
      .cookie("techtask_session", result.token, cookie)
      .json({ data: result.user });
  });
  app.get("/api/auth/me", async (req, res) => {
    const user = await auth.current(req.cookies.techtask_session);
    if (!user)
      throw new AppError(
        401,
        "UNAUTHENTICATED",
        "Iniciá sesión para continuar.",
      );
    res.json({ data: user });
  });
  app.post("/api/auth/logout", async (req, res) => {
    await auth.logout(req.cookies.techtask_session);
    res
      .clearCookie("techtask_session", { ...cookie, maxAge: undefined })
      .sendStatus(204);
  });
  app.use("/api", async (req, res, next) => {
    const user = await auth.current(req.cookies.techtask_session);
    if (!user)
      throw new AppError(
        401,
        "UNAUTHENTICATED",
        "Iniciá sesión para continuar.",
      );
    res.locals.user = user;
    next();
  });
  app.get("/api/projects", controller.projects);
  app.post("/api/projects", controller.createProject);
  app.get("/api/projects/:id", controller.project);
  app.patch("/api/projects/:id", controller.updateProject);
  app.delete("/api/projects/:id", controller.deleteProject);
  app.get("/api/projects/:id/progress", controller.progress);
  app.get("/api/projects/:id/tasks", controller.projectTasks);
  app.post("/api/projects/:id/tasks", controller.create);
  app.get("/api/tasks", controller.list);
  app.get("/api/tasks/:id", controller.get);
  app.patch("/api/tasks/:id", controller.update);
  app.delete("/api/tasks/:id", controller.delete);
  app.patch("/api/tasks/:id/status", controller.status);
  app.post("/api/tasks/:id/dependencies", controller.addDependency);
  app.delete(
    "/api/tasks/:id/dependencies/:dependencyId",
    controller.removeDependency,
  );
  app.get("/api/tasks/:id/history", controller.history);
  app.use("/api", (_req, _res, next) =>
    next(new AppError(404, "NOT_FOUND", "Ruta no disponible.")),
  );
  const frontend = resolve("dist/frontend");
  if (options.serveFrontend && existsSync(resolve(frontend, "index.html"))) {
    app.use(express.static(frontend));
    app.get("/{*path}", (_req, res) =>
      res.sendFile(resolve(frontend, "index.html")),
    );
  }
  app.use((_req, _res, next) =>
    next(new AppError(404, "NOT_FOUND", "Ruta no disponible.")),
  );
  app.use(errorHandler);
  return { app, db, close: () => db.close() };
}

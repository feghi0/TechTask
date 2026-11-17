import { createApp } from "./app";
const production = process.env.NODE_ENV === "production";
if (production && !process.env.DATABASE_URL)
  throw new Error("DATABASE_URL es obligatoria en producción.");
const port = Number(process.env.PORT ?? 3001);
if (!Number.isInteger(port) || port < 1 || port > 65535)
  throw new Error("PORT inválido.");
const host = process.env.HOST ?? (production ? "0.0.0.0" : "127.0.0.1");
const { app, close } = await createApp({
  databaseUrl: process.env.DATABASE_URL,
  dataDir: process.env.PGLITE_DATA_DIR ?? "data/postgres",
  secureCookies: production,
  allowedOrigins:
    (process.env.ALLOWED_ORIGINS ?? process.env.FRONTEND_ORIGIN)
      ?.split(",")
      .map((value) => value.trim())
      .filter(Boolean) ?? (production ? [] : undefined),
  trustProxy: production,
  serveFrontend: production,
});
const server = app.listen(port, host, () =>
  console.log(`TechTask: http://${host}:${port}`),
);
for (const signal of ["SIGINT", "SIGTERM"] as const)
  process.on(signal, () =>
    server.close(() => {
      void close().then(() => process.exit(0));
    }),
  );

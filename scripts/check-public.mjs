import { randomBytes } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
const base = process.env.TT_PUBLIC_URL;
if (!base || !base.startsWith("https://"))
  throw new Error("Definir TT_PUBLIC_URL HTTPS del despliegue propio.");
const health = await fetch(`${base}/api/health`);
const email = `verificacion-${Date.now()}@example.test`;
const registration = await fetch(`${base}/api/auth/register`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email,
    password: randomBytes(24).toString("base64url"),
  }),
});
if (registration.status !== 201)
  throw new Error(`Registro de prueba HTTP ${registration.status}`);
const cookieHeader = registration.headers.getSetCookie().join(";");
const cookie = registration.headers
  .getSetCookie()
  .map((value) => value.split(";")[0])
  .join("; ");
const security = {
  httpOnly: /httponly/i.test(cookieHeader),
  secure: /;\s*secure/i.test(cookieHeader),
  sameSiteLax: /samesite=lax/i.test(cookieHeader),
};
const me = await fetch(`${base}/api/auth/me`, { headers: { Cookie: cookie } });
const cors = await fetch(`${base}/api/projects`, {
  method: "POST",
  headers: {
    Cookie: cookie,
    "Content-Type": "application/json",
    Origin: "https://origen-no-autorizado.example",
  },
  body: JSON.stringify({ name: "No debe crearse" }),
});
const logout = await fetch(`${base}/api/auth/logout`, {
  method: "POST",
  headers: { Cookie: cookie, "Content-Type": "application/json" },
  body: "{}",
});
const revoked = await fetch(`${base}/api/auth/me`, {
  headers: { Cookie: cookie },
});
const result = {
  url: base,
  checkedAt: new Date().toISOString(),
  health: health.status,
  registration: registration.status,
  session: me.status,
  cookieFlags: security,
  foreignOrigin: cors.status,
  logout: logout.status,
  revokedOriginalCookie: revoked.status,
};
mkdirSync("docs/evidencias/publicacion", { recursive: true });
writeFileSync(
  "docs/evidencias/publicacion/seguridad-https.json",
  JSON.stringify(result, null, 2),
);
console.log(JSON.stringify(result, null, 2));
if (
  health.status !== 200 ||
  me.status !== 200 ||
  cors.status !== 403 ||
  logout.status !== 204 ||
  revoked.status !== 401 ||
  Object.values(security).some((value) => !value)
)
  process.exitCode = 1;

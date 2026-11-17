import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
const base = process.env.TT_PUBLIC_URL;
if (!base?.startsWith("https://"))
  throw new Error("Se requiere TT_PUBLIC_URL HTTPS.");
const browser = await chromium.launch({ channel: "msedge", headless: true });
const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
const dir = "docs/evidencias/password4";
mkdirSync(dir, { recursive: true });
const address = `minimo4-${Date.now()}@example.test`;
try {
  await page.goto(base);
  await page.getByRole("button", { name: "Crear cuenta", exact: true }).click();
  const password = page.getByLabel("Contraseña", { exact: true });
  const minimum = await password.getAttribute("minlength");
  if (minimum !== "4")
    throw new Error(`La versión publicada todavía tiene mínimo ${minimum}.`);
  await page.getByLabel("Correo electrónico", { exact: true }).fill(address);
  await password.fill("abcd");
  await page.screenshot({
    path: `${dir}/registro-minimo4.png`,
    fullPage: true,
  });
  const registered = page.waitForResponse(
    (r) =>
      r.url().endsWith("/api/auth/register") && r.request().method() === "POST",
  );
  await page.getByRole("button", { name: "Registrarme", exact: true }).click();
  const registration = await registered;
  if (registration.status() !== 201)
    throw new Error("Registro de 4 caracteres rechazado.");
  await page
    .getByRole("heading", { name: "Mis proyectos", exact: true })
    .waitFor();
  await page
    .getByRole("button", { name: "Cerrar sesión", exact: true })
    .click();
  await page.getByLabel("Correo electrónico", { exact: true }).fill(address);
  await page.getByLabel("Contraseña", { exact: true }).fill("abcd");
  const logged = page.waitForResponse(
    (r) =>
      r.url().endsWith("/api/auth/login") && r.request().method() === "POST",
  );
  await page.getByRole("button", { name: "Ingresar", exact: true }).click();
  const login = await logged;
  if (login.status() !== 200)
    throw new Error("Login de 4 caracteres rechazado.");
  await page
    .getByRole("heading", { name: "Mis proyectos", exact: true })
    .waitFor();
  const rejected = await page.request.post(`${base}/api/auth/register`, {
    data: { email: `short-${Date.now()}@example.test`, password: "abc" },
  });
  if (rejected.status() !== 400)
    throw new Error("No se rechazaron 3 caracteres.");
  const result = {
    url: base,
    htmlMinimum: Number(minimum),
    registration: registration.status(),
    login: login.status(),
    threeCharacters: rejected.status(),
    checkedAt: new Date().toISOString(),
  };
  writeFileSync(
    `${dir}/resultado-publico.json`,
    JSON.stringify(result, null, 2),
  );
  console.log(JSON.stringify(result, null, 2));
  await page
    .getByRole("button", { name: "Cerrar sesión", exact: true })
    .click();
} finally {
  await browser.close();
}

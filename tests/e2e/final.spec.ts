import { test, expect, type Page } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
const evidence = process.env.TT_EVIDENCE_DIR ?? "docs/evidencias";
const password = process.env.TT_PUBLIC_URL ? randomBytes(24).toString('base64url') : "Demostracion-segura-2026";

async function closeDialog(page: Page) {
  await page
    .getByRole("button", { name: "Cerrar diálogo", exact: true })
    .click();
}
async function openTask(page: Page, title: string) {
  await page
    .getByRole("button", { name: `Gestionar tarea ${title}`, exact: true })
    .click();
}
async function changeState(page: Page, status: string) {
  await expect(page.getByRole("button", { name: "Cambiar estado", exact: true })).toBeEnabled();
  await page
    .getByRole("combobox", { name: /^Nuevo estado/ })
    .selectOption(status);
  const response = page.waitForResponse(
    (r) => r.request().method() === "PATCH" && r.url().endsWith("/status") && r.request().postDataJSON().status === status,
  );
  await page
    .getByRole("button", { name: "Cambiar estado", exact: true })
    .click();
  const result = await response;
  await expect(page.getByRole("button", { name: "Cambiar estado", exact: true })).toBeEnabled();
  if(result.ok()) {
    const labels:Record<string,string>={pending:'Pendiente',in_progress:'En desarrollo',blocked:'Bloqueada',delivered:'Entregada'};
    await expect(page.getByText(`Estado actual: ${labels[status]}`,{exact:true})).toBeVisible();
  }
  return result;
}

test("cuentas privadas, dependencias, entrega protegida, progreso y persistencia", async ({
  page,
}) => {
  mkdirSync(evidence, { recursive: true });
  const pageErrors: string[] = [];
  const responses: { method: string; path: string; status: number }[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("response", (response) => {
    if (response.url().includes("/api/"))
      responses.push({
        method: response.request().method(),
        path: new URL(response.url()).pathname,
        status: response.status(),
      });
  });
  await page.goto("/");
  await expect(page).toHaveTitle(/TechTask/);
  await page.getByRole("button", { name: "Crear cuenta", exact: true }).click();
  await page
    .getByLabel("Correo electrónico", { exact: true })
    .fill(`demo-${Date.now()}@example.test`);
  await page.getByLabel("Contraseña", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Registrarme", exact: true }).click();
  await page
    .getByRole("button", { name: "Nuevo proyecto", exact: true })
    .click();
  await page
    .getByLabel("Nombre del proyecto", { exact: true })
    .fill("Proyecto técnico de Redes");
  await page
    .getByLabel("Descripción del proyecto", { exact: true })
    .fill("Demostración académica con datos ficticios.");
  await page.screenshot({
    path: `${evidence}/10-creacion-proyecto.png`,
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Crear proyecto", exact: true })
    .click();
  await expect(
    page.getByRole("button", {
      name: "Abrir proyecto Proyecto técnico de Redes",
      exact: true,
    }),
  ).toBeVisible();
  await page.screenshot({
    path: `${evidence}/01-proyectos.png`,
    fullPage: true,
  });
  await page
    .getByRole("button", {
      name: "Abrir proyecto Proyecto técnico de Redes",
      exact: true,
    })
    .click();
  for (const title of ["Diseñar topología", "Entregar TP de Redes"]) {
    await page
      .getByRole("button", { name: "Nueva tarea", exact: true })
      .click();
    await page.getByRole("textbox", { name: /^Título \*/ }).fill(title);
    await page.getByLabel("Materia *", { exact: true }).fill("Redes");
    if (title === "Diseñar topología") {
      await page.getByRole("textbox", { name: /^Título \*/ }).fill("ab");
      const rejected = page.waitForResponse(
        (r) => r.request().method() === "POST" && r.url().endsWith("/tasks"),
      );
      await page
        .getByRole("button", { name: "Guardar tarea", exact: true })
        .click();
      expect((await rejected).status()).toBe(400);
      await expect(page.getByRole("alert")).toContainText(/3 y 60/);
      await page.screenshot({
        path: `${evidence}/08-validacion.png`,
        fullPage: true,
      });
      await page.getByRole("textbox", { name: /^Título \*/ }).fill(title);
    }
    await page
      .getByLabel("Descripción", { exact: true })
      .fill("Datos de prueba sin información personal.");
    if (title.startsWith("Entregar"))
      await page
        .getByRole("checkbox", { name: "Marcar como favorita", exact: true })
        .check();
    await page.screenshot({
      path: `${evidence}/02-formulario-tarea.png`,
      fullPage: true,
    });
    const created = page.waitForResponse(
      (r) => r.request().method() === "POST" && r.url().endsWith("/tasks"),
    );
    await page
      .getByRole("button", { name: "Guardar tarea", exact: true })
      .click();
    expect((await created).status()).toBe(201);
    await expect(
      page.getByRole("heading", { name: title, exact: true }),
    ).toBeVisible();
  }
  await openTask(page, "Entregar TP de Redes");
  await page
    .getByRole("combobox", { name: /^Tarea requerida/ })
    .selectOption({ label: "Diseñar topología" });
  const linked = page.waitForResponse(r=>r.request().method()==='POST'&&r.url().endsWith('/dependencies'));
  await page
    .getByRole("button", { name: "Agregar dependencia", exact: true })
    .click();
  expect((await linked).status()).toBe(200);
  await expect(page.getByRole('button',{name:'Quitar dependencia Diseñar topología',exact:true})).toBeVisible();
  expect((await changeState(page, "in_progress")).status()).toBe(200);
  expect((await changeState(page, "delivered")).status()).toBe(409);
  await expect(page.getByRole("alert")).toBeVisible();
  await page.screenshot({
    path: `${evidence}/03-entrega-bloqueada.png`,
    fullPage: true,
  });
  await closeDialog(page);
  await openTask(page, "Diseñar topología");
  expect((await changeState(page, "in_progress")).status()).toBe(200);
  expect((await changeState(page, "delivered")).status()).toBe(200);
  await closeDialog(page);
  await openTask(page, "Entregar TP de Redes");
  expect((await changeState(page, "delivered")).status()).toBe(200);
  await expect(
    page.getByRole("heading", { name: "Historial de estados", exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: `${evidence}/04-historial.png`,
    fullPage: true,
  });
  await closeDialog(page);
  await expect(
    page
      .getByRole("region", { name: "Progreso del proyecto" })
      .locator("strong"),
  ).toHaveText("100%");
  await page.screenshot({
    path: `${evidence}/05-progreso.png`,
    fullPage: true,
  });
  await page.reload();
  // Project selection may be kept in URL or reset to dashboard; either way data must reload from API.
  const projectButton = page.getByRole("button", {
    name: "Abrir proyecto Proyecto técnico de Redes",
    exact: true,
  });
  if (await projectButton.isVisible()) await projectButton.click();
  await expect(
    page.getByRole("heading", { name: "Entregar TP de Redes", exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: `${evidence}/06-persistencia.png`,
    fullPage: true,
  });
  const apiPage = await page.context().newPage();
  const apiResponse = await apiPage.goto("/api/tasks");
  expect(apiResponse?.status()).toBe(200);
  await expect(apiPage.locator("body")).toContainText("Entregar TP de Redes");
  const prettyPrint = apiPage.getByRole("checkbox");
  if (await prettyPrint.count()) await prettyPrint.check();
  writeFileSync(
    `${evidence}/api-lectura.json`,
    JSON.stringify(
      {
        method: "GET",
        url: apiResponse!.url(),
        status: apiResponse!.status(),
        response: await apiResponse!.json(),
      },
      null,
      2,
    ),
  );
  await apiPage.screenshot({ path: `${evidence}/09-api.png`, fullPage: true });
  await apiPage.close();
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({ path: `${evidence}/07-mobile.png`, fullPage: true });
  await page
    .getByRole("button", { name: "Cerrar sesión", exact: true })
    .click();
  await expect(
    page.getByLabel("Correo electrónico", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Crear cuenta", exact: true }).click();
  await page
    .getByLabel("Correo electrónico", { exact: true })
    .fill(`otra-${Date.now()}@example.test`);
  await page.getByLabel("Contraseña", { exact: true }).fill(password);
  const isolatedProjects = page.waitForResponse(
    (r) => r.request().method() === "GET" && r.url().endsWith("/api/projects"),
  );
  await page.getByRole("button", { name: "Registrarme", exact: true }).click();
  const privateList = await isolatedProjects;
  expect(privateList.status()).toBe(200);
  expect((await privateList.json()).data).toEqual([]);
  await expect(
    page.getByRole("button", { name: "Nuevo proyecto", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", {
      name: "Abrir proyecto Proyecto técnico de Redes",
      exact: true,
    }),
  ).toHaveCount(0);
  expect(pageErrors).toEqual([]);
  writeFileSync(
    `${evidence}/navegador.json`,
    JSON.stringify(
      {
        viewportDesktop: "1600x1050",
        viewportMobile: "390x844",
        browser: "Edge local / Chromium CI",
        pageErrors,
        responses,
        expectedNegativeResponse: "409 en entrega con dependencia pendiente",
      },
      null,
      2,
    ),
  );
});

import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
const browser = await chromium.launch({ channel: "msedge", headless: true });
const page = await browser.newPage({ viewport: { width: 1600, height: 1050 } });
const dir = "docs/evidencias";
mkdirSync(dir, { recursive: true });
const results = [];
try {
  const url = "https://github.com/feghi0/TechTask/actions/runs/43985660035";
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page
    .getByText("TechTask verification", { exact: false })
    .first()
    .waitFor({ timeout: 20000 });
  results.push({
    url: page.url(),
    title: await page.title(),
    text: (await page.locator("body").innerText()).slice(0, 12000),
  });
  await page.screenshot({ path: `${dir}/11-ci-github.png`, fullPage: true });
  await page.goto("https://techtask-generacion-t.onrender.com", {
    waitUntil: "networkidle",
    timeout: 60000,
  });
  await page.getByRole("button", { name: "Ingresar", exact: true }).waitFor();
  await page.screenshot({
    path: `${dir}/publicacion/12-acceso-publico.png`,
    fullPage: true,
  });
  results.push({
    url: page.url(),
    title: await page.title(),
    loginVisible: true,
  });
} finally {
  writeFileSync(
    `${dir}/captura-ci-publica.json`,
    JSON.stringify(results, null, 2),
  );
  await browser.close();
}

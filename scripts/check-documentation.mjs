// Comprueba enlaces locales y cobertura documental de rutas, sin acceder a datos ni red.
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { resolve, dirname, relative } from "node:path";
const root = process.cwd();
const ignored = new Set([
  ".git",
  "node_modules",
  "dist",
  "data",
  "test-results",
  "playwright-report",
]);
const documents = [];
function visit(directory) {
  for (const item of readdirSync(directory, { withFileTypes: true })) {
    if (ignored.has(item.name)) continue;
    const path = resolve(directory, item.name);
    if (item.isDirectory()) visit(path);
    else if (item.name.endsWith(".md")) documents.push(path);
  }
}
visit(root);
const failures = [];
let localLinks = 0;
for (const file of documents) {
  const content = readFileSync(file, "utf8");
  for (const match of content.matchAll(/!?\[[^\]]*\]\(([^)]+)\)/g)) {
    const target = match[1].trim().replace(/^<|>$/g, "");
    if (
      !target ||
      target.startsWith("#") ||
      /^[a-z][a-z0-9+.-]*:/i.test(target)
    )
      continue;
    const path = decodeURIComponent(target.split("#")[0].split("?")[0]);
    if (!path) continue;
    localLinks++;
    const destination = path.startsWith("/")
      ? resolve(root, "." + path)
      : resolve(dirname(file), path);
    if (!existsSync(destination))
      failures.push(`${relative(root, file)}: enlace inexistente ${target}`);
  }
}
const source = readFileSync(resolve(root, "backend/src/app.ts"), "utf8");
const reference = readFileSync(
  resolve(root, "docs/manuales/04-api-rest.md"),
  "utf8",
);
const routes = [
  ...source.matchAll(/app\.(get|post|patch|delete)\(\s*["'](\/api[^"']*)["']/g),
];
for (const [, method, path] of routes) {
  const documented = `| ${method.toUpperCase()} \`${path.slice(4)}\` |`;
  if (!reference.includes(documented))
    failures.push(`API sin documentar: ${method.toUpperCase()} ${path}`);
}
console.log(
  `Documentos Markdown: ${documents.length}. Enlaces locales comprobados: ${localLinks}. Rutas HTTP documentadas: ${routes.length}.`,
);
if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else
  console.log(
    "Sin enlaces locales rotos ni rutas HTTP explícitas omitidas en el manual. No verifica URLs externas ni anclas.",
  );

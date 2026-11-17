import { defineConfig } from "@playwright/test";
const runId = `${Date.now()}`;
const publicUrl = process.env.TT_PUBLIC_URL;
export default defineConfig({
  testDir: "tests/e2e",
  workers: 1,
  timeout: 180000,
  expect: { timeout: 10000 },
  use: {
    actionTimeout: 15000,
    baseURL: publicUrl ?? "http://127.0.0.1:5173",
    browserName: "chromium",
    ...(process.env.CI ? {} : { channel: "msedge" }),
    viewport: { width: 1600, height: 1050 },
    trace: "retain-on-failure",
  },
  webServer: publicUrl ? undefined : [
    {
      command: "npm run dev:api",
      url: "http://127.0.0.1:3001/api/health",
      reuseExistingServer: false,
      env: {
        NODE_ENV: "test",
        PGLITE_DATA_DIR: `data/e2e-final-${runId}`,
        FRONTEND_ORIGIN: "http://127.0.0.1:5173",
      },
      timeout: 60000,
    },
    {
      command: "npm run dev:web",
      url: "http://127.0.0.1:5173",
      reuseExistingServer: false,
      timeout: 60000,
    },
  ],
});

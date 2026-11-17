import { expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../src/app";
it("registers a private account and refuses anonymous project access", async () => {
  const context = await createApp({ dataDir: "memory://" });
  try {
    await request(context.app).get("/api/projects").expect(401);
    const result = await request(context.app)
      .post("/api/auth/register")
      .send({ email: "student@example.test", password: "Demostracion-2026!" })
      .expect(201);
    expect(result.body.data.email).toBe("student@example.test");
    expect(result.headers["set-cookie"]).toBeDefined();
  } finally {
    await context.close();
  }
});

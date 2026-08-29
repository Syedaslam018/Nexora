import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { app, resetDatabase, registerAndLogin } from "./helpers.js";

describe("Auth API", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it("registers a new account and returns an access token + user", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "newuser@example.com",
      password: "Password123",
      firstName: "New",
      lastName: "User",
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe("newuser@example.com");
    expect(res.body.data.accessToken).toEqual(expect.any(String));
    // The refresh token must never appear in the JSON body — it's HTTP-only cookie only.
    expect(res.body.data.refreshToken).toBeUndefined();
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  it("rejects registering the same email twice", async () => {
    await registerAndLogin({ email: "dupe@example.com" });
    const res = await request(app).post("/api/auth/register").send({
      email: "dupe@example.com",
      password: "Password123",
      firstName: "Dupe",
      lastName: "User",
    });
    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it("rejects registration with a weak password", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "weak@example.com",
      password: "weak",
      firstName: "Weak",
      lastName: "Password",
    });
    expect(res.status).toBe(400);
  });

  it("logs in with correct credentials", async () => {
    const { email, password } = await registerAndLogin({ email: "logintest@example.com" });
    const res = await request(app).post("/api/auth/login").send({ email, password });
    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe(email);
  });

  it("rejects login with the wrong password", async () => {
    const { email } = await registerAndLogin({ email: "wrongpass@example.com" });
    const res = await request(app).post("/api/auth/login").send({ email, password: "TotallyWrong1" });
    expect(res.status).toBe(401);
  });

  it("returns the current user from /me when authenticated", async () => {
    const { accessToken, email } = await registerAndLogin();
    const res = await request(app).get("/api/auth/me").set("Authorization", `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe(email);
  });

  it("rejects /me with no token", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });

  it("rejects /me with a garbage token", async () => {
    const res = await request(app).get("/api/auth/me").set("Authorization", "Bearer not-a-real-token");
    expect(res.status).toBe(401);
  });
});

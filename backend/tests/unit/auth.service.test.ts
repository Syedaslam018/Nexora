import { describe, it, expect, vi, beforeEach } from "vitest";

const mocks = vi.hoisted(() => ({
  findByEmail: vi.fn(),
  createUser: vi.fn(),
  sessionCreate: vi.fn(),
  prismaSessionUpdate: vi.fn(),
  hashPassword: vi.fn(),
  verifyPassword: vi.fn(),
  signAccessToken: vi.fn(),
  signRefreshToken: vi.fn(),
  generateOpaqueToken: vi.fn(),
  hashOpaqueToken: vi.fn(),
  emailVerificationCreate: vi.fn(),
  sendWelcomeEmail: vi.fn(),
  sendVerificationEmail: vi.fn(),
}));

vi.mock("../../src/repositories/user.repository.js", () => ({
  userRepository: { findByEmail: mocks.findByEmail, create: mocks.createUser },
}));
vi.mock("../../src/repositories/session.repository.js", () => ({
  sessionRepository: { create: mocks.sessionCreate },
}));
vi.mock("../../src/repositories/passwordReset.repository.js", () => ({
  passwordResetRepository: {},
}));
vi.mock("../../src/repositories/emailVerification.repository.js", () => ({
  emailVerificationRepository: { create: mocks.emailVerificationCreate },
}));
vi.mock("../../src/config/db.js", () => ({
  prisma: { session: { update: mocks.prismaSessionUpdate } },
}));
vi.mock("../../src/utils/password.js", () => ({
  hashPassword: mocks.hashPassword,
  verifyPassword: mocks.verifyPassword,
}));
vi.mock("../../src/utils/tokens.js", () => ({
  signAccessToken: mocks.signAccessToken,
  signRefreshToken: mocks.signRefreshToken,
  generateOpaqueToken: mocks.generateOpaqueToken,
  hashOpaqueToken: mocks.hashOpaqueToken,
  verifyRefreshToken: vi.fn(),
}));
vi.mock("../../src/services/email.service.js", () => ({
  sendWelcomeEmail: mocks.sendWelcomeEmail,
  sendVerificationEmail: mocks.sendVerificationEmail,
  sendPasswordResetEmail: vi.fn(),
}));

const { authService } = await import("../../src/services/auth.service.js");

const FAKE_USER = {
  id: "user-1",
  email: "ada@example.com",
  passwordHash: "hashed",
  firstName: "Ada",
  lastName: "Lovelace",
  role: "CUSTOMER" as const,
  isActive: true,
  isEmailVerified: false,
};

function stubIssueTokens() {
  mocks.sessionCreate.mockResolvedValue({ id: "session-1" });
  mocks.signRefreshToken.mockReturnValue("refresh-jwt");
  mocks.signAccessToken.mockReturnValue("access-jwt");
  mocks.hashOpaqueToken.mockReturnValue("hashed-token");
  mocks.prismaSessionUpdate.mockResolvedValue({});
  mocks.generateOpaqueToken.mockReturnValue({ token: "raw-token", tokenHash: "hash" });
}

describe("authService.register", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    stubIssueTokens();
  });

  it("rejects registration with an email that's already in use", async () => {
    mocks.findByEmail.mockResolvedValue(FAKE_USER);
    await expect(
      authService.register(
        { email: "ada@example.com", password: "Password1", firstName: "Ada", lastName: "L" },
        {},
      ),
    ).rejects.toMatchObject({ statusCode: 409 });
    expect(mocks.createUser).not.toHaveBeenCalled();
  });

  it("hashes the password and creates the user on success", async () => {
    mocks.findByEmail.mockResolvedValue(null);
    mocks.hashPassword.mockResolvedValue("hashed-password");
    mocks.createUser.mockResolvedValue(FAKE_USER);
    mocks.sendWelcomeEmail.mockResolvedValue(undefined);
    mocks.sendVerificationEmail.mockResolvedValue(undefined);

    const result = await authService.register(
      { email: "ada@example.com", password: "Password1", firstName: "Ada", lastName: "Lovelace" },
      {},
    );

    expect(mocks.hashPassword).toHaveBeenCalledWith("Password1");
    expect(mocks.createUser).toHaveBeenCalledWith(
      expect.objectContaining({ email: "ada@example.com", passwordHash: "hashed-password" }),
    );
    expect(result.user.email).toBe("ada@example.com");
    expect(result.accessToken).toBe("access-jwt");
    expect(result.refreshToken).toBe("refresh-jwt");
  });

  it("never puts the plaintext password on the created user", async () => {
    mocks.findByEmail.mockResolvedValue(null);
    mocks.hashPassword.mockResolvedValue("hashed-password");
    mocks.createUser.mockResolvedValue(FAKE_USER);

    await authService.register(
      { email: "ada@example.com", password: "Password1", firstName: "Ada", lastName: "Lovelace" },
      {},
    );

    const createCallArg = mocks.createUser.mock.calls[0]![0];
    expect(createCallArg.password).toBeUndefined();
    expect(createCallArg.passwordHash).toBe("hashed-password");
  });
});

describe("authService.login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    stubIssueTokens();
  });

  it("rejects when no account exists for the email", async () => {
    mocks.findByEmail.mockResolvedValue(null);
    await expect(
      authService.login({ email: "nobody@example.com", password: "whatever" }, {}),
    ).rejects.toMatchObject({ statusCode: 401, message: expect.stringContaining("Invalid email or password") });
  });

  it("rejects with the same message for a wrong password (no account-enumeration leak)", async () => {
    mocks.findByEmail.mockResolvedValue(FAKE_USER);
    mocks.verifyPassword.mockResolvedValue(false);
    await expect(
      authService.login({ email: FAKE_USER.email, password: "wrong" }, {}),
    ).rejects.toMatchObject({ statusCode: 401, message: expect.stringContaining("Invalid email or password") });
  });

  it("rejects a disabled account even with the correct password", async () => {
    mocks.findByEmail.mockResolvedValue({ ...FAKE_USER, isActive: false });
    await expect(authService.login({ email: FAKE_USER.email, password: "Password1" }, {})).rejects.toMatchObject({
      statusCode: 403,
    });
    // Disabled-account check happens before password verification —
    // there's nothing useful to check a password against for a locked-out account.
    expect(mocks.verifyPassword).not.toHaveBeenCalled();
  });

  it("issues tokens on valid credentials", async () => {
    mocks.findByEmail.mockResolvedValue(FAKE_USER);
    mocks.verifyPassword.mockResolvedValue(true);
    const result = await authService.login({ email: FAKE_USER.email, password: "Password1" }, {});
    expect(result.accessToken).toBe("access-jwt");
    expect(result.user.id).toBe(FAKE_USER.id);
  });
});

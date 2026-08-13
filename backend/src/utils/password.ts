import argon2 from "argon2";

/**
 * Argon2id over bcrypt: it's the OWASP-recommended default, resistant to
 * both GPU-cracking and side-channel attacks, and has no 72-byte password
 * truncation quirk to worry about.
 */
export async function hashPassword(plain: string): Promise<string> {
  return argon2.hash(plain, { type: argon2.argon2id });
}

export async function verifyPassword(hash: string, plain: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, plain);
  } catch {
    // Malformed hash (shouldn't happen, but never let a hashing error look
    // like "correct password") — treat as a failed verification.
    return false;
  }
}

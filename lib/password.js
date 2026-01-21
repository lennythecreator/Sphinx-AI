import bcrypt from "bcryptjs"

const SALT_ROUNDS = 10

export function isBcryptHash(value) {
  return typeof value === "string" && /^\$2[aby]\$/.test(value)
}

export async function hashPassword(plainText) {
  return bcrypt.hash(plainText, SALT_ROUNDS)
}

export async function verifyPassword(plainText, hash) {
  return bcrypt.compare(plainText, hash)
}

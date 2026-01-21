import jwt from "jsonwebtoken"

export function getJwtSecret() {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error("JWT_SECRET is not set")
  }
  return secret
}

export function signJwt(payload, options = {}) {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "7d", ...options })
}

export function verifyJwt(token) {
  return jwt.verify(token, getJwtSecret())
}

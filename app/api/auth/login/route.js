import { NextResponse } from "next/server"
import { MongoConnection } from "@/app/api/db/mongodb"
import User from "@/app/models/user"
import { isBcryptHash, verifyPassword, hashPassword } from "@/lib/password"
import { signJwt } from "@/lib/jwt"

export async function POST(req) {
  try {
    const body = await req.json()
    const { email, password } = body || {}

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      )
    }

    await MongoConnection()

    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user || !user.password) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 })
    }

    let isValid = false
    if (isBcryptHash(user.password)) {
      isValid = await verifyPassword(password, user.password)
    } else {
      isValid = password === user.password
      if (isValid) {
        user.password = await hashPassword(password)
        await user.save()
      }
    }

    if (!isValid) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 })
    }

    const token = signJwt({
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    })

    return NextResponse.json({
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Error in POST /api/auth/login:", error)
    return NextResponse.json(
      { error: "Failed to log in." },
      { status: 500 }
    )
  }
}

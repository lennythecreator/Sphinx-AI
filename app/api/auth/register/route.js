import { NextResponse } from "next/server"
import { MongoConnection } from "@/app/api/db/mongodb"
import User from "@/app/models/user"
import { hashPassword } from "@/lib/password"

export async function POST(req) {
  try {
    const body = await req.json()
    const { email, password, name, major, grad_year } = body || {}

    if (!email || !password || !name || !major || !grad_year) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      )
    }
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      )
    }

    const gradYearNumber = Number(grad_year)
    if (!Number.isFinite(gradYearNumber)) {
      return NextResponse.json(
        { error: "Graduation year must be a number." },
        { status: 400 }
      )
    }

    await MongoConnection()

    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists." },
        { status: 409 }
      )
    }

    const passwordHash = await hashPassword(password)
    const user = await User.create({
      email: email.toLowerCase(),
      password: passwordHash,
      name,
      major,
      grad_year: gradYearNumber,
    })

    return NextResponse.json({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
    })
  } catch (error) {
    console.error("Error in POST /api/auth/register:", error)
    return NextResponse.json(
      { error: "Failed to register user." },
      { status: 500 }
    )
  }
}

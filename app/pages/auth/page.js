"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const emptyLogin = { email: "", password: "" }
const emptyRegister = {
  name: "",
  email: "",
  password: "",
  major: "",
  grad_year: "",
}

export default function AuthPage() {
  const router = useRouter()
  const [loginForm, setLoginForm] = useState(emptyLogin)
  const [registerForm, setRegisterForm] = useState(emptyRegister)
  const [status, setStatus] = useState("")
  const [token, setToken] = useState("")

  useEffect(() => {
    const stored = localStorage.getItem("authToken")
    if (stored) {
      setToken(stored)
      router.replace("/pages/new")
    }
  }, [router])

  const loginWithCredentials = async (email, password) => {
    setStatus("Signing in...")

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()
    if (!response.ok) {
      setStatus(data.error || "Login failed.")
      return false
    }

    localStorage.setItem("authToken", data.token)
    setToken(data.token)
    setStatus("Signed in.")
    setLoginForm(emptyLogin)
    router.push("/pages/new")
    return true
  }

  const handleLogin = async (event) => {
    event.preventDefault()
    await loginWithCredentials(loginForm.email, loginForm.password)
  }

  const handleRegister = async (event) => {
    event.preventDefault()
    setStatus("Creating account...")

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(registerForm),
    })

    const data = await response.json()
    if (!response.ok) {
      setStatus(data.error || "Registration failed.")
      return
    }

    const { email, password } = registerForm
    setRegisterForm(emptyRegister)
    const loggedIn = await loginWithCredentials(email, password)
    if (!loggedIn) {
      setStatus("Account created. Please sign in.")
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("authToken")
    setToken("")
    setStatus("Signed out.")
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <header className="h-16 flex items-center justify-between px-6 border-b bg-white">
        <Link href="/" className="font-semibold text-zinc-900">
          Sphinx-AI
        </Link>
        <Link href="/pages/new" className="text-sm text-zinc-600 hover:text-zinc-900">
          Back to chat
        </Link>
      </header>

      <main className="flex-1 w-full max-w-5xl mx-auto px-6 py-10">
        <div className="mb-6 text-sm text-zinc-600">
          {token ? "You are signed in." : "Sign in or create an account."}
        </div>
        {status && (
          <div className="mb-6 rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-700">
            {status}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-900">Sign in</h2>
            <p className="text-xs text-zinc-500 mt-1">Use your email and password.</p>
            <form className="mt-4 space-y-3" onSubmit={handleLogin}>
              <input
                type="email"
                value={loginForm.email}
                onChange={(event) => setLoginForm({ ...loginForm, email: event.target.value })}
                placeholder="Email"
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                required
              />
              <input
                type="password"
                value={loginForm.password}
                onChange={(event) => setLoginForm({ ...loginForm, password: event.target.value })}
                placeholder="Password"
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                required
              />
              <div className="flex items-center gap-3">
                <Button type="submit" className="rounded-full">
                  Sign in
                </Button>
                {token && (
                  <Button type="button" variant="outline" className="rounded-full" onClick={handleLogout}>
                    Sign out
                  </Button>
                )}
              </div>
            </form>
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-900">Create account</h2>
            <p className="text-xs text-zinc-500 mt-1">We store your profile in MongoDB.</p>
            <form className="mt-4 space-y-3" onSubmit={handleRegister}>
              <input
                type="text"
                value={registerForm.name}
                onChange={(event) => setRegisterForm({ ...registerForm, name: event.target.value })}
                placeholder="Full name"
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                required
              />
              <input
                type="email"
                value={registerForm.email}
                onChange={(event) => setRegisterForm({ ...registerForm, email: event.target.value })}
                placeholder="Email"
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                required
              />
              <input
                type="password"
                value={registerForm.password}
                onChange={(event) => setRegisterForm({ ...registerForm, password: event.target.value })}
                placeholder="Password"
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                required
              />
              <input
                type="text"
                value={registerForm.major}
                onChange={(event) => setRegisterForm({ ...registerForm, major: event.target.value })}
                placeholder="Major"
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                required
              />
              <input
                type="number"
                value={registerForm.grad_year}
                onChange={(event) => setRegisterForm({ ...registerForm, grad_year: event.target.value })}
                placeholder="Graduation year"
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                required
              />
              <Button type="submit" className="rounded-full">
                Create account
              </Button>
            </form>
          </section>
        </div>
      </main>
    </div>
  )
}

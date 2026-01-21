"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useChat } from "ai/react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { motion } from "motion/react"
import { Sparkles, Target, Users, Compass, Layers, Clock, CheckCircle2 } from "lucide-react"
import Navbar from "@/components/ui/Navbar"
import { Button } from "@/components/ui/button"

const styleOptions = [
  "Non-technical",
  "Lightly technical",
  "Technical",
  "Either",
]

const impactOptions = [
  "Community impact",
  "Portfolio showcase",
  "Research exploration",
  "Business idea",
  "Creative expression",
  "Service improvement",
]

const formatOptions = [
  "Campaign",
  "Workshop",
  "Research report",
  "Podcast or video",
  "Event or exhibit",
  "Product or service",
  "Policy brief",
  "Digital experience",
]

const timelineOptions = [
  "2-3 weeks",
  "4-6 weeks",
  "8-10 weeks",
  "Semester-long",
]

const audienceOptions = [
  "Campus community",
  "Local community",
  "Online audience",
  "Industry mentors",
  "Future employers",
  "Personal growth",
]

const starterIdeas = [
  {
    title: "Community Storytelling",
    description: "Collect stories and turn them into a public showcase.",
    prefill: {
      style: "Non-technical",
      impact: "Community impact",
      format: "Event or exhibit",
      timeline: "4-6 weeks",
      audience: "Local community",
    },
    notes: "Focus on interviews, narratives, and a public sharing moment.",
  },
  {
    title: "Campus Improvement Sprint",
    description: "Solve one practical problem students face weekly.",
    prefill: {
      style: "Either",
      impact: "Service improvement",
      format: "Product or service",
      timeline: "4-6 weeks",
      audience: "Campus community",
    },
    notes: "Include a needs survey and a simple prototype or pilot.",
  },
  {
    title: "Career Readiness Guide",
    description: "Build a guide or toolkit for your major.",
    prefill: {
      style: "Non-technical",
      impact: "Portfolio showcase",
      format: "Research report",
      timeline: "2-3 weeks",
      audience: "Future employers",
    },
    notes: "Interview professionals and create a practical playbook.",
  },
  {
    title: "Cause Awareness Campaign",
    description: "Design a campaign for a cause you care about.",
    prefill: {
      style: "Non-technical",
      impact: "Community impact",
      format: "Campaign",
      timeline: "4-6 weeks",
      audience: "Online audience",
    },
    notes: "Plan content, partnerships, and measurable goals.",
  },
]

const initialBrief = {
  major: "",
  goal: "",
  audience: "",
  style: "",
  impact: "",
  format: "",
  timeline: "",
}

function Chip({ label, isActive, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
        isActive
          ? "border-zinc-900 bg-zinc-900 text-white"
          : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400"
      }`}
    >
      {label}
    </button>
  )
}

export default function ProjectsPage() {
  const router = useRouter()
  const [isAllowed, setIsAllowed] = useState(false)
  const [brief, setBrief] = useState(initialBrief)
  const [notes, setNotes] = useState("")

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    setMessages,
    append,
    isLoading,
    stop,
  } = useChat({
    api: "/api/projects",
  })

  useEffect(() => {
    const token = localStorage.getItem("authToken")
    if (!token) {
      router.replace("/pages/auth")
      return
    }
    setIsAllowed(true)
  }, [router])

  const isComplete = useMemo(() => {
    const last = messages[messages.length - 1]
    if (!last || last.role !== "assistant") return false
    return last.content?.includes("Project plan complete.")
  }, [messages])

  const stageLabel = useMemo(() => {
    if (messages.length === 0) return "Intake"
    if (isComplete) return "Plan ready"
    if (isLoading) return "Council in session"
    return "Council reviewing"
  }, [messages.length, isComplete, isLoading])

  const markdownComponents = useMemo(() => ({
    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
    ul: ({ children }) => <ul className="mb-2 list-disc pl-5">{children}</ul>,
    ol: ({ children }) => <ol className="mb-2 list-decimal pl-5">{children}</ol>,
    li: ({ children }) => <li className="mb-1 last:mb-0">{children}</li>,
    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
    code: ({ inline, children }) => (
      inline ? (
        <code className="rounded bg-zinc-100 px-1 py-0.5 text-[0.85em] text-zinc-900">
          {children}
        </code>
      ) : (
        <code className="block rounded-lg bg-zinc-900 px-3 py-2 text-[0.85em] text-zinc-100 whitespace-pre-wrap">
          {children}
        </code>
      )
    ),
    pre: ({ children }) => <pre className="mb-2 overflow-x-auto">{children}</pre>,
  }), [])

  const updateBrief = (field, value) => {
    setBrief(prev => ({ ...prev, [field]: value }))
  }

  const handleStarter = (starter) => {
    setBrief(prev => ({ ...prev, ...starter.prefill }))
    setNotes(starter.notes)
  }

  const buildPrompt = () => {
    const parts = []
    if (brief.major) parts.push(`Major: ${brief.major}.`)
    if (brief.goal) parts.push(`Goal: ${brief.goal}.`)
    if (brief.style) parts.push(`Comfort level: ${brief.style}.`)
    if (brief.impact) parts.push(`Impact focus: ${brief.impact}.`)
    if (brief.format) parts.push(`Format: ${brief.format}.`)
    if (brief.timeline) parts.push(`Timeline: ${brief.timeline}.`)
    if (brief.audience) parts.push(`Audience: ${brief.audience}.`)
    if (notes) parts.push(`Notes: ${notes}.`)

    if (parts.length === 0) {
      return "I want a project idea that fits my major and interests."
    }

    return `I want a project plan that fits my major and goals. ${parts.join(" ")}`
  }

  const briefReady = useMemo(() => {
    return Object.values(brief).some(value => value) || notes.trim().length > 0
  }, [brief, notes])

  const sendBrief = async () => {
    const prompt = buildPrompt()
    await append({ role: "user", content: prompt })
  }

  const resetProject = () => {
    setMessages([])
    setBrief(initialBrief)
    setNotes("")
  }

  if (!isAllowed) {
    return null
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-50 via-emerald-50 to-sky-50">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute -left-32 top-20 h-72 w-72 rounded-full bg-amber-200/40 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-10 h-80 w-80 rounded-full bg-sky-200/40 blur-3xl" />
        <Navbar />

        <div className="relative z-10 max-w-6xl mx-auto px-6 pb-10 pt-8">
          <motion.div
            className="rounded-3xl border border-white/60 bg-white/70 p-6 shadow-xl backdrop-blur"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-emerald-700">Project Studio</p>
                <h1 className="text-3xl md:text-4xl font-semibold text-zinc-900">
                  Build a project that fits any major
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-zinc-600">
                  Share your goals and comfort level. The advisor council will shape a project that
                  can be technical, non-technical, or a mix of both.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs text-emerald-700">
                  <Sparkles className="h-4 w-4" />
                  All majors welcome
                </div>
                <div className="flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-xs text-sky-700">
                  <Compass className="h-4 w-4" />
                  Advisor roundtable
                </div>
              </div>
            </div>
          </motion.div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_1.6fr]">
            <motion.aside
              className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-xl backdrop-blur"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.45 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-zinc-900">Project Compass</h2>
                  <p className="text-xs text-zinc-500">Set the direction. Keep it simple or detailed.</p>
                </div>
                <div className="rounded-full bg-zinc-900/90 px-3 py-1 text-xs text-white">{stageLabel}</div>
              </div>

              <div className="mt-5 grid gap-4">
                <div>
                  <label className="text-xs font-semibold text-zinc-700">Your major or focus</label>
                  <input
                    value={brief.major}
                    onChange={(event) => updateBrief("major", event.target.value)}
                    placeholder="Example: Nursing, Marketing, History"
                    className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-700">What do you want to achieve?</label>
                  <input
                    value={brief.goal}
                    onChange={(event) => updateBrief("goal", event.target.value)}
                    placeholder="Example: improve community health awareness"
                    className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-zinc-700">
                    <Layers className="h-4 w-4" />
                    Comfort level
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {styleOptions.map((option) => (
                      <Chip
                        key={option}
                        label={option}
                        isActive={brief.style === option}
                        onClick={() => updateBrief("style", option)}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-zinc-700">
                    <Target className="h-4 w-4" />
                    Impact focus
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {impactOptions.map((option) => (
                      <Chip
                        key={option}
                        label={option}
                        isActive={brief.impact === option}
                        onClick={() => updateBrief("impact", option)}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-zinc-700">
                    <CheckCircle2 className="h-4 w-4" />
                    Format
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {formatOptions.map((option) => (
                      <Chip
                        key={option}
                        label={option}
                        isActive={brief.format === option}
                        onClick={() => updateBrief("format", option)}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-zinc-700">
                    <Clock className="h-4 w-4" />
                    Timeline
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {timelineOptions.map((option) => (
                      <Chip
                        key={option}
                        label={option}
                        isActive={brief.timeline === option}
                        onClick={() => updateBrief("timeline", option)}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-zinc-700">
                    <Users className="h-4 w-4" />
                    Audience
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {audienceOptions.map((option) => (
                      <Chip
                        key={option}
                        label={option}
                        isActive={brief.audience === option}
                        onClick={() => updateBrief("audience", option)}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-700">Extra notes</label>
                  <textarea
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    placeholder="Add any context, interests, or constraints."
                    className="mt-2 min-h-[90px] w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm"
                  />
                </div>

                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 p-4">
                  <p className="text-xs font-semibold text-emerald-800">Quick starts for all majors</p>
                  <div className="mt-3 grid gap-3">
                    {starterIdeas.map((starter) => (
                      <button
                        key={starter.title}
                        type="button"
                        onClick={() => handleStarter(starter)}
                        className="rounded-xl border border-emerald-100 bg-white px-3 py-2 text-left text-xs text-zinc-700 hover:border-emerald-300"
                      >
                        <p className="font-semibold text-zinc-900">{starter.title}</p>
                        <p>{starter.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    type="button"
                    className="rounded-full bg-zinc-900 hover:bg-zinc-800"
                    onClick={sendBrief}
                    disabled={!briefReady || isLoading || isComplete}
                  >
                    Send to council
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full"
                    onClick={resetProject}
                  >
                    Reset brief
                  </Button>
                </div>
              </div>
            </motion.aside>

            <motion.section
              className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-xl backdrop-blur"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.45 }}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-zinc-900">Council Room</h2>
                  <p className="text-xs text-zinc-500">Six advisors collaborate on your project plan.</p>
                </div>
                <div className="flex flex-wrap gap-2 text-[11px]">
                  {["Software", "Project", "Security", "Data", "ML", "TPM"].map((label) => (
                    <span key={label} className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-zinc-600">
                      {label}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex items-center gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-xs text-zinc-600">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-white">
                  <Compass className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-semibold text-zinc-800">Council status</p>
                  <p>{stageLabel}. Share details to unlock the full project plan.</p>
                </div>
              </div>

              <div className="mt-5 h-[420px] overflow-y-auto rounded-2xl border border-zinc-200 bg-stone-50/30 p-4 space-y-4">
                {messages.length === 0 && (
                  <div className="text-sm text-zinc-500">
                    Example: "I am a communications major who wants a project about community storytelling."
                  </div>
                )}
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${message.role === "user"
                        ? "bg-zinc-900 text-white rounded-br-none"
                        : "bg-white border border-zinc-200 text-zinc-800 rounded-bl-none shadow-sm"
                        }`}
                    >
                      {message.role === "assistant" ? (
                        <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                          {message.content}
                        </ReactMarkdown>
                      ) : (
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    className="flex-1 bg-zinc-100 border-0 rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-zinc-900 focus:outline-none"
                    placeholder="Ask the council a question or add a detail..."
                    value={input}
                    onChange={handleInputChange}
                    disabled={isComplete}
                  />
                  <Button
                    type="submit"
                    className="rounded-full bg-zinc-900 hover:bg-zinc-800"
                    disabled={isLoading || isComplete}
                  >
                    Send
                  </Button>
                  {isLoading && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => stop()}
                      className="rounded-full px-4 text-xs"
                    >
                      Stop
                    </Button>
                  )}
                  {isComplete && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetProject}
                      className="rounded-full px-4 text-xs"
                    >
                      New project
                    </Button>
                  )}
                </div>
                {isComplete && (
                  <p className="text-xs text-zinc-500">
                    Project plan completed. Start a new project to continue.
                  </p>
                )}
              </form>
            </motion.section>
          </div>
        </div>
      </div>
    </main>
  )
}

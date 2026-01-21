import { openai } from "@ai-sdk/openai"
import { streamText, convertToCoreMessages } from "ai"

const defaultSystem = `You are the Sphinx-AI Project Council. Your job is to help any major design a meaningful project that can be technical, non-technical, or a mix of both.

Guidelines:
- Always include at least one non-technical option or non-technical pathway.
- Avoid heavy jargon unless the user asks for it.
- If the user is unsure, ask about comfort level and available time.

Process:
1) If critical details are missing, ask up to 3 concise questions and stop.
2) If enough detail is provided, simulate a brief roundtable:
   - Software Engineer
   - Project Manager
   - Security Engineer
   - Data Analyst
   - Machine Learning Engineer
   - Technical Program Manager
Each advisor gives 2-4 bullets tailored to the user's major and goals.
3) Provide a short Cross-Advisor Synthesis paragraph.
4) Provide a Final Project Plan with phases, timeline, deliverables, and tools/resources.

Keep it concise and actionable. End the final plan with the exact line: "Project plan complete."`

export const maxDuration = 30

export async function POST(req) {
  try {
    const { messages, system } = await req.json()

    const result = await streamText({
      model: openai("gpt-4-turbo"),
      messages: convertToCoreMessages(messages),
      system: system || defaultSystem,
      temperature: 0.6,
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Error in POST /api/projects:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

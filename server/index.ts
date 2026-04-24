import "dotenv/config"
import express from "express"
import cors from "cors"

const app = express()
const port = Number(process.env.PORT || 8787)
const hfModel = "katanemo/Arch-Router-1.5B:hf-inference"

app.use(cors())
app.use(express.json({ limit: "1mb" }))

const hfToken = process.env.HF_TOKEN

if (!hfToken) {
  console.warn("HF_TOKEN is missing. Add it to server/.env before requesting hints.")
}

function buildPrompt(title: string, description: string, question: string) {
  return `
Problem title:
${title}

Problem description:
${String(description).slice(0, 4000)}

User question:
${question}
`
}

function fallbackHint(title: string, description: string, question: string) {
  const text = `${title} ${description} ${question}`.toLowerCase()

  if (text.includes("answer") || text.includes("solution") || text.includes("code")) {
    return "I cannot give the full answer, but I can help you choose the first step. Try naming the brute-force idea first, then look for what repeated work can be stored."
  }

  if (text.includes("two sum") || text.includes("target")) {
    return "Start with the brute-force idea: compare pairs. Then ask what information you wish you already had when you see each number."
  }

  if (text.includes("subarray") || text.includes("substring")) {
    return "Start by deciding what makes a window valid. Then think about what changes when the left or right edge moves."
  }

  if (text.includes("tree")) {
    return "Start by defining what one recursive call should return to its parent. The rest of the traversal usually follows from that."
  }

  return "Start with the simplest brute-force approach. Then identify the repeated work and ask what state could remember it."
}

app.get("/", (_req, res) => {
  res.type("text").send("helpcode API is running. Try /health or POST /api/hint.")
})

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "helpcode-api" })
})

app.post("/api/hint", async (req, res) => {
  try {
    const { title, description, question } = req.body

    if (!title || !description || !question) {
      return res.status(400).json({
        error: "Missing title, description, or question."
      })
    }

    if (!hfToken) {
      return res.status(500).json({
        error: "HF_TOKEN is missing. Add it to server/.env, then restart the server."
      })
    }

    const hfResponse = await fetch("https://router.huggingface.co/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${hfToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: hfModel,
        messages: [
          {
            role: "system",
            content:
              "You are helpcode, a LeetCode hint assistant. Give hints only. Do not provide full code, a complete final solution, or the exact algorithm immediately. If asked for the answer, refuse briefly and give a smaller hint. Keep the hint under 120 words."
          },
          {
            role: "user",
            content: buildPrompt(title, description, question)
          }
        ],
        max_tokens: 180,
        temperature: 0.4
      })
    })

    if (!hfResponse.ok) {
      const details = await hfResponse.text()
      throw new Error(`Hugging Face ${hfResponse.status}: ${details.slice(0, 600)}`)
    }

    const response = await hfResponse.json()
    const hint = response.choices?.[0]?.message?.content?.trim()

    res.json({
      hint:
        hint ||
        "Try identifying the brute-force approach first, then look for repeated work you can avoid."
    })
  } catch (error) {
    console.error(error)

    const message = error instanceof Error ? error.message : String(error)

    res.json({
      hint: `${fallbackHint(req.body?.title || "", req.body?.description || "", req.body?.question || "")}\n\nAI note: Hugging Face failed with: ${message}`
    })
  }
})

app.listen(port, () => {
  console.log(`helpcode API running on http://localhost:${port}`)
})

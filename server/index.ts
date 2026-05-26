import "dotenv/config"
import express from "express"
import cors from "cors"
import { fallbackHint, fetchHintFromHf } from "./lib/hint"

const app = express()
const port = Number(process.env.PORT || 8787)

app.use(cors())
app.use(express.json({ limit: "1mb" }))

const hfToken = process.env.HF_TOKEN

if (!hfToken) {
  console.warn("HF_TOKEN is missing. Add it to server/.env before requesting hints.")
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

    const hint = await fetchHintFromHf(hfToken, title, description, question)

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

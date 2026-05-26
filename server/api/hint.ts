import { fallbackHint, fetchHintFromHf } from "../lib/hint"

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST")
    return res.status(405).json({ error: "Method not allowed." })
  }

  try {
    const { title, description, question } = req.body || {}

    if (!title || !description || !question) {
      return res.status(400).json({
        error: "Missing title, description, or question."
      })
    }

    const hfToken = process.env.HF_TOKEN

    if (!hfToken) {
      return res.status(500).json({
        error: "HF_TOKEN is missing in Vercel environment variables."
      })
    }

    const hint = await fetchHintFromHf(hfToken, title, description, question)

    return res.status(200).json({
      hint:
        hint ||
        "Try identifying the brute-force approach first, then look for repeated work you can avoid."
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)

    return res.status(200).json({
      hint: `${fallbackHint(
        req.body?.title || "",
        req.body?.description || "",
        req.body?.question || ""
      )}\n\nAI note: Hugging Face failed with: ${message}`
    })
  }
}

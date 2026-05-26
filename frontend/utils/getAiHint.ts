import type { Problem } from "./extractProblem"

type HintResponse = {
  hint?: string
  error?: string
}

const PROD_API_URL = "https://helpcode-api.vercel.app/api/hint"
const DEV_API_URL = "http://localhost:8787/api/hint"

function getApiCandidates() {
  // In extension production, call hosted API first.
  // In local development, try localhost first so iteration stays fast.
  if (import.meta.env.DEV) {
    return [DEV_API_URL, PROD_API_URL]
  }

  return [PROD_API_URL]
}

export async function getAiHint(problem: Problem, question: string) {
  let lastError: unknown

  for (const apiUrl of getApiCandidates()) {
    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: problem.title,
          description: problem.description,
          url: problem.url,
          question
        })
      })

      const data = (await response.json()) as HintResponse

      if (!response.ok) {
        throw new Error(data.error || "Hint request failed.")
      }

      return (
        data.hint || "Try breaking the problem into inputs, state, transitions, and edge cases."
      )
    } catch (error) {
      lastError = error
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Could not connect to helpcode API.")
}

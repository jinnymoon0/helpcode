import type { Problem } from "./extractProblem"

type HintResponse = {
  hint?: string
  error?: string
}

const API_URL = "http://localhost:8787/api/hint"

export async function getAiHint(problem: Problem, question: string) {
  const response = await fetch(API_URL, {
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

  return data.hint || "Try breaking the problem into inputs, state, transitions, and edge cases."
}

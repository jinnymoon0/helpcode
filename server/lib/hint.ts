export const hfModel = "katanemo/Arch-Router-1.5B:hf-inference"

export function buildPrompt(title: string, description: string, question: string) {
  return `
Problem title:
${title}

Problem description:
${String(description).slice(0, 4000)}

User question:
${question}
`
}

export function fallbackHint(title: string, description: string, question: string) {
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

export async function fetchHintFromHf(
  hfToken: string,
  title: string,
  description: string,
  question: string
) {
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
  return response.choices?.[0]?.message?.content?.trim()
}

export type Problem = {
  title: string
  description: string
  url: string
}

function textFromSelector(selector: string) {
  return document.querySelector(selector)?.textContent?.trim() || ""
}

function getTitle() {
  const titleCandidates = [
    textFromSelector("a[href^='/problems/']"),
    textFromSelector("h1"),
    document.title.replace(" - LeetCode", "").trim()
  ]

  return titleCandidates.find(Boolean) || "LeetCode problem"
}

function getDescription() {
  const descriptionSelectors = [
    "[data-track-load='description_content']",
    "[class*='description']",
    "div[class*='elfjS']"
  ]

  for (const selector of descriptionSelectors) {
    const description = textFromSelector(selector)

    if (description.length > 100) {
      return description
    }
  }

  return document.body.innerText.slice(0, 5000)
}

export function extractProblem(): Problem {
  return {
    title: getTitle(),
    description: getDescription(),
    url: location.href
  }
}

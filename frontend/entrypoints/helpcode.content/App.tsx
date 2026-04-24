import { useEffect, useMemo, useState } from "react"
import { extractProblem, type Problem } from "../../utils/extractProblem"
import { getAiHint } from "../../utils/getAiHint"

export default function App() {
  const [problem, setProblem] = useState<Problem | null>(null)
  const [query, setQuery] = useState("")
  const [hint, setHint] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  const problemTitle = useMemo(() => {
    return problem?.title || "Scanning problem..."
  }, [problem])

  useEffect(() => {
    function scanProblem() {
      const scannedProblem = extractProblem()
      setProblem(scannedProblem)
    }

    scanProblem()

    const retryTimer = window.setTimeout(scanProblem, 1500)
    const observer = new MutationObserver(() => scanProblem())

    observer.observe(document.body, {
      childList: true,
      subtree: true
    })

    return () => {
      window.clearTimeout(retryTimer)
      observer.disconnect()
    }
  }, [])

  async function handleHint() {
    const trimmedQuery = query.trim()

    if (!trimmedQuery) {
      setHint("Ask a specific question first, like what pattern to consider or how to start.")
      return
    }

    if (!problem) {
      setHint("I am still scanning the problem. Try again in a moment.")
      return
    }

    setIsLoading(true)
    setHint("Thinking...")

    try {
      const result = await getAiHint(problem, trimmedQuery)
      setHint(result)
    } catch (error) {
      console.error(error)
      const message = error instanceof Error ? error.message : "Unknown error."
      setHint(message)
    } finally {
      setIsLoading(false)
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" && !isLoading) {
      void handleHint()
    }
  }

  if (collapsed) {
    return (
      <button className="hc-bubble" type="button" onClick={() => setCollapsed(false)}>
        helpcode
      </button>
    )
  }

  return (
    <section className="hc-panel" aria-label="helpcode hint helper">
      <div className="hc-header">
        <strong>helpcode</strong>
        <button
          className="hc-icon-button"
          type="button"
          aria-label="Collapse helpcode"
          onClick={() => setCollapsed(true)}
        >
          -
        </button>
      </div>

      <div className="hc-problem" title={problemTitle}>
        {problemTitle}
      </div>

      <input
        className="hc-input"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask for a hint..."
        disabled={isLoading}
      />

      <button className="hc-button" type="button" onClick={handleHint} disabled={isLoading}>
        {isLoading ? "Thinking..." : "Get hint"}
      </button>

      {hint && <div className="hc-hint">{hint}</div>}
    </section>
  )
}

import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import "./style.css"

export default defineContentScript({
  matches: ["*://leetcode.com/problems/*", "*://www.leetcode.com/problems/*"],

  async main(ctx) {
    console.log("helpcode content script loaded")

    document.getElementById("helpcode-root")?.remove()
    document.getElementById("helpcode-styles")?.remove()

    const style = document.createElement("style")
    style.id = "helpcode-styles"
    style.textContent = `
      .hc-panel {
        position: fixed;
        right: 20px;
        bottom: 20px;
        z-index: 2147483647;
        width: min(340px, calc(100vw - 40px));
        box-sizing: border-box;
        padding: 14px;
        border: 1px solid #374151;
        border-radius: 8px;
        background: #111827;
        color: #f9fafb;
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35);
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      .hc-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 10px;
      }

      .hc-icon-button {
        width: 28px;
        height: 28px;
        flex: 0 0 auto;
        border: 0;
        border-radius: 6px;
        background: #1f2937;
        color: #f9fafb;
        cursor: pointer;
      }

      .hc-problem {
        margin-bottom: 10px;
        overflow: hidden;
        color: #d1d5db;
        font-size: 13px;
        line-height: 1.4;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .hc-input {
        width: 100%;
        box-sizing: border-box;
        padding: 9px;
        margin-bottom: 8px;
        border: 1px solid #4b5563;
        border-radius: 6px;
        background: #030712;
        color: #ffffff;
        font: inherit;
      }

      .hc-button {
        width: 100%;
        padding: 9px;
        border: 0;
        border-radius: 6px;
        background: #10b981;
        color: #04130d;
        cursor: pointer;
        font: inherit;
        font-weight: 700;
      }

      .hc-hint {
        margin-top: 12px;
        color: #e5e7eb;
        font-size: 14px;
        line-height: 1.45;
        white-space: pre-wrap;
      }

      .hc-bubble {
        position: fixed;
        right: 20px;
        bottom: 20px;
        z-index: 2147483647;
        border: 0;
        border-radius: 8px;
        padding: 10px 14px;
        background: #10b981;
        color: #04130d;
        cursor: pointer;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        font-weight: 800;
      }
    `
    document.head.append(style)

    const container = document.createElement("div")
    container.id = "helpcode-root"
    document.documentElement.append(container)

    const root = ReactDOM.createRoot(container)
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    )

    ctx.onInvalidated(() => {
      root.unmount()
      container.remove()
      style.remove()
    })
  }
})

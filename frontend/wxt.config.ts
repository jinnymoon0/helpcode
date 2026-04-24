import { defineConfig } from "wxt"

export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  manifest: {
    name: "helpcode",
    description: "A LeetCode helper that gives hints without revealing full answers.",
    version: "0.0.1",
    permissions: ["storage"],
    host_permissions: [
      "*://leetcode.com/problems/*",
      "*://www.leetcode.com/problems/*",
      "http://localhost:8787/*"
    ]
  }
})

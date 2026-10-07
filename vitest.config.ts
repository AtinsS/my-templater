import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vitest/config"

const root = path.resolve(__dirname, ".")

export default defineConfig({
  plugins: [react()],
  resolve: {
    // как в tsconfig: "~*" → "./*"  (~lib/x → ./lib/x)
    alias: [
      {
        find: /^~(.*)$/,
        replacement: `${root}/$1`,
      },
    ],
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.test.{ts,tsx}"],
    globals: true,
  },
})

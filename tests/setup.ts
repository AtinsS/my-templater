import "@testing-library/jest-dom/vitest"
import { afterEach, vi } from "vitest"
import { cleanup } from "@testing-library/react"

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

// crypto.randomUUID есть в Node 19+, но на всякий случай
if (!globalThis.crypto?.randomUUID) {
  globalThis.crypto = {
    ...(globalThis.crypto ?? {}),
    randomUUID: () =>
      "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0
        const v = c === "x" ? r : (r & 0x3) | 0x8
        return v.toString(16)
      }),
  } as Crypto
}

/**
 * Мокаем `useStorage` из @plasmohq/storage/hook.
 *
 * Зачем: в unit/UI-тестах не нужен реальный chrome.storage.
 */
import { useState } from "react"

type AnySetter<T> = (value: T | ((prev: T) => T)) => void

const memory = new Map<string, unknown>()

export function seedStorage(key: string, value: unknown) {
  memory.set(key, value)
}

export function readStorage<T>(key: string): T | undefined {
  return memory.get(key) as T | undefined
}

export function resetStorage() {
  memory.clear()
}

export function useStorage<T>(key: string, defaultValue: T): [T, AnySetter<T>] {
  const [value, setValue] = useState<T>(
    () => (memory.has(key) ? (memory.get(key) as T) : defaultValue)
  )

  const set: AnySetter<T> = (next) => {
    setValue((prev) => {
      const resolved =
        typeof next === "function" ? (next as (p: T) => T)(prev) : next
      memory.set(key, resolved)
      return resolved
    })
  }

  return [value, set]
}

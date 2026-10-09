import { Storage } from "@plasmohq/storage"

import type { Template } from "~types/types"

// фильтрация
export function filterTemplates(
  templates: Template[],
  query: string
): Template[] {
  const q = query.trim().toLowerCase()
  if (!q) return templates
  return templates.filter(
    (t) =>
      t.title.toLowerCase().includes(q) || t.template.toLowerCase().includes(q)
  )
}

/**
 * Общий storage для popup и background.
 * Важно: area "local" и один экземпляр — иначе background пишет в local,
 * а popup через useStorage читает из sync, и шаблоны «не видно».
 */

export const templateStorage = new Storage({ area: "local" })

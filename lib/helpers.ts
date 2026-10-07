import type { Template } from "~types/types"

export function filterTemplates(templates: Template[], query: string): Template[] {
  const q = query.trim().toLowerCase()
  if (!q) return templates
  return templates.filter(
    (t) =>
      t.title.toLowerCase().includes(q) ||
      t.template.toLowerCase().includes(q)
  )
}

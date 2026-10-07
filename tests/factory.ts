import type { Template } from "~types/types"

/**
 * Фабрика данных для нагрузочных тестов.
 *
 */
export function makeTemplate(index: number): Template {
  return {
    id: `tpl-${String(index).padStart(3, "0")}`,
    title: `Шаблон ${index}`,
    template: `Тело заметки номер ${index}. Уникальный маркер: mark-${index}`,
  }
}

/** Список из n шаблонов: 1..n */
export function makeTemplates(n: number): Template[] {
  return Array.from({ length: n }, (_, i) => makeTemplate(i + 1))
}

/**
 * Специальные записи для поиска:
 * часть попадает в title, часть — только в body.
 */
export function makeSearchableSet(n: number): Template[] {
  const items = makeTemplates(n)
  // каждая 10-я — с "срочно" в заголовке
  return items.map((t, i) =>
    (i + 1) % 10 === 0 ? { ...t, title: `${t.title} срочно` } : t
  )
}

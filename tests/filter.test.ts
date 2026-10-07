import { describe, expect, it } from "vitest"
import { filterTemplates } from "~lib/helpers"
import { makeSearchableSet, makeTemplates } from "./factory"

/**
 * Unit-тесты чистой функции на нагрузке 50 и 100 записей.
 *
 * Идея: если фильтр «умеет» в 100 записей на уровне данных —
 * UI сломаться уже не должно. Это первый рубеж защиты.
 */
describe("filterTemplates", () => {
  describe.each([
    { n: 50, label: "50 заметок" },
    { n: 100, label: "100 заметок" },
  ])("при $label", ({ n }) => {
    it("пустой запрос возвращает весь список", () => {
      const items = makeTemplates(n)
      expect(filterTemplates(items, "")).toHaveLength(n)
      expect(filterTemplates(items, "   ")).toHaveLength(n)
    })

    it("ищет по заголовку (частичное совпадение, регистр не важен)", () => {
      const items = makeTemplates(n)
      const hit = filterTemplates(items, `шаблон ${n}`)
      expect(hit).toHaveLength(1)
      expect(hit[0].id).toBe(`tpl-${String(n).padStart(3, "0")}`)
    })

    it("ищет по телу заметки", () => {
      const items = makeTemplates(n)
      const hit = filterTemplates(items, `mark-${n}`)
      expect(hit).toHaveLength(1)
      expect(hit[0].template).toContain(`mark-${n}`)
    })

    it("находит несколько записей по общему слову", () => {
      // в searchable-наборе каждая 10-я имеет «срочно» в title
      const items = makeSearchableSet(n)
      const hit = filterTemplates(items, "срочно")
      expect(hit).toHaveLength(n / 10)
    })

    it("ничего не находит — возвращает пустой массив", () => {
      const items = makeTemplates(n)
      expect(filterTemplates(items, "zzz-нет-такого")).toEqual([])
    })

    it("не ломается на пустом списке", () => {
      expect(filterTemplates([], "любой")).toEqual([])
    })
  })

  it("100 записей: фильтр не мутирует исходный массив", () => {
    const items = makeTemplates(100)
    const snapshot = items.map((t) => t.id)
    filterTemplates(items, "шаблон 1")
    expect(items.map((t) => t.id)).toEqual(snapshot)
  })
})

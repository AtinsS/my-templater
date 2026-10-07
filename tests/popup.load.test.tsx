/**
 * Нагрузочные UI-тесты popup при 50 и 100 заметках.
 *
 * Слои проверки:
 *   1) рендер не падает, счётчик верный
 *   2) поиск под нагрузкой
 *   3) CRUD: копирование / редактирование / удаление / создание
 *
 * Мокаем @plasmohq/storage/hook → фейковый in-memory стор.
 */
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import type { Template } from "~types/types"

vi.mock("@plasmohq/storage/hook", async () => {
  const mod = await import("./mock-storage")
  return { useStorage: mod.useStorage }
})

import IndexPopup from "../popup"
import { makeSearchableSet, makeTemplates } from "./factory"
import { readStorage, resetStorage, seedStorage } from "./mock-storage"

const KEY = "templates"

function setup(items: Template[]) {
  seedStorage(KEY, items)
  return render(<IndexPopup />)
}

function getCards() {
  return document.querySelectorAll(".card")
}

beforeEach(() => {
  resetStorage()
  // clipboard может отсутствовать в jsdom
  if (!navigator.clipboard) {
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      configurable: true,
    })
  } else {
    vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue(undefined)
  }
})

describe.each([
  { n: 50, label: "50 заметках" },
  { n: 100, label: "100 заметках" },
])("popup при $label", ({ n }) => {
  it("рендерит все карточки и показывает счётчик", () => {
    setup(makeTemplates(n))
    expect(getCards()).toHaveLength(n)
    expect(screen.getByText(`${n} шт.`)).toBeInTheDocument()
  })

  it("поиск по заголовку сужает список", async () => {
    const user = userEvent.setup()
    setup(makeTemplates(n))

    await user.type(screen.getByPlaceholderText(/поиск/i), `шаблон ${n}`)

    expect(getCards()).toHaveLength(1)
    expect(screen.getByText(`Шаблон ${n}`)).toBeInTheDocument()
  })

  it("поиск по телу заметки работает", async () => {
    const user = userEvent.setup()
    setup(makeTemplates(n))

    await user.type(screen.getByPlaceholderText(/поиск/i), `mark-${n}`)

    expect(getCards()).toHaveLength(1)
    expect(screen.getByText(/Тело заметки номер/)).toBeInTheDocument()
  })

  it("без совпадений — блок «Ничего не найдено», карточек нет", async () => {
    const user = userEvent.setup()
    setup(makeTemplates(n))

    await user.type(screen.getByPlaceholderText(/поиск/i), "нет-такого-zzz")

    expect(getCards()).toHaveLength(0)
    expect(screen.getByText("Ничего не найдено")).toBeInTheDocument()
  })

  it("очистка поиска восстанавливает весь список", async () => {
    const user = userEvent.setup()
    setup(makeTemplates(n))
    const input = screen.getByPlaceholderText(/поиск/i)

    await user.type(input, "шаблон 1")
    expect(getCards().length).toBeLessThan(n)

    await user.clear(input)
    expect(getCards()).toHaveLength(n)
  })

  it("копирование кидает текст в буфер", async () => {
    const user = userEvent.setup()
    setup(makeTemplates(n))
    const cards = getCards()
    const first = cards[0]

    await user.click(within(first as HTMLElement).getByTitle("Копировать"))

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining("Тело заметки номер 1")
    )
  })

  it("редактирование обновляет одну карточку и не теряет остальные", async () => {
    const user = userEvent.setup()
    setup(makeTemplates(n))
    const cards = getCards()
    // правим «среднюю» — самый частый кейс в реальной жизни
    const mid = cards[Math.floor(n / 2)] as HTMLElement

    await user.click(within(mid).getByTitle("Редактировать"))

    const titleInput = screen.getByLabelText("Название")
    await user.clear(titleInput)
    await user.type(titleInput, "Изменённый заголовок")
    await user.click(screen.getByRole("button", { name: "Сохранить" }))

    expect(getCards()).toHaveLength(n)
    expect(screen.getByText("Изменённый заголовок")).toBeInTheDocument()
    // исходный заголовок середины исчез
    expect(
      screen.queryByText(`Шаблон ${Math.floor(n / 2) + 1}`)
    ).not.toBeInTheDocument()
  })

  it("удаление убирает ровно одну заметку", async () => {
    const user = userEvent.setup()
    setup(makeTemplates(n))
    const first = getCards()[0] as HTMLElement

    await user.click(within(first).getByTitle("Удалить"))
    // в DOM много кнопок «Удалить» (иконки карточек) — берём из диалога
    const confirmSheet = document.querySelector(".sheet--alert") as HTMLElement
    await user.click(within(confirmSheet).getByRole("button", { name: "Удалить" }))

    expect(getCards()).toHaveLength(n - 1)
    expect(screen.getByText(`${n - 1} шт.`)).toBeInTheDocument()
  })

  it("создание добавляет заметку в начало", async () => {
    const user = userEvent.setup()
    setup(makeTemplates(n))

    await user.click(screen.getByRole("button", { name: /новый/i }))
    await user.type(screen.getByLabelText("Название"), "Свежая заметка")
    await user.type(screen.getByLabelText("Текст"), "Текст свежей заметки")
    await user.click(screen.getByRole("button", { name: "Добавить" }))

    expect(getCards()).toHaveLength(n + 1)
    expect(screen.getByText(`${n + 1} шт.`)).toBeInTheDocument()
    // новая — первая в списке (prepend)
    expect(getCards()[0]).toHaveTextContent("Свежая заметка")
  })
})

describe("поиск по нескольким полям под нагрузкой", () => {
  it("100 заметок: «срочно» находит все заголовки с маркером", async () => {
    const user = userEvent.setup()
    const items = makeSearchableSet(100)
    setup(items)

    await user.type(screen.getByPlaceholderText(/поиск/i), "срочно")

    expect(getCards()).toHaveLength(10)
  })

  it("100 заметок: комбинация title/body дёт осмысленный результат", async () => {
    const user = userEvent.setup()
    setup(makeTemplates(100))

    await user.type(screen.getByPlaceholderText(/поиск/i), "шаблон 4")

    // "шаблон 4", "шаблон 40".."шаблон 49", "шаблон 4" внутри "шаблон 4X..."
    // строго: title "Шаблон 4" + body "номер 4" и все "4x"
    expect(getCards().length).toBeGreaterThan(1)
    expect(getCards().length).toBeLessThan(20)
  })
})

describe("крайние случаи на нагрузке", () => {
  it("пустое хранилище — empty state и нет поля поиска", () => {
    setup([])
    expect(screen.getByText("Нет шаблонов")).toBeInTheDocument()
    expect(screen.queryByPlaceholderText(/поиск/i)).not.toBeInTheDocument()
    expect(readStorage(KEY)).toEqual([])
  })

  it("отмена удаления ничего не меняет", async () => {
    const user = userEvent.setup()
    setup(makeTemplates(50))

    await user.click(within(getCards()[0] as HTMLElement).getByTitle("Удалить"))
    const confirmSheet = document.querySelector(".sheet--alert") as HTMLElement
    await user.click(within(confirmSheet).getByRole("button", { name: "Отмена" }))

    expect(getCards()).toHaveLength(50)
  })

  it("пустые title/text — кнопка «Добавить» заблокирована", async () => {
    const user = userEvent.setup()
    setup(makeTemplates(50))

    await user.click(screen.getByRole("button", { name: /новый/i }))
    const addBtn = screen.getByRole("button", { name: "Добавить" })
    expect(addBtn).toBeDisabled()
  })
})

// background.ts
import { templateStorage } from "~lib/helpers"
import type { Template } from "~types/types"

const MENU_ID = "save-selection-as-snippet"


function notify(title: string, message: string) {
  const icons = chrome.runtime.getManifest().icons
  const iconUrl = chrome.runtime.getURL(icons?.["48"] ?? icons?.["128"] ?? "")

  chrome.notifications.create(
    { type: "basic", iconUrl, title, message },
    () => {
      if (chrome.runtime.lastError) {
        console.error("[Snippet Saver] notifications:", chrome.runtime.lastError.message)
      }
    }
  )
}

// 1. Создаем пункт меню при установке или обновлении расширения и выделяем шаблоон
chrome.runtime.onInstalled.addListener(() => {
  // removeAll — чтобы не словить "duplicate id" при reload в dev
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: MENU_ID,
      title: "💾 Сохранить как шаблон",
      contexts: ["selection"]
    })
  })
})

// 2. Обрабатываем клик по пункту меню
chrome.contextMenus.onClicked.addListener(async (info) => {
  if (info.menuItemId !== MENU_ID) return

  const selectedText = info.selectionText?.trim()

  if (!selectedText) {
    console.warn("Выделенный текст пуст")
    return
  }

  try {
    const templates = (await templateStorage.get<Template[]>("templates")) ?? []

    const newTemplate: Template = {
      id: crypto.randomUUID(),
      title: selectedText,
      template: selectedText
    }

    await templateStorage.set("templates", [newTemplate, ...templates])

    notify("✅ Шаблон сохранен!", "Текст добавлен в расширение. Открой расширение, чтобы изменить название.")
  } catch (error) {
    console.error("Ошибка при сохранении:", error)
    notify("❌ Ошибка", "Не удалось сохранить шаблон. Проверьте консоль расширения.")
  }
})

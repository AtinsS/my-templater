import { useMemo, useState } from "react"

import { useStorage } from "@plasmohq/storage/hook"

import { filterTemplates, templateStorage } from "~lib/helpers"
import type { Template } from "~types/types"

import "./styles.css"

function IndexPopup() {
  const [templates, setTemplates] = useStorage<Template[]>(
    { key: "templates", instance: templateStorage },
    []
  )

  const [query, setQuery] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [title, setTitle] = useState("")
  const [text, setText] = useState("")
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  //Фильтрация
  const filtered = useMemo(
    () => filterTemplates(templates, query),
    [templates, query]
  )

  //Действия
  const openCreate = () => {
    setEditingId(null)
    setTitle("")
    setText("")
    setIsModalOpen(true)
  }

  const openEdit = (t: Template) => {
    setEditingId(t.id)
    setTitle(t.title)
    setText(t.template)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingId(null)
    setTitle("")
    setText("")
  }

  const handleSave = () => {
    const trimmedTitle = title.trim()
    const trimmedText = text.trim()
    if (!trimmedTitle || !trimmedText) return

    if (editingId) {
      setTemplates(
        templates.map((t) =>
          t.id === editingId
            ? { ...t, title: trimmedTitle, template: trimmedText }
            : t
        )
      )
    } else {
      const newTemplate: Template = {
        id: crypto.randomUUID(),
        title: trimmedTitle,
        template: trimmedText
      }
      setTemplates([newTemplate, ...templates])
    }

    closeModal()
  }

  const handleCopy = async (t: Template) => {
    await navigator.clipboard.writeText(t.template)
    setCopiedId(t.id)
    setTimeout(() => setCopiedId(null), 1200)
  }

  const handleDelete = () => {
    setTemplates(templates.filter((t) => t.id !== deleteId))
    setDeleteId(null)
  }

  const canSave = title.trim().length > 0 && text.trim().length > 0

  return (
    <div className="popup">
      <header className="header">
        <div className="brand">
          <div className="brand-icon">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M3 3.5h10M3 8h10M3 12.5h6"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div className="brand-text">
            <span className="brand-name">Мои шаблоны</span>
            <span className="brand-count">
              {templates.length === 0 ? "пусто" : `${templates.length} шт.`}
            </span>
          </div>
        </div>

        <button className="btn-primary" onClick={openCreate}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M7 2v10M2 7h10"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
          Новый
        </button>
      </header>

      {templates.length > 0 && (
        <div className="search-wrap">
          <svg
            className="search-icon"
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none">
            <circle
              cx="6"
              cy="6"
              r="4.2"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M9.2 9.2L12 12"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <input
            className="search-input"
            type="text"
            placeholder="Поиск по названию или тексту…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      )}

      <div className="list">
        {templates.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <rect
                  x="5"
                  y="4"
                  width="18"
                  height="20"
                  rx="3"
                  stroke="currentColor"
                  strokeWidth="1.6"
                />
                <path
                  d="M9 10h10M9 14h10M9 18h6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="empty-title">Нет шаблонов</div>
            <div className="empty-desc">
              Пока что пусто, но ты можешь это изменить
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty empty--compact">
            <div className="empty-title">Ничего не найдено</div>
            <div className="empty-desc">Попробуй другой запрос</div>
          </div>
        ) : (
          filtered.map((t) => (
            <article key={t.id} className="card">
              <div className="card-top">
                <h3 className="card-title">{t.title}</h3>
                <div className="card-actions">
                  <button
                    className={`icon-btn ${copiedId === t.id ? "is-ok" : ""}`}
                    onClick={() => handleCopy(t)}
                    title="Копировать">
                    {copiedId === t.id ? (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none">
                        <path
                          d="M3 7.2l2.6 2.6L11 4.5"
                          stroke="currentColor"
                          strokeWidth="1.7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none">
                        <rect
                          x="4.5"
                          y="4.5"
                          width="7"
                          height="7"
                          rx="1.5"
                          stroke="currentColor"
                          strokeWidth="1.4"
                        />
                        <path
                          d="M9.5 4.5V3.2A1.2 1.2 0 008.3 2H3.2A1.2 1.2 0 002 3.2v5.1A1.2 1.2 0 003.2 9.5H4.5"
                          stroke="currentColor"
                          strokeWidth="1.4"
                        />
                      </svg>
                    )}
                  </button>
                  <button
                    className="icon-btn"
                    onClick={() => openEdit(t)}
                    title="Редактировать">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path
                        d="M8.2 3.2l2.6 2.6M3 11l.7-2.6 6-6a1.2 1.2 0 011.7 0l1 1a1.2 1.2 0 010 1.7l-6 6L3 11z"
                        stroke="currentColor"
                        strokeWidth="1.3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <button
                    className="icon-btn icon-btn--danger"
                    onClick={() => setDeleteId(t.id)}
                    title="Удалить">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path
                        d="M3 4.5h8M5.5 4.5V3.2A1.2 1.2 0 016.7 2h.6a1.2 1.2 0 011.2 1.2v1.3M4.2 4.5l.5 6.2A1.3 1.3 0 006 11.8h2a1.3 1.3 0 001.3-1.1l.5-6.2"
                        stroke="currentColor"
                        strokeWidth="1.3"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>
              <p className="card-text">{t.template}</p>
            </article>
          ))
        )}
      </div>

      {/* {Модалка Редактировать/новый} */}
      {isModalOpen && (
        <div className="overlay" onClick={closeModal}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-handle" />
            <div className="sheet-title">
              {editingId ? "Редактировать шаблон" : "Новый шаблон"}
            </div>

            <label className="label" htmlFor="tpl-title">
              Название
            </label>
            <input
              id="tpl-title"
              className="field"
              type="text"
              placeholder="Приветствие"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />

            <label className="label" htmlFor="tpl-text">
              Текст
            </label>
            <textarea
              id="tpl-text"
              className="field field--area"
              placeholder="**Добрый день**"
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
            />

            <div className="sheet-actions">
              <button className="btn-secondary" onClick={closeModal}>
                Отмена
              </button>
              <button
                className="btn-primary btn-primary--block"
                disabled={!canSave}
                onClick={handleSave}>
                {editingId ? "Сохранить" : "Добавить"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Подтверждение удаления*/}
      {deleteId && (
        <div className="overlay" onClick={() => setDeleteId(null)}>
          <div
            className="sheet sheet--alert"
            onClick={(e) => e.stopPropagation()}>
            <div className="sheet-handle" />
            <div className="sheet-title">Удалить шаблон?</div>
            <p className="alert-text">
              Шаблон будет удалён навсегда! Прям вот совсем навсегда!
            </p>
            <div className="sheet-actions">
              <button
                className="btn-secondary"
                onClick={() => setDeleteId(null)}>
                Отмена
              </button>
              <button className="btn-danger" onClick={handleDelete}>
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
      <a href="https://github.com/AtinsS" target="_blank" className="my-link">
        Мой Github
      </a>
    </div>
  )
}

export default IndexPopup

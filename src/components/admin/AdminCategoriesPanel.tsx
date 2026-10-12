"use client"

import { useEffect, useState } from "react"
import { Plus, Loader2, GripVertical, ChevronUp, ChevronDown } from "lucide-react"

export default function AdminCategoriesPanel({ locale }: { locale: string }) {
  const isRtl = locale === "ar"
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [nameAr, setNameAr] = useState("")
  const [nameEn, setNameEn] = useState("")
  const [slug, setSlug] = useState("")
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState("")
  const [dragId, setDragId] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    fetch("/api/admin/categories", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setMsg(d.error)
        setItems(d.items || [])
      })
      .catch((e) => setMsg(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const persistOrder = async (next: any[]) => {
    setItems(next)
    const order = next.map((it, i) => ({ id: it.id, sortOrder: i + 1 }))
    await fetch("/api/admin/categories", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ order }),
    })
  }

  const move = async (index: number, dir: -1 | 1) => {
    const j = index + dir
    if (j < 0 || j >= items.length) return
    const next = [...items]
    const tmp = next[index]
    next[index] = next[j]
    next[j] = tmp
    await persistOrder(next)
  }

  const onDrop = async (targetId: string) => {
    if (!dragId || dragId === targetId) return
    const from = items.findIndex((x) => x.id === dragId)
    const to = items.findIndex((x) => x.id === targetId)
    if (from < 0 || to < 0) return
    const next = [...items]
    const [row] = next.splice(from, 1)
    next.splice(to, 0, row)
    setDragId(null)
    await persistOrder(next)
  }

  const create = async () => {
    setBusy(true)
    setMsg("")
    try {
      const r = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ nameAr, nameEn, slug }),
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || "fail")
      setNameAr("")
      setNameEn("")
      setSlug("")
      setMsg(isRtl ? "تمت الإضافة" : "Created")
      load()
    } catch (e: any) {
      setMsg(e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border p-5 space-y-3">
        <h2 className="font-semibold flex items-center gap-2">
          <Plus size={18} className="text-emerald-600" />
          {isRtl ? "إضافة تصنيف جديد" : "Add category"}
        </h2>
        <div className="grid sm:grid-cols-3 gap-3">
          <input
            className="border rounded-xl px-3 py-2 text-sm"
            placeholder={isRtl ? "الاسم بالعربي" : "Arabic name"}
            value={nameAr}
            onChange={(e) => setNameAr(e.target.value)}
          />
          <input
            className="border rounded-xl px-3 py-2 text-sm"
            placeholder={isRtl ? "الاسم بالإنجليزي" : "English name"}
            value={nameEn}
            onChange={(e) => setNameEn(e.target.value)}
          />
          <input
            className="border rounded-xl px-3 py-2 text-sm"
            placeholder="slug (e.g. cars)"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          />
        </div>
        <button
          type="button"
          disabled={busy || !nameAr || !slug}
          onClick={create}
          className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold disabled:opacity-50 inline-flex items-center gap-2"
        >
          {busy && <Loader2 size={14} className="animate-spin" />}
          {isRtl ? "إضافة" : "Add"}
        </button>
        {msg && <p className="text-sm text-emerald-700">{msg}</p>}
      </div>

      <div className="bg-white rounded-2xl border overflow-hidden">
        <div className="px-4 py-3 border-b text-sm text-gray-500">
          {isRtl
            ? "اسحب الصف أو استخدم الأسهم لتغيير ترتيب الفئات في البار"
            : "Drag rows or use arrows to reorder categories in the bar"}
        </div>
        {loading && (
          <p className="p-6 text-sm text-gray-400">{isRtl ? "جاري التحميل..." : "Loading..."}</p>
        )}
        {!loading && items.length === 0 && (
          <p className="p-6 text-sm text-gray-400">{isRtl ? "لا تصنيفات" : "No categories"}</p>
        )}
        <ul className="divide-y">
          {items.map((it, index) => (
            <li
              key={it.id}
              draggable
              onDragStart={() => setDragId(it.id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(it.id)}
              className={`flex items-center gap-2 px-3 py-3 text-sm hover:bg-gray-50 ${
                dragId === it.id ? "opacity-50 bg-emerald-50" : ""
              }`}
            >
              <button type="button" className="text-gray-400 cursor-grab active:cursor-grabbing p-1" aria-label="drag">
                <GripVertical size={18} />
              </button>
              <span className="w-7 h-7 rounded-lg bg-gray-100 text-gray-600 text-xs font-bold flex items-center justify-center">
                {index + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900">{it.nameAr}</div>
                <div className="text-xs text-gray-400" dir="ltr">
                  {it.slug} · {it.nameEn}
                </div>
              </div>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full ${
                  it.isActive ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"
                }`}
              >
                {it.isActive ? (isRtl ? "نشط" : "Active") : isRtl ? "متوقف" : "Off"}
              </span>
              <div className="flex flex-col gap-0.5">
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  className="p-1 rounded border hover:bg-white"
                  title={isRtl ? "أعلى" : "Up"}
                >
                  <ChevronUp size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  className="p-1 rounded border hover:bg-white"
                  title={isRtl ? "أسفل" : "Down"}
                >
                  <ChevronDown size={14} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

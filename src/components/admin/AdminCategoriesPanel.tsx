"use client"

import { useEffect, useState } from "react"
import { Plus, Loader2 } from "lucide-react"

export default function AdminCategoriesPanel({ locale }: { locale: string }) {
  const isRtl = locale === "ar"
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [nameAr, setNameAr] = useState("")
  const [nameEn, setNameEn] = useState("")
  const [slug, setSlug] = useState("")
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState("")

  const load = () => {
    setLoading(true)
    fetch("/api/admin/categories", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setItems(d.items || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

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
            placeholder="slug (maintenance)"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          />
        </div>
        <button
          type="button"
          disabled={busy || !nameAr || !slug}
          onClick={create}
          className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold disabled:opacity-50"
        >
          {busy ? <Loader2 className="animate-spin inline" size={16} /> : null}{" "}
          {isRtl ? "حفظ" : "Save"}
        </button>
        {msg && <p className="text-sm text-emerald-700">{msg}</p>}
      </div>

      <div className="bg-white rounded-2xl border divide-y">
        {loading && <p className="p-6 text-sm text-gray-400">...</p>}
        {!loading &&
          items.map((c) => (
            <div key={c.id} className="px-4 py-3 flex justify-between text-sm">
              <span className="font-medium">{c.nameAr}</span>
              <span className="text-gray-500">{c.slug}</span>
            </div>
          ))}
      </div>
    </div>
  )
}

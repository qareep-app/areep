"use client"

import { useEffect, useState } from "react"

export default function AdminUsers({ locale }: { locale: string }) {
  const isRtl = locale === "ar"
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState("")

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setErr(d.error)
        setRows(d.users || [])
      })
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-sm text-gray-500">{isRtl ? "جاري التحميل..." : "Loading..."}</p>
  if (err) return <p className="text-sm text-red-600">{err}</p>

  return (
    <div className="bg-white rounded-2xl border overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th className="text-start p-3">{isRtl ? "الهاتف" : "Phone"}</th>
            <th className="text-start p-3">{isRtl ? "الاسم" : "Name"}</th>
            <th className="text-start p-3">{isRtl ? "الدور" : "Role"}</th>
            <th className="text-start p-3">{isRtl ? "التوثيق" : "Badge"}</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={4} className="p-6 text-center text-gray-400">
                {isRtl ? "لا يوجد مستخدمون بعد" : "No users yet"}
              </td>
            </tr>
          )}
          {rows.map((u) => (
            <tr key={u.id} className="border-t">
              <td className="p-3" dir="ltr">{u.phone}</td>
              <td className="p-3">{u.name || "—"}</td>
              <td className="p-3">{u.role}</td>
              <td className="p-3">{u.trustBadge || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-3xl font-bold text-gray-900">404</h1>
      <p className="text-gray-600">الصفحة غير موجودة / Page not found</p>
      <Link href="/ar" className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold">
        الرئيسية / Home
      </Link>
    </div>
  )
}

import Header from "@/components/Header"
import Footer from "@/components/Footer"
import CategoryBar from "@/components/CategoryBar"

export default function PolicyLayout({
  locale,
  title,
  children,
}: {
  locale: string
  title: string
  children: React.ReactNode
}) {
  const isRtl = locale === "ar"
  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f5] dark:bg-gray-950" dir={isRtl ? "rtl" : "ltr"}>
      <Header locale={locale} />
      <CategoryBar locale={locale} />
      <main className="flex-1 max-w-3xl mx-auto px-4 py-10 w-full">
        <h1 className="text-2xl md:text-3xl font-bold text-emerald-800 dark:text-emerald-400 mb-8 text-center">
          {title}
        </h1>
        <div className="space-y-4">{children}</div>
      </main>
      <Footer locale={locale} />
    </div>
  )
}

export function Card({
  title,
  children,
}: {
  title?: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-amber-100 dark:border-gray-800 p-5 shadow-sm">
      {title && (
        <h2 className="font-bold text-gray-900 dark:text-gray-100 mb-3 text-lg">{title}</h2>
      )}
      <div className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed space-y-2">{children}</div>
    </div>
  )
}

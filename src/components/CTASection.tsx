import Link from "next/link"
import { Plus } from "lucide-react"

interface CTASectionProps {
  locale?: string
}

export default function CTASection({ locale = "ar" }: CTASectionProps) {
  const isRtl = locale === "ar"

  return (
    <section className="py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="relative rounded-3xl bg-gradient-to-l from-emerald-600 to-emerald-700 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-400 rounded-full translate-y-1/2 -translate-x-1/2" />
          </div>

          <div className="relative grid md:grid-cols-2 gap-8 items-center p-8 md:p-12">
            <div className={`${isRtl ? "text-right" : "text-left"}`}>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                {isRtl ? "عندك حاجة للبيع؟" : "Have something to sell?"}
              </h2>
              <p className="text-emerald-100 text-lg mb-6">
                {isRtl
                  ? "وصل إعلانك للناس اللي حواليك في دقائق"
                  : "Reach people around you in minutes"}
              </p>
              <Link
                href={`/${locale}/ads/new`}
                className="inline-flex items-center gap-2 bg-white text-emerald-700 hover:bg-orange-50 font-semibold px-6 py-3.5 rounded-full shadow-lg transition"
              >
                <Plus size={20} />
                {isRtl ? "أضف إعلانك الآن" : "Post your ad now"}
              </Link>
            </div>

            {/* Phone mockup placeholder */}
            <div className="flex justify-center">
              <div className="w-48 h-80 bg-white/10 backdrop-blur rounded-[2rem] border-4 border-white/20 flex items-center justify-center">
                <div className="text-center text-white/80">
                  <div className="text-4xl mb-2">📱</div>
                  <p className="text-sm font-medium">قريب</p>
                  <p className="text-xs opacity-70">دكانك قريب</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

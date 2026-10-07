import Link from "next/link"

interface FooterProps {
  locale?: string
}

export default function Footer({ locale = "ar" }: FooterProps) {
  const isRtl = locale === "ar"
  const year = new Date().getFullYear()

  // Placeholder store links — replace when apps are published
  const playUrl = "https://play.google.com/store/apps"
  const appStoreUrl = "https://apps.apple.com/app"

  return (
    <footer className="bg-gray-50 border-t border-gray-100 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/app-icon.png"
                alt="قريب"
                className="w-10 h-10 rounded-xl object-cover shadow"
              />
              <div>
                <div className="font-bold text-emerald-700">قريب</div>
                <div className="text-xs text-orange-500">دكانك قريب</div>
              </div>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed mb-4">
              {isRtl
                ? "منصة الإعلانات المبوبة اللي بتخلي الدكان قريب منك."
                : "The classifieds platform that brings the shop close to you."}
            </p>
            <div className="flex flex-wrap gap-2">
              <a
                href={playUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-black text-white rounded-lg px-3 py-2 hover:bg-gray-900 transition"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/app-icon.png" alt="" className="w-7 h-7 rounded-md object-cover" />
                <div className="text-start leading-tight">
                  <div className="text-[9px] opacity-80">GET IT ON</div>
                  <div className="text-sm font-semibold">Google Play</div>
                </div>
              </a>
              <a
                href={appStoreUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-black text-white rounded-lg px-3 py-2 hover:bg-gray-900 transition"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/app-icon.png" alt="" className="w-7 h-7 rounded-md object-cover" />
                <div className="text-start leading-tight">
                  <div className="text-[9px] opacity-80">Download on the</div>
                  <div className="text-sm font-semibold">App Store</div>
                </div>
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-emerald-800 mb-3 text-sm">
              {isRtl ? "للبائعين" : "For sellers"}
            </h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href={`/${locale}/merchant`} className="hover:text-emerald-600">{isRtl ? "سجّل كبائع" : "Register as seller"}</Link></li>
              <li><Link href={`/${locale}/fees`} className="hover:text-emerald-600">{isRtl ? "العمولة وسداد الرسوم" : "Fees & commission"}</Link></li>
              <li><Link href={`/${locale}/verification`} className="hover:text-emerald-600">{isRtl ? "توثيق المتجر" : "Store verification"}</Link></li>
              <li><Link href={`/${locale}/discounts`} className="hover:text-emerald-600">{isRtl ? "نظام الخصم" : "Discounts"}</Link></li>
              <li><Link href={`/${locale}/suspended`} className="hover:text-emerald-600">{isRtl ? "الحسابات الموقوفة" : "Suspended accounts"}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-emerald-800 mb-3 text-sm">
              {isRtl ? "المساعدة" : "Help"}
            </h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href={`/${locale}/faq`} className="hover:text-emerald-600">{isRtl ? "الأسئلة الشائعة" : "FAQ"}</Link></li>
              <li><Link href={`/${locale}/safety`} className="hover:text-emerald-600">{isRtl ? "مركز الأمان" : "Safety Center"}</Link></li>
              <li><Link href={`/${locale}/escrow`} className="hover:text-emerald-600">{isRtl ? "وسيط قريب" : "Areep Escrow"}</Link></li>
              <li><Link href={`/${locale}/prohibited`} className="hover:text-emerald-600">{isRtl ? "السلع والعروض الممنوعة" : "Prohibited items"}</Link></li>
              <li><Link href={`/${locale}/contact`} className="hover:text-emerald-600">{isRtl ? "اتصل بنا" : "Contact us"}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-emerald-800 mb-3 text-sm">
              {isRtl ? "السياسات" : "Policies"}
            </h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href={`/${locale}/terms`} className="hover:text-emerald-600">{isRtl ? "اتفاقية الاستخدام" : "Terms of use"}</Link></li>
              <li><Link href={`/${locale}/privacy`} className="hover:text-emerald-600">{isRtl ? "سياسة الخصوصية" : "Privacy"}</Link></li>
              <li><Link href={`/${locale}/ip`} className="hover:text-emerald-600">{isRtl ? "الملكية الفكرية" : "IP policy"}</Link></li>
              <li><Link href={`/${locale}/about`} className="hover:text-emerald-600">{isRtl ? "عن قريب" : "About"}</Link></li>
              <li><Link href={`/${locale}/how-it-works`} className="hover:text-emerald-600">{isRtl ? "كيف يعمل؟" : "How it works"}</Link></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            © {year} {isRtl ? "قريب. جميع الحقوق محفوظة" : "Areep. All rights reserved"}
          </p>
        </div>
      </div>
    </footer>
  )
}

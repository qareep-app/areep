import Link from "next/link"

interface FooterProps {
  locale?: string
}

export default function Footer({ locale = "ar" }: FooterProps) {
  const isRtl = locale === "ar"
  const year = new Date().getFullYear()

  return (
    <footer className="bg-gray-50 border-t border-gray-100 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-lg">
                ق
              </div>
              <div>
                <div className="font-bold text-emerald-700">قريب</div>
                <div className="text-xs text-orange-500">دكانك قريب</div>
              </div>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              {isRtl
                ? "منصة الإعلانات المبوبة اللي بتخلي الدكان قريب منك."
                : "The classifieds platform that brings the shop close to you."}
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-3 text-sm">
              {isRtl ? "قريب" : "Areep"}
            </h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href={`/${locale}/about`} className="hover:text-emerald-600">{isRtl ? "عن قريب" : "About"}</Link></li>
              <li><Link href={`/${locale}/how-it-works`} className="hover:text-emerald-600">{isRtl ? "كيف يعمل؟" : "How it works?"}</Link></li>
              <li><Link href={`/${locale}/privacy`} className="hover:text-emerald-600">{isRtl ? "سياسة الخصوصية" : "Privacy"}</Link></li>
              <li><Link href={`/${locale}/terms`} className="hover:text-emerald-600">{isRtl ? "الشروط والأحكام" : "Terms"}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-800 mb-3 text-sm">
              {isRtl ? "المساعدة" : "Help"}
            </h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href={`/${locale}/faq`} className="hover:text-emerald-600">{isRtl ? "الأسئلة الشائعة" : "FAQ"}</Link></li>
              <li><Link href={`/${locale}/safety`} className="hover:text-emerald-600">{isRtl ? "دليل الأمان" : "Safety Guide"}</Link></li>
              <li><Link href={`/${locale}/contact`} className="hover:text-emerald-600">{isRtl ? "تواصل معنا" : "Contact us"}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-800 mb-3 text-sm">
              {isRtl ? "للشركاء" : "Partners"}
            </h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href={`/${locale}/merchant`} className="hover:text-emerald-600">{isRtl ? "تاجر قريب" : "Areep Merchant"}</Link></li>
              <li><Link href={`/${locale}/partner-terms`} className="hover:text-emerald-600">{isRtl ? "الشروط للشركاء" : "Partner Terms"}</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            © {year} {isRtl ? "قريب. جميع الحقوق محفوظة" : "Areep. All rights reserved"}
          </p>
          <div className="flex items-center gap-3">
            {/* App store badges placeholders */}
            <div className="h-9 px-3 bg-black text-white text-xs rounded flex items-center gap-1.5 opacity-80">
              <span>Google Play</span>
            </div>
            <div className="h-9 px-3 bg-black text-white text-xs rounded flex items-center gap-1.5 opacity-80">
              <span>App Store</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

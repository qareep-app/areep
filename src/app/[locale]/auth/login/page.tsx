import { setRequestLocale } from "next-intl/server"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import LoginForm from "@/components/auth/LoginForm"

type Props = { params: Promise<{ locale: string }> }

export default async function LoginPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const isRtl = locale === "ar"

  return (
    <div
      className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <Header locale={locale} />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isRtl ? "تسجيل الدخول" : "Sign in"}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {isRtl ? "برقم الموبايل المصري — رمز تحقق حقيقي" : "Egyptian mobile — real OTP"}
            </p>
          </div>
          <LoginForm locale={locale} />
        </div>
      </main>
      <Footer locale={locale} />
    </div>
  )
}

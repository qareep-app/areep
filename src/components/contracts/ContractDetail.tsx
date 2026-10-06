"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import {
  FileText,
  ArrowLeft,
  ArrowRight,
  Upload,
  PenTool,
  Shield,
  Scale,
  CheckCircle,
  Smartphone,
} from "lucide-react"

interface ContractDetailProps {
  locale: string
  contractId: string
}

export default function ContractDetail({ locale, contractId }: ContractDetailProps) {
  const isRtl = locale === "ar"
  const fileRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState<"view" | "sign" | "otp" | "done">("view")
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null)
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [loading, setLoading] = useState(false)

  // Mock contract
  const contract = {
    id: contractId,
    type: "SALE" as const,
    propertyAr: "شقة 150 متر - المعادي - الدور الثالث",
    propertyEn: "150 sqm Apartment - Maadi - 3rd floor",
    amount: 2500000,
    sellerName: "حسن محمد",
    buyerName: "نورا أحمد",
    legalConsultant: "أ/ محمود حسن - مستشار قانوني معتمد",
    status: "PENDING_SIGNATURES",
    createdAt: "2026-10-01",
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setSignaturePreview(url)
    }
  }

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    // Auto focus next
    if (value && index < 5) {
      const next = document.getElementById(`otp-${index + 1}`)
      next?.focus()
    }
  }

  const submitSignature = async () => {
    if (!signaturePreview) return
    setLoading(true)
    // TODO: Upload signature image + request OTP via API
    await new Promise((r) => setTimeout(r, 800))
    setLoading(false)
    setStep("otp")
  }

  const verifyOtp = async () => {
    setLoading(true)
    // TODO: Verify OTP via API
    await new Promise((r) => setTimeout(r, 800))
    setLoading(false)
    setStep("done")
  }

  return (
    <div className="space-y-6">
      <Link
        href={`/${locale}/dashboard/contracts`}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-emerald-600"
      >
        {isRtl ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
        {isRtl ? "رجوع للعقود" : "Back to contracts"}
      </Link>

      {/* Contract Header */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <FileText size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {isRtl ? contract.propertyAr : contract.propertyEn}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {contract.type === "SALE" ? (isRtl ? "عقد تمليك" : "Sale Contract") : (isRtl ? "عقد إيجار" : "Rent Contract")}
              {" · "}
              {contract.amount.toLocaleString()} {isRtl ? "جنيه" : "EGP"}
            </p>
          </div>
        </div>
      </div>

      {/* Parties & Legal */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-gray-500 mb-2">{isRtl ? "الأطراف" : "Parties"}</h3>
          <p className="text-sm"><span className="text-gray-500">{isRtl ? "البائع:" : "Seller:"}</span> {contract.sellerName}</p>
          <p className="text-sm mt-1"><span className="text-gray-500">{isRtl ? "المشتري:" : "Buyer:"}</span> {contract.buyerName}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-gray-500 mb-2 flex items-center gap-1">
            <Scale size={14} /> {isRtl ? "المستشار القانوني" : "Legal Consultant"}
          </h3>
          <p className="text-sm font-medium text-gray-900">{contract.legalConsultant}</p>
          <p className="text-xs text-emerald-600 mt-1">{isRtl ? "معتمد لدى قريب" : "Accredited by Areep"}</p>
        </div>
      </div>

      {/* Signature Flow */}
      {step === "view" && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
          <h2 className="font-bold text-gray-900 flex items-center gap-2">
            <PenTool size={20} className="text-emerald-600" />
            {isRtl ? "التوقيع الإلكتروني" : "Electronic Signature"}
          </h2>
          <p className="text-sm text-gray-600">
            {isRtl
              ? "ارفع صورة واضحة لتوقيعك، ثم أكد برمز OTP هيوصلك على رقمك المسجل."
              : "Upload a clear image of your signature, then confirm with the OTP sent to your registered phone."}
          </p>
          <button
            onClick={() => setStep("sign")}
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3 rounded-xl transition"
          >
            {isRtl ? "ابدأ التوقيع" : "Start Signing"}
          </button>
        </div>
      )}

      {step === "sign" && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
          <h2 className="font-bold text-gray-900">{isRtl ? "ارفع صورة التوقيع" : "Upload Signature Image"}</h2>

          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-emerald-300 transition"
          >
            {signaturePreview ? (
              <img src={signaturePreview} alt="Signature" className="max-h-32 mx-auto" />
            ) : (
              <>
                <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                <p className="text-sm text-gray-500">
                  {isRtl ? "اضغط لرفع صورة التوقيع (PNG أو JPG)" : "Click to upload signature (PNG or JPG)"}
                </p>
              </>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          <button
            onClick={submitSignature}
            disabled={!signaturePreview || loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white font-semibold py-3 rounded-xl transition"
          >
            {loading ? (isRtl ? "جاري الإرسال..." : "Sending...") : isRtl ? "تأكيد وإرسال OTP" : "Confirm & Send OTP"}
          </button>
        </div>
      )}

      {step === "otp" && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
          <h2 className="font-bold text-gray-900 flex items-center gap-2">
            <Smartphone size={20} className="text-emerald-600" />
            {isRtl ? "أدخل رمز التحقق (OTP)" : "Enter Verification Code (OTP)"}
          </h2>
          <p className="text-sm text-gray-600">
            {isRtl ? "تم إرسال رمز مكون من 6 أرقام إلى رقمك المسجل" : "A 6-digit code was sent to your registered phone"}
          </p>

          <div className="flex justify-center gap-2" dir="ltr">
            {otp.map((digit, i) => (
              <input
                key={i}
                id={`otp-${i}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(i, e.target.value)}
                className="w-11 h-12 text-center text-lg font-bold border border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none"
              />
            ))}
          </div>

          <button
            onClick={verifyOtp}
            disabled={otp.some((d) => !d) || loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white font-semibold py-3 rounded-xl transition"
          >
            {loading ? (isRtl ? "جاري التحقق..." : "Verifying...") : isRtl ? "تأكيد التوقيع" : "Confirm Signature"}
          </button>
        </div>
      )}

      {step === "done" && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 text-center">
          <CheckCircle className="mx-auto text-emerald-600 mb-3" size={48} />
          <h2 className="text-xl font-bold text-emerald-800 mb-2">
            {isRtl ? "تم التوقيع بنجاح" : "Signed Successfully"}
          </h2>
          <p className="text-sm text-emerald-700">
            {isRtl
              ? "تم تسجيل توقيعك وإرسال العقد للمستشار القانوني للمراجعة النهائية."
              : "Your signature has been recorded and the contract sent to the legal consultant for final review."}
          </p>
        </div>
      )}

      {/* Security note */}
      <div className="flex items-start gap-2 text-xs text-gray-500 bg-gray-50 rounded-xl p-3">
        <Shield size={14} className="shrink-0 mt-0.5 text-emerald-600" />
        <span>
          {isRtl
            ? "التوقيع بالصورة + OTP يضمن الهوية. العقد لا يُعتبر سارياً إلا بعد موافقة المستشار القانوني المعتمد وخصم عمولة قريب."
            : "Image signature + OTP ensures identity. Contract is not valid until approved by the accredited legal consultant and Areep commission is deducted."}
        </span>
      </div>
    </div>
  )
}

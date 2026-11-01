/**
 * بيانات الشركة الظاهرة للعامة — مطلوبة لمراجعات بوابات الدفع (XPay / البنك المركزي).
 * يمكن تجاوزها بمتغيرات البيئة على Vercel إن لزم.
 */
export function getCompanyInfo() {
  return {
    nameAr: process.env.NEXT_PUBLIC_COMPANY_NAME_AR || "قريب",
    nameEn: process.env.NEXT_PUBLIC_COMPANY_NAME_EN || "Areep",
    addressAr:
      process.env.NEXT_PUBLIC_COMPANY_ADDRESS_AR ||
      "108 — مج 94 — الحي 15 — العاشر من رمضان — الشرقية — مصر",
    addressEn:
      process.env.NEXT_PUBLIC_COMPANY_ADDRESS_EN ||
      "108, Group 94, District 15, 10th of Ramadan, Sharqia, Egypt",
    phone: process.env.NEXT_PUBLIC_COMPANY_PHONE || "+201027058242",
    phoneDisplay: process.env.NEXT_PUBLIC_COMPANY_PHONE_DISPLAY || "01027058242",
    email: process.env.NEXT_PUBLIC_COMPANY_EMAIL || "qareep26@gmail.com",
    whatsapp: process.env.NEXT_PUBLIC_COMPANY_WHATSAPP || "201027058242",
  }
}

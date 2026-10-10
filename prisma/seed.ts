/**
 * Seed script - run with: npx tsx prisma/seed.ts
 * or add to package.json: "db:seed": "tsx prisma/seed.ts"
 */
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding categories...")

  const categories = [
    { slug: "cars", nameAr: "سيارات", nameEn: "Cars", sortOrder: 1, commissionType: "CARS_PARTS" as const },
    { slug: "car-parts", nameAr: "قطع غيار سيارات", nameEn: "Car Parts", sortOrder: 2, commissionType: "CARS_PARTS" as const },
    { slug: "motorcycles", nameAr: "موتسيكلات وتروسيكلات", nameEn: "Motorcycles & Tricycles", sortOrder: 3, commissionType: "CARS_PARTS" as const },
    { slug: "motorcycle-parts", nameAr: "قطع غيار موتسيكلات", nameEn: "Motorcycle Parts", sortOrder: 4, commissionType: "CARS_PARTS" as const },
    { slug: "real-estate-sale", nameAr: "عقارات - تمليك", nameEn: "Real Estate - Sale", sortOrder: 5, commissionType: "REAL_ESTATE_SALE" as const },
    { slug: "real-estate-rent", nameAr: "عقارات - إيجار", nameEn: "Real Estate - Rent", sortOrder: 6, commissionType: "REAL_ESTATE_RENT" as const },
    { slug: "mobiles", nameAr: "موبايلات وتابلت", nameEn: "Mobiles & Tablets", sortOrder: 7, commissionType: "STANDARD" as const },
    { slug: "electronics", nameAr: "أجهزة كهربائية ومنزلية", nameEn: "Home Appliances", sortOrder: 8, commissionType: "STANDARD" as const },
    { slug: "furniture", nameAr: "أثاث ومفروشات", nameEn: "Furniture", sortOrder: 9, commissionType: "STANDARD" as const },
    { slug: "fashion", nameAr: "ملابس وأحذية", nameEn: "Fashion", sortOrder: 10, commissionType: "STANDARD" as const },
    { slug: "pets", nameAr: "حيوانات أليفة", nameEn: "Pets", sortOrder: 11, commissionType: "STANDARD" as const },
    { slug: "jobs", nameAr: "وظائف وخدمات", nameEn: "Jobs & Services", sortOrder: 12, commissionType: "STANDARD" as const },
    { slug: "maintenance", nameAr: "مراكز صيانة", nameEn: "Maintenance centers", sortOrder: 13, commissionType: "STANDARD" as const },
    { slug: "other", nameAr: "أخرى", nameEn: "Other", sortOrder: 14, commissionType: "STANDARD" as const },
  ]

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    })
  }

  // Default packages
  const packages = [
    { slug: "free", nameAr: "مجانية", nameEn: "Free", price: 0, durationDays: 30, maxAds: 5, featuredAds: 0, featuredDays: 0, sortOrder: 1 },
    { slug: "basic", nameAr: "أساسية", nameEn: "Basic", price: 149, durationDays: 30, maxAds: 15, featuredAds: 3, featuredDays: 7, sortOrder: 2 },
    { slug: "pro", nameAr: "احترافية", nameEn: "Professional", price: 349, durationDays: 30, maxAds: 40, featuredAds: 10, featuredDays: 15, sortOrder: 3 },
    { slug: "cars", nameAr: "معارض سيارات", nameEn: "Car Dealers", price: 799, durationDays: 30, maxAds: null, featuredAds: 20, featuredDays: 30, sortOrder: 4 },
    { slug: "realestate", nameAr: "عقارات محترفة", nameEn: "Real Estate Pro", price: 599, durationDays: 30, maxAds: null, featuredAds: 15, featuredDays: 30, sortOrder: 5 },
  ]

  for (const pkg of packages) {
    await prisma.package.upsert({
      where: { slug: pkg.slug },
      update: pkg,
      create: pkg,
    })
  }

  console.log("Seed completed successfully.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

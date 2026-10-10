/** Single source of truth for category list across bar, grid, pages, forms */

export type CatDef = {
  slug: string
  nameAr: string
  nameEn: string
  sortOrder: number
}

export const AREEP_CATEGORIES: CatDef[] = [
  { slug: "cars", nameAr: "سيارات", nameEn: "Cars", sortOrder: 1 },
  { slug: "car-parts", nameAr: "قطع غيار سيارات", nameEn: "Car Parts", sortOrder: 2 },
  { slug: "motorcycles", nameAr: "موتسيكلات وتروسيكلات", nameEn: "Motorcycles", sortOrder: 3 },
  { slug: "motorcycle-parts", nameAr: "قطع غيار موتسيكلات", nameEn: "Motorcycle Parts", sortOrder: 4 },
  { slug: "maintenance", nameAr: "مراكز صيانة", nameEn: "Maintenance", sortOrder: 5 },
  { slug: "real-estate-sale", nameAr: "عقارات - تمليك", nameEn: "Real Estate Sale", sortOrder: 6 },
  { slug: "real-estate-rent", nameAr: "عقارات - إيجار", nameEn: "Real Estate Rent", sortOrder: 7 },
  { slug: "mobiles", nameAr: "موبايلات وتابلت", nameEn: "Mobiles", sortOrder: 8 },
  { slug: "electronics", nameAr: "أجهزة كهربائية", nameEn: "Electronics", sortOrder: 9 },
  { slug: "furniture", nameAr: "أثاث ومفروشات", nameEn: "Furniture", sortOrder: 10 },
  { slug: "fashion", nameAr: "ملابس وأحذية", nameEn: "Fashion", sortOrder: 11 },
  { slug: "pets", nameAr: "حيوانات أليفة", nameEn: "Pets", sortOrder: 12 },
  { slug: "jobs", nameAr: "وظائف", nameEn: "Jobs", sortOrder: 13 },
  { slug: "services", nameAr: "خدمات", nameEn: "Services", sortOrder: 14 },
  { slug: "training", nameAr: "تدريب", nameEn: "Training", sortOrder: 15 },
  { slug: "games", nameAr: "ألعاب", nameEn: "Games", sortOrder: 16 },
  { slug: "food", nameAr: "طعام", nameEn: "Food", sortOrder: 17 },
  { slug: "events", nameAr: "مناسبات", nameEn: "Events", sortOrder: 18 },
  { slug: "programming", nameAr: "برمجة", nameEn: "Programming", sortOrder: 19 },
  { slug: "gardens", nameAr: "حدائق", nameEn: "Gardens", sortOrder: 20 },
  { slug: "arts", nameAr: "فنون", nameEn: "Arts", sortOrder: 21 },
  { slug: "tourism", nameAr: "سياحة", nameEn: "Tourism", sortOrder: 22 },
  { slug: "trips", nameAr: "رحلات", nameEn: "Trips", sortOrder: 23 },
  { slug: "antiques", nameAr: "نوادر", nameEn: "Antiques", sortOrder: 24 },
  { slug: "lost-found", nameAr: "مفقودات", nameEn: "Lost & Found", sortOrder: 25 },
  { slug: "other", nameAr: "أخرى", nameEn: "Other", sortOrder: 26 },
]

export const MAINTENANCE_TYPES = [
  { value: "cars", ar: "مراكز صيانة سيارات", en: "Car maintenance" },
  { value: "car-service", ar: "مراكز خدمة سيارات", en: "Car service centers" },
  { value: "appliances", ar: "مراكز صيانة أجهزة كهربائية", en: "Appliance repair" },
  { value: "mobiles", ar: "مراكز صيانة موبايلات", en: "Mobile repair" },
  { value: "computers", ar: "مراكز صيانة كمبيوترات ولابتوبات", en: "Computer / laptop" },
  { value: "gaming", ar: "مراكز صيانة أجهزة ألعاب", en: "Gaming devices" },
]

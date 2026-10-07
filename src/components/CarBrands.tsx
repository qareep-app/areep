import Link from "next/link"

interface Props {
  locale?: string
}

/** Ordered by popularity in the Egyptian used-car market */
const brands: { slug: string; name: string; logo: string }[] = [
  { slug: "toyota", name: "Toyota", logo: "/brands/toyota.jpg" },
  { slug: "hyundai", name: "Hyundai", logo: "/brands/hyundai.png" },
  { slug: "kia", name: "Kia", logo: "/brands/kia.png" },
  { slug: "nissan", name: "Nissan", logo: "/brands/nissan.png" },
  { slug: "chevrolet", name: "Chevrolet", logo: "/brands/chevrolet.png" },
  { slug: "mg", name: "MG", logo: "/brands/mg.png" },
  { slug: "geely", name: "Geely", logo: "/brands/geely.png" },
  { slug: "mitsubishi", name: "Mitsubishi", logo: "/brands/mitsubishi.png" },
  { slug: "honda", name: "Honda", logo: "/brands/honda.png" },
  { slug: "changan", name: "Changan", logo: "/brands/changan.png" },
  { slug: "mercedes", name: "Mercedes", logo: "/brands/mercedes.png" },
  { slug: "bmw", name: "BMW", logo: "/brands/bmw.jpg" },
  { slug: "ford", name: "Ford", logo: "/brands/ford.png" },
  { slug: "peugeot", name: "Peugeot", logo: "/brands/peugeot.png" },
  { slug: "renault", name: "Renault", logo: "/brands/renault.png" },
  { slug: "opel", name: "Opel", logo: "/brands/opel.png" },
  { slug: "volkswagen", name: "Volkswagen", logo: "/brands/volkswagen.png" },
  { slug: "jeep", name: "Jeep", logo: "/brands/jeep.png" },
  { slug: "fiat", name: "Fiat", logo: "/brands/fiat.png" },
  { slug: "haval", name: "Haval", logo: "/brands/haval.png" },
  { slug: "audi", name: "Audi", logo: "/brands/audi.png" },
  { slug: "lexus", name: "Lexus", logo: "/brands/lexus.png" },
  { slug: "skoda", name: "Skoda", logo: "/brands/skoda.png" },
  { slug: "daihatsu", name: "Daihatsu", logo: "/brands/daihatsu.png" },
  { slug: "isuzu", name: "Isuzu", logo: "/brands/isuzu.png" },
  { slug: "gac", name: "GAC", logo: "/brands/gac.png" },
  { slug: "citroen", name: "Citroen", logo: "/brands/citroen.png" },
  { slug: "seat", name: "Seat", logo: "/brands/seat.png" },
  { slug: "mini", name: "Mini", logo: "/brands/mini.png" },
  { slug: "daewoo", name: "Daewoo", logo: "/brands/daewoo.png" },
  { slug: "proton", name: "Proton", logo: "/brands/proton.png" },
  { slug: "dodge", name: "Dodge", logo: "/brands/dodge.png" },
  { slug: "cadillac", name: "Cadillac", logo: "/brands/cadillac.png" },
  { slug: "hino", name: "Hino", logo: "/brands/hino.png" },
  { slug: "porsche", name: "Porsche", logo: "/brands/porsche.png" },
  { slug: "ferrari", name: "Ferrari", logo: "/brands/ferrari.png" },
  { slug: "lamborghini", name: "Lamborghini", logo: "/brands/lamborghini.png" },
]

export default function CarBrands({ locale = "ar" }: Props) {
  const isRtl = locale === "ar"

  return (
    <section className="py-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-800">
          {isRtl ? "ماركات السيارات" : "Car brands"}
        </h3>
        <Link
          href={`/${locale}/ads?category=cars`}
          className="text-xs text-emerald-600 font-medium hover:underline"
        >
          {isRtl ? "عرض المزيد" : "More"}
        </Link>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2.5">
        {brands.map((b) => (
          <Link
            key={b.slug}
            href={`/${locale}/ads?category=cars&brand=${b.slug}`}
            className="group relative flex items-center justify-center h-16 sm:h-[4.5rem] rounded-2xl bg-white border border-gray-100 hover:border-emerald-300 hover:shadow-md transition overflow-hidden"
            style={{
              boxShadow:
                "0 3px 8px rgb(0 0 0 / 0.06), inset 0 1px 0 rgb(255 255 255 / 0.9)",
            }}
            title={b.name}
          >
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-gray-50 to-transparent" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={b.logo}
              alt={b.name}
              className="relative z-10 max-h-10 sm:max-h-12 max-w-[85%] object-contain group-hover:scale-105 transition-transform duration-200"
            />
          </Link>
        ))}
      </div>
    </section>
  )
}

import Link from "next/link"

interface Props {
  locale?: string
  limit?: number
}

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
  { slug: "mazda", name: "Mazda", logo: "/brands/mazda.png" },
  { slug: "peugeot", name: "Peugeot", logo: "/brands/peugeot.png" },
  { slug: "renault", name: "Renault", logo: "/brands/renault.png" },
  { slug: "opel", name: "Opel", logo: "/brands/opel.png" },
  { slug: "volkswagen", name: "Volkswagen", logo: "/brands/volkswagen.png" },
  { slug: "jeep", name: "Jeep", logo: "/brands/jeep.png" },
  { slug: "gmc", name: "GMC", logo: "/brands/gmc.png" },
  { slug: "land-rover", name: "Land Rover", logo: "/brands/land-rover.png" },
  { slug: "fiat", name: "Fiat", logo: "/brands/fiat.png" },
  { slug: "haval", name: "Haval", logo: "/brands/haval.png" },
  { slug: "audi", name: "Audi", logo: "/brands/audi.png" },
  { slug: "lexus", name: "Lexus", logo: "/brands/lexus.png" },
  { slug: "volvo", name: "Volvo", logo: "/brands/volvo.png" },
  { slug: "tesla", name: "Tesla", logo: "/brands/tesla.png" },
  { slug: "skoda", name: "Skoda", logo: "/brands/skoda.png" },
  { slug: "daihatsu", name: "Daihatsu", logo: "/brands/daihatsu.png" },
  { slug: "isuzu", name: "Isuzu", logo: "/brands/isuzu.png" },
  { slug: "foton", name: "Foton", logo: "/brands/foton.png" },
  { slug: "dfsk", name: "DFSK", logo: "/brands/dfsk.png" },
  { slug: "gac", name: "GAC", logo: "/brands/gac.png" },
  { slug: "citroen", name: "Citroen", logo: "/brands/citroen.png" },
  { slug: "seat", name: "Seat", logo: "/brands/seat.png" },
  { slug: "mini", name: "Mini", logo: "/brands/mini.png" },
  { slug: "scania", name: "Scania", logo: "/brands/scania.png" },
  { slug: "kawasaki", name: "Kawasaki", logo: "/brands/kawasaki.png" },
  { slug: "daewoo", name: "Daewoo", logo: "/brands/daewoo.png" },
  { slug: "proton", name: "Proton", logo: "/brands/proton.png" },
  { slug: "dodge", name: "Dodge", logo: "/brands/dodge.png" },
  { slug: "cadillac", name: "Cadillac", logo: "/brands/cadillac.png" },
  { slug: "hino", name: "Hino", logo: "/brands/hino.png" },
  { slug: "porsche", name: "Porsche", logo: "/brands/porsche.png" },
  { slug: "ferrari", name: "Ferrari", logo: "/brands/ferrari.png" },
  { slug: "lamborghini", name: "Lamborghini", logo: "/brands/lamborghini.png" },
]

export { brands }

export default function CarBrandsSidebar({ locale = "ar", limit = 9 }: Props) {
  const isRtl = locale === "ar"
  const visible = brands.slice(0, limit)
  const hasMore = brands.length > limit

  return (
    <aside className="w-full">
      <div className="bg-white rounded-2xl border border-gray-100 p-3 sticky top-36">
        <h3 className="text-sm font-bold text-gray-800 mb-3 px-1">
          {isRtl ? "ماركات السيارات" : "Car brands"}
        </h3>

        <div className="grid grid-cols-3 gap-2.5">
          {visible.map((b) => (
            <Link
              key={b.slug}
              href={`/${locale}/ads?category=cars&brand=${b.slug}`}
              className="group flex items-center justify-center h-20 rounded-xl bg-gray-50 border border-gray-100 hover:border-emerald-300 hover:bg-white transition p-2"
              title={b.name}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={b.logo}
                alt={b.name}
                className="max-h-14 max-w-full object-contain group-hover:scale-105 transition"
              />
            </Link>
          ))}
        </div>

        {hasMore && (
          <Link
            href={`/${locale}/brands`}
            className="mt-3 block text-center text-sm font-medium text-emerald-600 hover:text-emerald-700 py-2 rounded-xl border border-dashed border-emerald-200 hover:bg-emerald-50 transition"
          >
            {isRtl ? "عرض المزيد" : "Show more"}
          </Link>
        )}
      </div>
    </aside>
  )
}

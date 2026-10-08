/** Normalize Egyptian mobile for ADMIN_PHONES comparison */
export function normalizePhone(phone: string): string {
  let p = String(phone || "").replace(/[\s\-()]/g, "")
  if (p.startsWith("+20")) p = "0" + p.slice(3)
  if (p.startsWith("20") && p.length >= 12) p = "0" + p.slice(2)
  return p
}

export function isAdminPhone(phone: string | null | undefined): boolean {
  if (!phone) return false
  const list = (process.env.ADMIN_PHONES || "")
    .split(/[,;\s]+/)
    .map((s) => normalizePhone(s))
    .filter(Boolean)
  const n = normalizePhone(phone)
  return list.includes(n)
}

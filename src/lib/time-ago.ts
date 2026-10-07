export function timeAgo(date: Date | string, isRtl = true): string {
  const d = typeof date === "string" ? new Date(date) : date
  const sec = Math.floor((Date.now() - d.getTime()) / 1000)
  if (sec < 60) return isRtl ? "الآن" : "just now"
  const min = Math.floor(sec / 60)
  if (min < 60) return isRtl ? `قبل ${min} دقيقة` : `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return isRtl ? `قبل ${hr} ساعة` : `${hr}h ago`
  const day = Math.floor(hr / 24)
  if (day < 30) return isRtl ? `قبل ${day} يوم` : `${day}d ago`
  const mo = Math.floor(day / 30)
  return isRtl ? `قبل ${mo} شهر` : `${mo}mo ago`
}

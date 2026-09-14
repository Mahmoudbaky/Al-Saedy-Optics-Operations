export { cn } from "cn"

/** "Dr. Ahmed Al-Saedy" → "AA", "محمود ب." → "مب". */
export function initials(name: string): string {
  return name
    .replace(/^Dr\.\s*/i, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("")
}

import type { LensAddon } from "@/types"

export const lensAddons: LensAddon[] = [
  { id: "la-1", key: "blueLight", nameEn: "Blue-light filter", descriptionEn: "Reduces screen glare", nameAr: "حماية من الضوء الأزرق", price: 15_000, sortOrder: 1, isActive: true, pastOrdersCount: 212 },
  { id: "la-2", key: "antiGlare", nameEn: "Anti-glare coating", descriptionEn: "Night driving and screens", nameAr: "طلاء مضاد للانعكاس", price: 9_000, sortOrder: 2, isActive: true, pastOrdersCount: 158 },
  { id: "la-3", key: "thin167", nameEn: "Thin lens 1.67", descriptionEn: "For strong prescriptions", nameAr: "عدسة رقيقة 1.67", price: 22_000, sortOrder: 3, isActive: true, pastOrdersCount: 64 },
  { id: "la-4", key: "photochromic", nameEn: "Photochromic", descriptionEn: "Darkens in sunlight", nameAr: "عدسات متغيّرة اللون", price: 35_000, sortOrder: 4, isActive: true, pastOrdersCount: 41 },
  { id: "la-5", key: "scratchGuard", nameEn: "Scratch guard", descriptionEn: "Two-year warranty", nameAr: "حماية من الخدوش", price: 6_000, sortOrder: 5, isActive: true, pastOrdersCount: 301 },
  { id: "la-6", key: "tintFashion", nameEn: "Fashion tint", descriptionEn: "Seasonal, Baghdad branch only", nameAr: "صبغة ملوّنة", price: 12_000, sortOrder: 6, isActive: false, pastOrdersCount: 14 },
]

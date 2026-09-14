import type { Customer } from "@/types"

const hoursAgo = (h: number) => new Date(Date.now() - h * 3_600_000).toISOString()

export const customers: Customer[] = [
  { id: "c-1", name: "Maryam Abdullah", email: "maryam.a@gmail.com", phone: "0770 123 4567", language: "ar", role: "customer", status: "active", ordersCount: 9, totalSpent: 1_184_000, lastOrderAt: hoursAgo(2), joinedAt: "2025-08-01" },
  { id: "c-2", name: "Hassan Al-Ani", email: "h.alani@gmail.com", phone: "0771 884 2210", language: "ar", role: "customer", status: "active", ordersCount: 6, totalSpent: 742_000, lastOrderAt: hoursAgo(0.4), joinedAt: "2025-11-01" },
  { id: "c-3", name: "Zahra Kareem", email: "zahra.k@outlook.com", phone: "0780 445 9087", language: "en", role: "customer", status: "active", ordersCount: 4, totalSpent: 556_000, lastOrderAt: hoursAgo(0.7), joinedAt: "2026-01-01" },
  { id: "c-4", name: "Dr. Ahmed Al-Saedy", email: "ahmed@alsaedy.iq", phone: "0770 900 1122", language: "ar", role: "admin", status: "active", ordersCount: 0, totalSpent: 0, lastOrderAt: null, joinedAt: "2024-03-01" },
  { id: "c-5", name: "Omar Saleh", email: "omar.s@gmail.com", phone: "0751 220 3344", language: "ar", role: "customer", status: "active", ordersCount: 2, totalSpent: 198_000, lastOrderAt: hoursAgo(1), joinedAt: "2026-02-01" },
  { id: "c-6", name: "Ali Jabbar", email: "ali.j@gmail.com", phone: "0770 991 5566", language: "ar", role: "customer", status: "banned", ordersCount: 1, totalSpent: 0, lastOrderAt: hoursAgo(3), joinedAt: "2026-06-01" },
  { id: "c-7", name: "Sara Hameed", email: "sara.h@gmail.com", phone: "0790 112 3344", language: "en", role: "customer", status: "active", ordersCount: 7, totalSpent: 903_000, lastOrderAt: hoursAgo(8), joinedAt: "2025-09-01" },
]

export const CUSTOMERS_TOTAL_COUNT = 2_418

/** Backend base URL (no trailing slash). Kept import-free so both the auth and API clients can use it. */
export const API_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:3000").replace(/\/+$/, "")
export const API_V1 = `${API_URL}/api/v1`

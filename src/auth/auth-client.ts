import { adminClient } from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"

import { API_URL } from "@/api/config"

/**
 * Better Auth browser client. Sessions are cookie-based: the backend sets
 * `better-auth.session_token` on sign-in and axios sends it back with `withCredentials`.
 */
export const authClient = createAuthClient({
  baseURL: API_URL,
  fetchOptions: { credentials: "include" },
  plugins: [adminClient()],
})

export type SessionUser = typeof authClient.$Infer.Session.user

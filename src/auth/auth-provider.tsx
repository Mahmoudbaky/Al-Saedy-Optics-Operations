import * as React from "react"
import { useQueryClient } from "@tanstack/react-query"

import { onUnauthorized } from "@/api/client"

import { authClient } from "./auth-client"
import { AuthContext, type AuthContextValue } from "./auth-context"
import { AuthError } from "./auth-error"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data, isPending, refetch } = authClient.useSession()
  const qc = useQueryClient()
  const user = data?.user ?? null

  // An API 401 means the cookie died server-side (expired, banned, revoked): re-check the session.
  React.useEffect(() => onUnauthorized(() => void refetch()), [refetch])

  const signIn = React.useCallback(async (email: string, password: string) => {
    const { error } = await authClient.signIn.email({ email: email.trim().toLowerCase(), password })
    if (error) throw new AuthError(error.code ?? "UNKNOWN", error.message ?? "Sign-in failed", error.status)
  }, [])

  const signOut = React.useCallback(async () => {
    await authClient.signOut()
    qc.clear()
  }, [qc])

  const value = React.useMemo<AuthContextValue>(
    () => ({ user, isPending, isAdmin: user?.role === "admin", signIn, signOut }),
    [user, isPending, signIn, signOut]
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

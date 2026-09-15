import * as React from "react"

import { AuthContext, type AuthContextValue } from "./auth-context"

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}

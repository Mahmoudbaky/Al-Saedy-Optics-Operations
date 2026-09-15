import * as React from "react"

import type { SessionUser } from "./auth-client"

export interface AuthContextValue {
  user: SessionUser | null
  /** True while the cookie session is being restored on first load. */
  isPending: boolean
  isAdmin: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

export const AuthContext = React.createContext<AuthContextValue | null>(null)

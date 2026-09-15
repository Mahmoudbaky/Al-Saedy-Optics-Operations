import { Navigate, Outlet, useLocation } from "react-router"

import { Spinner } from "@/components/shared/spinner"

import { useAuth } from "./use-auth"

/** Layout route: renders children only for signed-in admins, otherwise bounces to /login. */
export function RequireAdmin() {
  const { user, isAdmin, isPending } = useAuth()
  const location = useLocation()

  if (isPending) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Spinner />
      </div>
    )
  }
  if (!user || !isAdmin) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search, notAdmin: !!user && !isAdmin }} />
  }
  return <Outlet />
}

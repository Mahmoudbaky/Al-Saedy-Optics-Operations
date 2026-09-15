import * as React from "react"
import { Navigate, useLocation, useNavigate } from "react-router"

import { AuthError, useAuth } from "@/auth"
import { LanguageToggle } from "@/components/layout/language-toggle"
import { BrandMark } from "@/components/shared/brand-logo"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useI18n } from "@/lib/i18n"

/** POST /api/auth/sign-in/email — cookie session; only `role: admin` may enter. */
function LoginPage() {
  const { t } = useI18n()
  const { user, isAdmin, isPending, signIn, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string; notAdmin?: boolean } | null)?.from ?? "/"
  const bouncedNotAdmin = (location.state as { notAdmin?: boolean } | null)?.notAdmin ?? false

  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [error, setError] = React.useState<string | null>(bouncedNotAdmin ? t("auth.notAdmin") : null)
  const [submitting, setSubmitting] = React.useState(false)

  if (!isPending && user && isAdmin) return <Navigate to={from} replace />

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await signIn(email, password)
      // The session store updates after sign-in; role is checked by RequireAdmin on the next render.
      const session = await import("@/auth/auth-client").then((m) => m.authClient.getSession())
      if (session.data?.user.role !== "admin") {
        await signOut()
        setError(t("auth.notAdmin"))
        return
      }
      navigate(from, { replace: true })
    } catch (err) {
      if (err instanceof AuthError) {
        setError(err.status === 0 ? t("error.network") : err.code === "INVALID_EMAIL_OR_PASSWORD" ? t("auth.invalid") : t("auth.failed"))
      } else {
        setError(t("auth.failed"))
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-svh flex-col bg-muted/40">
      <div className="flex justify-end p-4">
        <LanguageToggle />
      </div>
      <div className="flex flex-1 items-center justify-center p-4">
        <Card className="w-full max-w-sm">
          <CardHeader className="items-center text-center">
            <span className="mb-2 flex rounded-md bg-secondary p-2">
              <BrandMark className="size-8" />
            </span>
            <CardTitle className="font-heading text-xl">{t("auth.title")}</CardTitle>
            <CardDescription>{t("auth.subtitle")}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} noValidate>
              <FieldGroup className="gap-4">
                <Field>
                  <FieldLabel htmlFor="email">{t("auth.email")}</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    dir="ltr"
                    autoComplete="email"
                    autoFocus
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Field>
                <Field data-invalid={error ? true : undefined}>
                  <FieldLabel htmlFor="password">{t("auth.password")}</FieldLabel>
                  <Input
                    id="password"
                    type="password"
                    dir="ltr"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  {error ? <FieldError>{error}</FieldError> : null}
                </Field>
                <Button type="submit" size="lg" disabled={submitting || !email || !password}>
                  {submitting ? t("auth.signingIn") : t("auth.signIn")}
                </Button>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export { LoginPage }

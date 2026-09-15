import { QueryClientProvider } from "@tanstack/react-query"
import { RouterProvider } from "react-router"

import { AuthProvider } from "@/auth"
import { I18nProvider } from "@/lib/i18n"
import { queryClient } from "@/lib/query-client"
import { router } from "@/routes"

function App() {
  return (
    <I18nProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </QueryClientProvider>
    </I18nProvider>
  )
}

export { App }

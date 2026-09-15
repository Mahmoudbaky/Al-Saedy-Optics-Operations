import { QueryClient } from "@tanstack/react-query"

import { ApiError } from "@/api/errors"

/** One client for the app. 4xx responses are not retried – they will not change. */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: (count, error) => !(ApiError.is(error) && error.status >= 400 && error.status < 500) && count < 2,
      refetchOnWindowFocus: true,
    },
    mutations: { retry: 0 },
  },
})

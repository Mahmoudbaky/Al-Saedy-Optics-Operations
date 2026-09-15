import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { api } from "./client"
import { qk } from "./query-keys"
import type { AdminUser, UserListQuery, UserRole } from "./types"

export function useUsers(params: UserListQuery) {
  return useQuery({
    queryKey: qk.users.list(params),
    queryFn: () => api.getPaged<AdminUser>("/admin/users", params),
    placeholderData: keepPreviousData,
  })
}

function useUserMutation<TVars>(mutationFn: (vars: TVars) => Promise<AdminUser>) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: (user) => {
      qc.setQueryData(qk.users.detail(user.id), user)
      qc.invalidateQueries({ queryKey: qk.users.all })
    },
  })
}

export function useSetUserRole() {
  return useUserMutation(({ id, role }: { id: string; role: UserRole }) => api.post<AdminUser>(`/admin/users/${id}/role`, { role }))
}

export function useBanUser() {
  return useUserMutation(({ id, reason }: { id: string; reason?: string }) =>
    api.post<AdminUser>(`/admin/users/${id}/ban`, reason ? { reason } : {})
  )
}

export function useUnbanUser() {
  return useUserMutation(({ id }: { id: string }) => api.post<AdminUser>(`/admin/users/${id}/unban`))
}

// Custom hook quản lý truy vấn và cập nhật trạng thái tài khoản quản trị bằng TanStack Query.
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { userService } from '@/features/users/services/user.service'
import { adminUserKeys } from '@/features/users/keys/admin.user.keys'
import type { AdminUser } from '@/features/users/helpers/admin.user.helper'
import type { UserProfile } from '@/types/api.types'

export async function fetchAdminUsers(): Promise<AdminUser[]> {
  const [adminRes, teacherRes, allRes] = await Promise.allSettled([
    userService.getAllUsers({ role: 'ADMIN', limit: 50 }),
    userService.getAllUsers({ role: 'INSTRUCTOR', limit: 50 }),
    userService.getAllUsers({ limit: 100 }),
  ])

  const items: UserProfile[] = []
  const seenIds = new Set<string>()

  const extractList = (val: unknown): UserProfile[] => {
    if (!val) return []
    if (Array.isArray(val)) return val as UserProfile[]
    const paginated = val as { result?: UserProfile[] }
    return Array.isArray(paginated.result) ? paginated.result : []
  }

  if (adminRes.status === 'fulfilled' && adminRes.value) {
    extractList(adminRes.value).forEach((u) => {
      if (u.user_id && !seenIds.has(u.user_id)) {
        seenIds.add(u.user_id)
        items.push(u)
      }
    })
  }

  if (teacherRes.status === 'fulfilled' && teacherRes.value) {
    extractList(teacherRes.value).forEach((u) => {
      if (u.user_id && !seenIds.has(u.user_id)) {
        seenIds.add(u.user_id)
        items.push(u)
      }
    })
  }

  if (allRes.status === 'fulfilled' && allRes.value) {
    extractList(allRes.value).forEach((u) => {
      const roleUpper = (u.role || '').toUpperCase()
      if (roleUpper === 'ADMIN' || roleUpper === 'INSTRUCTOR') {
        const uid = u.user_id
        if (uid && !seenIds.has(uid)) {
          seenIds.add(uid)
          items.push(u)
        }
      }
    })
  }

  return items.map((u: UserProfile) => ({
    id: u.user_id,
    name: u.full_name,
    email: u.email,
    role: u.role?.toUpperCase() === 'INSTRUCTOR' ? 'INSTRUCTOR' : 'ADMIN',
    is_active: u.status?.toUpperCase() === 'ACTIVE',
    avatar: u.avatar_url || undefined,
    created_at: u.created_at || new Date().toISOString(),
    last_active: 'Vừa xong',
    phone: u.phone_number || undefined,
  }))
}

export function useAdminUsersQuery(params?: Record<string, unknown>) {
  return useQuery<AdminUser[]>({
    queryKey: adminUserKeys.list(params),
    queryFn: () => fetchAdminUsers(),
    placeholderData: keepPreviousData,
    staleTime: 0,
  })
}

export function useUpdateAdminUserStatusMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: 'ACTIVE' | 'BLOCKED' }) =>
      userService.updateUserStatus(userId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminUserKeys.all })
    },
  })
}

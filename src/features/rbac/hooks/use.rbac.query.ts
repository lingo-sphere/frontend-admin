// Custom hook quản lý truy vấn và đột biến vai trò, quyền hạn bằng TanStack Query.
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { roleService } from '@/features/rbac/services/role.service'
import { userService } from '@/features/users/services/user.service'
import { rbacKeys } from '@/features/rbac/keys/rbac.keys'
import type { Role, Permission, UserProfile } from '@/types/api.types'

export function useRolesQuery(params?: { pageSize?: number; search?: string }, enabled = true) {
  const queryParams = { pageSize: 50, ...params }

  return useQuery<Role[]>({
    queryKey: rbacKeys.roles(queryParams),
    queryFn: async () => {
      const res = await roleService.getAllRoles(queryParams)
      return Array.isArray(res) ? res : (res?.result || [])
    },
    enabled,
    staleTime: 60 * 1000,
  })
}

export function usePermissionsQuery(params?: { pageSize?: number; search?: string }, enabled = true) {
  const queryParams = { pageSize: 100, ...params }

  return useQuery<Permission[]>({
    queryKey: rbacKeys.permissions(queryParams),
    queryFn: async () => {
      const res = await roleService.getAllPermissions(queryParams)
      return Array.isArray(res) ? res : (res?.result || [])
    },
    enabled,
    staleTime: 60 * 1000,
  })
}

export function useRbacUsersQuery(enabled = true) {
  return useQuery<UserProfile[]>({
    queryKey: rbacKeys.users(),
    queryFn: async () => {
      const res = await userService.getAllUsers({ limit: 50 })
      return Array.isArray(res) ? res : (res?.result || [])
    },
    enabled,
    staleTime: 60 * 1000,
  })
}

export function useCreateRoleMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: { name: string; description?: string; permissions?: string[]; is_active?: boolean }) =>
      roleService.createRole(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rbacKeys.roles() })
    },
  })
}

export function useUpdateRoleMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { name?: string; description?: string; permissions?: string[]; is_active?: boolean } }) =>
      roleService.updateRole(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rbacKeys.roles() })
    },
  })
}

export function useDeleteRoleMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => roleService.deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rbacKeys.roles() })
    },
  })
}

export function useCreatePermissionMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: { name: string; api_path: string; method: string; module: string; description?: string }) =>
      roleService.createPermission(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rbacKeys.permissions() })
    },
  })
}

export function useUpdatePermissionMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { name?: string; api_path?: string; method?: string; module?: string; description?: string } }) =>
      roleService.updatePermission(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rbacKeys.permissions() })
    },
  })
}

export function useDeletePermissionMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => roleService.deletePermission(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rbacKeys.permissions() })
    },
  })
}

export function useAssignRoleMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      roleService.assignUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rbacKeys.all })
    },
  })
}


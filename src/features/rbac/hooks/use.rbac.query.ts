// Custom hook quản lý truy vấn và đột biến vai trò, quyền hạn bằng TanStack Query.
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { roleService } from '@/features/rbac/services/role.service'
import { userService } from '@/features/users/services/user.service'
import { rbacKeys } from '@/features/rbac/keys/rbac.keys'
import type { Role, Permission, UserProfile } from '@/types/api.types'

export interface PaginatedRolesResult {
  items: Role[]
  total: number
  current: number
  pageSize: number
  pages: number
}

export interface PaginatedPermissionsResult {
  items: Permission[]
  total: number
  current: number
  pageSize: number
  pages: number
}

export function useRolesQuery(params?: { current?: number; pageSize?: number; search?: string }, enabled = true) {
  const queryParams = { pageSize: 10, current: 1, ...params }

  return useQuery<PaginatedRolesResult>({
    queryKey: rbacKeys.roles(queryParams),
    queryFn: async () => {
      const res = await roleService.getAllRoles(queryParams)
      const rawItems: Role[] = Array.isArray(res) ? res : (res?.result || [])
      const meta = Array.isArray(res)
        ? { current: queryParams.current || 1, pageSize: queryParams.pageSize || 10, pages: 1, total: rawItems.length }
        : {
            current: res?.meta?.current || queryParams.current || 1,
            pageSize: res?.meta?.pageSize || queryParams.pageSize || 10,
            pages: res?.meta?.pages || 1,
            total: res?.meta?.total ?? rawItems.length,
          }
      return {
        items: rawItems,
        total: meta.total,
        current: meta.current,
        pageSize: meta.pageSize,
        pages: meta.pages,
      }
    },
    enabled,
    staleTime: 60 * 1000,
  })
}

export function useAllRolesQuery(enabled = true) {
  return useQuery<Role[]>({
    queryKey: ['rbac', 'roles', 'all'] as const,
    queryFn: async () => {
      const res = await roleService.getAllRoles({ pageSize: 50 })
      return Array.isArray(res) ? res : (res?.result || [])
    },
    enabled,
    staleTime: 5 * 60 * 1000,
  })
}

export function usePermissionsQuery(
  params?: { current?: number; pageSize?: number; search?: string; module?: string; name?: string; api_path?: string },
  enabled = true,
) {
  const queryParams = { pageSize: 10, current: 1, ...params }

  return useQuery<PaginatedPermissionsResult>({
    queryKey: rbacKeys.permissions(queryParams),
    queryFn: async () => {
      const res = await roleService.getAllPermissions(queryParams)
      const rawItems: Permission[] = Array.isArray(res) ? res : (res?.result || [])
      const meta = Array.isArray(res)
        ? { current: queryParams.current || 1, pageSize: queryParams.pageSize || 10, pages: 1, total: rawItems.length }
        : {
            current: res?.meta?.current || queryParams.current || 1,
            pageSize: res?.meta?.pageSize || queryParams.pageSize || 10,
            pages: res?.meta?.pages || 1,
            total: res?.meta?.total ?? rawItems.length,
          }
      return {
        items: rawItems,
        total: meta.total,
        current: meta.current,
        pageSize: meta.pageSize,
        pages: meta.pages,
      }
    },
    enabled,
    staleTime: 60 * 1000,
  })
}

export function useAllPermissionsQuery(enabled = true) {
  return useQuery<Permission[]>({
    queryKey: ['rbac', 'permissions', 'all'] as const,
    queryFn: async () => {
      const res = await roleService.getAllPermissions({ pageSize: 100 })
      return Array.isArray(res) ? res : (res?.result || [])
    },
    enabled,
    staleTime: 5 * 60 * 1000,
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


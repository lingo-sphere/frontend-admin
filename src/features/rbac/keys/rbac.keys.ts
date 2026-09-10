// Quản lý Query Key tập trung cho module phân quyền (RBAC) trong frontend-admin.
export const rbacKeys = {
  all: ['rbac'] as const,
  roles: (params?: Record<string, unknown>) => [...rbacKeys.all, 'roles', params ?? {}] as const,
  permissions: (params?: Record<string, unknown>) => [...rbacKeys.all, 'permissions', params ?? {}] as const,
  users: () => [...rbacKeys.all, 'users'] as const,
}

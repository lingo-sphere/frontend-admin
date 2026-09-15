// Quản lý Query Key tập trung cho module phân quyền (RBAC) trong frontend-admin.
export const rbacKeys = {
  all: ['rbac'] as const,
  roles: (params?: Record<string, unknown>) =>
    (params ? [...rbacKeys.all, 'roles', params] as const : [...rbacKeys.all, 'roles'] as const),
  permissions: (params?: Record<string, unknown>) =>
    (params ? [...rbacKeys.all, 'permissions', params] as const : [...rbacKeys.all, 'permissions'] as const),
  users: () => [...rbacKeys.all, 'users'] as const,
}

// Quản lý Query Key tập trung cho module người dùng quản trị (Admin Users) trong frontend-admin.
export const adminUserKeys = {
  all: ['admin-users'] as const,
  lists: () => [...adminUserKeys.all, 'list'] as const,
  list: (params?: Record<string, unknown>) => [...adminUserKeys.lists(), params ?? {}] as const,
}

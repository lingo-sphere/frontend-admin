// Quản lý Query Key tập trung cho module cấu hình gói cước trong frontend-admin.
export const settingsPlansKeys = {
  all: ['settings-plans'] as const,
  lists: () => [...settingsPlansKeys.all, 'list'] as const,
}

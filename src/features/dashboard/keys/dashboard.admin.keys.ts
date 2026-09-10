// Định nghĩa query keys quản lý phân tích dữ liệu tổng quan cho Dashboard Admin.
export const dashboardAdminKeys = {
  all: ['dashboard', 'admin'] as const,
  analytics: () => [...dashboardAdminKeys.all, 'analytics'] as const,
  courses: () => [...dashboardAdminKeys.all, 'courses'] as const,
}

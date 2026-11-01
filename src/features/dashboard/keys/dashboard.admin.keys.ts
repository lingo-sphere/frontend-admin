// Định nghĩa query keys quản lý phân tích dữ liệu tổng quan cho Dashboard Admin.
export const dashboardAdminKeys = {
  all: ['dashboard', 'admin'] as const,
  analytics: () => [...dashboardAdminKeys.all, 'analytics'] as const,
  courses: () => [...dashboardAdminKeys.all, 'courses'] as const,
  exams: () => [...dashboardAdminKeys.all, 'exams'] as const,
  toeicAttempts: () => [...dashboardAdminKeys.all, 'toeic-attempts'] as const,
  platformStats: () => [...dashboardAdminKeys.all, 'platform-stats'] as const,
  users: () => [...dashboardAdminKeys.all, 'users'] as const,
}

// Định nghĩa query keys quản lý ngân hàng đề thi Admin.
export const examAdminKeys = {
  all: ['exams', 'admin'] as const,
  list: (params?: Record<string, unknown>) => [...examAdminKeys.all, 'list', params] as const,
  detail: (id: string) => [...examAdminKeys.all, 'detail', id] as const,
  placementAttempts: (params?: Record<string, unknown>) => [...examAdminKeys.all, 'placement-attempts', params] as const,
  attemptResult: (attemptId: string) => [...examAdminKeys.all, 'attempt-result', attemptId] as const,
  userAttempts: (userId: string) => [...examAdminKeys.all, 'user-attempts', userId] as const,
}

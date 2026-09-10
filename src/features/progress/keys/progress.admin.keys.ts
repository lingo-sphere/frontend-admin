// Định nghĩa Query Keys tập trung cho module Thống kê Tiến độ và AI Metrics trong trang quản trị Admin
export const progressAdminKeys = {
  all: ['progress-admin'] as const,
  toeicOverview: () => [...progressAdminKeys.all, 'toeic-overview'] as const,
  aiMetrics: () => [...progressAdminKeys.all, 'ai-metrics'] as const,
}

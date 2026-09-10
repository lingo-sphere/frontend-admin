// Định nghĩa Query Keys tập trung cho module Notifications trong trang quản trị Admin
export const notificationsAdminKeys = {
  all: ['notifications-admin'] as const,
  list: () => [...notificationsAdminKeys.all, 'list'] as const,
}

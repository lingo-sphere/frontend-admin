// Quản lý Query Key tập trung cho module người dùng và học viên trong frontend-admin.
import type { UserQueryParams } from '@/features/users/services/user.service'

export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (params?: UserQueryParams) => [...userKeys.lists(), params ?? {}] as const,
  learners: (params?: UserQueryParams) => [...userKeys.all, 'learners', params ?? {}] as const,
  detail: (userId: string) => [...userKeys.all, 'detail', userId] as const,
}

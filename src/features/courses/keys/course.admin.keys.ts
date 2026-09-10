// Quản lý Query Key tập trung cho module khóa học trong frontend-admin.
import type { CourseFilterParams } from '@/features/courses/services/course.service'

export const courseAdminKeys = {
  all: ['admin-courses'] as const,
  lists: () => [...courseAdminKeys.all, 'list'] as const,
  list: (params?: CourseFilterParams & { current?: number; pageSize?: number }) =>
    [...courseAdminKeys.lists(), params ?? {}] as const,
  detail: (id: string) => [...courseAdminKeys.all, 'detail', id] as const,
}

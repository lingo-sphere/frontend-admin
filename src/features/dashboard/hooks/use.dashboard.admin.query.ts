// Custom hook quản lý truy vấn số liệu phân tích tổng quan Dashboard Admin bằng TanStack Query.
import { useQuery } from '@tanstack/react-query'
import { userService } from '@/features/users/services/user.service'
import { courseService } from '@/features/courses/services/course.service'
import { dashboardAdminKeys } from '@/features/dashboard/keys/dashboard.admin.keys'
import type { SystemAnalyticsOverview, Course as ApiCourse } from '@/types/api.types'

export function useSystemAnalyticsQuery(enabled = true) {
  return useQuery<SystemAnalyticsOverview>({
    queryKey: dashboardAdminKeys.analytics(),
    queryFn: async () => {
      return userService.getSystemAnalytics()
    },
    enabled,
    staleTime: 60 * 1000,
  })
}

export function useDashboardCoursesQuery(enabled = true) {
  return useQuery<ApiCourse[]>({
    queryKey: dashboardAdminKeys.courses(),
    queryFn: async () => {
      const res = await courseService.getAllCourses()
      return Array.isArray(res) ? res : (res?.result || [])
    },
    enabled,
    staleTime: 2 * 60 * 1000,
  })
}

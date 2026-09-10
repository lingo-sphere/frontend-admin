// Custom hook quản lý truy vấn và đột biến danh sách khóa học Admin với Optimistic Update bằng TanStack Query.
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { courseService, type CourseFilterParams } from '@/features/courses/services/course.service'
import { courseAdminKeys } from '@/features/courses/keys/course.admin.keys'
import type { Course } from '@/features/courses/data/courses.data'
import type { Course as ApiCourse } from '@/types/api.types'

export function useAdminCoursesQuery(params?: CourseFilterParams & { current?: number; pageSize?: number }) {
  const queryParams = { pageSize: 50, ...params }

  return useQuery<Course[]>({
    queryKey: courseAdminKeys.list(queryParams),
    queryFn: async () => {
      const res = await courseService.getAllCourses(queryParams)
      const data: ApiCourse[] = Array.isArray(res) ? res : (res?.result || [])
      return data.map((c: ApiCourse) => ({
        id: c._id || '',
        title: c.title,
        slug: c.slug || '',
        description: c.description || '',
        thumbnail_url: c.thumbnail_url || '',
        target_score: c.target_score || 500,
        category: (c.category as Course['category']) || 'TOEIC_2_SKILLS',
        level: (c.level as Course['level']) || 'BEGINNER',
        total_modules: c.total_modules || 0,
        total_lessons: c.total_lessons || 0,
        price: c.price || 0,
        discount_price: typeof c.discount_price === 'number' ? c.discount_price : undefined,
        is_published: c.is_published ?? true,
        author_id: c.author_id || '',
        author_name: c.author_name || 'Đội ngũ Giảng viên LingoSphere',
        created_at: c.created_at || new Date().toISOString(),
        enrollments: c.students_count || 0,
        completed_count: Math.round((c.students_count || 0) * 0.4),
        avg_progress: 58,
      }))
    },
    staleTime: 90 * 1000,
  })
}

export function useAdminApiCoursesQuery(params?: CourseFilterParams & { current?: number; pageSize?: number }) {
  const queryParams = { pageSize: 100, ...params }

  return useQuery<ApiCourse[]>({
    queryKey: ['courses', 'admin', 'api-list', queryParams],
    queryFn: async () => {
      const res = await courseService.getAllCourses(queryParams)
      return Array.isArray(res) ? res : (res?.result || [])
    },
    staleTime: 90 * 1000,
  })
}

export function useDeleteCourseMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => courseService.deleteCourse(id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: courseAdminKeys.all })
      const queryCache = queryClient.getQueryCache()
      const courseQueries = queryCache.findAll({ queryKey: courseAdminKeys.all })
      const previousDataMap: Array<{ queryKey: unknown; data: Course[] | undefined }> = []

      courseQueries.forEach((q) => {
        const prev = q.state.data as Course[] | undefined
        if (Array.isArray(prev)) {
          previousDataMap.push({ queryKey: q.queryKey, data: prev })
          queryClient.setQueryData<Course[]>(
            q.queryKey,
            prev.filter((c) => c.id !== id)
          )
        }
      })

      return { previousDataMap }
    },
    onError: (_err, _id, context) => {
      if (context?.previousDataMap) {
        context.previousDataMap.forEach(({ queryKey, data }) => {
          queryClient.setQueryData(queryKey as string[], data)
        })
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: courseAdminKeys.all })
    },
  })
}

export function useUpdateCourseStatusMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, isPublished }: { id: string; isPublished: boolean }) =>
      courseService.updateCourse(id, { is_published: isPublished }),
    onMutate: async ({ id, isPublished }) => {
      await queryClient.cancelQueries({ queryKey: courseAdminKeys.all })
      const queryCache = queryClient.getQueryCache()
      const courseQueries = queryCache.findAll({ queryKey: courseAdminKeys.all })
      const previousDataMap: Array<{ queryKey: unknown; data: Course[] | undefined }> = []

      courseQueries.forEach((q) => {
        const prev = q.state.data as Course[] | undefined
        if (Array.isArray(prev)) {
          previousDataMap.push({ queryKey: q.queryKey, data: prev })
          queryClient.setQueryData<Course[]>(
            q.queryKey,
            prev.map((c) => (c.id === id ? { ...c, is_published: isPublished } : c))
          )
        }
      })

      return { previousDataMap }
    },
    onError: (_err, _vars, context) => {
      if (context?.previousDataMap) {
        context.previousDataMap.forEach(({ queryKey, data }) => {
          queryClient.setQueryData(queryKey as string[], data)
        })
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: courseAdminKeys.all })
    },
  })
}

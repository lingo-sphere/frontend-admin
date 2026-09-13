// Custom hook quản lý truy vấn và đột biến danh sách khóa học Admin với Optimistic Update bằng TanStack Query.
import { useQuery, useMutation, useQueryClient, keepPreviousData, queryOptions, type QueryClient } from '@tanstack/react-query'
import { courseService, type CourseFilterParams } from '@/features/courses/services/course.service'
import { courseAdminKeys } from '@/features/courses/keys/course.admin.keys'
import { optimisticUpdateCollection, rollbackCollection, type CollectionRollbackContext } from '@/lib/query.optimistic'
import type { Course } from '@/features/courses/data/courses.data'
import type { Course as ApiCourse } from '@/types/api.types'

export async function fetchAdminCourses(
  queryParams: CourseFilterParams & { current?: number; pageSize?: number }
): Promise<Course[]> {
  const res = await courseService.getAllCourses(queryParams)
  const data: ApiCourse[] = Array.isArray(res) ? res : (res?.result || [])
  return data.map((c: ApiCourse) => ({
    id: c._id || '',
    title: c.title,
    slug: c.slug || '',
    description: c.description || '',
    thumbnail_url: c.thumbnail_url || '',
    target_score: c.target_score ?? 0,
    category: (c.category as Course['category']) || 'TOEIC_2_SKILLS',
    level: (c.level as Course['level']) || 'BEGINNER',
    total_modules: c.total_modules || 0,
    total_lessons: c.total_lessons || 0,
    price: c.price || 0,
    discount_price: typeof c.discount_price === 'number' ? c.discount_price : undefined,
    is_published: c.is_published ?? true,
    author_id: c.author_id || '',
    author_name: c.author_name || '',
    created_at: c.created_at || '',
    enrollments: c.students_count || 0,
    completed_count: 0,
    avg_progress: 0,
  }))
}

export const adminCourseQueries = {
  list: (params?: CourseFilterParams & { current?: number; pageSize?: number }) => {
    const queryParams = { pageSize: 50, ...params }
    return queryOptions({
      queryKey: courseAdminKeys.list(queryParams),
      queryFn: () => fetchAdminCourses(queryParams),
      placeholderData: keepPreviousData,
      staleTime: 90 * 1000,
    })
  },
  apiList: (params?: CourseFilterParams & { current?: number; pageSize?: number }) => {
    const queryParams = { pageSize: 100, ...params }
    return queryOptions({
      queryKey: courseAdminKeys.apiList(queryParams),
      queryFn: async () => {
        const res = await courseService.getAllCourses(queryParams)
        return Array.isArray(res) ? res : (res?.result || [])
      },
      staleTime: 90 * 1000,
    })
  },
}

export function useAdminCoursesQuery(params?: CourseFilterParams & { current?: number; pageSize?: number }) {
  return useQuery(adminCourseQueries.list(params))
}

export function prefetchAdminCourses(
  queryClient: QueryClient,
  params?: CourseFilterParams & { current?: number; pageSize?: number }
) {
  return queryClient.prefetchQuery(adminCourseQueries.list(params))
}

export function useAdminApiCoursesQuery(params?: CourseFilterParams & { current?: number; pageSize?: number }) {
  return useQuery(adminCourseQueries.apiList(params))
}

export function useDeleteCourseMutation() {
  const queryClient = useQueryClient()

  return useMutation<unknown, Error, string, CollectionRollbackContext<Course>>({
    mutationFn: (id: string) => courseService.deleteCourse(id),
    onMutate: (id: string) =>
      optimisticUpdateCollection<Course>(queryClient, courseAdminKeys.all, (courses) =>
        courses.filter((c) => c.id !== id)
      ),
    onError: (_err, _id, context) => rollbackCollection<Course>(queryClient, context),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: courseAdminKeys.all })
    },
  })
}

export function useUpdateCourseStatusMutation() {
  const queryClient = useQueryClient()

  return useMutation<unknown, Error, { id: string; isPublished: boolean }, CollectionRollbackContext<Course>>({
    mutationFn: ({ id, isPublished }: { id: string; isPublished: boolean }) =>
      courseService.updateCourse(id, { is_published: isPublished }),
    onMutate: ({ id, isPublished }) =>
      optimisticUpdateCollection<Course>(queryClient, courseAdminKeys.all, (courses) =>
        courses.map((c) => (c.id === id ? { ...c, is_published: isPublished } : c))
      ),
    onError: (_err, _vars, context) => rollbackCollection<Course>(queryClient, context),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: courseAdminKeys.all })
    },
  })
}

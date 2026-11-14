// Custom hook quản lý truy vấn số liệu phân tích tổng quan Dashboard Admin bằng TanStack Query.
import { useQuery } from '@tanstack/react-query'
import { userService } from '@/features/users/services/user.service'
import { courseService } from '@/features/courses/services/course.service'
import { examAdminService, type ToeicExamItem, type PaginatedPlacementAttempts } from '@/features/exams/services/exam.service'
import { vocabularyService } from '@/features/vocabulary/services/vocabulary.service'
import { practiceService } from '@/features/practice/services/practice.service'
import { listeningAdminService } from '@/features/practice/services/listening-admin.service'
import { grammarAdminService } from '@/features/practice/services/grammar-admin.service'
import { listeningTypes } from '@/features/practice/types/listening-admin.types'
import { dashboardAdminKeys } from '@/features/dashboard/keys/dashboard.admin.keys'
import type { SystemAnalyticsOverview, UserProfile } from '@/types/api.types'
import type { Course } from '@/features/courses/schemas/course.schema'

export interface PlatformCounts {
  totalWords: number
  publicDecksCount: number
  grammarPointsCount: number | null
  listeningCount: number | null
  speakingCount: number
  writingCount: number
}

export function useSystemAnalyticsQuery(enabled = true) {
  return useQuery<SystemAnalyticsOverview>({
    queryKey: dashboardAdminKeys.analytics(),
    queryFn: async () => {
      return userService.getSystemAnalytics()
    },
    enabled,
    staleTime: 0,
  })
}

export function useDashboardCoursesQuery(enabled = true) {
  return useQuery<Course[]>({
    queryKey: dashboardAdminKeys.courses(),
    queryFn: async () => {
      const res = await courseService.getAllCourses()
      return Array.isArray(res) ? res : (res?.result || [])
    },
    enabled,
    staleTime: 0,
  })
}

export function useDashboardExamsQuery(enabled = true) {
  return useQuery<ToeicExamItem[]>({
    queryKey: dashboardAdminKeys.exams(),
    queryFn: async () => {
      return examAdminService.getAllExams()
    },
    enabled,
    staleTime: 0,
  })
}

export function useDashboardToeicAttemptsQuery(enabled = true) {
  return useQuery<PaginatedPlacementAttempts>({
    queryKey: dashboardAdminKeys.toeicAttempts(),
    queryFn: async () => {
      return examAdminService.getToeicAttempts()
    },
    enabled,
    staleTime: 0,
  })
}

export function useDashboardPlatformStatsQuery(enabled = true) {
  return useQuery<PlatformCounts>({
    queryKey: dashboardAdminKeys.platformStats(),
    queryFn: async () => {
      const [wordsRes, decksRes, grammarRes, listeningRes, speakingRes, writingRes] = await Promise.allSettled([
        vocabularyService.listVocabulary({ limit: 1 }),
        vocabularyService.getAllFlashcardDecks(),
        grammarAdminService.topics({ page: 1, limit: 1 }),
        Promise.all(listeningTypes.map(type => listeningAdminService.list(type, { page: 1, limit: 1 }))),
        practiceService.getAllSpeakingExercises(),
        practiceService.getAllWritingExercises(),
      ])

      const totalWords = wordsRes.status === 'fulfilled' && wordsRes.value && typeof wordsRes.value === 'object' && 'total' in wordsRes.value
        ? ((wordsRes.value as { total?: number }).total || 0)
        : 0
      const publicDecksCount = decksRes.status === 'fulfilled' && Array.isArray(decksRes.value) ? decksRes.value.length : 0
      // Match the admin catalogs: all non-deleted records, including drafts.
      // Use totals, not the number of rows on the first page. A failed source
      // stays unknown rather than reporting an empty catalog or a partial sum.
      const validTotal = (total: unknown): total is number => typeof total === 'number' && Number.isInteger(total) && total >= 0
      const grammarPointsCount = grammarRes.status === 'fulfilled' && validTotal(grammarRes.value?.pagination?.total)
        ? grammarRes.value.pagination.total : null
      const listeningCount = listeningRes.status === 'fulfilled' && listeningRes.value.every(page => validTotal(page?.pagination?.total))
        ? listeningRes.value.reduce((total, page) => total + page.pagination.total, 0) : null
      const speakingCount = speakingRes.status === 'fulfilled' && Array.isArray(speakingRes.value) ? speakingRes.value.length : 0
      const writingCount = writingRes.status === 'fulfilled' && Array.isArray(writingRes.value) ? writingRes.value.length : 0

      return {
        totalWords,
        publicDecksCount,
        grammarPointsCount,
        listeningCount,
        speakingCount,
        writingCount,
      }
    },
    enabled,
    staleTime: 0,
  })
}

export function useDashboardUsersQuery(enabled = true) {
  return useQuery<UserProfile[]>({
    queryKey: dashboardAdminKeys.users(),
    queryFn: async () => {
      const res = await userService.getAllUsers({ limit: 100 })
      return Array.isArray(res) ? res : (res?.result || [])
    },
    enabled,
    staleTime: 0,
  })
}

// Custom hook quản lý truy vấn số liệu phân tích tổng quan Dashboard Admin bằng TanStack Query.
import { useQuery } from '@tanstack/react-query'
import { userService } from '@/features/users/services/user.service'
import { courseService } from '@/features/courses/services/course.service'
import { examAdminService, type ToeicExamItem, type PaginatedPlacementAttempts } from '@/features/exams/services/exam.service'
import { vocabularyService } from '@/features/vocabulary/services/vocabulary.service'
import { practiceService } from '@/features/practice/services/practice.service'
import { dashboardAdminKeys } from '@/features/dashboard/keys/dashboard.admin.keys'
import type { SystemAnalyticsOverview, UserProfile } from '@/types/api.types'
import type { Course } from '@/features/courses/schemas/course.schema'

export interface PlatformCounts {
  totalWords: number
  publicDecksCount: number
  grammarPointsCount: number
  listeningCount: number
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
        vocabularyService.getAllGrammarPoints(),
        practiceService.getAllListeningExercises(),
        practiceService.getAllSpeakingExercises(),
        practiceService.getAllWritingExercises(),
      ])

      const totalWords = wordsRes.status === 'fulfilled' && wordsRes.value && typeof wordsRes.value === 'object' && 'total' in wordsRes.value
        ? ((wordsRes.value as { total?: number }).total || 0)
        : 0
      const publicDecksCount = decksRes.status === 'fulfilled' && Array.isArray(decksRes.value) ? decksRes.value.length : 0
      const grammarPointsCount = grammarRes.status === 'fulfilled' && Array.isArray(grammarRes.value) ? grammarRes.value.length : 0
      const listeningCount = listeningRes.status === 'fulfilled' && Array.isArray(listeningRes.value) ? listeningRes.value.length : 0
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

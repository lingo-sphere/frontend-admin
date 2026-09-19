// Hook quản lý dữ liệu học viên, tiến độ học tập và bài nộp khóa học với TanStack Query.
import { useState, useMemo, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { courseService } from '@/features/courses/services/course.service'
import {
  progressService,
  type StudentProgressItem,
  type SkillSubmissionItem,
} from '@/features/progress/services/progress.service'
import { userService } from '@/features/users/services/user.service'
import { useAuthStore } from '@/features/auth/store/auth.store'
import type { UserProfile } from '@/types/api.types'
import type { Course } from '@/features/courses/schemas/course.schema'

export interface CourseSimple {
  id: string
  title: string
  thumbnail_url?: string
  author_id?: string
  students_count?: number
}

interface ProgressQueryData {
  students: StudentProgressItem[]
  usersMap: Map<string, UserProfile>
}

export function useCourseLearnersData() {
  const user = useAuthStore((state) => state.user)
  const profile = useAuthStore((state) => state.profile)
  const currentRole = (user?.role || profile?.role || '').toUpperCase()
  const isTeacher = currentRole === 'TEACHER' || currentRole === 'INSTRUCTOR' || currentRole === 'GIANG_VIEN'
  const currentUserId = user?.user_id || profile?.user_id || ''

  const [selectedCourseId, setSelectedCourseId] = useState<string>('ALL')

  const {
    data: courses = [],
    isLoading: isLoadingCourses,
  } = useQuery<CourseSimple[]>({
    queryKey: ['course-learners', 'courses', isTeacher, currentUserId],
    queryFn: async () => {
      let loadedCourses: CourseSimple[] = []

      if (isTeacher) {
        try {
          const teacherCourses = await courseService.getTeacherCourses()
          if (Array.isArray(teacherCourses) && teacherCourses.length > 0) {
            loadedCourses = teacherCourses.map((c: Course) => ({
              id: c._id || '',
              title: c.title || '',
              thumbnail_url: c.thumbnail_url || '',
              author_id: c.author_id || '',
              students_count: c.students_count || 0,
            }))
          }
        } catch {
          loadedCourses = []
        }

        if (loadedCourses.length === 0) {
          const allRes = await courseService.getAllCourses({ pageSize: 100 })
          const rawList: Course[] = Array.isArray(allRes) ? allRes : allRes?.result || []
          loadedCourses = rawList
            .filter((c: Course) => c.author_id === currentUserId)
            .map((c: Course) => ({
              id: c._id || '',
              title: c.title || '',
              thumbnail_url: c.thumbnail_url || '',
              author_id: c.author_id || '',
              students_count: c.students_count || 0,
            }))
        }
      } else {
        const allRes = await courseService.getAllCourses({ pageSize: 100 })
        const rawList: Course[] = Array.isArray(allRes) ? allRes : allRes?.result || []
        loadedCourses = rawList.map((c: Course) => ({
          id: c._id || '',
          title: c.title || '',
          thumbnail_url: c.thumbnail_url || '',
          author_id: c.author_id || '',
          students_count: c.students_count || 0,
        }))
      }

      return loadedCourses
    },
    staleTime: 0,
  })

  const coursesKey = useMemo(() => courses.map((c) => c.id).sort().join(','), [courses])

  const {
    data: progressData,
    isLoading: isLoadingProgress,
    refetch: refetchProgressQuery,
  } = useQuery<ProgressQueryData>({
    queryKey: ['course-learners', 'progress', selectedCourseId, coursesKey],
    queryFn: async () => {
      if (courses.length === 0) {
        return { students: [], usersMap: new Map() }
      }

      const targetCourses =
        selectedCourseId === 'ALL'
          ? courses
          : courses.filter((c) => c.id === selectedCourseId)

      const [progressResults, usersRes] = await Promise.all([
        Promise.all(
          targetCourses.map(async (course) => {
            try {
              const res = await progressService.getCourseStudentsProgress(course.id)
              const students = res?.students || []
              return students.map((st) => ({
                ...st,
                course_id: course.id,
                course_title: course.title,
              }))
            } catch {
              return []
            }
          })
        ),
        userService.getAllUsers({ limit: 100 }).catch(() => null),
      ])

      const mergedStudents = progressResults.flat()
      const map = new Map<string, UserProfile>()

      if (usersRes) {
        const uList: UserProfile[] = Array.isArray(usersRes)
          ? usersRes
          : Array.isArray(usersRes.result)
          ? usersRes.result
          : []
        uList.forEach((u: UserProfile) => {
          if (u.user_id) map.set(u.user_id, u)
        })
      }

      const missingIds = mergedStudents
        .map((s) => s.user_id)
        .filter((uid) => uid && !map.has(uid) && !map.has(String(uid)))

      if (missingIds.length > 0) {
        const profiles = await Promise.all(
          missingIds.map((uid) => userService.getProfileById(uid).catch(() => null))
        )
        profiles.forEach((p, idx) => {
          const fallbackUid = missingIds[idx]
          if (p) {
            map.set(fallbackUid, p)
            if (p.user_id) map.set(p.user_id, p)
          }
        })
      }

      return {
        students: mergedStudents,
        usersMap: map,
      }
    },
    enabled: courses.length > 0,
    staleTime: 0,
  })

  const {
    data: submissions = [],
    isLoading: isLoadingSubmissions,
    refetch: refetchSubmissionsQuery,
  } = useQuery<SkillSubmissionItem[]>({
    queryKey: ['course-learners', 'submissions', selectedCourseId, coursesKey],
    queryFn: async () => {
      if (courses.length === 0) return []

      const targetCourses =
        selectedCourseId === 'ALL'
          ? courses
          : courses.filter((c) => c.id === selectedCourseId)

      const submissionResults = await Promise.all(
        targetCourses.map(async (course) => {
          try {
            const data = await progressService.getCourseSubmissions(course.id)
            return (data || []).map((sub) => ({
              ...sub,
              course_id: course.id,
              course_title: course.title,
            }))
          } catch {
            return []
          }
        })
      )

      return submissionResults.flat()
    },
    enabled: courses.length > 0,
    staleTime: 0,
  })

  const allStudentsProgress = useMemo(() => progressData?.students || [], [progressData])
  const usersMap = useMemo(() => progressData?.usersMap || new Map<string, UserProfile>(), [progressData])

  const fetchProgress = useCallback(async () => {
    await refetchProgressQuery()
  }, [refetchProgressQuery])

  const fetchSubmissions = useCallback(async () => {
    await refetchSubmissionsQuery()
  }, [refetchSubmissionsQuery])

  const stats = useMemo(() => {
    const totalStudents = allStudentsProgress.length
    const avgProgress = totalStudents
      ? Math.round(
          allStudentsProgress.reduce((sum, s) => sum + (s.progress_percentage || 0), 0) / totalStudents
        )
      : 0
    const totalSubmissions = submissions.length
    const pendingReviews = submissions.filter(
      (s) => !s.is_teacher_reviewed && s.status !== 'TEACHER_REVIEWED'
    ).length

    return { totalStudents, avgProgress, totalSubmissions, pendingReviews }
  }, [allStudentsProgress, submissions])

  return {
    isTeacher,
    courses,
    selectedCourseId,
    setSelectedCourseId,
    isLoadingCourses,
    allStudentsProgress,
    usersMap,
    isLoadingProgress,
    submissions,
    isLoadingSubmissions,
    fetchProgress,
    fetchSubmissions,
    stats,
  }
}

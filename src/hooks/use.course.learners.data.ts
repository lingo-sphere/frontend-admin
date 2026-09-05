/**
 * @file use.course.learners.data.ts
 * @description Custom hook fetching and managing courses, student progress records, submissions, and usersMap
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { courseService } from '@/services/course.service'
import {
  progressService,
  type StudentProgressItem,
  type SkillSubmissionItem,
} from '@/services/progress.service'
import { userService } from '@/services/user.service'
import { useAuthStore } from '@/store/auth.store'
import { toast } from '@/store/toast.store'
import type { Course as ApiCourse, UserProfile } from '@/types/api.types'

export interface CourseSimple {
  id: string
  title: string
  thumbnail_url?: string
  author_id?: string
  students_count?: number
}

export function useCourseLearnersData() {
  const user = useAuthStore((state) => state.user)
  const profile = useAuthStore((state) => state.profile)
  const currentRole = (user?.role || profile?.role || '').toUpperCase()
  const isTeacher = currentRole === 'TEACHER' || currentRole === 'INSTRUCTOR' || currentRole === 'GIANG_VIEN'
  const currentUserId = user?.user_id || profile?.user_id || ''

  const [courses, setCourses] = useState<CourseSimple[]>([])
  const [selectedCourseId, setSelectedCourseId] = useState<string>('ALL')
  const [isLoadingCourses, setIsLoadingCourses] = useState<boolean>(false)

  const [allStudentsProgress, setAllStudentsProgress] = useState<StudentProgressItem[]>([])
  const [usersMap, setUsersMap] = useState<Map<string, UserProfile>>(new Map())
  const [isLoadingProgress, setIsLoadingProgress] = useState<boolean>(false)

  const [submissions, setSubmissions] = useState<SkillSubmissionItem[]>([])
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState<boolean>(false)

  const fetchCourses = useCallback(async () => {
    setIsLoadingCourses(true)
    try {
      let loadedCourses: CourseSimple[] = []

      if (isTeacher) {
        try {
          const teacherCourses = await courseService.getTeacherCourses()
          if (Array.isArray(teacherCourses) && teacherCourses.length > 0) {
            loadedCourses = teacherCourses.map((c: ApiCourse) => ({
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
          const rawList: ApiCourse[] = Array.isArray(allRes) ? allRes : ((allRes as any)?.result || [])
          loadedCourses = rawList
            .filter((c: ApiCourse) => c.author_id === currentUserId)
            .map((c: ApiCourse) => ({
              id: c._id || '',
              title: c.title || '',
              thumbnail_url: c.thumbnail_url || '',
              author_id: c.author_id || '',
              students_count: c.students_count || 0,
            }))
        }
      } else {
        const allRes = await courseService.getAllCourses({ pageSize: 100 })
        const rawList: ApiCourse[] = Array.isArray(allRes) ? allRes : ((allRes as any)?.result || [])
        loadedCourses = rawList.map((c: ApiCourse) => ({
          id: c._id || '',
          title: c.title || '',
          thumbnail_url: c.thumbnail_url || '',
          author_id: c.author_id || '',
          students_count: c.students_count || 0,
        }))
      }

      setCourses(loadedCourses)
    } catch {
      toast.error('Không thể tải danh sách khóa học.')
    } finally {
      setIsLoadingCourses(false)
    }
  }, [isTeacher, currentUserId])

  useEffect(() => {
    fetchCourses()
  }, [fetchCourses])

  const fetchProgress = useCallback(async () => {
    if (courses.length === 0) {
      setAllStudentsProgress([])
      return
    }

    setIsLoadingProgress(true)
    try {
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
      setAllStudentsProgress(mergedStudents)

      if (usersRes) {
        const uList: UserProfile[] = Array.isArray(usersRes)
          ? usersRes
          : Array.isArray(usersRes.result)
          ? usersRes.result
          : []
        const map = new Map<string, UserProfile>()
        uList.forEach((u: UserProfile) => {
          if (u.user_id) map.set(u.user_id, u)
        })
        setUsersMap(map)
      }
    } catch {
      toast.error('Không thể tải tiến độ học viên cho khóa học đã chọn.')
    } finally {
      setIsLoadingProgress(false)
    }
  }, [courses, selectedCourseId])

  const fetchSubmissions = useCallback(async () => {
    if (courses.length === 0) {
      setSubmissions([])
      return
    }

    setIsLoadingSubmissions(true)
    try {
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

      setSubmissions(submissionResults.flat())
    } catch {
      toast.error('Không thể tải danh sách bài nộp kỹ năng.')
    } finally {
      setIsLoadingSubmissions(false)
    }
  }, [courses, selectedCourseId])

  useEffect(() => {
    if (allStudentsProgress.length === 0) return

    const missingIds = allStudentsProgress
      .map((s) => s.user_id)
      .filter((uid) => uid && !usersMap.has(uid) && !usersMap.has(String(uid)))

    if (missingIds.length === 0) return

    Promise.all(
      missingIds.map((uid) => userService.getProfileById(uid).catch(() => null))
    ).then((profiles) => {
      setUsersMap((prev) => {
        const next = new Map(prev)
        profiles.forEach((p, idx) => {
          const fallbackUid = missingIds[idx]
          if (p) {
            next.set(fallbackUid, p)
            if (p.user_id) next.set(p.user_id, p)
          }
        })
        return next
      })
    })
  }, [allStudentsProgress, usersMap])

  const stats = useMemo(() => {
    const totalStudents = allStudentsProgress.length
    const avgProgress = totalStudents
      ? Math.round(
          allStudentsProgress.reduce((sum, s) => sum + (s.progress_percentage || 0), 0) / totalStudents
        )
      : 0
    const totalSubmissions = submissions.length
    const pendingReviews = submissions.filter((s) => !s.is_teacher_reviewed && s.status !== 'TEACHER_REVIEWED').length

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

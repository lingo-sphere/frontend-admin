// Hook quản lý tải danh sách học viên, hồ sơ người dùng và tìm kiếm bảng điểm với TanStack Query.
import { useState, useMemo, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  progressService,
  type CourseStudentsProgressResponse,
  type StudentProgressItem,
} from '@/features/progress/services/progress.service'
import { userService } from '@/features/users/services/user.service'
import type { UserProfile } from '@/types/api.types'

interface CourseStudentScoresData {
  progressResponse: CourseStudentsProgressResponse | null
  usersMap: Map<string, UserProfile>
}

export function useCourseStudentScores(courseId: string, isOpen: boolean) {
  const [searchTerm, setSearchTerm] = useState<string>('')

  const {
    data: queryResult,
    isLoading,
    refetch,
  } = useQuery<CourseStudentScoresData>({
    queryKey: ['course-student-scores', courseId],
    queryFn: async () => {
      if (!courseId) {
        return { progressResponse: null, usersMap: new Map() }
      }

      const [progressRes, usersRes] = await Promise.all([
        progressService.getCourseStudentsProgress(courseId),
        userService.getAllUsers({ limit: 100 }).catch(() => null),
      ])

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

      const students = progressRes?.students || []
      const missingIds = students
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
            if (p.user_id) map.set(String(p.user_id), p)
          }
        })
      }

      return {
        progressResponse: progressRes,
        usersMap: map,
      }
    },
    enabled: isOpen && !!courseId,
    staleTime: 0,
  })

  const data = queryResult?.progressResponse || null
  const usersMap = queryResult?.usersMap || new Map<string, UserProfile>()

  const filteredStudents: StudentProgressItem[] = useMemo(() => {
    if (!data?.students) return []
    if (!searchTerm.trim()) return data.students

    const term = searchTerm.toLowerCase()
    return data.students.filter((st) => {
      const u = usersMap.get(st.user_id) || usersMap.get(String(st.user_id))
      const name = (u?.full_name || st.full_name || '').toLowerCase()
      const email = (u?.email || st.email || '').toLowerCase()
      return name.includes(term) || email.includes(term) || st.user_id.toLowerCase().includes(term)
    })
  }, [data?.students, searchTerm, usersMap])

  const fetchData = useCallback(async () => {
    await refetch()
  }, [refetch])

  return {
    data,
    usersMap,
    isLoading,
    searchTerm,
    setSearchTerm,
    filteredStudents,
    fetchData,
  }
}

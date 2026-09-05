/**
 * @file use.course.student.scores.ts
 * @description Custom hook quản lý tải danh sách học viên, nạp hồ sơ người dùng và tìm kiếm bảng điểm trong khóa học
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  progressService,
  type CourseStudentsProgressResponse,
  type StudentProgressItem,
} from '@/services/progress.service'
import { userService } from '@/services/user.service'
import type { UserProfile } from '@/types/api.types'
import { toast } from '@/store/toast.store'

export function useCourseStudentScores(courseId: string, isOpen: boolean) {
  const [data, setData] = useState<CourseStudentsProgressResponse | null>(null)
  const [usersMap, setUsersMap] = useState<Map<string, UserProfile>>(new Map())
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [searchTerm, setSearchTerm] = useState<string>('')

  const fetchData = useCallback(async () => {
    if (!courseId) return
    setIsLoading(true)
    try {
      const [progressRes, usersRes] = await Promise.all([
        progressService.getCourseStudentsProgress(courseId),
        userService.getAllUsers({ limit: 100 }).catch(() => null),
      ])

      setData(progressRes)

      if (usersRes) {
        const uList = Array.isArray(usersRes)
          ? usersRes
          : Array.isArray((usersRes as any).result)
          ? (usersRes as any).result
          : Array.isArray((usersRes as any).data)
          ? (usersRes as any).data
          : []
        const map = new Map<string, UserProfile>()
        uList.forEach((u: any) => {
          if (u.user_id) map.set(String(u.user_id), u)
          if (u._id) map.set(String(u._id), u)
          if (u.id) map.set(String(u.id), u)
        })
        setUsersMap(map)
      }
    } catch {
      toast.error('Không thể tải dữ liệu bảng điểm học viên.')
    } finally {
      setIsLoading(false)
    }
  }, [courseId])

  useEffect(() => {
    if (isOpen) {
      fetchData()
    } else {
      setData(null)
      setSearchTerm('')
    }
  }, [isOpen, fetchData])

  useEffect(() => {
    if (!data?.students || data.students.length === 0) return

    const missingIds = data.students
      .map((s) => s.user_id)
      .filter((uid) => uid && !usersMap.has(uid) && !usersMap.has(String(uid)))

    if (missingIds.length === 0) return

    Promise.all(
      missingIds.map((uid) => userService.getProfileById(uid).catch(() => null))
    ).then((profiles) => {
      setUsersMap((prev) => {
        const next = new Map(prev)
        profiles.forEach((p: any, idx) => {
          const fallbackUid = missingIds[idx]
          if (p) {
            const actualProfile = p.profile || p.data || p
            next.set(fallbackUid, actualProfile)
            if (actualProfile.user_id) next.set(String(actualProfile.user_id), actualProfile)
            if (actualProfile._id) next.set(String(actualProfile._id), actualProfile)
            if (actualProfile.id) next.set(String(actualProfile.id), actualProfile)
          }
        })
        return next
      })
    })
  }, [data?.students, usersMap])

  const filteredStudents: StudentProgressItem[] = useMemo(() => {
    if (!data?.students) return []
    if (!searchTerm.trim()) return data.students

    const term = searchTerm.toLowerCase()
    return data.students.filter((st) => {
      const u = usersMap.get(st.user_id) || usersMap.get(String(st.user_id))
      const name = (u?.full_name || (u as any)?.fullName || st.full_name || '').toLowerCase()
      const email = (u?.email || st.email || '').toLowerCase()
      return name.includes(term) || email.includes(term) || st.user_id.toLowerCase().includes(term)
    })
  }, [data?.students, searchTerm, usersMap])

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

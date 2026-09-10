// Hook quản lý dữ liệu lịch học, lịch sử gửi mail nhắc nhở và thao tác mở khóa chương cho học viên.

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  progressService,
  type StudentProgressItem,
  type LearnerLockState,
} from '@/features/progress/services/progress.service'
import {
  notificationService,
  type ReminderTimelineItem,
} from '@/features/notifications/services/notification.service'
import { courseService, type Course } from '@/features/courses/services/course.service'
import { userService } from '@/features/users/services/user.service'
import { toast } from '@/store/toast.store'
import { storage, STORAGE_KEYS } from '@/lib/storage'
import type { UserProfile } from '@/types/api.types'

interface UseLearnerReminderHistoryProps {
  courseId: string
  userId: string
}

export type ReminderFilterCategory = 'ALL' | 'ON_TIME' | 'LATE_WARNING' | 'LOCK_UNLOCK' | 'WEEKLY'

export function useLearnerReminderHistory({ courseId, userId }: UseLearnerReminderHistoryProps) {
  const [student, setStudent] = useState<StudentProgressItem | null>(() => {
    const cached = storage.session.get<StudentProgressItem>(STORAGE_KEYS.ACTIVE_STUDENT_PROGRESS)
    if (cached && cached.user_id === userId) {
      return cached
    }
    return null
  })

  const studentRef = useRef(student)
  studentRef.current = student

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [courseInfo, setCourseInfo] = useState<Course | null>(null)
  const [reminders, setReminders] = useState<ReminderTimelineItem[]>([])
  const [filterCategory, setFilterCategory] = useState<ReminderFilterCategory>('ALL')
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isUnlocking, setIsUnlocking] = useState<boolean>(false)

  const loadData = useCallback(async () => {
    if (!userId) return
    setIsLoading(true)

    try {
      const isAllCourse = !courseId || courseId === 'all'
      const [remindersRes, courseRes, userProfileRes, studentsRes] = await Promise.all([
        notificationService.getLearnerReminders(userId, !isAllCourse ? courseId : undefined).catch(() => []),
        !isAllCourse ? courseService.getCourseById(courseId).catch(() => null) : null,
        userService.getProfileById(userId).catch(() => null),
        !isAllCourse ? progressService.getCourseStudentsProgress(courseId).catch(() => null) : null,
      ])

      setReminders(Array.isArray(remindersRes) ? remindersRes : [])

      if (courseRes) {
        setCourseInfo(courseRes)
      }

      if (userProfileRes) {
        setUserProfile(userProfileRes)
      }

      if (studentsRes?.students) {
        const found = studentsRes.students.find((s: StudentProgressItem) => s.user_id === userId)
        if (found) {
          setStudent(found)
          storage.session.set(STORAGE_KEYS.ACTIVE_STUDENT_PROGRESS, found)
        }
      }
    } catch {
      toast.error('Không thể tải lịch sử email nhắc nhở của học viên')
    } finally {
      setIsLoading(false)
    }
  }, [courseId, userId])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleManualUnlock = useCallback(async () => {
    if (!courseId || courseId === 'all' || !userId) {
      toast.error('Thiếu thông tin khóa học hoặc học viên để mở khóa')
      return
    }

    setIsUnlocking(true)
    try {
      const res = await progressService.manualUnlockChapter(courseId, userId)
      toast.success(res.message || 'Mở khóa chương học thành công!')

      setStudent((prev) => {
        if (!prev) return prev
        const updatedLockState: LearnerLockState = res.lock_state || {
          is_locked: false,
          unlocked_at: new Date().toISOString(),
        }
        const updatedSchedule = prev.schedule ? {
          ...prev.schedule,
          consecutive_missed_sessions: 0,
        } : undefined

        const updated: StudentProgressItem = {
          ...prev,
          lock_state: updatedLockState,
          schedule: updatedSchedule,
        }
        storage.session.set(STORAGE_KEYS.ACTIVE_STUDENT_PROGRESS, updated)
        return updated
      })

      const refreshedReminders = await notificationService
        .getLearnerReminders(userId, courseId)
        .catch(() => [])
      setReminders(Array.isArray(refreshedReminders) ? refreshedReminders : [])
    } catch {
      toast.error('Có lỗi xảy ra khi mở khóa chương học')
    } finally {
      setIsUnlocking(false)
    }
  }, [courseId, userId])

  const filteredReminders = reminders.filter((item) => {
    if (filterCategory === 'ALL') return true
    if (filterCategory === 'ON_TIME') return item.event_type === 'ON_TIME'
    if (filterCategory === 'LATE_WARNING') return item.event_type === 'LATE_WARNING'
    if (filterCategory === 'LOCK_UNLOCK') {
      return item.event_type === 'CHAPTER_LOCKED' || item.event_type === 'CHAPTER_UNLOCKED'
    }
    if (filterCategory === 'WEEKLY') return item.event_type === 'WEEKLY_INACTIVE'
    return true
  })

  return {
    student,
    userProfile,
    courseInfo,
    reminders,
    filteredReminders,
    filterCategory,
    setFilterCategory,
    isLoading,
    isUnlocking,
    loadData,
    handleManualUnlock,
  }
}

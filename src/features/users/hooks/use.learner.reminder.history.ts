// Hook quản lý dữ liệu lịch học, lịch sử gửi mail nhắc nhở và mở khóa chương với TanStack Query.
import { useState, useMemo, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
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

interface LearnerReminderQueryResult {
  student: StudentProgressItem | null
  userProfile: UserProfile | null
  courseInfo: Course | null
  reminders: ReminderTimelineItem[]
}

export function useLearnerReminderHistory({ courseId, userId }: UseLearnerReminderHistoryProps) {
  const queryClient = useQueryClient()
  const [filterCategory, setFilterCategory] = useState<ReminderFilterCategory>('ALL')

  const initialCachedStudent = useMemo(() => {
    const cached = storage.session.get<StudentProgressItem>(STORAGE_KEYS.ACTIVE_STUDENT_PROGRESS)
    return cached && cached.user_id === userId ? cached : null
  }, [userId])

  const {
    data,
    isLoading,
    refetch,
  } = useQuery<LearnerReminderQueryResult>({
    queryKey: ['learner-reminder-history', courseId, userId],
    queryFn: async () => {
      const isAllCourse = !courseId || courseId === 'all'
      const [remindersRes, courseRes, userProfileRes, studentsRes] = await Promise.all([
        notificationService.getLearnerReminders(userId, !isAllCourse ? courseId : undefined).catch(() => []),
        !isAllCourse ? courseService.getCourseById(courseId).catch(() => null) : null,
        userService.getProfileById(userId).catch(() => null),
        !isAllCourse ? progressService.getCourseStudentsProgress(courseId).catch(() => null) : null,
      ])

      let studentData: StudentProgressItem | null = null
      if (studentsRes?.students) {
        const found = studentsRes.students.find((s: StudentProgressItem) => s.user_id === userId)
        if (found) {
          studentData = found
          storage.session.set(STORAGE_KEYS.ACTIVE_STUDENT_PROGRESS, found)
        }
      }

      if (!studentData && initialCachedStudent) {
        studentData = initialCachedStudent
      }

      return {
        student: studentData,
        userProfile: userProfileRes,
        courseInfo: courseRes,
        reminders: Array.isArray(remindersRes) ? remindersRes : [],
      }
    },
    enabled: !!userId,
    staleTime: 0,
  })

  const student = data?.student || initialCachedStudent
  const userProfile = data?.userProfile || null
  const courseInfo = data?.courseInfo || null
  const reminders = data?.reminders || []

  const unlockMutation = useMutation({
    mutationFn: async () => {
      if (!courseId || courseId === 'all' || !userId) {
        throw new Error('Thiếu thông tin khóa học hoặc học viên')
      }
      return progressService.manualUnlockChapter(courseId, userId)
    },
    onSuccess: (res) => {
      toast.success(res.message || 'Mở khóa chương học thành công!')
      if (student) {
        const updatedLockState: LearnerLockState = res.lock_state || {
          is_locked: false,
          unlocked_at: new Date().toISOString(),
        }
        const updated: StudentProgressItem = {
          ...student,
          lock_state: updatedLockState,
          schedule: student.schedule
            ? { ...student.schedule, consecutive_missed_sessions: 0 }
            : undefined,
        }
        storage.session.set(STORAGE_KEYS.ACTIVE_STUDENT_PROGRESS, updated)
      }
      queryClient.invalidateQueries({ queryKey: ['learner-reminder-history', courseId, userId] })
      queryClient.invalidateQueries({ queryKey: ['course-learners'] })
    },
    onError: () => {
      toast.error('Có lỗi xảy ra khi mở khóa chương học')
    },
  })

  const handleManualUnlock = useCallback(async () => {
    await unlockMutation.mutateAsync()
  }, [unlockMutation])

  const filteredReminders = useMemo(() => {
    return reminders.filter((item) => {
      if (filterCategory === 'ALL') return true
      if (filterCategory === 'ON_TIME') return item.event_type === 'ON_TIME'
      if (filterCategory === 'LATE_WARNING') return item.event_type === 'LATE_WARNING'
      if (filterCategory === 'LOCK_UNLOCK') {
        return item.event_type === 'CHAPTER_LOCKED' || item.event_type === 'CHAPTER_UNLOCKED'
      }
      if (filterCategory === 'WEEKLY') return item.event_type === 'WEEKLY_INACTIVE'
      return true
    })
  }, [reminders, filterCategory])

  const loadData = useCallback(async () => {
    await refetch()
  }, [refetch])

  return {
    student,
    userProfile,
    courseInfo,
    reminders,
    filteredReminders,
    filterCategory,
    setFilterCategory,
    isLoading: isLoading && !student,
    isUnlocking: unlockMutation.isPending,
    loadData,
    handleManualUnlock,
  }
}

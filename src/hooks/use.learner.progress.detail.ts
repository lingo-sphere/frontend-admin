// Hook quản lý dữ liệu chi tiết tiến độ học tập và bài nộp kỹ năng của học viên.

import { useState, useEffect, useCallback, useRef } from 'react'
import { progressService, type StudentProgressItem, type SkillSubmissionItem } from '@/services/progress.service'
import { courseService } from '@/services/course.service'
import { userService } from '@/services/user.service'
import { toast } from '@/store/toast.store'
import type { Course as ApiCourse, UserProfile } from '@/types/api.types'

interface UseLearnerProgressDetailProps {
  courseId: string
  userId: string
}

export function useLearnerProgressDetail({ courseId, userId }: UseLearnerProgressDetailProps) {
  const [student, setStudent] = useState<StudentProgressItem | null>(() => {
    if (typeof window !== 'undefined') {
      const cachedStr = sessionStorage.getItem('lingo_admin_active_student_progress')
      if (cachedStr) {
        try {
          const cached = JSON.parse(cachedStr) as StudentProgressItem
          if (cached && cached.user_id === userId) {
            return cached
          }
        } catch {}
      }
    }
    return null
  })

  const studentRef = useRef(student)
  studentRef.current = student

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [courseInfo, setCourseInfo] = useState<ApiCourse | null>(null)
  const [submissions, setSubmissions] = useState<SkillSubmissionItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const cachedStr = sessionStorage.getItem('lingo_admin_active_student_progress')
      if (cachedStr) {
        try {
          const cached = JSON.parse(cachedStr) as StudentProgressItem
          if (cached && cached.user_id === userId) {
            return false
          }
        } catch {}
      }
    }
    return true
  })

  const [selectedSubmission, setSelectedSubmission] = useState<SkillSubmissionItem | null>(null)
  const [editScore, setEditScore] = useState<number>(0)
  const [editFeedback, setEditFeedback] = useState<string>('')
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false)

  const loadData = useCallback(async () => {
    if (!courseId || !userId) return
    const hasInitialData = !!studentRef.current
    if (!hasInitialData) {
      setIsLoading(true)
    }

    try {
      const isAllCourse = courseId === 'all'
      const [detailRes, submissionsRes, courseRes, userProfileRes] = await Promise.all([
        !isAllCourse
          ? progressService.getStudentCourseProgressDetail(courseId, userId).catch(() => null)
          : null,
        !isAllCourse
          ? progressService.getCourseSubmissions(courseId, undefined, userId).catch(() => [])
          : [],
        !isAllCourse
          ? courseService.getCourseById(courseId).catch(() => null)
          : null,
        userService.getProfileById(userId).catch(() => null),
      ])

      if (detailRes?.course_progress) {
        const cp = detailRes.course_progress
        const currentStudent = studentRef.current
        const mergedStudent: StudentProgressItem = {
          user_id: userId,
          full_name: userProfileRes?.full_name || currentStudent?.full_name,
          email: userProfileRes?.email || currentStudent?.email,
          avatar_url: userProfileRes?.avatar_url || currentStudent?.avatar_url,
          course_id: courseId,
          course_title: courseRes?.title || currentStudent?.course_title,
          progress_percentage: cp.progress_percentage ?? currentStudent?.progress_percentage ?? 0,
          completed_lessons: cp.completed_lessons_count ?? currentStudent?.completed_lessons ?? 0,
          total_lessons: cp.total_lessons_count ?? currentStudent?.total_lessons ?? 1,
          baseline_score: cp.baseline_score ?? currentStudent?.baseline_score,
          baseline_source: cp.baseline_source ?? currentStudent?.baseline_source,
          final_test_score: cp.final_test_score ?? currentStudent?.final_test_score,
          total_score_growth: cp.total_score_growth ?? currentStudent?.total_score_growth,
          modules_progress: detailRes.modules_progress || currentStudent?.modules_progress || [],
          status: cp.status ?? currentStudent?.status,
        }
        setStudent(mergedStudent)
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('lingo_admin_active_student_progress', JSON.stringify(mergedStudent))
        }
      } else if (isAllCourse && !studentRef.current) {
        const allProg = await progressService.getCourseStudentsProgress('all').catch(() => null)
        if (allProg?.students) {
          const found = allProg.students.find((s) => s.user_id === userId)
          if (found) {
            setStudent(found)
            if (typeof window !== 'undefined') {
              sessionStorage.setItem('lingo_admin_active_student_progress', JSON.stringify(found))
            }
          }
        }
      }

      if (Array.isArray(submissionsRes)) {
        setSubmissions(submissionsRes)
      }

      if (courseRes) {
        setCourseInfo(courseRes)
      }

      if (userProfileRes) {
        setUserProfile(userProfileRes)
      }
    } catch {
      toast.error('Không thể tải chi tiết tiến độ học viên.')
    } finally {
      setIsLoading(false)
    }
  }, [courseId, userId])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleOpenReview = (sub: SkillSubmissionItem) => {
    setSelectedSubmission(sub)
    setEditScore(sub.teacher_score !== undefined ? sub.teacher_score : sub.ai_score)
    setEditFeedback(sub.teacher_feedback || '')
  }

  const handleSaveReview = async (overrideScore?: number) => {
    if (!selectedSubmission) return
    const scoreToSave = overrideScore !== undefined ? overrideScore : editScore

    setIsSubmittingReview(true)
    try {
      await progressService.reviewSubmission(selectedSubmission._id, {
        teacher_score: scoreToSave,
        teacher_feedback: editFeedback || 'Giáo viên đã xác nhận và chuẩn hóa điểm số.',
      })
      toast.success(`Đã cập nhật điểm thành công: ${scoreToSave}/100!`)
      setSelectedSubmission(null)
      loadData()
    } catch {
      toast.error('Lỗi khi lưu điểm đánh giá của giáo viên.')
    } finally {
      setIsSubmittingReview(false)
    }
  }

  return {
    student,
    userProfile,
    courseInfo,
    submissions,
    isLoading,
    selectedSubmission,
    editScore,
    editFeedback,
    isSubmittingReview,
    setEditScore,
    setEditFeedback,
    setSelectedSubmission,
    loadData,
    handleOpenReview,
    handleSaveReview,
  }
}

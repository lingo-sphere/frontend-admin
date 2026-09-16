// Hook quản lý dữ liệu chi tiết tiến độ học tập và bài nộp kỹ năng của học viên với TanStack Query.
import { useState, useMemo, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  progressService,
  type StudentProgressItem,
  type SkillSubmissionItem,
} from '@/features/progress/services/progress.service'
import { courseService } from '@/features/courses/services/course.service'
import { userService } from '@/features/users/services/user.service'
import { toast } from '@/store/toast.store'
import { storage, STORAGE_KEYS } from '@/lib/storage'
import type { Course as ApiCourse, UserProfile } from '@/types/api.types'

interface UseLearnerProgressDetailProps {
  courseId: string
  userId: string
}

interface LearnerProgressDetailQueryResult {
  student: StudentProgressItem | null
  userProfile: UserProfile | null
  courseInfo: ApiCourse | null
  submissions: SkillSubmissionItem[]
}

export function useLearnerProgressDetail({ courseId, userId }: UseLearnerProgressDetailProps) {
  const queryClient = useQueryClient()
  const [selectedSubmission, setSelectedSubmission] = useState<SkillSubmissionItem | null>(null)
  const [editScore, setEditScore] = useState<number>(0)
  const [editFeedback, setEditFeedback] = useState<string>('')

  const initialCachedStudent = useMemo(() => {
    const cached = storage.session.get<StudentProgressItem>(STORAGE_KEYS.ACTIVE_STUDENT_PROGRESS)
    return cached && cached.user_id === userId ? cached : null
  }, [userId])

  const {
    data,
    isLoading,
    refetch,
  } = useQuery<LearnerProgressDetailQueryResult>({
    queryKey: ['learner-progress-detail', courseId, userId],
    queryFn: async () => {
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

      let studentData: StudentProgressItem | null = null

      if (detailRes?.course_progress) {
        const cp = detailRes.course_progress
        studentData = {
          user_id: userId,
          full_name: userProfileRes?.full_name || initialCachedStudent?.full_name,
          email: userProfileRes?.email || initialCachedStudent?.email,
          avatar_url: userProfileRes?.avatar_url || initialCachedStudent?.avatar_url,
          course_id: courseId,
          course_title: courseRes?.title || initialCachedStudent?.course_title,
          progress_percentage: cp.progress_percentage ?? initialCachedStudent?.progress_percentage ?? 0,
          completed_lessons: cp.completed_lessons_count ?? initialCachedStudent?.completed_lessons ?? 0,
          total_lessons: cp.total_lessons_count ?? initialCachedStudent?.total_lessons ?? 1,
          baseline_score: cp.baseline_score ?? initialCachedStudent?.baseline_score,
          baseline_source: cp.baseline_source ?? initialCachedStudent?.baseline_source,
          final_test_score: cp.final_test_score ?? initialCachedStudent?.final_test_score,
          total_score_growth: cp.total_score_growth ?? initialCachedStudent?.total_score_growth,
          modules_progress: detailRes.modules_progress || initialCachedStudent?.modules_progress || [],
          status: cp.status ?? initialCachedStudent?.status,
        }
        storage.session.set(STORAGE_KEYS.ACTIVE_STUDENT_PROGRESS, studentData)
      } else if (isAllCourse) {
        const allProg = await progressService.getCourseStudentsProgress('all').catch(() => null)
        if (allProg?.students) {
          const found = allProg.students.find((s) => s.user_id === userId)
          if (found) {
            studentData = found
            storage.session.set(STORAGE_KEYS.ACTIVE_STUDENT_PROGRESS, found)
          }
        }
      }

      if (!studentData && initialCachedStudent) {
        studentData = initialCachedStudent
      }

      return {
        student: studentData,
        userProfile: userProfileRes,
        courseInfo: courseRes,
        submissions: Array.isArray(submissionsRes) ? submissionsRes : [],
      }
    },
    enabled: !!userId,
    staleTime: 0,
  })

  const student = data?.student || initialCachedStudent
  const userProfile = data?.userProfile || null
  const courseInfo = data?.courseInfo || null
  const submissions = data?.submissions || []

  const reviewMutation = useMutation({
    mutationFn: async ({
      submissionId,
      score,
      feedback,
    }: {
      submissionId: string
      score: number
      feedback: string
    }) => {
      return progressService.reviewSubmission(submissionId, {
        teacher_score: score,
        teacher_feedback: feedback || 'Giáo viên đã xác nhận và chuẩn hóa điểm số.',
      })
    },
    onSuccess: (_, vars) => {
      toast.success(`Đã cập nhật điểm thành công: ${vars.score}/100!`)
      setSelectedSubmission(null)
      queryClient.invalidateQueries({ queryKey: ['learner-progress-detail', courseId, userId] })
      queryClient.invalidateQueries({ queryKey: ['course-learners'] })
    },
    onError: () => {
      toast.error('Lỗi khi lưu điểm đánh giá của giáo viên.')
    },
  })

  const handleOpenReview = useCallback((sub: SkillSubmissionItem) => {
    setSelectedSubmission(sub)
    setEditScore(sub.teacher_score !== undefined ? sub.teacher_score : sub.ai_score)
    setEditFeedback(sub.teacher_feedback || '')
  }, [])

  const handleSaveReview = useCallback(
    async (overrideScore?: number) => {
      if (!selectedSubmission) return
      const scoreToSave = overrideScore !== undefined ? overrideScore : editScore
      await reviewMutation.mutateAsync({
        submissionId: selectedSubmission._id,
        score: scoreToSave,
        feedback: editFeedback,
      })
    },
    [selectedSubmission, editScore, editFeedback, reviewMutation]
  )

  const loadData = useCallback(async () => {
    await refetch()
  }, [refetch])

  return {
    student,
    userProfile,
    courseInfo,
    submissions,
    isLoading: isLoading && !student,
    selectedSubmission,
    editScore,
    editFeedback,
    isSubmittingReview: reviewMutation.isPending,
    setEditScore,
    setEditFeedback,
    setSelectedSubmission,
    loadData,
    handleOpenReview,
    handleSaveReview,
  }
}

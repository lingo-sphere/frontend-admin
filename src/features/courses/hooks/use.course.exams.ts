// Hook quản lý dữ liệu bài thi, bộ lọc, phân trang và trạng thái hiển thị với TanStack Query.
import { useState, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { examAdminService, type ToeicExamItem } from '@/features/exams/services/exam.service'
import { courseService } from '@/features/courses/services/course.service'
import { courseExamAggregatorService } from '@/features/courses/services/course.exam.aggregator.service'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { toast } from '@/store/toast.store'
import { storage, STORAGE_KEYS } from '@/lib/storage'
import type { CourseSelectItem } from '@/features/courses/components/course.exam.header.actions'

export function useCourseExams() {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'
  const queryClient = useQueryClient()

  const user = useAuthStore((state) => state.user)
  const profile = useAuthStore((state) => state.profile)
  const currentRole = (user?.role || profile?.role || '').toUpperCase()
  const isTeacher = currentRole === 'TEACHER' || currentRole === 'INSTRUCTOR' || currentRole === 'GIANG_VIEN'
  const currentUserId = user?.user_id || profile?.user_id || ''

  const [selectedCourseId, setSelectedCourseId] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [typeFilter, setTypeFilter] = useState<string>('ALL')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [viewMode, setViewModeState] = useState<'table' | 'grid'>(() => {
    const saved = storage.get<'table' | 'grid'>(STORAGE_KEYS.COURSE_EXAMS_VIEW_MODE)
    return saved === 'grid' || saved === 'table' ? saved : 'table'
  })

  const setViewMode = useCallback((mode: 'table' | 'grid') => {
    setViewModeState(mode)
    storage.set(STORAGE_KEYS.COURSE_EXAMS_VIEW_MODE, mode)
  }, [])

  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(10)
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null)

  const {
    data: aggregatedData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['course-exams-aggregated', isTeacher, currentUserId],
    queryFn: async () => {
      return courseExamAggregatorService.fetchAggregatedCourseExams({
        isTeacher,
        currentUserId,
      })
    },
    staleTime: 0,
  })

  const courses: CourseSelectItem[] = useMemo(() => aggregatedData?.allowedCourses || [], [aggregatedData])
  const exams: ToeicExamItem[] = useMemo(() => aggregatedData?.exams || [], [aggregatedData])

  const deleteExamMutation = useMutation({
    mutationFn: async (examId: string) => {
      if (String(examId).startsWith('course_final_')) {
        const courseId = examId.replace('course_final_', '')
        await courseService.updateCourse(courseId, { final_test_questions: [] })
      } else if (String(examId).startsWith('mod_challenge_')) {
        const modId = examId.replace('mod_challenge_', '')
        await courseService.updateModule(modId, { challenge_questions: [], post_mini_questions: [] })
      } else {
        await examAdminService.deleteExam(examId)
      }
      return examId
    },
    onSuccess: (deletedId) => {
      queryClient.setQueryData(
        ['course-exams-aggregated', isTeacher, currentUserId],
        (old: { allowedCourses: CourseSelectItem[]; exams: ToeicExamItem[] } | undefined) => {
          if (!old) return old
          return {
            ...old,
            exams: old.exams.filter((e) => (e._id || e.id) !== deletedId),
          }
        }
      )
      toast.success(isVi ? 'Đã xóa bài thi thành công!' : 'Exam deleted successfully!')
      queryClient.invalidateQueries({ queryKey: ['course-exams-aggregated'] })
    },
    onError: () => {
      toast.error(isVi ? 'Không thể xóa bài thi.' : 'Failed to delete exam.')
    },
  })

  const togglePublishMutation = useMutation({
    mutationFn: async ({ exam, nextStatus }: { exam: ToeicExamItem; nextStatus: boolean }) => {
      const examId = exam._id || exam.id || ''
      if (exam.course_id && String(examId).startsWith('course_final_')) {
        await courseService.updateCourse(exam.course_id, { is_published: nextStatus })
      } else if (exam.module_id && String(examId).startsWith('mod_challenge_')) {
        await courseService.updateModule(exam.module_id, { is_published: nextStatus })
      } else {
        await examAdminService.updateExam(examId, { is_published: nextStatus })
      }
      return { examId, nextStatus }
    },
    onSuccess: ({ examId, nextStatus }) => {
      queryClient.setQueryData(
        ['course-exams-aggregated', isTeacher, currentUserId],
        (old: { allowedCourses: CourseSelectItem[]; exams: ToeicExamItem[] } | undefined) => {
          if (!old) return old
          return {
            ...old,
            exams: old.exams.map((e) =>
              (e._id || e.id) === examId ? { ...e, is_published: nextStatus } : e
            ),
          }
        }
      )
      toast.success(
        nextStatus
          ? (isVi ? 'Đã xuất bản bài thi!' : 'Exam published!')
          : (isVi ? 'Đã chuyển bài thi về bản nháp / Private!' : 'Exam set to private draft!')
      )
      queryClient.invalidateQueries({ queryKey: ['course-exams-aggregated'] })
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Không thể cập nhật trạng thái xuất bản bài thi.'
      toast.error(msg)
    },
  })

  const filteredExams = useMemo(() => {
    const list = exams.filter((e) => {
      const matchCourse =
        selectedCourseId === 'ALL' || e.course_id === selectedCourseId

      const isChallengeType = e.type === 'CHALLENGE_TEST' || e.type === 'POST_MINI_TEST' || e.type === 'PRE_TEST'
      const matchType =
        typeFilter === 'ALL' ||
        (typeFilter === 'CHALLENGE_TEST' ? isChallengeType : e.type === typeFilter)

      const matchStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'PUBLISHED' && e.is_published) ||
        (statusFilter === 'DRAFT' && !e.is_published)

      const q = searchQuery.toLowerCase().trim()
      const matchSearch =
        !q ||
        e.title.toLowerCase().includes(q) ||
        (e.course_title || '').toLowerCase().includes(q) ||
        (e.module_title || '').toLowerCase().includes(q) ||
        (e.type || '').toLowerCase().includes(q)

      return matchCourse && matchType && matchStatus && matchSearch
    })

    if (!sortKey || !sortOrder) return list

    return [...list].sort((a, b) => {
      if (sortKey === 'title' || sortKey === 'exam_info') {
        const comp = a.title.localeCompare(b.title)
        return sortOrder === 'asc' ? comp : -comp
      }
      if (sortKey === 'course') {
        const comp = (a.course_title || '').localeCompare(b.course_title || '')
        return sortOrder === 'asc' ? comp : -comp
      }
      if (sortKey === 'duration') {
        const diff = (a.duration_minutes || 0) - (b.duration_minutes || 0)
        return sortOrder === 'asc' ? diff : -diff
      }
      if (sortKey === 'questions') {
        const aCount = Array.isArray(a.questions) ? a.questions.length : (a.total_questions || 0)
        const bCount = Array.isArray(b.questions) ? b.questions.length : (b.total_questions || 0)
        const diff = aCount - bCount
        return sortOrder === 'asc' ? diff : -diff
      }
      if (sortKey === 'attempts') {
        const diff = (a.total_attempts || 0) - (b.total_attempts || 0)
        return sortOrder === 'asc' ? diff : -diff
      }
      if (sortKey === 'score') {
        const diff = (a.avg_score || 0) - (b.avg_score || 0)
        return sortOrder === 'asc' ? diff : -diff
      }
      return 0
    })
  }, [exams, selectedCourseId, typeFilter, statusFilter, searchQuery, sortKey, sortOrder])

  const paginatedExams = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredExams.slice(start, start + pageSize)
  }, [filteredExams, currentPage, pageSize])

  const stats = useMemo(() => {
    const total = filteredExams.length
    const published = filteredExams.filter((e) => e.is_published).length
    const totalAttempts = filteredExams.reduce((sum, e) => sum + (e.total_attempts || 0), 0)
    const scored = filteredExams.filter((e) => (e.avg_score || 0) > 0)
    const avgScore = scored.length
      ? Math.round(scored.reduce((sum, e) => sum + (e.avg_score || 0), 0) / scored.length)
      : 760

    return { total, published, totalAttempts, avgScore }
  }, [filteredExams])

  const loadData = useCallback(async () => {
    await refetch()
  }, [refetch])

  const handleResetFilters = useCallback(async () => {
    setSearchQuery('')
    setSelectedCourseId('ALL')
    setTypeFilter('ALL')
    setStatusFilter('ALL')
    setSortKey(null)
    setSortOrder(null)
    setCurrentPage(1)
    await loadData()
    toast.success(isVi ? 'Đã đặt lại bộ lọc bài thi' : 'Exam filters reset')
  }, [loadData, isVi])

  const handleDeleteExam = useCallback(
    async (examId?: string) => {
      if (!examId) return
      await deleteExamMutation.mutateAsync(examId)
    },
    [deleteExamMutation]
  )

  const handleTogglePublish = useCallback(
    async (exam: ToeicExamItem) => {
      const examId = exam._id || exam.id || ''
      const nextStatus = !exam.is_published

      if (nextStatus && (exam.is_system_placement || exam.type === 'DIAGNOSTIC_TEST' || !exam.course_id)) {
        const is4Skills = exam.skills_enabled === 'ALL' || exam.placement_type === '4SKILLS'
        const conflict = exams.find(
          (e) =>
            (e._id || e.id) !== examId &&
            (e.is_system_placement || e.type === 'DIAGNOSTIC_TEST' || !e.course_id) &&
            e.is_published &&
            (is4Skills
              ? e.skills_enabled === 'ALL' || e.placement_type === '4SKILLS'
              : e.skills_enabled === 'LR' || e.placement_type === '2SKILLS')
        )

        if (conflict) {
          toast.error(
            isVi
              ? `Toàn hệ thống đã có bài thi "${conflict.title}" đang Public. Vui lòng chuyển bài thi đó về Private (Bản nháp) trước!`
              : `System already has a public test for this skill set. Please make "${conflict.title}" private first!`
          )
          return
        }
      }

      await togglePublishMutation.mutateAsync({ exam, nextStatus })
    },
    [exams, isVi, togglePublishMutation]
  )

  return {
    isVi,
    isTeacher,
    currentUserId,
    courses,
    selectedCourseId,
    setSelectedCourseId,
    exams,
    filteredExams,
    paginatedExams,
    isLoading,
    searchQuery,
    setSearchQuery,
    typeFilter,
    setTypeFilter,
    statusFilter,
    setStatusFilter,
    viewMode,
    setViewMode,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    sortKey,
    setSortKey,
    sortOrder,
    setSortOrder,
    stats,
    loadData,
    handleResetFilters,
    handleDeleteExam,
    handleTogglePublish,
  }
}

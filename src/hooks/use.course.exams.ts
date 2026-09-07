// Hook quản lý dữ liệu bài thi, tiến độ học viên và phân loại đề thi.

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { examAdminService, type ToeicExamItem } from '@/services/exam.service'
import { courseService } from '@/services/course.service'
import { progressService, type StudentProgressItem } from '@/services/progress.service'
import { useAuthStore } from '@/store/auth.store'
import { toast } from '@/store/toast.store'
import type { CourseSelectItem } from '@/components/course-exams/course.exam.header.actions'
import type { Course } from '@/types/api.types'

export function useCourseExams() {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'

  const user = useAuthStore((state) => state.user)
  const profile = useAuthStore((state) => state.profile)
  const currentRole = (user?.role || profile?.role || '').toUpperCase()
  const isTeacher = currentRole === 'TEACHER' || currentRole === 'INSTRUCTOR' || currentRole === 'GIANG_VIEN'
  const currentUserId = user?.user_id || profile?.user_id || ''

  const [courses, setCourses] = useState<CourseSelectItem[]>([])
  const [selectedCourseId, setSelectedCourseId] = useState<string>('ALL')
  const [exams, setExams] = useState<ToeicExamItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [typeFilter, setTypeFilter] = useState<string>('ALL')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('grid')

  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(10)
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null)

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      let allowedCourses: CourseSelectItem[] = []
      let rawCourses: Course[] = []

      if (isTeacher) {
        try {
          const teacherRes = await courseService.getTeacherCourses()
          if (Array.isArray(teacherRes) && teacherRes.length > 0) {
            rawCourses = teacherRes
            allowedCourses = teacherRes.map((c) => ({
              id: c._id || '',
              title: c.title || '',
              author_id: c.author_id || currentUserId,
              students_count: c.students_count || 0,
            }))
          }
        } catch {
          allowedCourses = []
        }

        if (allowedCourses.length === 0) {
          const allRes = await courseService.getAllCourses({ pageSize: 100 })
          rawCourses = allRes.result || []
          const myCourses = rawCourses.filter((c) => c.author_id === currentUserId)
          const targetList = myCourses.length > 0 ? myCourses : rawCourses
          allowedCourses = targetList.map((c) => ({
            id: c._id || '',
            title: c.title || '',
            author_id: c.author_id || '',
            students_count: c.students_count || 0,
          }))
        }
      } else {
        const allRes = await courseService.getAllCourses({ pageSize: 100 })
        rawCourses = allRes.result || []
        allowedCourses = rawCourses.map((c) => ({
          id: c._id || '',
          title: c.title || '',
          author_id: c.author_id || '',
          students_count: c.students_count || 0,
        }))
      }

      setCourses(allowedCourses)

      const apiExams = await examAdminService.getExams().catch(() => [])

      const courseExamsList: ToeicExamItem[] = []

      await Promise.all(
        allowedCourses.map(async (c) => {
          const rawCourse = rawCourses.find((rc) => rc._id === c.id) || (c as unknown as Course)

          let studentsProgressList: StudentProgressItem[] = []
          try {
            const prog = await progressService.getCourseStudentsProgress(c.id)
            if (prog && Array.isArray(prog.students)) {
              studentsProgressList = prog.students
            }
          } catch {}

          if (
            rawCourse.final_test_questions &&
            Array.isArray(rawCourse.final_test_questions) &&
            rawCourse.final_test_questions.length > 0
          ) {
            const finalCompleted = studentsProgressList.filter(
              (s) => typeof s.final_test_score === 'number' && s.final_test_score >= 0
            )
            const finalAttempts = finalCompleted.length
            const finalAvg =
              finalAttempts > 0
                ? Math.round(
                    finalCompleted.reduce((acc, s) => acc + (s.final_test_score || 0), 0) /
                      finalAttempts
                  )
                : 0

            courseExamsList.push({
              id: rawCourse.final_test_exam_id || `course_final_${c.id}`,
              _id: rawCourse.final_test_exam_id || `course_final_${c.id}`,
              title: `Bài Thi Tốt Nghiệp: ${c.title}`,
              course_id: c.id,
              course_title: c.title,
              type: 'FULL_TEST',
              total_questions: rawCourse.final_test_questions.length,
              duration_minutes: rawCourse.final_test_duration_minutes || 60,
              passing_score: rawCourse.final_test_passing_score || 70,
              is_published: rawCourse.is_published ?? true,
              total_attempts: finalAttempts,
              avg_score: finalAvg,
              questions: rawCourse.final_test_questions,
              audio_url: rawCourse.final_test_audio_url || '',
              author_id: c.author_id,
            })
          }

          try {
            const modulesList = await courseService.getModules(c.id)
            for (const mod of modulesList) {
              const qList =
                mod.challenge_questions && Array.isArray(mod.challenge_questions) && mod.challenge_questions.length > 0
                  ? mod.challenge_questions
                  : mod.post_mini_questions && Array.isArray(mod.post_mini_questions) && mod.post_mini_questions.length > 0
                  ? mod.post_mini_questions
                  : []

              if (qList.length > 0) {
                const targetModId = mod._id || mod.id
                const modAttemptsList = studentsProgressList
                  .map((s) =>
                    (s.modules_progress || []).find(
                      (m) =>
                        m.module_id === targetModId ||
                        (typeof m.order_index === 'number' && m.order_index === mod.order_index)
                    )
                  )
                  .filter(
                    (m) =>
                      Boolean(m && (m.challenge_taken || (typeof m.challenge_score === 'number' && m.challenge_score >= 0)))
                  )

                const challengeAttempts = modAttemptsList.length
                const challengeAvg =
                  challengeAttempts > 0
                    ? Math.round(
                        modAttemptsList.reduce(
                          (acc, m) => acc + (typeof m?.challenge_score === 'number' ? m.challenge_score : 0),
                          0
                        ) / challengeAttempts
                      )
                    : 0

                courseExamsList.push({
                  id: mod.challenge_test_exam_id || mod.post_mini_test_exam_id || `mod_challenge_${targetModId}`,
                  _id: mod.challenge_test_exam_id || mod.post_mini_test_exam_id || `mod_challenge_${targetModId}`,
                  title: `Challenge Test: ${mod.title}`,
                  course_id: c.id,
                  course_title: c.title,
                  module_id: targetModId,
                  module_title: mod.title,
                  type: 'CHALLENGE_TEST',
                  total_questions: qList.length,
                  duration_minutes: mod.challenge_duration_minutes || mod.post_mini_duration_minutes || 15,
                  passing_score: mod.challenge_passing_score || mod.post_mini_passing_score || 80,
                  is_published: true,
                  total_attempts: challengeAttempts,
                  avg_score: challengeAvg,
                  questions: qList,
                  audio_url: mod.challenge_audio_url || mod.test_audio_url || mod.audio_url || '',
                  author_id: c.author_id,
                })
              }
            }
          } catch {}
        })
      )

      const seenIds = new Set<string>()
      const combined: ToeicExamItem[] = []

      apiExams.forEach((e) => {
        const eid = e._id || e.id || ''
        if (eid && !seenIds.has(eid)) {
          seenIds.add(eid)
          const rawExam = e as Record<string, unknown>
          const resolvedType =
            (rawExam.exam_type as string) ||
            e.type ||
            (e.is_system_placement ? 'DIAGNOSTIC_TEST' : 'FULL_TEST')

          let courseTitle = 'Toàn Hệ Thống'
          if (!e.is_system_placement && resolvedType !== 'DIAGNOSTIC_TEST' && e.course_id) {
            const matched = allowedCourses.find(
              (c) => c.id === e.course_id || (c as unknown as { _id?: string })._id === e.course_id
            )
            courseTitle = matched?.title || e.course_title || 'Khóa học'
          } else if (e.course_title) {
            courseTitle = e.course_title
          }

          const qCount =
            Array.isArray(e.questions) && e.questions.length > 0
              ? e.questions.length
              : (e.total_questions || (resolvedType === 'FULL_TEST' ? 200 : 30))

          const duration =
            e.duration_minutes ||
            (typeof rawExam.listening_duration_minutes === 'number' &&
            typeof rawExam.reading_duration_minutes === 'number'
              ? rawExam.listening_duration_minutes + rawExam.reading_duration_minutes
              : resolvedType === 'FULL_TEST'
              ? 120
              : 45)

          combined.push({
            ...e,
            id: eid,
            _id: eid,
            type: resolvedType,
            course_title: courseTitle,
            total_questions: qCount,
            duration_minutes: duration,
            total_attempts: typeof e.total_attempts === 'number' ? e.total_attempts : 0,
            avg_score: typeof e.avg_score === 'number' ? e.avg_score : 0,
          })
        }
      })

      courseExamsList.forEach((e) => {
        const eid = e._id || e.id || ''
        if (eid && !seenIds.has(eid)) {
          seenIds.add(eid)
          combined.push(e)
        }
      })

      setExams(combined)
    } catch {
      toast.error('Không thể tải danh sách bài thi và khóa học.')
    } finally {
      setIsLoading(false)
    }
  }, [isTeacher, currentUserId])

  useEffect(() => {
    loadData()
  }, [loadData])

  const filteredExams = useMemo(() => {
    const list = exams.filter((e) => {
      const isSystemPlacement = e.is_system_placement || e.type === 'DIAGNOSTIC_TEST' || !e.course_id
      const matchCourse =
        selectedCourseId === 'ALL' ||
        (selectedCourseId === 'GLOBAL_SYSTEM' ? isSystemPlacement : e.course_id === selectedCourseId)

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

  const handleResetFilters = () => {
    setSearchQuery('')
    setSelectedCourseId('ALL')
    setTypeFilter('ALL')
    setStatusFilter('ALL')
    setSortKey(null)
    setSortOrder(null)
    setCurrentPage(1)
  }

  const handleDeleteExam = async (examId?: string) => {
    if (!examId) return
    try {
      if (String(examId).startsWith('course_final_')) {
        const courseId = examId.replace('course_final_', '')
        await courseService.updateCourse(courseId, { final_test_questions: [] })
      } else if (String(examId).startsWith('mod_challenge_')) {
        const modId = examId.replace('mod_challenge_', '')
        await courseService.updateModule(modId, { challenge_questions: [], post_mini_questions: [] })
      } else {
        await examAdminService.deleteExam(examId)
      }
      setExams((prev) => prev.filter((e) => (e._id || e.id) !== examId))
      toast.success(isVi ? 'Đã xóa bài thi thành công!' : 'Exam deleted successfully!')
    } catch {
      setExams((prev) => prev.filter((e) => (e._id || e.id) !== examId))
      toast.success(isVi ? 'Đã xóa bài thi khỏi danh sách.' : 'Exam removed from list.')
    }
  }

  const handleTogglePublish = async (exam: ToeicExamItem) => {
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

    try {
      if (exam.course_id && String(examId).startsWith('course_final_')) {
        await courseService.updateCourse(exam.course_id, { is_published: nextStatus })
      } else if (exam.module_id && String(examId).startsWith('mod_challenge_')) {
        await courseService.updateModule(exam.module_id, { is_published: nextStatus })
      } else {
        await examAdminService.updateExam(examId, { is_published: nextStatus })
      }

      setExams((prev) =>
        prev.map((e) => ((e._id || e.id) === examId ? { ...e, is_published: nextStatus } : e))
      )
      toast.success(
        nextStatus
          ? (isVi ? 'Đã xuất bản bài thi!' : 'Exam published!')
          : (isVi ? 'Đã chuyển bài thi về bản nháp / Private!' : 'Exam set to private draft!')
      )
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể cập nhật trạng thái xuất bản bài thi.'
      toast.error(msg)
    }
  }

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

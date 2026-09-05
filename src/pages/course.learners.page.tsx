/**
 * @file CourseLearnersPage.tsx
 * @description Trang quản lý học viên theo khóa học, bảng điểm tiến độ học tập và phúc khảo chấm bài nộp kỹ năng Speaking, Writing chuẩn DataTable và UI/UX Admin
 */

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import {
  GraduationCap,
  FileCheck2,
  Search,
  RotateCcw,
  BookOpen,
  Users,
  Trophy,
  CheckCircle2,
  Clock,
  Zap,
  Sparkles,
  Volume2,
  FileText,
  Bot,
  Edit3,
  Save,
  X,
  ShieldCheck,
  UserCheck,
  BarChart3,
  ExternalLink,
} from 'lucide-react'
import { DataTable, type DataTableColumn } from '@/components/common/data.table'
import { courseService } from '@/services/course.service'
import {
  progressService,
  type CourseStudentsProgressResponse,
  type StudentProgressItem,
  type SkillSubmissionItem,
} from '@/services/progress.service'
import { userService } from '@/services/user.service'
import { useAuthStore } from '@/store/auth-store'
import { toast } from '@/store/toast-store'
import type { Course as ApiCourse, UserProfile } from '@/types/api.types'
import { resolveMediaUrl } from '@/utils/media.utils'

interface CourseSimple {
  id: string
  title: string
  thumbnail_url?: string
  author_id?: string
  students_count?: number
}

export function CourseLearnersPage() {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'

  const user = useAuthStore((state) => state.user)
  const profile = useAuthStore((state) => state.profile)
  const currentRole = (user?.role || profile?.role || '').toUpperCase()
  const isTeacher = currentRole === 'TEACHER' || currentRole === 'INSTRUCTOR' || currentRole === 'GIANG_VIEN'
  const currentUserId = user?.user_id || profile?.user_id || (user as unknown as { _id?: string; id?: string })?._id || ''

  const [activeTab, setActiveTab] = useState<'PROGRESS' | 'SUBMISSIONS'>('PROGRESS')
  const [courses, setCourses] = useState<CourseSimple[]>([])
  const [selectedCourseId, setSelectedCourseId] = useState<string>('ALL')
  const [isLoadingCourses, setIsLoadingCourses] = useState<boolean>(false)

  // Progress state
  const [allStudentsProgress, setAllStudentsProgress] = useState<StudentProgressItem[]>([])
  const [usersMap, setUsersMap] = useState<Map<string, UserProfile>>(new Map())
  const [isLoadingProgress, setIsLoadingProgress] = useState<boolean>(false)
  const [progressSearch, setProgressSearch] = useState<string>('')
  const [progressStatusFilter, setProgressStatusFilter] = useState<'ALL' | 'COMPLETED' | 'IN_PROGRESS' | 'STARTED'>('ALL')
  const [progressCurrentPage, setProgressCurrentPage] = useState<number>(1)
  const [progressPageSize, setProgressPageSize] = useState<number>(10)
  const [progressSortKey, setProgressSortKey] = useState<string | null>(null)
  const [progressSortOrder, setProgressSortOrder] = useState<'asc' | 'desc' | null>(null)
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<StudentProgressItem | null>(null)

  // Submissions state
  const [submissions, setSubmissions] = useState<SkillSubmissionItem[]>([])
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState<boolean>(false)
  const [submissionSearch, setSubmissionSearch] = useState<string>('')
  const [skillFilter, setSkillFilter] = useState<'ALL' | 'SPEAKING' | 'WRITING'>('ALL')
  const [reviewStatusFilter, setReviewStatusFilter] = useState<'ALL' | 'PENDING' | 'REVIEWED'>('ALL')
  const [subViewMode, setSubViewMode] = useState<'table' | 'grid'>('table')
  const [subCurrentPage, setSubCurrentPage] = useState<number>(1)
  const [subPageSize, setSubPageSize] = useState<number>(10)
  const [subSortKey, setSubSortKey] = useState<string | null>(null)
  const [subSortOrder, setSubSortOrder] = useState<'asc' | 'desc' | null>(null)
  const [selectedReviewSub, setSelectedReviewSub] = useState<SkillSubmissionItem | null>(null)
  const [editScore, setEditScore] = useState<number>(0)
  const [editFeedback, setEditFeedback] = useState<string>('')
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false)

  const fetchCourses = useCallback(async () => {
    setIsLoadingCourses(true)
    try {
      let loadedCourses: CourseSimple[] = []

      if (isTeacher) {
        try {
          const teacherCourses = await courseService.getTeacherCourses()
          if (Array.isArray(teacherCourses) && teacherCourses.length > 0) {
            loadedCourses = teacherCourses.map((c: any) => ({
              id: c._id || c.id || '',
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
          const rawList = Array.isArray(allRes) ? allRes : ((allRes as any)?.result || (allRes as any)?.data || [])
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
        const rawList = Array.isArray(allRes) ? allRes : ((allRes as any)?.result || (allRes as any)?.data || [])
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
    if (courses.length > 0) {
      if (activeTab === 'PROGRESS') {
        fetchProgress()
      } else {
        fetchSubmissions()
      }
    }
  }, [courses, selectedCourseId, activeTab, fetchProgress, fetchSubmissions])

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
  }, [allStudentsProgress, usersMap])

  const filteredStudents = useMemo(() => {
    let list = allStudentsProgress

    if (progressSearch.trim()) {
      const q = progressSearch.toLowerCase()
      list = list.filter((st) => {
        const u = usersMap.get(st.user_id) || usersMap.get(String(st.user_id))
        const name = (u?.full_name || (u as any)?.fullName || st.full_name || '').toLowerCase()
        const email = (u?.email || st.email || '').toLowerCase()
        const course = (st.course_title || '').toLowerCase()
        return (
          name.includes(q) ||
          email.includes(q) ||
          st.user_id.toLowerCase().includes(q) ||
          course.includes(q)
        )
      })
    }

    if (progressStatusFilter === 'COMPLETED') {
      list = list.filter((st) => (st.progress_percentage || 0) >= 100)
    } else if (progressStatusFilter === 'IN_PROGRESS') {
      list = list.filter((st) => (st.progress_percentage || 0) > 0 && (st.progress_percentage || 0) < 100)
    } else if (progressStatusFilter === 'STARTED') {
      list = list.filter((st) => (st.progress_percentage || 0) <= 20)
    }

    if (!progressSortKey || !progressSortOrder) return list

    return [...list].sort((a, b) => {
      if (progressSortKey === 'learner') {
        const uA = usersMap.get(a.user_id)
        const uB = usersMap.get(b.user_id)
        const nameA = (uA?.full_name || a.full_name || a.email || a.user_id || '').toLowerCase()
        const nameB = (uB?.full_name || b.full_name || b.email || b.user_id || '').toLowerCase()
        const comp = nameA.localeCompare(nameB)
        return progressSortOrder === 'asc' ? comp : -comp
      }
      if (progressSortKey === 'course') {
        const comp = (a.course_title || '').localeCompare(b.course_title || '')
        return progressSortOrder === 'asc' ? comp : -comp
      }
      if (progressSortKey === 'progress') {
        const diff = (a.progress_percentage || 0) - (b.progress_percentage || 0)
        return progressSortOrder === 'asc' ? diff : -diff
      }
      if (progressSortKey === 'pre_test') {
        const diff = (a.baseline_score || 0) - (b.baseline_score || 0)
        return progressSortOrder === 'asc' ? diff : -diff
      }
      if (progressSortKey === 'final_test') {
        const diff = (a.final_test_score || 0) - (b.final_test_score || 0)
        return progressSortOrder === 'asc' ? diff : -diff
      }
      if (progressSortKey === 'growth') {
        const growthA = a.total_score_growth ?? ((a.final_test_score || 0) - (a.baseline_score || 0))
        const growthB = b.total_score_growth ?? ((b.final_test_score || 0) - (b.baseline_score || 0))
        const diff = growthA - growthB
        return progressSortOrder === 'asc' ? diff : -diff
      }
      return 0
    })
  }, [allStudentsProgress, progressSearch, progressStatusFilter, usersMap, progressSortKey, progressSortOrder])

  const paginatedStudents = useMemo(() => {
    const start = (progressCurrentPage - 1) * progressPageSize
    return filteredStudents.slice(start, start + progressPageSize)
  }, [filteredStudents, progressCurrentPage, progressPageSize])

  const filteredSubmissions = useMemo(() => {
    let list = submissions

    if (skillFilter !== 'ALL') {
      list = list.filter((sub) => sub.skill === skillFilter)
    }

    if (reviewStatusFilter === 'PENDING') {
      list = list.filter((sub) => !sub.is_teacher_reviewed && sub.status !== 'TEACHER_REVIEWED')
    } else if (reviewStatusFilter === 'REVIEWED') {
      list = list.filter((sub) => sub.is_teacher_reviewed || sub.status === 'TEACHER_REVIEWED')
    }

    if (submissionSearch.trim()) {
      const q = submissionSearch.toLowerCase()
      list = list.filter((sub) => {
        const name = (sub.user_name || '').toLowerCase()
        const email = (sub.user_email || '').toLowerCase()
        const transcript = (sub.whisper_transcript || '').toLowerCase()
        const essay = (sub.essay_text || '').toLowerCase()
        const course = (sub.course_title || '').toLowerCase()
        return (
          name.includes(q) ||
          email.includes(q) ||
          transcript.includes(q) ||
          essay.includes(q) ||
          course.includes(q)
        )
      })
    }

    if (!subSortKey || !subSortOrder) return list

    return [...list].sort((a, b) => {
      if (subSortKey === 'student') {
        const comp = (a.user_name || '').localeCompare(b.user_name || '')
        return subSortOrder === 'asc' ? comp : -comp
      }
      if (subSortKey === 'course') {
        const comp = (a.course_title || '').localeCompare(b.course_title || '')
        return subSortOrder === 'asc' ? comp : -comp
      }
      if (subSortKey === 'ai_score') {
        const diff = (a.ai_score || 0) - (b.ai_score || 0)
        return subSortOrder === 'asc' ? diff : -diff
      }
      if (subSortKey === 'teacher_score') {
        const diff = (a.teacher_score || 0) - (b.teacher_score || 0)
        return subSortOrder === 'asc' ? diff : -diff
      }
      return 0
    })
  }, [submissions, skillFilter, reviewStatusFilter, submissionSearch, subSortKey, subSortOrder])

  const paginatedSubmissions = useMemo(() => {
    const start = (subCurrentPage - 1) * subPageSize
    return filteredSubmissions.slice(start, start + subPageSize)
  }, [filteredSubmissions, subCurrentPage, subPageSize])

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

  const handleOpenReview = (sub: SkillSubmissionItem) => {
    setSelectedReviewSub(sub)
    setEditScore(sub.teacher_score !== undefined ? sub.teacher_score : sub.ai_score)
    setEditFeedback(sub.teacher_feedback || '')
  }

  const handleSaveReview = async (overrideScore?: number) => {
    if (!selectedReviewSub) return
    const scoreToSave = overrideScore !== undefined ? overrideScore : editScore

    setIsSubmittingReview(true)
    try {
      await progressService.reviewSubmission(selectedReviewSub._id, {
        teacher_score: scoreToSave,
        teacher_feedback: editFeedback || 'Giáo viên đã xác nhận và chuẩn hóa điểm số bài nộp.',
      })
      toast.success(`Đã cập nhật điểm thành công: ${scoreToSave}/100!`)
      setSelectedReviewSub(null)
      fetchSubmissions()
    } catch {
      toast.error('Lỗi khi lưu điểm đánh giá của giáo viên.')
    } finally {
      setIsSubmittingReview(false)
    }
  }

  const handleResetProgressFilters = () => {
    setProgressSearch('')
    setSelectedCourseId('ALL')
    setProgressStatusFilter('ALL')
    setProgressSortKey(null)
    setProgressSortOrder(null)
    setProgressCurrentPage(1)
  }

  const handleResetSubmissionFilters = () => {
    setSubmissionSearch('')
    setSelectedCourseId('ALL')
    setSkillFilter('ALL')
    setReviewStatusFilter('ALL')
    setSubSortKey(null)
    setSubSortOrder(null)
    setSubCurrentPage(1)
  }

  // Student Progress Columns
  const progressColumns: DataTableColumn<StudentProgressItem>[] = useMemo(
    () => [
      {
        key: 'learner',
        title: isVi ? 'Học Viên' : 'Student',
        sortable: true,
        render: (st) => {
          const u = usersMap.get(st.user_id) || usersMap.get(String(st.user_id))
          const displayName = u?.full_name || (u as any)?.fullName || st.full_name || 'Học viên ẩn danh'
          const email = u?.email || st.email || 'Chưa cập nhật email'

          return (
            <div className="flex items-center gap-3 min-w-[170px]">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs shrink-0 overflow-hidden">
                {u?.avatar_url || st.avatar_url ? (
                  <img
                    src={u?.avatar_url || st.avatar_url}
                    alt={displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  displayName.charAt(0)
                )}
              </div>
              <div className="min-w-0">
                <div className="font-bold text-slate-900 dark:text-slate-100 truncate">
                  {displayName}
                </div>
                <div className="text-[11px] text-slate-400 truncate">{email}</div>
              </div>
            </div>
          )
        },
      },
      {
        key: 'course',
        title: isVi ? 'Khóa Học Đang Học' : 'Enrolled Course',
        sortable: true,
        render: (st) => (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/80 whitespace-nowrap">
            <BookOpen className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span className="truncate max-w-[190px]">{st.course_title || 'Khóa học tiếng Anh'}</span>
          </span>
        ),
      },
      {
        key: 'progress',
        title: isVi ? 'Tiến Độ Học' : 'Progress',
        sortable: true,
        render: (st) => {
          const progressPct = Math.min(100, Math.max(0, st.progress_percentage || 0))
          return (
            <div className="space-y-1 min-w-[130px]">
              <div className="flex items-center justify-between text-[11px] whitespace-nowrap">
                <span className="font-bold text-slate-700 dark:text-slate-300">{progressPct}%</span>
                <span className="text-slate-400">
                  {st.completed_lessons}/{st.total_lessons || 1} bài
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    progressPct >= 100
                      ? 'bg-emerald-500'
                      : progressPct >= 50
                      ? 'bg-indigo-500'
                      : 'bg-amber-500'
                  }`}
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          )
        },
      },
      {
        key: 'pre_test',
        title: isVi ? 'Đầu Vào (Pre-test)' : 'Baseline',
        align: 'center',
        sortable: true,
        render: (st) =>
          st.baseline_score !== undefined ? (
            <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 whitespace-nowrap">
              {st.baseline_score}
            </span>
          ) : (
            <span className="text-slate-400 text-xs">-</span>
          ),
      },
      {
        key: 'modules',
        title: isVi ? 'Kiểm Tra Chương' : 'Module Tests',
        align: 'center',
        render: (st) => (
          <div className="flex items-center justify-center gap-1.5 flex-wrap max-w-[200px] mx-auto">
            {st.modules_progress && st.modules_progress.length > 0 ? (
              st.modules_progress.map((m, idx) => {
                const challenge = typeof m.challenge_score === 'number' ? m.challenge_score : -1
                const postMini = typeof m.post_mini_score === 'number' ? m.post_mini_score : -1
                const maxScore = Math.max(challenge, postMini)
                const score = maxScore >= 0 ? maxScore : m.best_score
                const passed = m.status === 'COMPLETED' || m.is_passed_by_challenge || (score !== undefined && score >= 70)
                const modOrder = m.order_index || idx + 1
                const modName = m.title || `Chương ${modOrder}`
                return (
                  <span
                    key={m.module_id || idx}
                    title={`${modName}: ${score !== undefined ? score + ' điểm' : m.status}`}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold whitespace-nowrap ${
                      passed
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    C{modOrder}: {score !== undefined ? score : '-'}
                  </span>
                )
              })
            ) : (
              <span className="text-slate-400 text-xs">Chưa test</span>
            )}
          </div>
        ),
      },
      {
        key: 'final_test',
        title: isVi ? 'Kết Khóa (Final)' : 'Final Test',
        align: 'center',
        sortable: true,
        render: (st) =>
          st.final_test_score !== undefined ? (
            <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 whitespace-nowrap">
              {st.final_test_score}
            </span>
          ) : (
            <span className="text-slate-400 text-xs">Chưa thi</span>
          ),
      },
      {
        key: 'growth',
        title: isVi ? 'Tăng Trưởng' : 'Growth',
        align: 'center',
        sortable: true,
        render: (st) => {
          const growth = st.total_score_growth ?? ((st.final_test_score || 0) - (st.baseline_score || 0))
          return growth > 0 ? (
            <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
              <Zap className="w-3.5 h-3.5" />+{growth}
            </span>
          ) : growth < 0 ? (
            <span className="text-xs font-bold text-rose-500 whitespace-nowrap">{growth}</span>
          ) : (
            <span className="text-slate-400 text-xs whitespace-nowrap">0</span>
          )
        },
      },
      {
        key: 'actions',
        title: isVi ? 'Chi Tiết' : 'Action',
        align: 'right',
        render: (st) => (
          <button
            type="button"
            onClick={() => setSelectedStudentDetail(st)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-950/60 text-slate-700 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 font-bold text-xs transition-colors cursor-pointer whitespace-nowrap ml-auto"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Xem tiến độ</span>
          </button>
        ),
      },
    ],
    [isVi, usersMap]
  )

  // Submissions Columns
  const submissionColumns: DataTableColumn<SkillSubmissionItem>[] = useMemo(
    () => [
      {
        key: 'student',
        title: isVi ? 'Học Viên' : 'Student',
        sortable: true,
        render: (sub) => (
          <div className="space-y-0.5 min-w-[150px]">
            <div className="font-bold text-slate-900 dark:text-slate-100 text-xs">
              {sub.user_name || 'Học viên'}
            </div>
            <div className="text-[11px] text-slate-400 truncate max-w-[160px]">
              {sub.user_email || 'Email chưa cập nhật'}
            </div>
            <div className="text-[10px] text-slate-400">
              {sub.created_at ? new Date(sub.created_at).toLocaleDateString('vi-VN') : 'Mới nộp'}
            </div>
          </div>
        ),
      },
      {
        key: 'course',
        title: isVi ? 'Khóa Học' : 'Course',
        sortable: true,
        render: (sub) => (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/80 whitespace-nowrap">
            <BookOpen className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span className="truncate max-w-[160px]">{sub.course_title || 'Khóa học'}</span>
          </span>
        ),
      },
      {
        key: 'skill_content',
        title: isVi ? 'Kỹ Năng & Bài Làm' : 'Skill & Submission Content',
        render: (sub) => (
          <div className="space-y-1.5 max-w-md">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                sub.skill === 'SPEAKING'
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200'
                  : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200'
              }`}
            >
              {sub.skill === 'SPEAKING' ? <Volume2 className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
              <span>{sub.skill === 'SPEAKING' ? 'Speaking' : 'Writing'}</span>
            </span>

            {sub.skill === 'SPEAKING' && sub.audio_url && (
              <audio
                controls
                className="w-full h-7 mt-1"
                src={resolveMediaUrl(sub.audio_url)}
                preload="metadata"
              />
            )}

            {sub.skill === 'SPEAKING' && sub.whisper_transcript && (
              <p className="text-slate-600 dark:text-slate-400 italic text-xs line-clamp-2">
                "{sub.whisper_transcript}"
              </p>
            )}

            {sub.skill === 'WRITING' && sub.essay_text && (
              <p className="text-slate-700 dark:text-slate-300 text-xs line-clamp-2 font-mono">
                {sub.essay_text}
              </p>
            )}
          </div>
        ),
      },
      {
        key: 'ai_score',
        title: isVi ? 'Điểm AI' : 'AI Score',
        align: 'center',
        sortable: true,
        render: (sub) => (
          <div className="space-y-0.5 text-center whitespace-nowrap">
            <span className="inline-flex items-center gap-1 font-black text-indigo-600 dark:text-indigo-400 text-xs sm:text-sm">
              <Sparkles className="w-3 h-3" />
              {sub.ai_score}/100
            </span>
          </div>
        ),
      },
      {
        key: 'teacher_score',
        title: isVi ? 'Điểm Giáo Viên' : 'Teacher Score',
        align: 'center',
        sortable: true,
        render: (sub) =>
          sub.teacher_score !== undefined ? (
            <span className="inline-block font-black text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm whitespace-nowrap">
              {sub.teacher_score}/100
            </span>
          ) : (
            <span className="text-slate-400 text-xs italic whitespace-nowrap">Chưa duyệt</span>
          ),
      },
      {
        key: 'review_status',
        title: isVi ? 'Trạng Thái' : 'Status',
        align: 'center',
        render: (sub) => {
          const isReviewed = sub.is_teacher_reviewed || sub.status === 'TEACHER_REVIEWED'
          return (
            <span
              className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap ${
                isReviewed
                  ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800'
                  : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
              }`}
            >
              {isReviewed ? '✅ Đã duyệt' : '⏳ Chờ chấm'}
            </span>
          )
        },
      },
      {
        key: 'actions',
        title: isVi ? 'Thao Tác' : 'Action',
        align: 'right',
        render: (sub) => {
          const isReviewed = sub.is_teacher_reviewed || sub.status === 'TEACHER_REVIEWED'
          return (
            <button
              type="button"
              onClick={() => handleOpenReview(sub)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs hover:shadow-indigo-500/20 transition-all cursor-pointer whitespace-nowrap ml-auto"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isReviewed ? 'Sửa điểm' : 'Chấm bài'}</span>
            </button>
          )
        },
      },
    ],
    [isVi]
  )

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Overview Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              {isVi ? 'Tổng Học Viên' : 'Total Students'}
            </span>
            <span className="text-xl font-black text-slate-900 dark:text-slate-100">
              {stats.totalStudents}
            </span>
          </div>
        </div>

        <div className="p-4.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Trophy className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              {isVi ? 'Tiến Độ Trung Bình' : 'Avg Progress'}
            </span>
            <span className="text-xl font-black text-slate-900 dark:text-slate-100">
              {stats.avgProgress}%
            </span>
          </div>
        </div>

        <div className="p-4.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              {isVi ? 'Bài Nộp Kỹ Năng' : 'Skill Submissions'}
            </span>
            <span className="text-xl font-black text-slate-900 dark:text-slate-100">
              {stats.totalSubmissions}
            </span>
          </div>
        </div>

        <div className="p-4.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              {isVi ? 'Chờ Giáo Viên Chấm' : 'Pending Review'}
            </span>
            <span className="text-xl font-black text-amber-600 dark:text-amber-400">
              {stats.pendingReviews}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('PROGRESS')}
          className={`flex items-center gap-2.5 px-5 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'PROGRESS'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <GraduationCap className="w-4.5 h-4.5" />
          <span>{isVi ? 'Bảng Điểm & Tiến Độ Học Viên' : 'Scores & Learning Progress'}</span>
          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {stats.totalStudents}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('SUBMISSIONS')}
          className={`flex items-center gap-2.5 px-5 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'SUBMISSIONS'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <FileCheck2 className="w-4.5 h-4.5" />
          <span>{isVi ? 'Phúc Khảo & Chấm Bài Nộp Kỹ Năng' : 'Speaking & Writing Review'}</span>
          {stats.pendingReviews > 0 ? (
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-white animate-pulse">
              {stats.pendingReviews}
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {stats.totalSubmissions}
            </span>
          )}
        </button>
      </div>

      {/* Tab 1: Progress DataTable */}
      {activeTab === 'PROGRESS' && (
        <DataTable<StudentProgressItem>
          title={
            <div className="flex items-center gap-2.5 flex-wrap">
              <span>{isVi ? 'Bảng Điểm & Tiến Độ Học Viên Khóa Học' : 'Student Scores & Learning Progress'}</span>
              {isTeacher ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <UserCheck className="w-3.5 h-3.5" />
                  {isVi ? 'Giảng viên' : 'Teacher Mode'}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {isVi ? 'Quản trị viên' : 'Admin Mode'}
                </span>
              )}
            </div>
          }
          subtitle={
            isVi
              ? 'Theo dõi khóa học đang tham gia, tiến trình bài học, điểm đánh giá đầu vào Pre-test, bài kiểm tra các chương và kết khóa'
              : 'Track enrolled course, lesson progress, Pre-test baselines, chapter tests, and final exam performance'
          }
          isLoading={isLoadingProgress}
          columns={progressColumns}
          data={paginatedStudents}
          rowKey={(st) => `${st.course_id || 'c'}_${st.user_id}`}
          sortKey={progressSortKey}
          sortOrder={progressSortOrder}
          onSortChange={(k, o) => {
            setProgressSortKey(k)
            setProgressSortOrder(o)
            setProgressCurrentPage(1)
          }}
          onResetFilters={handleResetProgressFilters}
          extraActions={
            <>
              <div className="flex items-center gap-2 min-w-[220px]">
                <BookOpen className="w-4 h-4 text-slate-400 shrink-0" />
                <select
                  value={selectedCourseId}
                  onChange={(e) => {
                    setSelectedCourseId(e.target.value)
                    setProgressCurrentPage(1)
                  }}
                  disabled={isLoadingCourses || courses.length === 0}
                  className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                >
                  <option value="ALL">
                    {isTeacher
                      ? `Tất cả khóa học của tôi (${courses.length})`
                      : `Tất cả khóa học (${courses.length})`}
                  </option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={fetchProgress}
                title="Làm mới dữ liệu"
                className="flex items-center justify-center p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer shrink-0"
              >
                <RotateCcw className={`w-4 h-4 ${isLoadingProgress ? 'animate-spin text-indigo-500' : ''}`} />
              </button>
            </>
          }
          filterSlot={
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={progressSearch}
                  onChange={(e) => {
                    setProgressSearch(e.target.value)
                    setProgressCurrentPage(1)
                  }}
                  placeholder={isVi ? 'Tìm học viên theo tên, email, khóa học, mã ID...' : 'Search by name, email, course, ID...'}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { id: 'ALL', label: isVi ? 'Tất cả tiến độ' : 'All Progress' },
                  { id: 'COMPLETED', label: isVi ? 'Đã hoàn thành' : 'Completed' },
                  { id: 'IN_PROGRESS', label: isVi ? 'Đang học' : 'In Progress' },
                  { id: 'STARTED', label: isVi ? 'Mới bắt đầu' : 'Started' },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => {
                      setProgressStatusFilter(f.id as any)
                      setProgressCurrentPage(1)
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      progressStatusFilter === f.id
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          }
          pagination={{
            currentPage: progressCurrentPage,
            pageSize: progressPageSize,
            totalItems: filteredStudents.length,
            onPageChange: setProgressCurrentPage,
            onPageSizeChange: (limit) => {
              setProgressPageSize(limit)
              setProgressCurrentPage(1)
            },
          }}
        />
      )}

      {/* Tab 2: Submissions DataTable */}
      {activeTab === 'SUBMISSIONS' && (
        <DataTable<SkillSubmissionItem>
          title={
            <div className="flex items-center gap-2.5 flex-wrap">
              <span>{isVi ? 'Phúc Khảo & Chấm Bài Nộp Kỹ Năng' : 'Speaking & Writing Review'}</span>
              {stats.pendingReviews > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-white animate-pulse">
                  {stats.pendingReviews} {isVi ? 'bài chờ duyệt' : 'pending'}
                </span>
              )}
            </div>
          }
          subtitle={
            isVi
              ? 'Nghe bản ghi âm Speaking (kèm Whisper transcript) hoặc bài luận Writing, chuẩn hóa điểm số và gửi nhận xét cho học viên'
              : 'Listen to student audio (with Whisper transcript) or read essays, calibrate scores, and give feedback'
          }
          isLoading={isLoadingSubmissions}
          columns={submissionColumns}
          data={paginatedSubmissions}
          rowKey={(sub) => sub._id}
          viewMode={subViewMode}
          onViewModeChange={setSubViewMode}
          renderGridItem={(sub) => {
            const isReviewed = sub.is_teacher_reviewed || sub.status === 'TEACHER_REVIEWED'
            return (
              <div
                key={sub._id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4 hover:border-indigo-300 dark:hover:border-indigo-800 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                          sub.skill === 'SPEAKING'
                            ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400'
                            : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                        }`}
                      >
                        {sub.skill === 'SPEAKING' ? <Volume2 className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          {sub.user_name || 'Học viên'}
                        </h4>
                        <p className="text-xs text-slate-400">{sub.user_email || 'Email chưa cập nhật'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isReviewed
                            ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200'
                            : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200'
                        }`}
                      >
                        {isReviewed ? '✅ Đã duyệt' : '⏳ Chờ chấm'}
                      </span>
                    </div>
                  </div>

                  {sub.course_title && (
                    <div className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span className="truncate">{sub.course_title}</span>
                    </div>
                  )}

                  {sub.skill === 'SPEAKING' && sub.audio_url && (
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
                        <span>🎧 Bản ghi âm học viên:</span>
                        <a
                          href={resolveMediaUrl(sub.audio_url)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 text-[11px]"
                        >
                          Tải về <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <audio
                        controls
                        className="w-full h-8"
                        src={resolveMediaUrl(sub.audio_url)}
                        preload="metadata"
                      />
                    </div>
                  )}

                  {sub.skill === 'SPEAKING' && sub.whisper_transcript && (
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                      <div className="font-bold text-slate-500 dark:text-slate-400 text-[11px] flex items-center gap-1.5">
                        <Bot className="w-3.5 h-3.5 text-indigo-500" /> Bóc tách Whisper AI:
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 italic font-mono text-xs leading-relaxed">
                        "{sub.whisper_transcript}"
                      </p>
                    </div>
                  )}

                  {sub.skill === 'WRITING' && sub.essay_text && (
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                      <div className="font-bold text-slate-500 dark:text-slate-400 text-[11px]">
                        Bài viết luận của học viên:
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed line-clamp-3">
                        {sub.essay_text}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="p-2.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> Điểm AI:
                        </span>
                        <span className="text-sm font-black text-indigo-700 dark:text-indigo-300">
                          {sub.ai_score}/100
                        </span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Giáo Viên:
                        </span>
                        <span className="text-sm font-black text-emerald-700 dark:text-emerald-300">
                          {sub.teacher_score !== undefined ? `${sub.teacher_score}/100` : 'Chưa duyệt'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-400">
                    {sub.created_at ? new Date(sub.created_at).toLocaleDateString('vi-VN') : 'Mới nộp'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleOpenReview(sub)}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs hover:shadow-indigo-500/20 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{isReviewed ? 'Sửa điểm' : 'Chấm bài'}</span>
                  </button>
                </div>
              </div>
            )
          }}
          sortKey={subSortKey}
          sortOrder={subSortOrder}
          onSortChange={(k, o) => {
            setSubSortKey(k)
            setSubSortOrder(o)
            setSubCurrentPage(1)
          }}
          onResetFilters={handleResetSubmissionFilters}
          extraActions={
            <>
              <div className="flex items-center gap-2 min-w-[220px]">
                <BookOpen className="w-4 h-4 text-slate-400 shrink-0" />
                <select
                  value={selectedCourseId}
                  onChange={(e) => {
                    setSelectedCourseId(e.target.value)
                    setSubCurrentPage(1)
                  }}
                  disabled={isLoadingCourses || courses.length === 0}
                  className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                >
                  <option value="ALL">
                    {isTeacher
                      ? `Tất cả khóa học của tôi (${courses.length})`
                      : `Tất cả khóa học (${courses.length})`}
                  </option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={fetchSubmissions}
                title="Làm mới dữ liệu"
                className="flex items-center justify-center p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer shrink-0"
              >
                <RotateCcw className={`w-4 h-4 ${isLoadingSubmissions ? 'animate-spin text-indigo-500' : ''}`} />
              </button>
            </>
          }
          filterSlot={
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={submissionSearch}
                  onChange={(e) => {
                    setSubmissionSearch(e.target.value)
                    setSubCurrentPage(1)
                  }}
                  placeholder={isVi ? 'Tìm theo tên học viên, bài viết, khóa học, từ khóa...' : 'Search student, transcript, course...'}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                {(['ALL', 'SPEAKING', 'WRITING'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      setSkillFilter(s)
                      setSubCurrentPage(1)
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      skillFilter === s
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {s === 'ALL' ? 'Tất cả kỹ năng' : s === 'SPEAKING' ? '🎙️ Speaking' : '✍️ Writing'}
                  </button>
                ))}

                <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block" />

                {(['ALL', 'PENDING', 'REVIEWED'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      setReviewStatusFilter(r)
                      setSubCurrentPage(1)
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      reviewStatusFilter === r
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {r === 'ALL' ? 'Tất cả trạng thái' : r === 'PENDING' ? '⏳ Chờ chấm' : '✅ Đã duyệt'}
                  </button>
                ))}
              </div>
            </div>
          }
          pagination={{
            currentPage: subCurrentPage,
            pageSize: subPageSize,
            totalItems: filteredSubmissions.length,
            onPageChange: setSubCurrentPage,
            onPageSizeChange: (limit) => {
              setSubPageSize(limit)
              setSubCurrentPage(1)
            },
          }}
        />
      )}

      {/* Modal Review Submission */}
      {selectedReviewSub && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedReviewSub(null)
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 dark:bg-black/45 backdrop-blur-[2px] animate-in fade-in duration-150"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl ring-1 ring-black/5 dark:ring-white/10 p-6 space-y-5 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm ${
                    selectedReviewSub.skill === 'SPEAKING'
                      ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400'
                      : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                  }`}
                >
                  {selectedReviewSub.skill === 'SPEAKING' ? (
                    <Volume2 className="w-5 h-5" />
                  ) : (
                    <FileText className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                    {selectedReviewSub.skill === 'SPEAKING'
                      ? 'Chấm Điểm & Đánh Giá Bài Nói (Speaking)'
                      : 'Chấm Điểm & Đánh Giá Bài Luận (Writing)'}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                    <span>
                      Học viên: <strong className="text-slate-700 dark:text-slate-200">{selectedReviewSub.user_name}</strong>
                    </span>
                    {selectedReviewSub.course_title && (
                      <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                        • {selectedReviewSub.course_title}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReviewSub(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 1. Student Submission Content Card */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  {selectedReviewSub.skill === 'SPEAKING' ? (
                    <>
                      <Volume2 className="w-4 h-4 text-indigo-500" />
                      <span>1. Nội dung bài nói của học viên</span>
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 text-emerald-500" />
                      <span>1. Nội dung bài viết của học viên</span>
                    </>
                  )}
                </span>
                <span className="text-[11px] text-slate-400">
                  {selectedReviewSub.created_at
                    ? new Date(selectedReviewSub.created_at).toLocaleString('vi-VN')
                    : 'Gần đây'}
                </span>
              </div>

              {selectedReviewSub.skill === 'SPEAKING' && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-3">
                  {selectedReviewSub.audio_url ? (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
                        <span>🎧 Bản ghi âm bài nói:</span>
                        <a
                          href={resolveMediaUrl(selectedReviewSub.audio_url)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 text-[11px]"
                        >
                          Tải audio gốc <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <audio
                        controls
                        className="w-full h-9 rounded-lg"
                        src={resolveMediaUrl(selectedReviewSub.audio_url)}
                        preload="metadata"
                      />
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">Không tìm thấy tệp ghi âm.</p>
                  )}

                  {selectedReviewSub.whisper_transcript ? (
                    <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/60 space-y-1.5">
                      <div className="font-bold text-indigo-600 dark:text-indigo-400 text-xs flex items-center gap-1.5">
                        <Bot className="w-4 h-4" />
                        <span>Bản bóc tách văn bản từ giọng nói (Whisper STT):</span>
                      </div>
                      <p className="text-slate-800 dark:text-slate-200 italic font-mono text-xs leading-relaxed">
                        &ldquo;{selectedReviewSub.whisper_transcript}&rdquo;
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">Chưa có bản bóc tách Whisper.</p>
                  )}
                </div>
              )}

              {selectedReviewSub.skill === 'WRITING' && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
                    <span>✍️ Toàn văn bài luận:</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {selectedReviewSub.essay_text?.trim().split(/\s+/).filter(Boolean).length || 0} từ
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/60 text-xs text-slate-800 dark:text-slate-200 font-mono whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                    {selectedReviewSub.essay_text || 'Chưa có nội dung bài viết.'}
                  </div>
                </div>
              )}
            </div>

            {/* 2. AI Grading & Feedback Card */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-500" />
                <span>2. Kết quả phân tích & Chấm điểm từ AI</span>
              </span>

              <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/70 dark:border-purple-900/40 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-purple-900 dark:text-purple-200">
                      Điểm AI đề xuất:
                    </span>
                    <span className="text-base font-black text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/60 px-3 py-1 rounded-xl">
                      {selectedReviewSub.ai_score}/100
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setEditScore(selectedReviewSub.ai_score)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300 hover:bg-purple-50 cursor-pointer shadow-2xs"
                  >
                    Áp dụng điểm AI ({selectedReviewSub.ai_score})
                  </button>
                </div>

                {/* Sub-scores breakdown */}
                {selectedReviewSub.ai_feedback && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    {selectedReviewSub.skill === 'SPEAKING' && (
                      <>
                        <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/30 text-center">
                          <span className="text-[10px] text-slate-400 block font-semibold">Phát âm</span>
                          <span className="text-xs font-black text-purple-600 dark:text-purple-400">
                            {selectedReviewSub.ai_feedback.pronunciation_score ?? selectedReviewSub.ai_score}/100
                          </span>
                        </div>
                        <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/30 text-center">
                          <span className="text-[10px] text-slate-400 block font-semibold">Lưu loát</span>
                          <span className="text-xs font-black text-purple-600 dark:text-purple-400">
                            {selectedReviewSub.ai_feedback.fluency_score ?? selectedReviewSub.ai_score}/100
                          </span>
                        </div>
                      </>
                    )}

                    {selectedReviewSub.skill === 'WRITING' && (
                      <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/30 text-center">
                        <span className="text-[10px] text-slate-400 block font-semibold">Ngữ pháp</span>
                        <span className="text-xs font-black text-purple-600 dark:text-purple-400">
                          {selectedReviewSub.ai_feedback.grammar_score ?? selectedReviewSub.ai_score}/100
                        </span>
                      </div>
                    )}

                    <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/30 text-center">
                      <span className="text-[10px] text-slate-400 block font-semibold">Từ vựng</span>
                      <span className="text-xs font-black text-purple-600 dark:text-purple-400">
                        {selectedReviewSub.ai_feedback.vocabulary_score ?? selectedReviewSub.ai_score}/100
                      </span>
                    </div>

                    <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/30 text-center">
                      <span className="text-[10px] text-slate-400 block font-semibold">Độ chính xác</span>
                      <span className="text-xs font-black text-purple-600 dark:text-purple-400">
                        {selectedReviewSub.ai_score}/100
                      </span>
                    </div>
                  </div>
                )}

                {/* AI detailed comments */}
                {selectedReviewSub.ai_feedback?.detailed_comment && (
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/30 text-xs space-y-1">
                    <span className="font-bold text-purple-900 dark:text-purple-200 block">
                      💬 Nhận xét chi tiết của AI:
                    </span>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      {selectedReviewSub.ai_feedback.detailed_comment}
                    </p>
                  </div>
                )}

                {/* AI improvement tips */}
                {Array.isArray(selectedReviewSub.ai_feedback?.improvement_tips) &&
                  selectedReviewSub.ai_feedback.improvement_tips.length > 0 && (
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/30 text-xs space-y-1">
                      <span className="font-bold text-purple-900 dark:text-purple-200 block">
                        💡 Gợi ý cải thiện:
                      </span>
                      <ul className="list-disc pl-4 space-y-1 text-slate-700 dark:text-slate-300">
                        {selectedReviewSub.ai_feedback.improvement_tips.map((tip, tIdx) => (
                          <li key={tIdx}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}
              </div>
            </div>

            {/* 3. Teacher Calibration & Review Card */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Edit3 className="w-4 h-4 text-indigo-500" />
                <span>3. Giáo viên Duyệt & Hiệu chỉnh điểm số</span>
              </span>

              <div className="p-4 rounded-2xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-200/70 dark:border-indigo-900/40 space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Điểm chính thức của Giáo Viên (Thang 0 - 100):
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={editScore}
                      onChange={(e) => setEditScore(Math.min(100, Math.max(0, Number(e.target.value))))}
                      className="w-24 px-3 py-2 bg-white dark:bg-slate-900 border border-indigo-300 dark:border-indigo-700 rounded-xl text-base font-black text-indigo-600 dark:text-indigo-400 text-center focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-2xs"
                    />
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {[+5, +10, -5, -10].map((delta) => (
                        <button
                          key={delta}
                          type="button"
                          onClick={() => setEditScore((prev) => Math.min(100, Math.max(0, prev + delta)))}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer shadow-2xs transition-colors"
                        >
                          {delta > 0 ? `+${delta}` : delta}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Lời phê & Nhận xét của Giáo Viên gửi cho học viên:
                  </label>
                  <textarea
                    rows={3}
                    value={editFeedback}
                    onChange={(e) => setEditFeedback(e.target.value)}
                    placeholder="Nhập nhận xét chi tiết: khen ngợi điểm mạnh, chỉ rõ lỗi ngữ pháp/phát âm cụ thể và hướng dẫn bài tập rèn luyện thêm..."
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none leading-relaxed shadow-2xs"
                  />
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedReviewSub(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={isSubmittingReview}
                onClick={() => handleSaveReview()}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs hover:shadow-indigo-500/20 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSubmittingReview ? 'Đang lưu...' : 'Lưu điểm & Gửi học viên'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Student Details */}
      {selectedStudentDetail && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedStudentDetail(null)
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/25 dark:bg-black/35 backdrop-blur-[2px] animate-in fade-in duration-150"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl ring-1 ring-black/5 dark:ring-white/10 p-6 space-y-5 max-h-[85vh] overflow-y-auto animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                    Chi Tiết Tiến Độ Các Chương Học
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                    <span>Học viên: <strong className="text-slate-700 dark:text-slate-200">{selectedStudentDetail.full_name || selectedStudentDetail.user_id}</strong></span>
                    {selectedStudentDetail.course_title && (
                      <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                        • {selectedStudentDetail.course_title}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStudentDetail(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-center">
                <div>
                  <span className="text-[11px] text-slate-400 block font-semibold">Hoàn thành</span>
                  <span className="text-base font-black text-indigo-600 dark:text-indigo-400">
                    {Math.min(100, Math.max(0, selectedStudentDetail.progress_percentage || 0))}%
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block font-semibold">Bài học</span>
                  <span className="text-base font-black text-slate-800 dark:text-slate-200">
                    {selectedStudentDetail.completed_lessons} / {selectedStudentDetail.total_lessons || selectedStudentDetail.completed_lessons || 1}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block font-semibold">Tăng trưởng</span>
                  <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                    +{selectedStudentDetail.total_score_growth || 0} XP
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Cột mốc kiểm tra từng chương (Post-mini Tests & Challenge):
                </h4>
                {selectedStudentDetail.modules_progress && selectedStudentDetail.modules_progress.length > 0 ? (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                    {selectedStudentDetail.modules_progress.map((m, idx) => {
                      const modOrder = m.order_index || idx + 1
                      const challengeScore = typeof m.challenge_score === 'number' ? m.challenge_score : -1
                      const postMiniScore = typeof m.post_mini_score === 'number' ? m.post_mini_score : -1
                      const hasChallenge = m.challenge_taken || m.is_passed_by_challenge || challengeScore > 0
                      const hasPostMini = postMiniScore > 0 || (typeof m.post_mini_score === 'number' && m.post_mini_score >= 0 && !hasChallenge)
                      const isPassed = m.status === 'COMPLETED' || m.is_passed_by_challenge || (challengeScore >= 70) || (postMiniScore >= 70)

                      return (
                        <div
                          key={m.module_id || idx}
                          className="p-3 bg-white dark:bg-slate-900 flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 font-bold flex items-center justify-center text-[10px] text-slate-600 dark:text-slate-300">
                              {modOrder}
                            </span>
                            <div className="flex flex-col">
                              <span className="font-semibold text-slate-800 dark:text-slate-200">
                                {m.title || `Chương ${modOrder}`}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 flex-wrap justify-end">
                              {hasChallenge ? (
                                <span className="text-slate-500">
                                  Thử thách: <strong className="text-emerald-600">{challengeScore >= 0 ? `${challengeScore}đ` : '-'}</strong>
                                </span>
                              ) : null}
                              {hasPostMini ? (
                                <span className="text-slate-500">
                                  Post-mini: <strong className="text-indigo-600">{postMiniScore >= 0 ? `${postMiniScore}đ` : '-'}</strong>
                                </span>
                              ) : null}
                              {!hasChallenge && !hasPostMini ? (
                                <span className="text-slate-400 italic">Chưa làm test</span>
                              ) : null}
                            </div>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                isPassed
                                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800'
                                  : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                              }`}
                            >
                              {isPassed ? 'Đã hoàn thành' : (m.status === 'LOCKED' ? 'Đang khóa' : 'Đang học')}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic py-4 text-center">
                    Học viên chưa thực hiện bài kiểm tra chương nào.
                  </p>
                )}

                {/* Student's Speaking & Writing Submissions */}
                {(() => {
                  const studentSubs = submissions.filter((s) => s.user_id === selectedStudentDetail.user_id)
                  if (studentSubs.length === 0) return null
                  return (
                    <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <FileCheck2 className="w-4 h-4 text-indigo-500" />
                          <span>Bài nộp kỹ năng Nói & Viết ({studentSubs.length}):</span>
                        </h4>
                      </div>

                      <div className="space-y-2.5">
                        {studentSubs.map((sub) => {
                          const isReviewed = sub.is_teacher_reviewed || sub.status === 'TEACHER_REVIEWED'
                          return (
                            <div
                              key={sub._id}
                              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/70 space-y-2"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                      sub.skill === 'SPEAKING'
                                        ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                    }`}
                                  >
                                    {sub.skill === 'SPEAKING' ? '🎙️ Speaking' : '✍️ Writing'}
                                  </span>
                                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                                    Điểm AI: <span className="text-purple-600 dark:text-purple-400">{sub.ai_score}đ</span>
                                    {sub.teacher_score !== undefined && (
                                      <span className="text-emerald-600 dark:text-emerald-400 ml-1">
                                        • GV: {sub.teacher_score}đ
                                      </span>
                                    )}
                                  </span>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleOpenReview(sub)}
                                  className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] transition-colors cursor-pointer flex items-center gap-1"
                                >
                                  <Edit3 className="w-3 h-3" />
                                  <span>{isReviewed ? 'Sửa điểm' : 'Chấm điểm'}</span>
                                </button>
                              </div>

                              {sub.skill === 'SPEAKING' && sub.audio_url && (
                                <audio
                                  controls
                                  className="w-full h-7"
                                  src={resolveMediaUrl(sub.audio_url)}
                                  preload="metadata"
                                />
                              )}

                              {sub.skill === 'SPEAKING' && sub.whisper_transcript && (
                                <p className="text-[11px] text-slate-600 dark:text-slate-400 italic">
                                  Whisper: &ldquo;{sub.whisper_transcript}&rdquo;
                                </p>
                              )}

                              {sub.skill === 'WRITING' && sub.essay_text && (
                                <p className="text-[11px] text-slate-700 dark:text-slate-300 line-clamp-2">
                                  {sub.essay_text}
                                </p>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })()}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedStudentDetail(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * @file course.learners.page.tsx
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
  Clock,
  Zap,
  ShieldCheck,
  UserCheck,
  BarChart3,
  TrendingUp,
} from 'lucide-react'
import { DataTable, type DataTableColumn } from '@/components/common/data.table'
import { CourseAnalyticsTab } from '@/components/learners/course.analytics.tab'
import { LearnerSubmissionsTab } from '@/components/learners/learner.submissions.tab'
import { LearnerSubmissionReviewModal } from '@/components/learners/learner.submission.review.modal'
import { StudentProgressDetailModal } from '@/components/learners/student.progress.detail.modal'
import { courseService } from '@/services/course.service'
import {
  progressService,
  type StudentProgressItem,
  type SkillSubmissionItem,
} from '@/services/progress.service'
import { userService } from '@/services/user.service'
import { useAuthStore } from '@/store/auth-store'
import { toast } from '@/store/toast-store'
import type { Course as ApiCourse, UserProfile } from '@/types/api.types'

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

  const [activeTab, setActiveTab] = useState<'PROGRESS' | 'SUBMISSIONS' | 'ANALYTICS'>('PROGRESS')
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
  const [selectedReviewSub, setSelectedReviewSub] = useState<SkillSubmissionItem | null>(null)

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
      if (activeTab === 'PROGRESS' || activeTab === 'ANALYTICS') {
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

  const handleResetProgressFilters = () => {
    setProgressSearch('')
    setSelectedCourseId('ALL')
    setProgressStatusFilter('ALL')
    setProgressSortKey(null)
    setProgressSortOrder(null)
    setProgressCurrentPage(1)
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

        <button
          type="button"
          onClick={() => setActiveTab('ANALYTICS')}
          className={`flex items-center gap-2.5 px-5 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'ANALYTICS'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <TrendingUp className="w-4.5 h-4.5" />
          <span>{isVi ? 'Báo Cáo Phân Tích & Điểm Rơi' : 'Learning Analytics & Retention'}</span>
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

      {/* Tab 2: Submissions DataTable & Grid */}
      {activeTab === 'SUBMISSIONS' && (
        <LearnerSubmissionsTab
          submissions={submissions}
          isLoading={isLoadingSubmissions}
          courses={courses}
          selectedCourseId={selectedCourseId}
          onSelectCourseId={setSelectedCourseId}
          onRefresh={fetchSubmissions}
          onOpenReview={(sub) => setSelectedReviewSub(sub)}
          pendingReviewsCount={stats.pendingReviews}
          isVi={isVi}
          isTeacher={isTeacher}
        />
      )}

      {/* Tab 3: Learning Analytics & Drop-off Report */}
      {activeTab === 'ANALYTICS' && (
        <CourseAnalyticsTab
          allStudentsProgress={allStudentsProgress}
          courses={courses}
          selectedCourseId={selectedCourseId}
          onSelectCourseId={setSelectedCourseId}
          isVi={isVi}
          isTeacher={isTeacher}
        />
      )}

      {/* Modal Review Submission */}
      <LearnerSubmissionReviewModal
        submission={selectedReviewSub}
        onClose={() => setSelectedReviewSub(null)}
        onSuccess={fetchSubmissions}
      />

      {/* Modal Student Details */}
      <StudentProgressDetailModal
        student={selectedStudentDetail}
        submissions={submissions}
        onOpenReview={(sub) => setSelectedReviewSub(sub)}
        onClose={() => setSelectedStudentDetail(null)}
      />
    </div>
  )
}

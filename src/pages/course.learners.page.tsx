/**
 * @file course.learners.page.tsx
 * @description Course learners management page featuring progress table, submissions review, and analytics
 */

import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  GraduationCap,
  FileCheck2,
  TrendingUp,
  BookOpen,
  BarChart3,
  Zap,
} from 'lucide-react'
import type { DataTableColumn } from '@/components/common/data.table'
import { CourseAnalyticsTab } from '@/components/learners/course.analytics.tab'
import { LearnerSubmissionsTab } from '@/components/learners/learner.submissions.tab'
import { LearnerSubmissionReviewModal } from '@/components/learners/learner.submission.review.modal'
import { StudentProgressDetailModal } from '@/components/learners/student.progress.detail.modal'
import { CourseLearnersStatsBar } from '@/components/learners/course.learners.stats.bar'
import { CourseProgressTableTab } from '@/components/learners/course.progress.table.tab'
import {
  useCourseLearnersData,
} from '@/components/learners/use.course.learners.data'
import type { StudentProgressItem, SkillSubmissionItem } from '@/services/progress.service'

export function CourseLearnersPage() {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'

  const {
    isTeacher,
    courses,
    selectedCourseId,
    setSelectedCourseId,
    allStudentsProgress,
    usersMap,
    isLoadingProgress,
    submissions,
    isLoadingSubmissions,
    fetchProgress,
    fetchSubmissions,
    stats,
  } = useCourseLearnersData()

  const [activeTab, setActiveTab] = useState<'PROGRESS' | 'SUBMISSIONS' | 'ANALYTICS'>('PROGRESS')
  const [progressSearch, setProgressSearch] = useState<string>('')
  const [progressStatusFilter, setProgressStatusFilter] = useState<'ALL' | 'COMPLETED' | 'IN_PROGRESS' | 'STARTED'>('ALL')
  const [progressCurrentPage, setProgressCurrentPage] = useState<number>(1)
  const [progressPageSize, setProgressPageSize] = useState<number>(10)
  const [progressSortKey, setProgressSortKey] = useState<string | null>(null)
  const [progressSortOrder, setProgressSortOrder] = useState<'asc' | 'desc' | null>(null)
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<StudentProgressItem | null>(null)
  const [selectedReviewSub, setSelectedReviewSub] = useState<SkillSubmissionItem | null>(null)

  useEffect(() => {
    if (courses.length > 0) {
      if (activeTab === 'PROGRESS' || activeTab === 'ANALYTICS') {
        fetchProgress()
      } else {
        fetchSubmissions()
      }
    }
  }, [courses, selectedCourseId, activeTab, fetchProgress, fetchSubmissions])

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

  const handleResetProgressFilters = () => {
    setProgressSearch('')
    setSelectedCourseId('ALL')
    setProgressStatusFilter('ALL')
    setProgressSortKey(null)
    setProgressSortOrder(null)
    setProgressCurrentPage(1)
  }

  const handleSort = (key: string, order: 'asc' | 'desc' | null) => {
    setProgressSortKey(order ? key : null)
    setProgressSortOrder(order)
  }

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
      <CourseLearnersStatsBar
        isVi={isVi}
        totalStudents={stats.totalStudents}
        avgProgress={stats.avgProgress}
        totalSubmissions={stats.totalSubmissions}
        pendingReviews={stats.pendingReviews}
      />

      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-1">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('PROGRESS')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'PROGRESS'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>{isVi ? 'Bảng Điểm & Tiến Độ Học Tập' : 'Learner Progress Table'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('SUBMISSIONS')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer relative ${
              activeTab === 'SUBMISSIONS'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            <span>{isVi ? 'Chấm Điểm & Phúc Khảo Bài Nộp' : 'Speaking & Writing Submissions'}</span>
            {stats.pendingReviews > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-400 absolute top-1.5 right-1.5 animate-pulse" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ANALYTICS')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'ANALYTICS'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>{isVi ? 'Phân Tích Tăng Trưởng & Insights' : 'Course Analytics & Insights'}</span>
          </button>
        </div>
      </div>

      {activeTab === 'PROGRESS' && (
        <CourseProgressTableTab
          isVi={isVi}
          courses={courses}
          selectedCourseId={selectedCourseId}
          onSelectCourseId={setSelectedCourseId}
          progressSearch={progressSearch}
          onProgressSearchChange={setProgressSearch}
          progressStatusFilter={progressStatusFilter}
          onProgressStatusFilterChange={setProgressStatusFilter}
          onResetFilters={handleResetProgressFilters}
          onRefresh={fetchProgress}
          isLoadingProgress={isLoadingProgress}
          filteredStudents={filteredStudents}
          paginatedStudents={paginatedStudents}
          progressColumns={progressColumns}
          progressCurrentPage={progressCurrentPage}
          progressPageSize={progressPageSize}
          onPageChange={setProgressCurrentPage}
          onPageSizeChange={setProgressPageSize}
          progressSortKey={progressSortKey}
          progressSortOrder={progressSortOrder}
          onSort={handleSort}
        />
      )}

      {activeTab === 'SUBMISSIONS' && (
        <LearnerSubmissionsTab
          submissions={submissions}
          isLoading={isLoadingSubmissions}
          courses={courses}
          selectedCourseId={selectedCourseId}
          onSelectCourseId={setSelectedCourseId}
          onRefresh={fetchSubmissions}
          onOpenReview={(sub: SkillSubmissionItem) => setSelectedReviewSub(sub)}
          pendingReviewsCount={stats.pendingReviews}
          isVi={isVi}
          isTeacher={isTeacher}
        />
      )}

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

      {selectedReviewSub && (
        <LearnerSubmissionReviewModal
          submission={selectedReviewSub}
          onClose={() => setSelectedReviewSub(null)}
          onSuccess={fetchSubmissions}
        />
      )}

      {selectedStudentDetail && (
        <StudentProgressDetailModal
          student={selectedStudentDetail}
          submissions={submissions}
          onOpenReview={(sub) => setSelectedReviewSub(sub)}
          onClose={() => setSelectedStudentDetail(null)}
        />
      )}
    </div>
  )
}

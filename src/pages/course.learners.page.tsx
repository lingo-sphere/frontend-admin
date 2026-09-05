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
} from 'lucide-react'
import { CourseAnalyticsTab } from '@/components/learners/course.analytics.tab'
import { LearnerSubmissionsTab } from '@/components/learners/learner.submissions.tab'
import { LearnerSubmissionReviewModal } from '@/components/learners/learner.submission.review.modal'
import { StudentProgressDetailModal } from '@/components/learners/student.progress.detail.modal'
import { CourseLearnersStatsBar } from '@/components/learners/course.learners.stats.bar'
import { CourseProgressTableTab } from '@/components/learners/course.progress.table.tab'
import { createCourseProgressColumns } from '@/components/learners/course.progress.columns'
import {
  useCourseLearnersData,
} from '@/hooks/use.course.learners.data'
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
        const name = (u?.full_name || st.full_name || '').toLowerCase()
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
        const nameA = (uA?.full_name || a.full_name || '').toLowerCase()
        const nameB = (uB?.full_name || b.full_name || '').toLowerCase()
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

  const progressColumns = useMemo(
    () =>
      createCourseProgressColumns({
        isVi,
        usersMap,
        onSelectStudentDetail: setSelectedStudentDetail,
      }),
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

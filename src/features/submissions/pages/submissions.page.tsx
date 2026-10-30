// Trang quản lý chấm điểm và phúc khảo bài kiểm tra khóa học.
import { FileCheck2, FileText, Clock, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { Tabs } from 'antd'
import { StatCard } from '@/components/stat.card'
import { CourseTestSessionsTab } from '@/features/submissions/components/course.test.sessions.tab'
import { useCourseLearnersData } from '@/features/courses/hooks/use.course.learners.data'
import { LearnerSubmissionsTab } from '@/features/submissions/components/learner.submissions.tab'
import { LearnerSubmissionReviewModal } from '@/features/submissions/components/learner.submission.review.modal'
import type { SkillSubmissionItem } from '@/features/progress/services/progress.service'

export function SubmissionsPage() {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'
  const [searchParams, setSearchParams] = useSearchParams()
  const queryClient = useQueryClient()
  const [selectedSubmission, setSelectedSubmission] = useState<SkillSubmissionItem | null>(null)
  const [activeTab, setActiveTab] = useState('tests')
  const {
    isTeacher,
    courses,
    selectedCourseId,
    submissions,
    isLoadingCourses,
    isLoadingSubmissions,
    coursesError,
    submissionsError,
    fetchSubmissions,
    stats,
  } = useCourseLearnersData({
    loadProgress: false,
    loadSubmissions: activeTab === 'skills',
    courseId: searchParams.get('courseId') || 'ALL',
  })

  const selectCourse = (courseId: string) => {
    setSelectedSubmission(null)
    setSearchParams((previous) => {
      const next = new URLSearchParams(previous)
      if (courseId === 'ALL') next.delete('courseId')
      else next.set('courseId', courseId)
      return next
    })
  }

  const refreshAfterReview = () => {
    void queryClient.invalidateQueries({ queryKey: ['course-learners'] })
    void queryClient.invalidateQueries({ queryKey: ['learner-progress-detail'] })
    void queryClient.invalidateQueries({ queryKey: ['course-submissions'] })
    void queryClient.invalidateQueries({ queryKey: ['course-test-sessions'] })
    void queryClient.invalidateQueries({ queryKey: ['course-test-session-detail'] })
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
          <FileCheck2 className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            {isVi ? 'Chấm điểm & Phúc khảo — Bài kiểm tra khóa học' : 'Submission Grading & Review'}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {isVi
              ? 'Xem các lượt kiểm tra khóa học, bài làm và kết quả; duyệt điểm Speaking, Writing của học viên.'
              : 'Inspect course test attempts, answers and results, and review Speaking and Writing grades.'}
          </p>
        </div>
      </div>


      <Tabs activeKey={activeTab} onChange={setActiveTab} items={[
        { key: 'tests', label: isVi ? 'Bài kiểm tra khóa học' : 'Course tests' },
        { key: 'skills', label: isVi ? 'Phúc khảo Speaking & Writing' : 'Speaking & Writing review' },
      ]} />

      {activeTab === 'tests' && <CourseTestSessionsTab
        key={selectedCourseId} courses={courses} selectedCourseId={selectedCourseId}
        onSelectCourseId={selectCourse} isLoadingCourses={isLoadingCourses} coursesError={coursesError}
      />}

      {activeTab === 'skills' && <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title={isVi ? 'Tổng Bài Nộp' : 'Total Submissions'}
          value={stats.totalSubmissions.toLocaleString(isVi ? 'vi-VN' : 'en-US')}
          subtitle={isVi ? 'Bài nộp Speaking & Writing trong khóa học' : 'Course Speaking & Writing submissions'}
          icon={FileText}
          color="indigo"
          trend={stats.totalSubmissions > 0 ? `${stats.totalSubmissions}` : undefined}
          trendType="neutral"
          loading={isLoadingSubmissions}
        />
        <StatCard
          title={isVi ? 'Bài Chờ Duyệt' : 'Pending Reviews'}
          value={stats.pendingReviews.toLocaleString(isVi ? 'vi-VN' : 'en-US')}
          subtitle={isVi ? 'Cần giáo viên kiểm tra và chấm điểm' : 'Requires teacher grading and review'}
          icon={Clock}
          color="amber"
          trend={stats.pendingReviews > 0 ? `${stats.pendingReviews}` : undefined}
          trendType={stats.pendingReviews > 0 ? 'down' : 'neutral'}
          loading={isLoadingSubmissions}
        />
        <StatCard
          title={isVi ? 'Đã Chấm Điểm' : 'Reviewed'}
          value={(stats.totalSubmissions - stats.pendingReviews).toLocaleString(isVi ? 'vi-VN' : 'en-US')}
          subtitle={isVi ? 'Bài làm đã hoàn tất đánh giá' : 'Completed evaluations'}
          icon={CheckCircle2}
          color="emerald"
          trend={stats.totalSubmissions > 0 ? `${Math.round(((stats.totalSubmissions - stats.pendingReviews) / stats.totalSubmissions) * 100)}%` : undefined}
          trendType="up"
          loading={isLoadingSubmissions}
        />
      </div>

      {(coursesError || submissionsError) && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
          {isVi ? 'Không tải được dữ liệu bài nộp. Vui lòng làm mới để thử lại.' : 'Unable to load submissions. Refresh to try again.'}
        </div>
      )}

      <LearnerSubmissionsTab
        key={selectedCourseId}
        submissions={submissions}
        isLoading={isLoadingCourses || isLoadingSubmissions}
        courses={courses}
        selectedCourseId={selectedCourseId}
        onSelectCourseId={selectCourse}
        onRefresh={fetchSubmissions}
        onOpenReview={setSelectedSubmission}
        pendingReviewsCount={stats.pendingReviews}
        isVi={isVi}
        isTeacher={isTeacher}
      />
      </>}

      {selectedSubmission && (
        <LearnerSubmissionReviewModal
          submission={selectedSubmission}
          onClose={() => setSelectedSubmission(null)}
          onSuccess={refreshAfterReview}
        />
      )}
    </div>
  )
}

import { Link } from 'react-router-dom'
import { FileCheck2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
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
    loadSubmissions: true,
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
              ? 'Xem bài làm, đối chiếu kết quả AI và duyệt điểm Speaking, Writing của học viên.'
              : 'Inspect learner submissions, compare AI feedback and review Speaking and Writing grades.'}
          </p>
        </div>
      </div>

      <nav className="flex flex-wrap gap-3 text-sm">
        <Link to="/submissions/practice/speaking">Luyện tập Speaking</Link>
        <Link to="/submissions/practice/writing">Luyện tập Writing</Link>
        <Link className="font-bold text-indigo-600" to="/submissions/courses">Bài kiểm tra khóa học</Link>
      </nav>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs text-slate-500">{isVi ? 'Tổng bài nộp' : 'Submissions'}</p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{stats.totalSubmissions}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs text-slate-500">{isVi ? 'Bài chưa duyệt' : 'Not yet reviewed'}</p>
          <p className="mt-1 text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.pendingReviews}</p>
        </div>
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

// Trang quản trị hiển thị chi tiết tiến độ học tập, bài thi từng chương và bài nộp kỹ năng của học viên.

import { useNavigate } from 'react-router-dom'
import { CourseSubmissionReviewDialog } from '@/features/courses/components/course.submission.review.dialog'
import { useLearnerProgressDetail } from '@/features/users/hooks/use.learner.progress.detail'
import { LearnerProgressHeader } from '@/features/users/components/learner.progress.header'
import { LearnerModulesProgressList } from '@/features/users/components/learner.modules.progress.list'
import { LearnerSubmissionsList } from '@/features/users/components/learner.submissions.list'

interface LearnerProgressDetailPageProps {
  courseId: string
  userId: string
}

export function LearnerProgressDetailPage({ courseId, userId }: LearnerProgressDetailPageProps) {
  const navigate = useNavigate()

  const {
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
  } = useLearnerProgressDetail({ courseId, userId })

  const displayName = userProfile?.full_name || student?.full_name || userProfile?.email || student?.email || '-'
  const displayEmail = userProfile?.email || student?.email || '-'
  const avatarUrl = userProfile?.avatar_url || student?.avatar_url
  const courseTitle = courseInfo?.title || student?.course_title || '-'

  const progressPct = Math.min(100, Math.max(0, student?.progress_percentage || 0))
  const completedLessons = student?.completed_lessons || 0
  const totalLessons = student?.total_lessons || 1
  const baselineScore = student?.baseline_score
  const finalTestScore = student?.final_test_score
  const growth = student?.total_score_growth ?? ((finalTestScore || 0) - (baselineScore || 0))
  const modules = student?.modules_progress || []

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <LearnerProgressHeader
        displayName={displayName}
        displayEmail={displayEmail}
        avatarUrl={avatarUrl}
        courseTitle={courseTitle}
        progressPct={progressPct}
        completedLessons={completedLessons}
        totalLessons={totalLessons}
        baselineScore={baselineScore}
        finalTestScore={finalTestScore}
        growth={growth}
        isLoading={isLoading}
        onBack={() => navigate('/course-learners')}
        onRefresh={loadData}
      />

      <LearnerModulesProgressList modules={modules} />

      <LearnerSubmissionsList
        submissions={submissions}
        onOpenReview={handleOpenReview}
      />

      {selectedSubmission && (
        <CourseSubmissionReviewDialog
          submission={selectedSubmission}
          editScore={editScore}
          editFeedback={editFeedback}
          isSubmitting={isSubmittingReview}
          onScoreChange={setEditScore}
          onFeedbackChange={setEditFeedback}
          onClose={() => setSelectedSubmission(null)}
          onSaveReview={handleSaveReview}
        />
      )}
    </div>
  )
}

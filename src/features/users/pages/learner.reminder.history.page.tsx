// Trang quản trị hiển thị chi tiết cấu hình lịch học và dòng thời gian email nhắc nhở, cảnh báo của học viên.

import { useNavigate } from 'react-router-dom'
import { useLearnerReminderHistory } from '@/features/users/hooks/use.learner.reminder.history'
import { LearnerReminderHeader } from '@/features/users/components/learner.reminder.header'
import { LearnerReminderStatusCards } from '@/features/users/components/learner.reminder.status.cards'
import { LearnerReminderTimeline } from '@/features/users/components/learner.reminder.timeline'

interface LearnerReminderHistoryPageProps {
  courseId: string
  userId: string
}

export function LearnerReminderHistoryPage({ courseId, userId }: LearnerReminderHistoryPageProps) {
  const navigate = useNavigate()

  const {
    student,
    userProfile,
    courseInfo,
    reminders,
    filteredReminders,
    filterCategory,
    setFilterCategory,
    isLoading,
    isUnlocking,
    loadData,
    handleManualUnlock,
  } = useLearnerReminderHistory({ courseId, userId })

  const displayName = userProfile?.full_name || student?.full_name || userProfile?.email || student?.email || '-'
  const displayEmail = userProfile?.email || student?.email || '-'
  const avatarUrl = userProfile?.avatar_url || student?.avatar_url
  const courseTitle = courseInfo?.title || student?.course_title || '-'

  const schedule = student?.schedule
  const lockState = student?.lock_state
  const isLocked = lockState?.is_locked || false
  const lockedChapterOrder = lockState?.locked_chapter_order
  const consecutiveMissedSessions = schedule?.consecutive_missed_sessions || 0
  const lastVideoWatchedAt = student?.last_video_watched_at

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <LearnerReminderHeader
        displayName={displayName}
        displayEmail={displayEmail}
        avatarUrl={avatarUrl}
        courseTitle={courseTitle}
        isLocked={isLocked}
        lockedChapterOrder={lockedChapterOrder}
        consecutiveMissedSessions={consecutiveMissedSessions}
        isLoading={isLoading}
        isUnlocking={isUnlocking}
        onBack={() => navigate('/course-learners')}
        onRefresh={loadData}
        onManualUnlock={handleManualUnlock}
      />

      <LearnerReminderStatusCards
        schedule={schedule}
        lockState={lockState}
        lastVideoWatchedAt={lastVideoWatchedAt}
        totalEmailsSent={reminders.length}
      />

      <LearnerReminderTimeline
        reminders={filteredReminders}
        filterCategory={filterCategory}
        onSelectFilterCategory={setFilterCategory}
      />
    </div>
  )
}

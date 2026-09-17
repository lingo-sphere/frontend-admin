// Điều hướng trang và kiểm soát quyền truy cập các tính năng Quản trị Admin.

import { useLocation } from 'react-router-dom'
import { pathToNavItem } from '@/routes/navigation'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { DashboardPage } from '@/features/dashboard/pages/dashboard.page'
import { LearnersPage } from '@/features/users/pages/learners.page'
import { AdminUsersPage } from '@/features/users/pages/admin.users.page'
import { CoursesPage } from '@/features/courses/pages/courses.page'
import { CourseLearnersPage } from '@/features/courses/pages/course.learners.page'
import { CourseExamsPage } from '@/features/courses/pages/course.exams.page'
import { CourseExamQuestionsPage } from '@/features/courses/pages/course.exam.questions.page'
import { VocabularyPage } from '@/features/vocabulary/pages/vocabulary.page'
import { PracticeExercisesPage } from '@/features/practice/pages/practice.exercises.page'
import { PracticeListeningPage } from '@/features/practice/pages/practice.listening.page'
import { PracticeSpeakingPage } from '@/features/practice/pages/practice.speaking.page'
import { PracticeWritingPage } from '@/features/practice/pages/practice.writing.page'
import { CommunityPage } from '@/features/community/pages/community.page'
import { PublicDecksPage } from '@/features/vocabulary/pages/public.decks.page'
import { ProgressPage } from '@/features/progress/pages/progress.page'
import { PostHogAnalyticsPage } from '@/features/progress/pages/posthog.analytics.page'
import { BetterStackMonitoringPage } from '@/features/progress/pages/better.stack.monitoring.page'
import { NotificationsPage } from '@/features/notifications/pages/notifications.page'
import { SettingsPlansPage } from '@/features/settings/pages/settings.plans.page'
import { SettingsAiPage } from '@/features/settings/pages/settings.ai.page'
import { SettingsSystemPage } from '@/features/settings/pages/settings.system.page'
import { UserProfilePage } from '@/features/users/pages/learner.profile.page'
import { CourseFormPage } from '@/features/courses/pages/course.form.page'
import { CourseScoresPage } from '@/features/courses/pages/course.scores.page'
import { CourseSubmissionsPage } from '@/features/courses/pages/course.submissions.page'
import { LearnerProgressDetailPage } from '@/features/users/pages/learner.progress.detail.page'
import { LearnerReminderHistoryPage } from '@/features/users/pages/learner.reminder.history.page'
import { AdminUserFormPage } from '@/features/users/pages/admin.user.form.page'
import { VocabularyImportPage } from '@/features/vocabulary/pages/vocabulary.import.page'
import { VocabularyFormPage } from '@/features/vocabulary/pages/vocabulary.form.page'
import { AdminProfilePage } from '@/features/auth/pages/admin.profile.page'
import { RolesPage } from '@/features/rbac/pages/roles.page'
import { PermissionsPage } from '@/features/rbac/pages/permissions.page'
import { ExamsPage } from '@/features/exams/pages/exams.page'
import { PlacementTestsPage } from '@/features/exams/pages/placement.tests.page'
import { MediaStoragePage } from '@/features/media/pages/media.storage.page'
import { ForbiddenPage, NotFoundPage } from '@/features/system/pages/status.result.page'

const pageMap: Record<string, React.ComponentType> = {
  dashboard: DashboardPage,
  'users-list': LearnersPage,
  users: LearnersPage,
  admins: AdminUsersPage,
  roles: RolesPage,
  permissions: PermissionsPage,
  'admin-user-create': AdminUserFormPage,
  courses: CoursesPage,
  'courses-list': CoursesPage,
  'course-learners': CourseLearnersPage,
  'course-exams': CourseExamsPage,
  'course-create': CourseFormPage,
  vocabulary: VocabularyPage,
  'vocab-create': VocabularyFormPage,
  'vocabulary-import': VocabularyImportPage,
  practice: PracticeExercisesPage,
  'practice-exercises': PracticeExercisesPage,
  'practice-listening': PracticeListeningPage,
  'practice-speaking': PracticeSpeakingPage,
  'practice-writing': PracticeWritingPage,
  'toeic-tests': ExamsPage,
  'placement-tests': PlacementTestsPage,
  exams: ExamsPage,
  'media-storage': MediaStoragePage,
  media: MediaStoragePage,
  'ai-management': SettingsAiPage,
  'ai-teacher': SettingsAiPage,
  community: CommunityPage,
  'public-decks': PublicDecksPage,
  progress: ProgressPage,
  'analytics-posthog': PostHogAnalyticsPage,
  posthog: PostHogAnalyticsPage,
  'monitoring-betterstack': BetterStackMonitoringPage,
  betterstack: BetterStackMonitoringPage,
  notifications: NotificationsPage,
  settings: SettingsPlansPage,
  'settings-plans': SettingsPlansPage,
  'settings-ai': SettingsAiPage,
  'settings-system': SettingsSystemPage,
  'admin-profile': AdminProfilePage,
  'not-found': NotFoundPage,
  'forbidden': ForbiddenPage,
  '403': ForbiddenPage,
  '404': NotFoundPage,
}

export function PageRouter() {
  const { pathname } = useLocation()
  const activeNavItem = pathToNavItem(pathname)
  const user = useAuthStore((state) => state.user)
  const profile = useAuthStore((state) => state.profile)
  const hasPermission = useAuthStore((state) => state.hasPermission)
  const hasModulePermission = useAuthStore((state) => state.hasModulePermission)

  const currentRole = (user?.role || profile?.role || '').toUpperCase()
  const isAdmin = currentRole === 'ADMIN'

  if (activeNavItem === 'not-found' || activeNavItem === '404') {
    return <NotFoundPage />
  }

  if (activeNavItem === 'forbidden' || activeNavItem === '403') {
    return <ForbiddenPage />
  }

  if (!isAdmin) {
    if (
      activeNavItem === 'courses' ||
      activeNavItem === 'courses-list' ||
      activeNavItem === 'course-learners' ||
      activeNavItem === 'course-exams' ||
      activeNavItem === 'course-exam-create' ||
      activeNavItem.startsWith('course-exam-questions:') ||
      activeNavItem.startsWith('course-scores:') ||
      activeNavItem.startsWith('course-submissions:') ||
      activeNavItem.startsWith('learner-progress:') ||
      activeNavItem.startsWith('learner-reminders:') ||
      activeNavItem.startsWith('course-edit:') ||
      activeNavItem.startsWith('course-form:')
    ) {
      if (!hasPermission('GET', '/courses') && !hasModulePermission('COURSES')) {
        return <ForbiddenPage />
      }
    }

    if (activeNavItem === 'vocabulary' || activeNavItem.startsWith('vocab-edit:') || activeNavItem.startsWith('vocabulary-form:') || activeNavItem === 'public-decks') {
      if (!hasModulePermission('VOCABULARY')) {
        return <ForbiddenPage />
      }
    }

    if (
      activeNavItem === 'toeic-tests' ||
      activeNavItem === 'placement-tests' ||
      activeNavItem === 'placement-test-create'
    ) {
      if (!hasPermission('GET', '/exams') && !hasModulePermission('EXAMS') && !hasModulePermission('PRACTICE')) {
        return <ForbiddenPage />
      }
    }

    if (activeNavItem === 'roles') {
      if (!hasPermission('GET', '/roles') && !hasModulePermission('ROLES')) {
        return <ForbiddenPage />
      }
    }

    if (activeNavItem === 'permissions') {
      if (!hasPermission('GET', '/permissions') && !hasModulePermission('PERMISSIONS')) {
        return <ForbiddenPage />
      }
    }

    if (activeNavItem === 'admins' || activeNavItem === 'settings' || activeNavItem.startsWith('admin-user-')) {
      return <ForbiddenPage />
    }
  }

  if (activeNavItem.startsWith('admin-user-form:') || activeNavItem.startsWith('admin-user-edit:')) {
    const userId = activeNavItem.split(':')[1]
    return <AdminUserFormPage editUserId={userId} />
  }

  if (activeNavItem.startsWith('user-profile:')) {
    return <UserProfilePage />
  }

  if (activeNavItem.startsWith('admin-profile:')) {
    return <AdminProfilePage />
  }

  if (activeNavItem.startsWith('vocab-edit:') || activeNavItem.startsWith('vocabulary-form:')) {
    const wordId = activeNavItem.split(':')[1]
    return <VocabularyFormPage editWordId={wordId} />
  }

  if (activeNavItem.startsWith('course-edit:') || activeNavItem.startsWith('course-form:')) {
    const courseId = activeNavItem.split(':')[1]
    return <CourseFormPage editCourseId={courseId} />
  }

  if (activeNavItem.startsWith('course-scores:')) {
    const courseId = activeNavItem.split(':')[1]
    return <CourseScoresPage courseId={courseId} />
  }

  if (activeNavItem.startsWith('course-submissions:')) {
    const courseId = activeNavItem.split(':')[1]
    return <CourseSubmissionsPage courseId={courseId} />
  }

  if (activeNavItem === 'course-exam-create' || activeNavItem === 'placement-test-create') {
    return <CourseExamQuestionsPage examId="new" />
  }

  if (activeNavItem.startsWith('course-exam-questions:')) {
    const examId = activeNavItem.split(':')[1]
    return <CourseExamQuestionsPage examId={examId} />
  }

  if (activeNavItem.startsWith('learner-progress:')) {
    const parts = activeNavItem.split(':')
    const courseId = parts[1]
    const userId = parts[2]
    return <LearnerProgressDetailPage courseId={courseId} userId={userId} />
  }

  if (activeNavItem.startsWith('learner-reminders:')) {
    const parts = activeNavItem.split(':')
    const courseId = parts[1]
    const userId = parts[2]
    return <LearnerReminderHistoryPage courseId={courseId} userId={userId} />
  }

  const PageComponent = pageMap[activeNavItem] || NotFoundPage

  return <PageComponent />
}

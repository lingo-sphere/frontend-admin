/**
 * @file page.router.tsx
 * @description Component giao diện PageRouter phục vụ khu vực Quản trị Admin
 */

import { useAdminStore } from '@/store/admin.store'
import { useAuthStore } from '@/store/auth.store'
import { DashboardPage } from '@/pages/dashboard.page'
import { LearnersPage } from '@/pages/learners.page'
import { AdminUsersPage } from '@/pages/admin.users.page'
import { CoursesPage } from '@/pages/courses.page'
import { CourseLearnersPage } from '@/pages/course.learners.page'
import { CourseExamsPage } from '@/pages/course.exams.page'
import { CourseExamQuestionsPage } from '@/pages/course.exam.questions.page'
import { VocabularyPage } from '@/pages/vocabulary.page'
import { PracticeExercisesPage } from '@/pages/practice.exercises.page'
import { PracticeListeningPage } from '@/pages/practice.listening.page'
import { PracticeSpeakingPage } from '@/pages/practice.speaking.page'
import { PracticeWritingPage } from '@/pages/practice.writing.page'
import { CommunityPage } from '@/pages/community.page'
import { PublicDecksPage } from '@/pages/public.decks.page'
import { ProgressPage } from '@/pages/progress.page'
import { PostHogAnalyticsPage } from '@/pages/posthog.analytics.page'
import { BetterStackMonitoringPage } from '@/pages/better.stack.monitoring.page'
import { NotificationsPage } from '@/pages/notifications.page'
import { SettingsPlansPage } from '@/pages/settings.plans.page'
import { SettingsAiPage } from '@/pages/settings.ai.page'
import { SettingsSystemPage } from '@/pages/settings.system.page'
import { UserProfilePage } from '@/pages/user.profile.page'
import { CourseFormPage } from '@/pages/course.form.page'
import { CourseScoresPage } from '@/pages/course.scores.page'
import { CourseSubmissionsPage } from '@/pages/course.submissions.page'
import { LearnerProgressDetailPage } from '@/pages/learner.progress.detail.page'
import { AdminUserFormPage } from '@/pages/admin.user.form.page'
import { VocabularyImportPage } from '@/pages/vocabulary.import.page'
import { VocabularyFormPage } from '@/pages/vocabulary.form.page'
import { AdminProfilePage } from '@/pages/admin.profile.page'
import { RolesPage } from '@/pages/roles.page'
import { PermissionsPage } from '@/pages/permissions.page'
import { ExamsPage } from '@/pages/exams.page'
import { MediaStoragePage } from '@/pages/media.storage.page'
import { RoadmapsPage } from '@/pages/roadmaps.page'

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
  roadmaps: RoadmapsPage,
  'roadmaps-list': RoadmapsPage,
  vocabulary: VocabularyPage,
  'vocab-create': VocabularyFormPage,
  'vocabulary-import': VocabularyImportPage,
  practice: PracticeExercisesPage,
  'practice-exercises': PracticeExercisesPage,
  'practice-listening': PracticeListeningPage,
  'practice-speaking': PracticeSpeakingPage,
  'practice-writing': PracticeWritingPage,
  'toeic-tests': ExamsPage,
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
}

export function PageRouter() {
  const activeNavItem = useAdminStore((state) => state.activeNavItem)
  const user = useAuthStore((state) => state.user)
  const profile = useAuthStore((state) => state.profile)
  const hasPermission = useAuthStore((state) => state.hasPermission)
  const hasModulePermission = useAuthStore((state) => state.hasModulePermission)

  const currentRole = (user?.role || profile?.role || '').toUpperCase()
  const isAdmin = currentRole === 'ADMIN'

  if (!isAdmin) {
    if (
      activeNavItem === 'courses' ||
      activeNavItem === 'courses-list' ||
      activeNavItem === 'course-learners' ||
      activeNavItem === 'course-exams' ||
      activeNavItem === 'course-exam-create' ||
      activeNavItem.startsWith('course-exam-questions:') ||
      activeNavItem === 'roadmaps' ||
      activeNavItem === 'roadmaps-list' ||
      activeNavItem.startsWith('course-scores:') ||
      activeNavItem.startsWith('course-submissions:') ||
      activeNavItem.startsWith('learner-progress:') ||
      activeNavItem.startsWith('course-edit:') ||
      activeNavItem.startsWith('course-form:')
    ) {
      if (!hasPermission('GET', '/courses') && !hasModulePermission('COURSES')) {
        return <DashboardPage />
      }
    }

    if (activeNavItem === 'vocabulary' || activeNavItem.startsWith('vocab-edit:') || activeNavItem.startsWith('vocabulary-form:') || activeNavItem === 'public-decks') {
      if (!hasModulePermission('VOCABULARY')) {
        return <DashboardPage />
      }
    }

    if (activeNavItem === 'toeic-tests') {
      if (!hasPermission('GET', '/exams') && !hasModulePermission('EXAMS')) {
        return <DashboardPage />
      }
    }

    if (activeNavItem === 'roles') {
      if (!hasPermission('GET', '/roles') && !hasModulePermission('ROLES')) {
        return <DashboardPage />
      }
    }

    if (activeNavItem === 'permissions') {
      if (!hasPermission('GET', '/permissions') && !hasModulePermission('PERMISSIONS')) {
        return <DashboardPage />
      }
    }

    if (activeNavItem === 'admins' || activeNavItem === 'settings' || activeNavItem.startsWith('admin-user-')) {
      return <DashboardPage />
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

  if (activeNavItem === 'course-exam-create') {
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

  const PageComponent = pageMap[activeNavItem] || DashboardPage

  return <PageComponent />
}

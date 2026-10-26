// Điều hướng trang và kiểm soát quyền truy cập các tính năng Quản trị Admin.

import { useLocation } from 'react-router-dom'
import { lazy, Suspense } from 'react'
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
import { ForbiddenPage, NotFoundPage } from '@/features/system/pages/status.result.page'

import { ListTablePageSkeleton } from '@/components/skeleton'

const ContextsPage = lazy(() => import('@/features/practice/pages/practice.contexts.page').then(module => ({ default: module.PracticeContextsPage })))
function ContextsPageRoute() { return <Suspense fallback={<ListTablePageSkeleton />}><ContextsPage /></Suspense> }
const IpaPage = lazy(() => import('@/features/practice/pages/practice.ipa.page').then(module => ({ default: module.PracticeIpaPage })))
const ListeningPage = lazy(() => import('@/features/practice/pages/practice.listening.page').then(module => ({ default: module.PracticeListeningPage })))
const GrammarPage = lazy(() => import('@/features/practice/pages/practice.grammar.page').then(module => ({ default: module.PracticeGrammarPage })))
function GrammarPageRoute() { return <Suspense fallback={<ListTablePageSkeleton />}><GrammarPage /></Suspense> }
const ReadingPage = lazy(() => import('@/features/practice/pages/practice.reading.page').then(module => ({ default: module.PracticeReadingPage })))
function ReadingPageRoute() { return <Suspense fallback={<ListTablePageSkeleton />}><ReadingPage /></Suspense> }
const WritingPage = lazy(() => import('@/features/practice/pages/practice.writing.page').then(module => ({ default: module.PracticeWritingPage })))
function WritingPageRoute() { return <Suspense fallback={<ListTablePageSkeleton />}><WritingPage /></Suspense> }
const SpeakingPage = lazy(() => import('@/features/practice/pages/practice.speaking.page').then(module => ({ default: module.PracticeSpeakingPage })))
function SpeakingPageRoute() { return <Suspense fallback={<ListTablePageSkeleton />}><SpeakingPage /></Suspense> }
function ListeningPageRoute() {
  return <Suspense fallback={<ListTablePageSkeleton />}><ListeningPage /></Suspense>
}
function IpaPageRoute() {
  return <Suspense fallback={<ListTablePageSkeleton />}><IpaPage /></Suspense>
}

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
  practice: ListeningPageRoute,
  'practice-contexts': ContextsPageRoute,
  'practice-exercises': ListeningPageRoute,
  'practice-listening': ListeningPageRoute,
  'practice-speaking': SpeakingPageRoute,
  'practice-writing': WritingPageRoute,
  'practice-reading': ReadingPageRoute,
  'practice-grammar': GrammarPageRoute,
  'practice-ipa': IpaPageRoute,
  'toeic-tests': ExamsPage,
  'placement-tests': PlacementTestsPage,
  exams: ExamsPage,
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

  if (['practice-ipa', 'practice-listening', 'practice-speaking', 'practice-writing', 'practice-reading', 'practice-grammar', 'practice-contexts'].includes(activeNavItem) && !isAdmin) return <ForbiddenPage key={pathname} />

  if (activeNavItem === 'not-found' || activeNavItem === '404') {
    return <NotFoundPage key={pathname} />
  }

  if (activeNavItem === 'forbidden' || activeNavItem === '403') {
    return <ForbiddenPage key={pathname} />
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
        return <ForbiddenPage key={pathname} />
      }
    }

    if (activeNavItem === 'vocabulary' || activeNavItem.startsWith('vocab-edit:') || activeNavItem.startsWith('vocabulary-form:') || activeNavItem === 'public-decks') {
      if (!hasModulePermission('VOCABULARY')) {
        return <ForbiddenPage key={pathname} />
      }
    }

    if (
      activeNavItem === 'toeic-tests' ||
      activeNavItem === 'toeic-exam-create' ||
      activeNavItem.startsWith('toeic-exam-questions:') ||
      activeNavItem === 'placement-tests' ||
      activeNavItem === 'placement-test-create' ||
      activeNavItem.startsWith('placement-test-questions:')
    ) {
      if (!hasPermission('GET', '/exams') && !hasModulePermission('EXAMS') && !hasModulePermission('PRACTICE')) {
        return <ForbiddenPage key={pathname} />
      }
    }

    if (activeNavItem === 'roles') {
      if (!hasPermission('GET', '/roles') && !hasModulePermission('ROLES')) {
        return <ForbiddenPage key={pathname} />
      }
    }

    if (activeNavItem === 'permissions') {
      if (!hasPermission('GET', '/permissions') && !hasModulePermission('PERMISSIONS')) {
        return <ForbiddenPage key={pathname} />
      }
    }

    if (activeNavItem === 'admins' || activeNavItem === 'settings' || activeNavItem.startsWith('admin-user-')) {
      return <ForbiddenPage key={pathname} />
    }
  }

  if (activeNavItem.startsWith('admin-user-form:') || activeNavItem.startsWith('admin-user-edit:')) {
    const userId = activeNavItem.split(':')[1]
    return <AdminUserFormPage key={pathname} editUserId={userId} />
  }

  if (activeNavItem.startsWith('user-profile:')) {
    return <UserProfilePage key={pathname} />
  }

  if (activeNavItem.startsWith('admin-profile:')) {
    return <AdminProfilePage key={pathname} />
  }

  if (activeNavItem.startsWith('vocab-edit:') || activeNavItem.startsWith('vocabulary-form:')) {
    const wordId = activeNavItem.split(':')[1]
    return <VocabularyFormPage key={pathname} editWordId={wordId} />
  }

  if (activeNavItem.startsWith('course-edit:') || activeNavItem.startsWith('course-form:')) {
    const courseId = activeNavItem.split(':')[1]
    return <CourseFormPage key={pathname} editCourseId={courseId} />
  }

  if (activeNavItem.startsWith('course-scores:')) {
    const courseId = activeNavItem.split(':')[1]
    return <CourseScoresPage key={pathname} courseId={courseId} />
  }

  if (activeNavItem.startsWith('course-submissions:')) {
    const courseId = activeNavItem.split(':')[1]
    return <CourseSubmissionsPage key={pathname} courseId={courseId} />
  }

  if (
    activeNavItem === 'course-exam-create' ||
    activeNavItem === 'placement-test-create' ||
    activeNavItem === 'toeic-exam-create'
  ) {
    return <CourseExamQuestionsPage key={pathname} examId="new" />
  }

  if (
    activeNavItem.startsWith('course-exam-questions:') ||
    activeNavItem.startsWith('placement-test-questions:') ||
    activeNavItem.startsWith('toeic-exam-questions:')
  ) {
    const examId = activeNavItem.split(':')[1]
    return <CourseExamQuestionsPage key={pathname} examId={examId} />
  }

  if (activeNavItem.startsWith('learner-progress:')) {
    const parts = activeNavItem.split(':')
    const courseId = parts[1]
    const userId = parts[2]
    return <LearnerProgressDetailPage key={pathname} courseId={courseId} userId={userId} />
  }

  if (activeNavItem.startsWith('learner-reminders:')) {
    const parts = activeNavItem.split(':')
    const courseId = parts[1]
    const userId = parts[2]
    return <LearnerReminderHistoryPage key={pathname} courseId={courseId} userId={userId} />
  }

  const PageComponent = pageMap[activeNavItem] || NotFoundPage

  return <PageComponent key={pathname} />
}

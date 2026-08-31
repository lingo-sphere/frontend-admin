import { useAdminStore } from '@/store/admin-store'
import { useAuthStore } from '@/store/auth-store'
import { DashboardPage } from '@/pages/DashboardPage'
import { LearnersPage } from '@/pages/LearnersPage'
import { AdminUsersPage } from '@/pages/AdminUsersPage'
import { CoursesPage } from '@/pages/CoursesPage'
import { VocabularyPage } from '@/pages/VocabularyPage'
import { PracticeExercisesPage } from '@/pages/PracticeExercisesPage'
import { PracticeListeningPage } from '@/pages/PracticeListeningPage'
import { PracticeSpeakingPage } from '@/pages/PracticeSpeakingPage'
import { PracticeWritingPage } from '@/pages/PracticeWritingPage'
import { CommunityPage } from '@/pages/CommunityPage'
import { PublicDecksPage } from '@/pages/PublicDecksPage'
import { ProgressPage } from '@/pages/ProgressPage'
import { PostHogAnalyticsPage } from '@/pages/PostHogAnalyticsPage'
import { BetterStackMonitoringPage } from '@/pages/BetterStackMonitoringPage'
import { NotificationsPage } from '@/pages/NotificationsPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { UserProfilePage } from '@/pages/UserProfilePage'
import { CourseFormPage } from '@/pages/CourseFormPage'
import { AdminUserFormPage } from '@/pages/AdminUserFormPage'
import { VocabularyImportPage } from '@/pages/VocabularyImportPage'
import { VocabularyFormPage } from '@/pages/VocabularyFormPage'
import { AdminProfilePage } from '@/pages/AdminProfilePage'
import { RolesPage } from '@/pages/RolesPage'
import { PermissionsPage } from '@/pages/PermissionsPage'
import { ExamsPage } from '@/pages/ExamsPage'
import { MediaStoragePage } from '@/pages/MediaStoragePage'
import { AiManagementPage } from '@/pages/AiManagementPage'

const pageMap: Record<string, React.ComponentType> = {
  dashboard: DashboardPage,
  'users-list': LearnersPage,
  users: LearnersPage,
  admins: AdminUsersPage,
  roles: RolesPage,
  permissions: PermissionsPage,
  'admin-user-create': AdminUserFormPage,
  courses: CoursesPage,
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
  exams: ExamsPage,
  'media-storage': MediaStoragePage,
  media: MediaStoragePage,
  'ai-management': AiManagementPage,
  'ai-teacher': AiManagementPage,
  community: CommunityPage,
  'public-decks': PublicDecksPage,
  progress: ProgressPage,
  'analytics-posthog': PostHogAnalyticsPage,
  posthog: PostHogAnalyticsPage,
  'monitoring-betterstack': BetterStackMonitoringPage,
  betterstack: BetterStackMonitoringPage,
  notifications: NotificationsPage,
  settings: SettingsPage,
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
    if (activeNavItem === 'courses' || activeNavItem.startsWith('course-edit:') || activeNavItem.startsWith('course-form:')) {
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

  const PageComponent = pageMap[activeNavItem] || DashboardPage

  return <PageComponent />
}

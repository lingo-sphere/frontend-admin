import { useAdminStore } from '@/store/admin-store'
import { useAuthStore } from '@/store/auth-store'
import { DashboardPage } from '@/pages/DashboardPage'
import { LearnersPage } from '@/pages/LearnersPage'
import { AdminUsersPage } from '@/pages/AdminUsersPage'
import { CoursesPage } from '@/pages/CoursesPage'
import { VocabularyPage } from '@/pages/VocabularyPage'
import { PracticePage } from '@/pages/PracticePage'
import { CommunityPage } from '@/pages/CommunityPage'
import { PublicDecksPage } from '@/pages/PublicDecksPage'
import { ProgressPage } from '@/pages/ProgressPage'
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
  practice: PracticePage,
  'practice-exercises': PracticePage,
  'practice-listening': PracticePage,
  'practice-speaking': PracticePage,
  'practice-writing': PracticePage,
  'toeic-tests': ExamsPage,
  exams: ExamsPage,
  'media-storage': MediaStoragePage,
  media: MediaStoragePage,
  'ai-management': AiManagementPage,
  'ai-teacher': AiManagementPage,
  community: CommunityPage,
  'public-decks': PublicDecksPage,
  progress: ProgressPage,
  notifications: NotificationsPage,
  settings: SettingsPage,
  'admin-profile': AdminProfilePage,
}

export function PageRouter() {
  const activeNavItem = useAdminStore((state) => state.activeNavItem)
  const user = useAuthStore((state) => state.user)
  const profile = useAuthStore((state) => state.profile)

  const currentRole = (user?.role || profile?.role || '').toUpperCase()
  const isAdmin = currentRole === 'ADMIN'

  // Admin-only pages
  const adminOnlyPages = ['roles', 'permissions', 'admins', 'admin-user-create', 'settings']
  const isAdminOnlyNav =
    adminOnlyPages.includes(activeNavItem) ||
    activeNavItem.startsWith('admin-user-form:') ||
    activeNavItem.startsWith('admin-user-edit:')

  if (isAdminOnlyNav && !isAdmin) {
    return <DashboardPage />
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

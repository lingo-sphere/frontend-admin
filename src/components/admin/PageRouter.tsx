// Updated: 2026-08-22
// PageRouter - Render page based on activeNavItem from store

import { useAdminStore } from '@/store/admin-store'
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

const pageMap: Record<string, React.ComponentType> = {
  dashboard: DashboardPage,
  'users-list': LearnersPage,
  'admins': AdminUsersPage,
  courses: CoursesPage,
  vocabulary: VocabularyPage,
  practice: PracticePage,
  'practice-exercises': PracticePage,
  'practice-listening': PracticePage,
  'practice-speaking': PracticePage,
  'practice-writing': PracticePage,
  'toeic-tests': PracticePage,
  community: CommunityPage,
  'public-decks': PublicDecksPage,
  progress: ProgressPage,
  notifications: NotificationsPage,
  settings: SettingsPage,
  'user-profile': UserProfilePage,
  'course-form': CourseFormPage,
  'admin-user-form': AdminUserFormPage,
  'vocabulary-import': VocabularyImportPage,
  'vocabulary-form': VocabularyFormPage,
  'admin-profile': AdminProfilePage,
}

export function PageRouter() {
  const activeNavItem = useAdminStore((state) => state.activeNavItem)

  // Handle edit mode: admin-user-form:userId
  if (activeNavItem.startsWith('admin-user-form:')) {
    const userId = activeNavItem.split(':')[1]
    return <AdminUserFormPage editUserId={userId} />
  }

  // Handle user profile: user-profile:userId
  if (activeNavItem.startsWith('user-profile:')) {
    return <UserProfilePage />
  }

  // Handle admin profile: admin-profile:userId
  if (activeNavItem.startsWith('admin-profile:')) {
    return <AdminProfilePage />
  }

  // Handle vocabulary form: vocabulary-form or vocabulary-form:wordId
  if (activeNavItem.startsWith('vocabulary-form')) {
    const wordId = activeNavItem.includes(':') ? activeNavItem.split(':')[1] : undefined
    return <VocabularyFormPage editWordId={wordId} />
  }

  const PageComponent = pageMap[activeNavItem] || DashboardPage

  return <PageComponent />
}

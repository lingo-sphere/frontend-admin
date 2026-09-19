// Ánh xạ điều hướng giữa đường dẫn URL và danh mục menu Quản trị Admin.

export function navItemToPath(navItem: string): string {
  if (!navItem || navItem === 'dashboard') return '/dashboard'
  if (navItem === 'users' || navItem === 'users-list') return '/users'
  if (navItem.startsWith('user-profile:')) {
    const id = navItem.split(':')[1]
    return `/users/${id}`
  }
  if (navItem === 'admins') return '/admins'
  if (navItem === 'admin-user-create') return '/admins/create'
  if (navItem.startsWith('admin-user-edit:') || navItem.startsWith('admin-user-form:')) {
    const id = navItem.split(':')[1]
    return `/admins/${id}/edit`
  }
  if (navItem === 'courses' || navItem === 'courses-list') return '/courses'
  if (navItem === 'course-learners') return '/course-learners'
  if (navItem.startsWith('learner-progress:')) {
    const parts = navItem.split(':')
    const courseId = parts[1]
    const userId = parts[2]
    return `/course-learners/${courseId}/students/${userId}`
  }
  if (navItem.startsWith('learner-reminders:')) {
    const parts = navItem.split(':')
    const courseId = parts[1]
    const userId = parts[2]
    return `/course-learners/${courseId}/reminders/${userId}`
  }
  if (navItem === 'course-exams') return '/course-exams'
  if (navItem === 'course-exam-create') return '/course-exams/create'
  if (navItem.startsWith('course-exam-questions:')) {
    const id = navItem.split(':')[1]
    return id === 'new' ? '/course-exams/create' : `/course-exams/${id}/questions`
  }
  if (navItem === 'course-create') return '/courses/create'
  if (navItem.startsWith('course-scores:')) {
    const id = navItem.split(':')[1]
    return `/courses/${id}/scores`
  }
  if (navItem.startsWith('course-submissions:')) {
    const id = navItem.split(':')[1]
    return `/courses/${id}/submissions`
  }
  if (navItem.startsWith('course-edit:') || navItem.startsWith('course-form:')) {
    const id = navItem.split(':')[1]
    return `/courses/${id}/edit`
  }
  if (navItem === 'vocabulary') return '/vocabulary'
  if (navItem === 'vocab-create' || navItem === 'vocabulary-form') return '/vocabulary/create'
  if (navItem.startsWith('vocab-edit:') || navItem.startsWith('vocabulary-form:')) {
    const id = navItem.split(':')[1]
    return `/vocabulary/${id}/edit`
  }
  if (navItem === 'vocabulary-import') return '/vocabulary/import'
  if (navItem === 'practice' || navItem === 'practice-exercises') return '/practice'
  if (navItem === 'practice-listening') return '/practice/listening'
  if (navItem === 'practice-speaking') return '/practice/speaking'
  if (navItem === 'practice-writing') return '/practice/writing'
  if (navItem === 'toeic-tests') return '/practice/exams'
  if (navItem === 'placement-tests') return '/practice/placement-tests'
  if (navItem === 'placement-test-create') return '/practice/placement-tests/create'
  if (navItem.startsWith('placement-test-questions:')) {
    const id = navItem.split(':')[1]
    return id === 'new' ? '/practice/placement-tests/create' : `/practice/placement-tests/${id}/questions`
  }
  if (navItem === 'community') return '/community'
  if (navItem === 'public-decks') return '/public-decks'
  if (navItem === 'progress') return '/progress'
  if (navItem === 'analytics-posthog' || navItem === 'posthog') return '/analytics/posthog'
  if (navItem === 'monitoring-betterstack' || navItem === 'betterstack') return '/monitoring/betterstack'
  if (navItem === 'notifications') return '/notifications'
  if (navItem === 'settings' || navItem === 'settings-plans') return '/settings/plans'
  if (navItem === 'settings-ai') return '/settings/ai'
  if (navItem === 'settings-system') return '/settings/system'
  if (navItem === 'roles') return '/roles'
  if (navItem === 'permissions') return '/permissions'
  if (navItem === 'admin-profile') return '/profile'
  if (navItem.startsWith('admin-profile:')) {
    const id = navItem.split(':')[1]
    return `/profile/${id}`
  }
  if (navItem === 'forbidden' || navItem === '403') return '/403'
  if (navItem === 'not-found' || navItem === '404') return '/404'
  return `/${navItem}`
}

export function pathToNavItem(pathname: string): string {
  if (pathname === '/' || pathname === '/dashboard') return 'dashboard'
  if (pathname === '/users') return 'users-list'
  if (pathname.startsWith('/users/')) {
    return `user-profile:${pathname.replace('/users/', '')}`
  }
  if (pathname === '/admins') return 'admins'
  if (pathname === '/admins/create') return 'admin-user-create'
  if (pathname.startsWith('/admins/') && pathname.endsWith('/edit')) {
    const id = pathname.replace('/admins/', '').replace('/edit', '')
    return `admin-user-edit:${id}`
  }
  if (pathname === '/courses') return 'courses-list'
  if (pathname === '/courses/list') return 'courses-list'
  if (pathname === '/courses/learners' || pathname === '/course-learners') return 'course-learners'
  if (pathname.startsWith('/course-learners/') && pathname.includes('/students/')) {
    const raw = pathname.replace('/course-learners/', '')
    const parts = raw.split('/students/')
    const courseId = parts[0]
    const userId = parts[1]
    return `learner-progress:${courseId}:${userId}`
  }
  if (pathname.startsWith('/course-learners/') && pathname.includes('/reminders/')) {
    const raw = pathname.replace('/course-learners/', '')
    const parts = raw.split('/reminders/')
    const courseId = parts[0]
    const userId = parts[1]
    return `learner-reminders:${courseId}:${userId}`
  }
  if (pathname === '/courses/exams' || pathname === '/course-exams') return 'course-exams'
  if (pathname === '/course-exams/create') return 'course-exam-create'
  if (pathname.startsWith('/course-exams/') && pathname.endsWith('/questions')) {
    const id = pathname.replace('/course-exams/', '').replace('/questions', '')
    return `course-exam-questions:${id}`
  }
  if (pathname === '/courses/create') return 'course-create'
  if (pathname.startsWith('/courses/') && pathname.endsWith('/scores')) {
    const id = pathname.replace('/courses/', '').replace('/scores', '')
    return `course-scores:${id}`
  }
  if (pathname.startsWith('/courses/') && pathname.endsWith('/submissions')) {
    const id = pathname.replace('/courses/', '').replace('/submissions', '')
    return `course-submissions:${id}`
  }
  if (pathname.startsWith('/courses/') && pathname.endsWith('/edit')) {
    const id = pathname.replace('/courses/', '').replace('/edit', '')
    return `course-edit:${id}`
  }
  if (pathname === '/vocabulary') return 'vocabulary'
  if (pathname === '/vocabulary/create') return 'vocab-create'
  if (pathname.startsWith('/vocabulary/') && pathname.endsWith('/edit')) {
    const id = pathname.replace('/vocabulary/', '').replace('/edit', '')
    return `vocab-edit:${id}`
  }
  if (pathname === '/vocabulary/import') return 'vocabulary-import'
  if (pathname === '/practice' || pathname === '/practice/exercises') return 'practice-exercises'
  if (pathname === '/practice/listening') return 'practice-listening'
  if (pathname === '/practice/speaking') return 'practice-speaking'
  if (pathname === '/practice/writing') return 'practice-writing'
  if (pathname === '/practice/exams') return 'toeic-tests'
  if (pathname === '/practice/placement-tests/create' || pathname === '/placement-tests/create') return 'placement-test-create'
  if (pathname.startsWith('/practice/placement-tests/') && pathname.endsWith('/questions')) {
    const id = pathname.replace('/practice/placement-tests/', '').replace('/questions', '')
    return `placement-test-questions:${id}`
  }
  if (pathname.startsWith('/placement-tests/') && pathname.endsWith('/questions')) {
    const id = pathname.replace('/placement-tests/', '').replace('/questions', '')
    return `placement-test-questions:${id}`
  }
  if (pathname === '/practice/placement-tests' || pathname === '/placement-tests') return 'placement-tests'
  if (pathname === '/community') return 'community'
  if (pathname === '/public-decks') return 'public-decks'
  if (pathname === '/progress') return 'progress'
  if (pathname === '/analytics/posthog' || pathname === '/posthog') return 'analytics-posthog'
  if (pathname === '/monitoring/betterstack' || pathname === '/betterstack') return 'monitoring-betterstack'
  if (pathname === '/notifications') return 'notifications'
  if (pathname === '/settings' || pathname === '/settings/plans') return 'settings-plans'
  if (pathname === '/settings/ai' || pathname === '/ai-management' || pathname === '/ai') return 'settings-ai'
  if (pathname === '/settings/system') return 'settings-system'
  if (pathname === '/roles') return 'roles'
  if (pathname === '/permissions') return 'permissions'
  if (pathname === '/profile') return 'admin-profile'
  if (pathname.startsWith('/profile/')) {
    return `admin-profile:${pathname.replace('/profile/', '')}`
  }
  if (pathname === '/403' || pathname === '/forbidden') return 'forbidden'
  if (pathname === '/404' || pathname === '/not-found') return 'not-found'
  return 'not-found'
}

export function getEffectiveNavId(navItem: string): string {
  if (
    navItem === 'courses' ||
    navItem === 'courses-list' ||
    navItem === 'course-create' ||
    navItem.startsWith('course-edit:') ||
    navItem.startsWith('course-form:') ||
    navItem.startsWith('course-scores:') ||
    navItem.startsWith('course-submissions:')
  ) {
    return 'courses-list'
  }

  if (
    navItem === 'course-learners' ||
    navItem.startsWith('learner-progress:') ||
    navItem.startsWith('learner-reminders:')
  ) {
    return 'course-learners'
  }

  if (
    navItem === 'course-exams' ||
    navItem === 'course-exam-create' ||
    navItem.startsWith('course-exam-questions:')
  ) {
    return 'course-exams'
  }

  if (navItem === 'users' || navItem === 'users-list' || navItem.startsWith('user-profile:')) {
    return 'users-list'
  }

  if (
    navItem === 'admins' ||
    navItem === 'admin-user-create' ||
    navItem.startsWith('admin-user-edit:') ||
    navItem.startsWith('admin-user-form:')
  ) {
    return 'admins'
  }

  if (
    navItem === 'vocabulary' ||
    navItem === 'vocab-create' ||
    navItem === 'vocabulary-form' ||
    navItem === 'vocabulary-import' ||
    navItem.startsWith('vocab-edit:') ||
    navItem.startsWith('vocabulary-form:')
  ) {
    return 'vocabulary'
  }

  if (navItem === 'practice' || navItem === 'practice-exercises') {
    return 'practice-exercises'
  }

  if (navItem === 'toeic-tests' || navItem === 'exams') {
    return 'toeic-tests'
  }

  if (navItem === 'placement-tests' || navItem === 'placement-test-create' || navItem.startsWith('placement-test-questions:')) {
    return 'placement-tests'
  }

  if (navItem === 'analytics-posthog' || navItem === 'posthog') {
    return 'analytics-posthog'
  }

  if (navItem === 'monitoring-betterstack' || navItem === 'betterstack') {
    return 'monitoring-betterstack'
  }

  if (navItem === 'settings' || navItem === 'settings-plans') {
    return 'settings-plans'
  }

  if (navItem === 'settings-ai' || navItem === 'ai-management' || navItem === 'ai') {
    return 'settings-ai'
  }

  if (navItem === 'admin-profile' || navItem.startsWith('admin-profile:')) {
    return 'admin-profile'
  }

  return navItem
}


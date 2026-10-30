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
  if (navItem === 'course-submissions') return '/submissions/courses'
  if (navItem.startsWith('course-test-session-detail:')) {
    const parts = navItem.split(':')
    const courseId = parts[1]
    const sessionId = parts[2]
    return `/submissions/courses/${courseId}/sessions/${sessionId}`
  }
  if (navItem === 'practice-speaking-submissions') return '/submissions/practice/speaking'
  if (navItem === 'practice-writing-submissions') return '/submissions/practice/writing'
  if (navItem.startsWith('practice-submission-review:')) {
    const parts = navItem.split(':')
    const skill = parts[1]
    const id = parts[2]
    return `/submissions/practice/${skill}/${id}`
  }
  if (navItem === 'submissions') return '/submissions'
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
    return `/submissions?courseId=${encodeURIComponent(id)}`
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
  if (navItem === 'practice-contexts') return '/practice/contexts'
  if (navItem === 'practice' || navItem === 'practice-exercises') return '/practice/listening'
  if (navItem === 'practice-listening') return '/practice/listening'
  if (navItem === 'practice-speaking') return '/practice/speaking'
  if (navItem === 'practice-grammar') return '/practice/grammar'
  if (navItem === 'practice-reading') return '/practice/reading'
  if (navItem === 'practice-writing') return '/practice/writing'
  if (navItem === 'practice-ipa') return '/practice/ipa'
  if (navItem === 'toeic-tests') return '/practice/exams'
  if (navItem === 'toeic-exam-create') return '/practice/exams/create'
  if (navItem.startsWith('toeic-exam-questions:')) {
    const id = navItem.split(':')[1]
    return id === 'new' ? '/practice/exams/create' : `/practice/exams/${id}/questions`
  }
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
  const cleanPath = pathname ? pathname.split('?')[0].split('#')[0].replace(/\/+$/, '') || '/' : '/'
  if (cleanPath === '/' || cleanPath === '/dashboard') return 'dashboard'
  if (cleanPath === '/users') return 'users-list'
  if (cleanPath.startsWith('/users/')) {
    return `user-profile:${cleanPath.replace('/users/', '')}`
  }
  if (cleanPath === '/admins') return 'admins'
  if (cleanPath === '/admins/create') return 'admin-user-create'
  if (cleanPath.startsWith('/admins/') && cleanPath.endsWith('/edit')) {
    const id = cleanPath.replace('/admins/', '').replace('/edit', '')
    return `admin-user-edit:${id}`
  }
  if (cleanPath === '/submissions/courses') return 'course-submissions'
  if (cleanPath.startsWith('/submissions/courses/') && cleanPath.includes('/sessions/')) {
    const raw = cleanPath.replace('/submissions/courses/', '')
    const parts = raw.split('/sessions/')
    return `course-test-session-detail:${parts[0]}:${parts[1]}`
  }
  if (cleanPath === '/submissions/practice/speaking') return 'practice-speaking-submissions'
  if (cleanPath.startsWith('/submissions/practice/speaking/')) {
    const id = cleanPath.replace('/submissions/practice/speaking/', '')
    return `practice-submission-review:speaking:${id}`
  }
  if (cleanPath === '/submissions/practice/writing') return 'practice-writing-submissions'
  if (cleanPath.startsWith('/submissions/practice/writing/')) {
    const id = cleanPath.replace('/submissions/practice/writing/', '')
    return `practice-submission-review:writing:${id}`
  }
  if (cleanPath === '/submissions') return 'submissions'
  if (cleanPath === '/courses') return 'courses-list'
  if (cleanPath === '/courses/list') return 'courses-list'
  if (cleanPath === '/courses/learners' || cleanPath === '/course-learners') return 'course-learners'
  if (cleanPath.startsWith('/course-learners/') && cleanPath.includes('/students/')) {
    const raw = cleanPath.replace('/course-learners/', '')
    const parts = raw.split('/students/')
    const courseId = parts[0]
    const userId = parts[1]
    return `learner-progress:${courseId}:${userId}`
  }
  if (cleanPath.startsWith('/course-learners/') && cleanPath.includes('/reminders/')) {
    const raw = cleanPath.replace('/course-learners/', '')
    const parts = raw.split('/reminders/')
    const courseId = parts[0]
    const userId = parts[1]
    return `learner-reminders:${courseId}:${userId}`
  }
  if (cleanPath === '/courses/exams' || cleanPath === '/course-exams') return 'course-exams'
  if (cleanPath === '/course-exams/create') return 'course-exam-create'
  if (cleanPath.startsWith('/course-exams/') && cleanPath.endsWith('/questions')) {
    const id = cleanPath.replace('/course-exams/', '').replace('/questions', '')
    return `course-exam-questions:${id}`
  }
  if (cleanPath === '/courses/create') return 'course-create'
  if (cleanPath.startsWith('/courses/') && cleanPath.endsWith('/scores')) {
    const id = cleanPath.replace('/courses/', '').replace('/scores', '')
    return `course-scores:${id}`
  }
  if (cleanPath.startsWith('/courses/') && cleanPath.endsWith('/submissions')) {
    const id = cleanPath.replace('/courses/', '').replace('/submissions', '')
    return `course-submissions:${id}`
  }
  if (cleanPath.startsWith('/courses/') && cleanPath.endsWith('/edit')) {
    const id = cleanPath.replace('/courses/', '').replace('/edit', '')
    return `course-edit:${id}`
  }
  if (cleanPath === '/vocabulary') return 'vocabulary'
  if (cleanPath === '/vocabulary/create') return 'vocab-create'
  if (cleanPath.startsWith('/vocabulary/') && cleanPath.endsWith('/edit')) {
    const id = cleanPath.replace('/vocabulary/', '').replace('/edit', '')
    return `vocab-edit:${id}`
  }
  if (cleanPath === '/vocabulary/import') return 'vocabulary-import'
  if (cleanPath === '/practice/contexts') return 'practice-contexts'
  if (cleanPath === '/practice' || cleanPath === '/practice/exercises') return 'practice-listening'
  if (cleanPath === '/practice/listening') return 'practice-listening'
  if (cleanPath === '/practice/speaking') return 'practice-speaking'
  if (cleanPath === '/practice/grammar') return 'practice-grammar'
  if (cleanPath === '/practice/reading') return 'practice-reading'
  if (cleanPath === '/practice/writing') return 'practice-writing'
  if (cleanPath === '/practice/ipa') return 'practice-ipa'
  if (cleanPath === '/practice/exams') return 'toeic-tests'
  if (cleanPath === '/practice/exams/create') return 'toeic-exam-create'
  if (cleanPath.startsWith('/practice/exams/') && cleanPath.endsWith('/questions')) {
    const id = cleanPath.replace('/practice/exams/', '').replace('/questions', '')
    return `toeic-exam-questions:${id}`
  }
  if (cleanPath === '/practice/placement-tests/create' || cleanPath === '/placement-tests/create') return 'placement-test-create'
  if (cleanPath.startsWith('/practice/placement-tests/') && cleanPath.endsWith('/questions')) {
    const id = cleanPath.replace('/practice/placement-tests/', '').replace('/questions', '')
    return `placement-test-questions:${id}`
  }
  if (cleanPath.startsWith('/placement-tests/') && cleanPath.endsWith('/questions')) {
    const id = cleanPath.replace('/placement-tests/', '').replace('/questions', '')
    return `placement-test-questions:${id}`
  }
  if (cleanPath === '/practice/placement-tests' || cleanPath === '/placement-tests') return 'placement-tests'
  if (cleanPath === '/community') return 'community'
  if (cleanPath === '/public-decks') return 'public-decks'
  if (cleanPath === '/progress') return 'progress'
  if (cleanPath === '/analytics/posthog' || cleanPath === '/posthog') return 'analytics-posthog'
  if (cleanPath === '/monitoring/betterstack' || cleanPath === '/monitoring-betterstack' || cleanPath === '/betterstack') return 'monitoring-betterstack'
  if (cleanPath === '/notifications') return 'notifications'
  if (cleanPath === '/settings' || cleanPath === '/settings/plans') return 'settings-plans'
  if (cleanPath === '/settings/ai' || cleanPath === '/ai-management' || cleanPath === '/ai') return 'settings-ai'
  if (cleanPath === '/roles') return 'roles'
  if (cleanPath === '/permissions') return 'permissions'
  if (cleanPath === '/profile') return 'admin-profile'
  if (cleanPath.startsWith('/profile/')) {
    return `admin-profile:${cleanPath.replace('/profile/', '')}`
  }
  if (cleanPath === '/403' || cleanPath === '/forbidden') return 'forbidden'
  if (cleanPath === '/404' || cleanPath === '/not-found') return 'not-found'
  return 'not-found'
}

export function getEffectiveNavId(navItem: string): string {
  if (navItem === 'submissions' || navItem.startsWith('course-submissions:') || navItem.startsWith('course-test-session-detail:')) return 'course-submissions'
  if (navItem.startsWith('practice-submission-review:speaking:')) return 'practice-speaking-submissions'
  if (navItem.startsWith('practice-submission-review:writing:')) return 'practice-writing-submissions'
  if (
    navItem === 'courses' ||
    navItem === 'courses-list' ||
    navItem === 'course-create' ||
    navItem.startsWith('course-edit:') ||
    navItem.startsWith('course-form:') ||
    navItem.startsWith('course-scores:')
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

  if (
    navItem === 'toeic-tests' ||
    navItem === 'exams' ||
    navItem === 'toeic-exam-create' ||
    navItem.startsWith('toeic-exam-questions:')
  ) {
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


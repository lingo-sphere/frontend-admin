/**
 * @file navigation.ts
 * @description Tiện ích hỗ trợ xử lý dữ liệu và giao diện Admin
 */

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
  if (navItem === 'course-exams') return '/course-exams'
  if (navItem === 'roadmaps' || navItem === 'roadmaps-list') return '/courses/roadmaps'
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
  if (navItem === 'community') return '/community'
  if (navItem === 'public-decks') return '/public-decks'
  if (navItem === 'progress') return '/progress'
  if (navItem === 'analytics-posthog' || navItem === 'posthog') return '/analytics/posthog'
  if (navItem === 'monitoring-betterstack' || navItem === 'betterstack') return '/monitoring/betterstack'
  if (navItem === 'notifications') return '/notifications'
  if (navItem === 'settings') return '/settings'
  if (navItem === 'roles') return '/roles'
  if (navItem === 'permissions') return '/permissions'
  if (navItem === 'admin-profile') return '/profile'
  if (navItem.startsWith('admin-profile:')) {
    const id = navItem.split(':')[1]
    return `/profile/${id}`
  }
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
  if (pathname === '/courses/exams' || pathname === '/course-exams') return 'course-exams'
  if (pathname === '/courses/roadmaps' || pathname === '/roadmaps') return 'roadmaps'
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
  if (pathname === '/community') return 'community'
  if (pathname === '/public-decks') return 'public-decks'
  if (pathname === '/progress') return 'progress'
  if (pathname === '/analytics/posthog' || pathname === '/posthog') return 'analytics-posthog'
  if (pathname === '/monitoring/betterstack' || pathname === '/betterstack') return 'monitoring-betterstack'
  if (pathname === '/notifications') return 'notifications'
  if (pathname === '/settings') return 'settings'
  if (pathname === '/roles') return 'roles'
  if (pathname === '/permissions') return 'permissions'
  if (pathname === '/profile') return 'admin-profile'
  if (pathname.startsWith('/profile/')) {
    return `admin-profile:${pathname.replace('/profile/', '')}`
  }
  return 'dashboard'
}

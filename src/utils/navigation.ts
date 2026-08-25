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
  if (navItem === 'courses') return '/courses'
  if (navItem === 'course-create') return '/courses/create'
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
  if (navItem === 'notifications') return '/notifications'
  if (navItem === 'settings') return '/settings'
  if (navItem === 'roles' || navItem === 'permissions') return '/roles'
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
  if (pathname === '/courses') return 'courses'
  if (pathname === '/courses/create') return 'course-create'
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
  if (pathname === '/notifications') return 'notifications'
  if (pathname === '/settings') return 'settings'
  if (pathname === '/roles' || pathname === '/permissions') return 'roles'
  if (pathname === '/profile') return 'admin-profile'
  if (pathname.startsWith('/profile/')) {
    return `admin-profile:${pathname.replace('/profile/', '')}`
  }
  return 'dashboard'
}

// Thanh điều hướng thanh bên Admin hỗ trợ thu gọn và phân quyền truy cập.
import { useState, useEffect, useMemo, useCallback } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { PanelLeftClose, Shield } from 'lucide-react'
import { useAdminLayout } from '@/contexts/admin.layout.context'
import { pathToNavItem, getEffectiveNavId } from '@/routes/navigation'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { useTranslation } from 'react-i18next'
import { navGroups, type NavGroup, type NavItem } from '@/layouts/sidebar.nav.config'
import { SidebarNavGroup } from '@/layouts/sidebar.nav.group'

interface SidebarProps {
  mobile?: boolean
}

export function Sidebar({ mobile = false }: SidebarProps) {
  const { t, i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'
  const location = useLocation()
  const activeNavItem = getEffectiveNavId(pathToNavItem(location.pathname))
  const { sidebarCollapsed, toggleSidebarCollapsed, setMobileSidebarOpen } = useAdminLayout()
  const user = useAuthStore((state) => state.user)
  const profile = useAuthStore((state) => state.profile)

  const [expandedItem, setExpandedItem] = useState<string | null>(() => {
    for (const group of navGroups) {
      for (const item of group.items) {
        if (item.children && (item.id === activeNavItem || item.children.some((c) => c.id === activeNavItem))) {
          return item.id
        }
      }
    }
    return null
  })

  const handleNavigate = (id: string) => {
    let targetParentId: string | null = null
    for (const group of navGroups) {
      for (const item of group.items) {
        if (item.children && (item.id === id || item.children.some((c) => c.id === id))) {
          targetParentId = item.id
          break
        }
      }
      if (targetParentId) break
    }

    if (targetParentId) {
      setExpandedItem((prev) => (prev === targetParentId ? prev : targetParentId))
    }
    if (mobile) {
      setMobileSidebarOpen(false)
    }
  }

  const toggleExpand = (id: string) => {
    setExpandedItem((prev) => (prev === id ? null : id))
  }

  useEffect(() => {
    for (const group of navGroups) {
      for (const item of group.items) {
        if (item.children && (item.id === activeNavItem || item.children.some((c) => c.id === activeNavItem))) {
          setExpandedItem((prev) => (prev === item.id ? prev : item.id))
          return
        }
      }
    }
    setExpandedItem((prev) => (prev === null ? prev : null))
  }, [activeNavItem])

  const currentRole = (user?.role || profile?.role || '').toUpperCase()
  const isAdmin = currentRole === 'ADMIN'
  const hasPermission = useAuthStore((state) => state.hasPermission)
  const hasModulePermission = useAuthStore((state) => state.hasModulePermission)
  const permissions = useAuthStore((state) => state.permissions)

  const isNavAllowed = useCallback(
    (id: string): boolean => {
      if (isAdmin) return true

      switch (id) {
        case 'dashboard':
          return true
        case 'users':
        case 'users-list':
          return hasModulePermission('USERS') || hasPermission('GET', '/users/admin/users')
        case 'admins':
          return false
        case 'access_control':
        case 'roles':
          return hasPermission('GET', '/roles') || hasModulePermission('ROLES')
        case 'permissions':
          return hasPermission('GET', '/permissions') || hasModulePermission('PERMISSIONS')
        case 'courses':
        case 'courses-list':
        case 'course-learners':
        case 'course-exams':
          return hasPermission('GET', '/courses') || hasModulePermission('COURSES')
        case 'practice-speaking-submissions':
        case 'practice-writing-submissions':
        case 'course-submissions':
        case 'submissions':
          return currentRole === 'INSTRUCTOR' || hasPermission('GET', '/progress/teacher/courses/:courseId/submissions')
        case 'vocabulary':
        case 'public-decks':
          return hasModulePermission('VOCABULARY')
        case 'practice':
        case 'practice-exercises':
          return hasModulePermission('PRACTICE')
        case 'practice-grammar':
        case 'practice-reading':
        case 'practice-writing':
        case 'practice-ipa':
        case 'practice-speaking':
        case 'practice-listening':
        case 'practice-contexts':
          return false // IPA management endpoints are restricted to ADMIN.
        case 'toeic-tests':
        case 'placement-tests':
          return hasPermission('GET', '/exams') || hasModulePermission('EXAMS') || hasModulePermission('PRACTICE')
        case 'media-storage':
          return hasModulePermission('MEDIA')
        case 'community':
          return hasModulePermission('COMMUNITY')
        case 'progress':
        case 'analytics-posthog':
        case 'monitoring-betterstack':
          return hasModulePermission('PROGRESS')
        case 'notifications':
          return hasModulePermission('NOTIFICATIONS')
        case 'measurement-profiles':
        case 'settings':
        case 'settings-plans':
        case 'settings-ai':
        case 'settings-system':
          return false
        default:
          return true
      }
    },
    [isAdmin, currentRole, hasPermission, hasModulePermission]
  )

  const visibleNavGroups = useMemo(() => {
    return navGroups
      .map((group) => {
        if (!isAdmin && group.id === 'access_control' && !hasModulePermission('ROLES') && !hasModulePermission('PERMISSIONS')) {
          return null
        }

        const filteredItems = group.items
          .map((item) => {
            if (item.children && item.children.length > 0) {
              const filteredChildren = item.children.filter((c) => isNavAllowed(c.id))
              if (filteredChildren.length === 0) return null
              return { ...item, children: filteredChildren }
            }
            if (!isNavAllowed(item.id)) return null
            return item
          })
          .filter(Boolean) as NavItem[]

        if (filteredItems.length === 0) return null
        return { ...group, items: filteredItems }
      })
      .filter(Boolean) as NavGroup[]
  }, [isAdmin, isNavAllowed, permissions, hasModulePermission])

  const toCamelCase = (str: string) =>
    str.toLowerCase().replace(/[-_]([a-z0-9])/g, (_, c) => c.toUpperCase())

  const localizedGroups: NavGroup[] = visibleNavGroups.map((group) => {
    const groupKey = `nav.${toCamelCase(group.id)}`
    const groupTranslated = t(groupKey)
    const groupLabel =
      groupTranslated && groupTranslated !== groupKey ? groupTranslated : group.label

    return {
      ...group,
      label: groupLabel,
      items: group.items.map((item) => {
        const itemKey = item.id === 'community' ? 'nav.communityNav' : `nav.${toCamelCase(item.id)}`
        const itemTranslated = t(itemKey)
        const itemLabel =
          itemTranslated && itemTranslated !== itemKey ? itemTranslated : item.label

        return {
          ...item,
          label: itemLabel,
          children: item.children?.map((child) => {
            const childKey =
              child.id === 'progress' && item.id === 'progress'
                ? 'nav.progressLingosphere'
                : `nav.${toCamelCase(child.id)}`
            const childTranslated = t(childKey)
            const childLabel =
              childTranslated && childTranslated !== childKey
                ? childTranslated
                : child.label

            return {
              ...child,
              label: childLabel,
            }
          }),
        }
      }),
    }
  })

  const content = (
    <div className="flex flex-col h-full select-none justify-between overflow-hidden">
      <div className="flex flex-col flex-1 min-h-0">
        <Link
          to="/dashboard"
          onClick={() => handleNavigate('dashboard')}
          title={isVietnamese ? 'Về trang Tổng quan' : 'Go to Dashboard'}
          className={`w-full shrink-0 flex items-center gap-3 pb-3 border-b border-slate-200/80 dark:border-slate-800/80 text-left cursor-pointer group transition-all ${
            sidebarCollapsed && !mobile ? 'justify-center' : ''
          }`}
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-400 via-teal-500 to-indigo-600 flex items-center justify-center shadow-md shadow-teal-500/25 shrink-0 ring-1 ring-black/5 dark:ring-white/20 group-hover:scale-105 group-hover:shadow-teal-500/40 transition-all duration-200">
            <Shield className="w-4.5 h-4.5 text-white group-hover:rotate-6 transition-transform duration-200" />
          </div>
          {(!sidebarCollapsed || mobile) && (
            <div className="min-w-0 flex-1">
              <p className="font-extrabold text-sm text-slate-900 dark:text-white truncate tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                LingoSphere
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                <p className="text-[10px] text-teal-600 dark:text-teal-400 font-bold uppercase tracking-wider">
                  {t('common.adminConsole')}
                </p>
              </div>
            </div>
          )}
        </Link>

        <nav className="my-2 flex-1 sidebar-scroll space-y-2 pr-0.5 overflow-y-auto">
          {localizedGroups.map((group, groupIdx) => (
            <SidebarNavGroup
              key={group.id}
              group={group}
              groupIdx={groupIdx}
              sidebarCollapsed={sidebarCollapsed}
              mobile={mobile}
              activeNavItem={activeNavItem}
              expandedItem={expandedItem}
              onNavigate={handleNavigate}
              onToggleExpand={toggleExpand}
            />
          ))}
        </nav>
      </div>

      <div className="pt-2 shrink-0 border-t border-slate-200/80 dark:border-slate-800/80">
        {!mobile && (
          <button
            className={`w-full flex items-center justify-center gap-2 py-2 px-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all cursor-pointer ${
              sidebarCollapsed ? 'px-0' : ''
            }`}
            onClick={toggleSidebarCollapsed}
            type="button"
          >
            <PanelLeftClose className="w-4 h-4 shrink-0" />
            {!sidebarCollapsed && (
              <span>{t('nav.collapseMenu')}</span>
            )}
          </button>
        )}
      </div>
    </div>
  )

  if (mobile) {
    return (
      <div className="flex h-full w-full flex-col bg-white dark:bg-slate-900 px-4 py-5 border-r border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-slate-100 transition-colors">
        {content}
      </div>
    )
  }

  return (
    <aside
      className={`hidden md:flex fixed inset-y-0 left-0 z-30 flex-col bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 p-4 transition-all duration-300 shadow-sm dark:shadow-none ${
        sidebarCollapsed ? 'w-[72px] p-2.5' : 'w-64 p-4'
      }`}
    >
      {content}
    </aside>
  )
}

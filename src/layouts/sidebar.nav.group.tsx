// Component hiển thị nhóm điều hướng thanh bên Admin, các mục menu và hiệu ứng kích hoạt.
import { Link } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import type { NavGroup } from '@/layouts/sidebar.nav.config'
import { navItemToPath } from '@/routes/navigation'
import { SidebarBranchedSubmenu } from '@/layouts/sidebar.branched.submenu'

interface SidebarNavGroupProps {
  group: NavGroup
  groupIdx: number
  sidebarCollapsed: boolean
  mobile: boolean
  activeNavItem: string
  expandedItem: string | null
  onNavigate: (id: string) => void
  onToggleExpand: (id: string) => void
}

export function SidebarNavGroup({
  group,
  groupIdx,
  sidebarCollapsed,
  mobile,
  activeNavItem,
  expandedItem,
  onNavigate,
  onToggleExpand,
}: SidebarNavGroupProps) {
  const isCollapsedMode = sidebarCollapsed && !mobile

  return (
    <div className="space-y-1">
      {groupIdx > 0 && (
        <div className="pt-1.5 my-1 border-t border-slate-200/70 dark:border-slate-800/70" />
      )}
      <div
        className={`overflow-hidden transition-[max-height,opacity,padding] duration-300 ease-in-out whitespace-nowrap truncate ${
          isCollapsedMode
            ? 'max-h-0 opacity-0 pointer-events-none py-0'
            : groupIdx > 0
            ? 'max-h-8 opacity-100 pt-1 pb-1 px-3 text-[10.5px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500'
            : 'max-h-0 opacity-0 py-0'
        }`}
      >
        {group.label}
      </div>
      <div className="space-y-1">
        {group.items.map((item) => {
          const Icon = item.icon
          const hasChildren = Boolean(item.children && item.children.length > 0)
          const isExactActive = activeNavItem === item.id
          const isChildActive = Boolean(item.children && item.children.some((c) => activeNavItem === c.id))
          const isExpanded = expandedItem === item.id
          const isLeafActive = isExactActive && !hasChildren
          const showActiveIndicator = isLeafActive || (isCollapsedMode && isChildActive)
          const showActiveBg = isLeafActive || (isCollapsedMode && isChildActive)
          const showSolidIcon = isLeafActive || (isCollapsedMode && isChildActive)

          const navButtonContent = (
            <>
              {showActiveIndicator && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-blue-600 dark:bg-blue-500 rounded-r-full" />
              )}

              <div className="w-8 h-8 shrink-0 flex items-center justify-center">
                <div
                  className={`w-7.5 h-7.5 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                    showSolidIcon
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                      : isChildActive
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                      : 'bg-slate-100/90 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 group-hover:bg-slate-200/80 dark:group-hover:bg-slate-700/80 group-hover:text-slate-700 dark:group-hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div
                className={`flex-1 min-w-0 flex items-center justify-between overflow-hidden transition-[max-width,opacity,margin] duration-300 ease-in-out ${
                  isCollapsedMode ? 'max-w-0 opacity-0 ml-0 pointer-events-none' : 'max-w-full opacity-100 ml-2'
                }`}
              >
                <span
                  className={`overflow-hidden truncate whitespace-nowrap text-[12.5px] sm:text-[13px] tracking-tight ${
                    isLeafActive
                      ? 'text-blue-600 dark:text-blue-400 font-bold'
                      : isChildActive
                      ? 'text-blue-600 dark:text-blue-400 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 font-medium group-hover:text-slate-900 dark:group-hover:text-slate-200'
                  }`}
                >
                  {item.label}
                </span>

                <div className="flex items-center gap-1 shrink-0 pl-1">
                  {item.kicker && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/20">
                      {item.kicker}
                    </span>
                  )}
                  {hasChildren && (
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                        isExpanded
                          ? 'rotate-0 text-blue-600 dark:text-blue-400 opacity-100'
                          : `-rotate-90 ${isChildActive ? 'text-blue-500 dark:text-blue-400 opacity-90' : 'text-slate-400 opacity-60'}`
                      }`}
                    />
                  )}
                </div>
              </div>
            </>
          )

          const itemContainerClass = `group relative w-full flex items-center h-10 px-1 rounded-xl text-xs sm:text-[13px] transition-colors duration-200 cursor-pointer overflow-hidden ${
            showActiveBg
              ? 'bg-blue-50/90 dark:bg-blue-950/40'
              : 'hover:bg-slate-100/80 dark:hover:bg-slate-800/60'
          }`

          return (
            <div key={item.id} className="space-y-0.5">
              {hasChildren ? (
                <button
                  className={itemContainerClass}
                  onClick={() => onToggleExpand(item.id)}
                  type="button"
                  title={item.label}
                >
                  {navButtonContent}
                </button>
              ) : (
                <Link
                  to={navItemToPath(item.id)}
                  onClick={() => onNavigate(item.id)}
                  className={itemContainerClass}
                  title={item.label}
                >
                  {navButtonContent}
                </Link>
              )}

              {hasChildren && (
                <div
                  className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
                    isExpanded && !isCollapsedMode
                      ? 'grid-rows-[1fr] opacity-100'
                      : 'grid-rows-[0fr] opacity-0 pointer-events-none'
                  }`}
                >
                  <div className="min-h-0 overflow-hidden w-full">
                    <SidebarBranchedSubmenu
                      children={item.children!}
                      activeNavItem={activeNavItem}
                      isExpanded={isExpanded && !isCollapsedMode}
                      onNavigate={onNavigate}
                    />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}


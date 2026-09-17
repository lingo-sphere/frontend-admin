// Component hiển thị nhóm điều hướng thanh bên Admin, các mục menu và hiệu ứng kích hoạt.
import { ChevronDown, ChevronRight } from 'lucide-react'
import type { NavGroup } from '@/layouts/sidebar.nav.config'

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
  return (
    <div className="space-y-1">
      {groupIdx > 0 && (
        <div className="pt-1.5 my-1 border-t border-slate-200/70 dark:border-slate-800/70" />
      )}
      {(!sidebarCollapsed || mobile) && groupIdx > 0 && (
        <div className="pt-0.5 pb-1 px-3 text-[10.5px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          {group.label}
        </div>
      )}
      <div className="space-y-1">
        {group.items.map((item) => {
          const Icon = item.icon
          const isActive =
            activeNavItem === item.id ||
            Boolean(item.children && item.children.some((c) => activeNavItem === c.id))
          const isExactActive = activeNavItem === item.id
          const hasChildren = Boolean(item.children && item.children.length > 0)
          const isExpanded = expandedItem === item.id
          const isItemActive = (isExactActive && !hasChildren) || (isActive && hasChildren)

          if (sidebarCollapsed && !mobile) {
            return (
              <button
                key={item.id}
                className={`relative w-full flex items-center justify-center p-1.5 rounded-2xl transition-all cursor-pointer ${
                  isItemActive
                    ? 'bg-blue-50/90 dark:bg-blue-950/40'
                    : 'hover:bg-slate-100/80 dark:hover:bg-slate-800/60'
                }`}
                onClick={
                  hasChildren
                    ? () => onToggleExpand(item.id)
                    : () => onNavigate(item.id)
                }
                type="button"
                title={item.label}
              >
                {isItemActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-blue-600 dark:bg-blue-500 rounded-r-full" />
                )}
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                    isItemActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                      : 'bg-slate-100/90 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  <Icon className="w-4.5 h-4.5" />
                </div>
              </button>
            )
          }

          return (
            <div key={item.id} className="space-y-0.5">
              <button
                className={`group relative w-full flex items-center justify-between px-2.5 py-2 rounded-2xl text-xs sm:text-[13px] transition-all cursor-pointer ${
                  isItemActive
                    ? 'bg-blue-50/90 dark:bg-blue-950/40'
                    : 'hover:bg-slate-100/80 dark:hover:bg-slate-800/60'
                }`}
                onClick={
                  hasChildren
                    ? () => onToggleExpand(item.id)
                    : () => onNavigate(item.id)
                }
                type="button"
              >
                {isItemActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-blue-600 dark:bg-blue-500 rounded-r-full" />
                )}

                <div className="flex items-center gap-3 min-w-0 pl-1">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                      isItemActive
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                        : 'bg-slate-100/90 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 group-hover:bg-slate-200/80 dark:group-hover:bg-slate-700/80 group-hover:text-slate-700 dark:group-hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span
                    className={`truncate ${
                      isItemActive
                        ? 'text-blue-600 dark:text-blue-400 font-bold'
                        : 'text-slate-600 dark:text-slate-400 font-medium group-hover:text-slate-900 dark:group-hover:text-slate-200'
                    }`}
                  >
                    {item.label}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 pr-1">
                  {item.kicker && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/20">
                      {item.kicker}
                    </span>
                  )}
                  {hasChildren && (
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-300 ease-out ${
                        isExpanded
                          ? 'rotate-0 text-blue-600 dark:text-blue-400 opacity-100'
                          : `-rotate-90 ${isItemActive ? 'text-blue-500 dark:text-blue-400 opacity-90' : 'text-slate-400 opacity-60'}`
                      }`}
                    />
                  )}
                </div>
              </button>

              {hasChildren && (
                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isExpanded
                      ? 'grid-rows-[1fr] opacity-100 mt-1 mb-1'
                      : 'grid-rows-[0fr] opacity-0 pointer-events-none'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="ml-4 pl-3 border-l-2 border-slate-200 dark:border-slate-800 space-y-0.5 py-0.5">
                      {item.children!.map((child) => {
                        const isChildActive = activeNavItem === child.id

                        return (
                          <button
                            key={child.id}
                            onClick={() => onNavigate(child.id)}
                            className={`relative w-full flex items-center justify-between pl-3 pr-2.5 py-1.5 rounded-xl text-xs transition-all cursor-pointer ${
                              isChildActive
                                ? 'text-blue-600 dark:text-blue-400 bg-blue-50/90 dark:bg-blue-950/50 font-bold'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/40 font-medium'
                            }`}
                            type="button"
                          >
                            {isChildActive && (
                              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-blue-600 dark:bg-blue-500 rounded-r-full" />
                            )}
                            <span className="truncate">{child.label}</span>
                            {isChildActive && (
                              <ChevronRight className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                            )}
                          </button>
                        )
                      })}
                    </div>
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

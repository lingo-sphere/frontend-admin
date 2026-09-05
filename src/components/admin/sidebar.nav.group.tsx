/**
 * @file sidebar.nav.group.tsx
 * @description Component rendering sidebar navigation group, menu items, kickers, and nested sub-items
 */

import React from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import type { NavGroup } from './sidebar.nav.config'

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
            (item.children &&
              item.children.some((c) => activeNavItem === c.id))
          const isExactActive = activeNavItem === item.id
          const hasChildren = Boolean(item.children && item.children.length > 0)
          const isExpanded = expandedItem === item.id

          if (sidebarCollapsed && !mobile) {
            return (
              <button
                key={item.id}
                className={`w-full flex items-center justify-center p-2.5 rounded-xl transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
                onClick={
                  hasChildren
                    ? () => onToggleExpand(item.id)
                    : () => onNavigate(item.id)
                }
                type="button"
                title={item.label}
              >
                <Icon className="w-4.5 h-4.5" />
              </button>
            )
          }

          return (
            <div key={item.id} className="space-y-0.5">
              <button
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-[13px] font-semibold transition-all cursor-pointer ${
                  isExactActive && !hasChildren
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                    : isActive && hasChildren
                    ? 'text-indigo-600 dark:text-indigo-300 bg-indigo-50/70 dark:bg-indigo-500/10 font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-slate-800/60'
                }`}
                onClick={
                  hasChildren
                    ? () => onToggleExpand(item.id)
                    : () => onNavigate(item.id)
                }
                type="button"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon
                    className={`w-4.5 h-4.5 shrink-0 ${
                      isExactActive && !hasChildren
                        ? 'text-white'
                        : isActive && hasChildren
                        ? 'text-indigo-600 dark:text-indigo-400'
                        : 'text-slate-400 dark:text-slate-500'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {item.kicker && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/20">
                      {item.kicker}
                    </span>
                  )}
                  {hasChildren && (
                    <ChevronDown
                      className={`w-3.5 h-3.5 opacity-60 transition-transform duration-300 ease-out ${
                        isExpanded ? 'rotate-0 text-indigo-600 dark:text-indigo-400 opacity-100' : '-rotate-90'
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
                            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                              isChildActive
                                ? 'text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/50 font-bold'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/40'
                            }`}
                            type="button"
                          >
                            <span className="truncate">{child.label}</span>
                            {isChildActive && (
                              <ChevronRight className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
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

/**
 * @file role.module.permission.group.tsx
 * @description Nhóm danh sách quyền hạn (Permissions) theo module trong RoleEditModal kèm toggle mở rộng và chọn tất cả
 */

import { ChevronDown, ChevronRight } from 'lucide-react'
import type { Permission } from '@/types/api.types'

interface RoleModulePermissionGroupProps {
  moduleName: string
  modulePermissions: Permission[]
  selectedPermIds: string[]
  isExpanded: boolean
  permFilter: string
  onToggleExpand: () => void
  onToggleModuleAll: (currentChecked: boolean) => void
  onTogglePerm: (permId: string) => void
}

const getMethodBadgeClass = (method?: string) => {
  switch (method?.toUpperCase()) {
    case 'POST':
      return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20'
    case 'PUT':
    case 'PATCH':
      return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20'
    case 'DELETE':
      return 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20'
    case 'GET':
    default:
      return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20'
  }
}

export function RoleModulePermissionGroup({
  moduleName,
  modulePermissions,
  selectedPermIds,
  isExpanded,
  permFilter,
  onToggleExpand,
  onToggleModuleAll,
  onTogglePerm,
}: RoleModulePermissionGroupProps) {
  const filteredModPerms = modulePermissions.filter((p) => {
    if (!permFilter) return true
    const q = permFilter.toLowerCase()
    return (
      p.name.toLowerCase().includes(q) ||
      (p.api_path || '').toLowerCase().includes(q) ||
      moduleName.toLowerCase().includes(q)
    )
  })

  if (filteredModPerms.length === 0) return null

  const modPermIds = modulePermissions.map((p) => p._id)
  const selectedInMod = modPermIds.filter((id) => selectedPermIds.includes(id)).length
  const isAllSelected = modPermIds.length > 0 && selectedInMod === modPermIds.length

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-2xs">
      <div className="flex items-center justify-between px-4 py-3 bg-slate-100/70 dark:bg-slate-800/60 select-none">
        <button
          type="button"
          onClick={onToggleExpand}
          className="flex items-center gap-2 text-left flex-1 font-bold text-xs text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-slate-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-slate-500" />
          )}
          <span className="tracking-wide">{moduleName}</span>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
            {selectedInMod}/{modulePermissions.length}
          </span>
        </button>

        <div className="flex items-center gap-2 pl-3">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:inline">
            {isAllSelected ? 'Bỏ chọn hết' : 'Chọn tất cả'}
          </span>
          <button
            type="button"
            onClick={() => onToggleModuleAll(isAllSelected)}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              isAllSelected ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                isAllSelected ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800/80">
          {filteredModPerms.map((perm) => {
            const isChecked = selectedPermIds.includes(perm._id)

            return (
              <div
                key={perm._id}
                onClick={() => onTogglePerm(perm._id)}
                className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                  isChecked
                    ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800/60 shadow-2xs'
                    : 'bg-slate-50/50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onTogglePerm(perm._id)
                  }}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none mt-0.5 ${
                    isChecked ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                      isChecked ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>

                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-tight">
                    {perm.name}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-black border ${getMethodBadgeClass(
                        perm.method
                      )}`}
                    >
                      {perm.method || 'GET'}
                    </span>
                    <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {perm.api_path || '/'}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

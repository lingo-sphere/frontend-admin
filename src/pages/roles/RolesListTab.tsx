import { useState } from 'react'
import { Shield, Edit2, Trash2 } from 'lucide-react'
import type { Role, Permission } from '@/types/api.types'

interface RoleFormData {
  name: string
  description: string
  permissions: string[]
}

interface RolesListTabProps {
  roles: Role[]
  permissions: Permission[]
  onOpenEditRole: (role: Role) => void
  onDeleteRole: (roleId: string) => void
}

export function RolesListTab({
  roles,
  onOpenEditRole,
  onDeleteRole,
}: RolesListTabProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {roles.map((role) => {
        const permCount = role.permissions?.length || 0

        return (
          <div
            key={role._id}
            className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all group"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-extrabold border ${
                    role.name === 'SUPER_ADMIN' || role.name === 'ADMIN'
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      : role.name === 'INSTRUCTOR'
                        ? 'bg-teal-500/10 text-teal-400 border-teal-500/20'
                        : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                  }`}
                >
                  {role.name}
                </span>

                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Hoạt động
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-100">
                {role.description || role.name}
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Vai trò kiểm soát các quyền truy cập tài nguyên thuộc hệ thống LingoSphere.
              </p>

              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 my-4 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Số lượng quyền hạn:</span>
                  <span className="font-bold text-teal-300">
                    {role.name === 'SUPER_ADMIN' || role.name === 'ADMIN'
                      ? 'Toàn quyền (*)'
                      : `${permCount} Permissions`}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-2">
              <span className="text-[11px] text-slate-500 font-mono">
                ID: {role._id.slice(-6)}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onOpenEditRole(role)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="Chỉnh sửa quyền hạn"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                {role.name !== 'SUPER_ADMIN' && role.name !== 'ADMIN' && (
                  <button
                    onClick={() => onDeleteRole(role._id)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                    title="Xóa vai trò"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

import { Shield, GraduationCap, Edit2, Ban, CheckCircle } from 'lucide-react'
import type { AdminUser } from '@/helpers/admin-user.helper'
import type { DataTableColumn } from '@/components/common/DataTable'

interface GetAdminUserColumnsOptions {
  onEditUser: (userId: string) => void
  onOpenStatusModal: (user: AdminUser, action: 'ban' | 'unban') => void
}

export function getAdminUserColumns({
  onEditUser,
  onOpenStatusModal,
}: GetAdminUserColumnsOptions): DataTableColumn<AdminUser>[] {
  return [
    {
      key: 'user',
      title: 'Quản trị viên / Giảng viên',
      render: (user) => (
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => onEditUser(user.id)}
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-white text-xs shrink-0">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-full h-full rounded-xl object-cover"
              />
            ) : (
              user.name.slice(0, 2).toUpperCase()
            )}
          </div>
          <div>
            <p className="font-semibold text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              {user.name}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      title: 'Vai trò phân quyền',
      render: (user) => (
        <>
          {user.role === 'ADMIN' ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
              <Shield className="w-3 h-3" />
              <span>Quản trị viên</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
              <GraduationCap className="w-3 h-3" />
              <span>Giảng viên</span>
            </span>
          )}
        </>
      ),
    },
    {
      key: 'phone',
      title: 'Số điện thoại',
      render: (user) => (
        <span className="text-xs text-slate-600 dark:text-slate-400">
          {user.phone || '—'}
        </span>
      ),
    },
    {
      key: 'created_at',
      title: 'Ngày tạo',
      render: (user) => (
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {user.created_at ? new Date(user.created_at).toLocaleDateString('vi-VN') : '—'}
        </span>
      ),
    },
    {
      key: 'status',
      title: 'Trạng thái',
      render: (user) => (
        <span
          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
            user.is_active
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
          }`}
        >
          {user.is_active ? 'Hoạt động' : 'Tạm khóa'}
        </span>
      ),
    },
    {
      key: 'actions',
      title: 'Thao tác',
      align: 'right',
      render: (user) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => onEditUser(user.id)}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            title="Chỉnh sửa tài khoản"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          {user.is_active ? (
            <button
              onClick={() => onOpenStatusModal(user, 'ban')}
              className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 dark:text-rose-400 transition-colors cursor-pointer"
              title="Khóa tài khoản"
            >
              <Ban className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={() => onOpenStatusModal(user, 'unban')}
              className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 dark:text-emerald-400 transition-colors cursor-pointer"
              title="Mở khóa tài khoản"
            >
              <CheckCircle className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ),
    },
  ]
}

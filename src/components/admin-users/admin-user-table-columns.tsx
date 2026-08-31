import { Shield, GraduationCap, Edit2, Ban, CheckCircle } from 'lucide-react'
import type { AdminUser } from '@/helpers/admin-user.helper'
import type { DataTableColumn } from '@/components/common/DataTable'
import { Popconfirm } from '@/components/common/Popconfirm'

interface GetAdminUserColumnsOptions {
  onEditUser: (userId: string) => void
  onOpenStatusModal: (user: AdminUser, action: 'ban' | 'unban') => Promise<void> | void
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
            className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 transition-colors cursor-pointer"
            title="Chỉnh sửa tài khoản"
            type="button"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          {user.is_active ? (
            <Popconfirm
              title="Khóa tài khoản này?"
              description="Tài khoản này sẽ bị tạm dừng truy cập vào hệ thống quản trị."
              okText="Khóa tài khoản"
              cancelText="Hủy"
              okType="danger"
              placement="topRight"
              onConfirm={() => onOpenStatusModal(user, 'ban')}
            >
              <button
                className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 transition-colors cursor-pointer"
                title="Khóa tài khoản"
                type="button"
              >
                <Ban className="w-3.5 h-3.5" />
              </button>
            </Popconfirm>
          ) : (
            <Popconfirm
              title="Mở khóa tài khoản này?"
              description="Tài khoản này sẽ có thể đăng nhập lại vào hệ thống quản trị."
              okText="Mở khóa"
              cancelText="Hủy"
              okType="primary"
              placement="topRight"
              onConfirm={() => onOpenStatusModal(user, 'unban')}
            >
              <button
                className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 transition-colors cursor-pointer"
                title="Mở khóa tài khoản"
                type="button"
              >
                <CheckCircle className="w-3.5 h-3.5" />
              </button>
            </Popconfirm>
          )}
        </div>
      ),
    },
  ]
}

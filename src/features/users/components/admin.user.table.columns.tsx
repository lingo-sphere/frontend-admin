/**
 * @file admin.user.table.columns.tsx
 * @description Component giao diện admin-user-table-columns phục vụ khu vực Quản trị Admin
 */

import { Shield, GraduationCap, Edit2, Ban, CheckCircle } from 'lucide-react'
import type { AdminUser } from '@/features/users/helpers/admin.user.helper'
import type { DataTableColumn } from '@/components/data.table'
import { Popconfirm } from '@/components/popconfirm'

interface GetAdminUserColumnsOptions {
  isVi?: boolean
  onEditUser: (userId: string) => void
  onOpenStatusModal: (user: AdminUser, action: 'ban' | 'unban') => Promise<void> | void
}

export function getAdminUserColumns({
  isVi = true,
  onEditUser,
  onOpenStatusModal,
}: GetAdminUserColumnsOptions): DataTableColumn<AdminUser>[] {
  return [
    {
      key: 'user',
      title: isVi ? 'Quản trị viên / Giảng viên' : 'Admin / Teacher',
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
      title: isVi ? 'Vai trò phân quyền' : 'Assigned Role',
      render: (user) => (
        <>
          {user.role === 'ADMIN' ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
              <Shield className="w-3 h-3" />
              <span>{isVi ? 'Quản trị viên' : 'Administrator'}</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
              <GraduationCap className="w-3 h-3" />
              <span>{isVi ? 'Giảng viên' : 'Teacher'}</span>
            </span>
          )}
        </>
      ),
    },
    {
      key: 'phone',
      title: isVi ? 'Số điện thoại' : 'Phone Number',
      render: (user) => (
        <span className="text-xs text-slate-600 dark:text-slate-400">
          {user.phone || '—'}
        </span>
      ),
    },
    {
      key: 'created_at',
      title: isVi ? 'Ngày tạo' : 'Created At',
      sortable: true,
      render: (user) => (
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {user.created_at
            ? new Date(user.created_at).toLocaleDateString(isVi ? 'vi-VN' : 'en-US')
            : '—'}
        </span>
      ),
    },
    {
      key: 'status',
      title: isVi ? 'Trạng thái' : 'Status',
      render: (user) => (
        <span
          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
            user.is_active
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
          }`}
        >
          {user.is_active ? (isVi ? 'Hoạt động' : 'Active') : (isVi ? 'Tạm khóa' : 'Blocked')}
        </span>
      ),
    },
    {
      key: 'actions',
      title: isVi ? 'Thao tác' : 'Actions',
      align: 'right',
      render: (user) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => onEditUser(user.id)}
            className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 transition-colors cursor-pointer"
            title={isVi ? 'Chỉnh sửa tài khoản' : 'Edit account'}
            type="button"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          {user.is_active ? (
            <Popconfirm
              title={isVi ? 'Khóa tài khoản này?' : 'Block this account?'}
              description={
                isVi
                  ? 'Tài khoản này sẽ bị tạm dừng truy cập vào hệ thống quản trị.'
                  : 'This account will be suspended from accessing the admin console.'
              }
              okText={isVi ? 'Khóa tài khoản' : 'Block'}
              cancelText={isVi ? 'Hủy' : 'Cancel'}
              okType="danger"
              placement="topRight"
              onConfirm={() => onOpenStatusModal(user, 'ban')}
            >
              <button
                className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 transition-colors cursor-pointer"
                title={isVi ? 'Khóa tài khoản' : 'Block account'}
                type="button"
              >
                <Ban className="w-3.5 h-3.5" />
              </button>
            </Popconfirm>
          ) : (
            <Popconfirm
              title={isVi ? 'Mở khóa tài khoản này?' : 'Unblock this account?'}
              description={
                isVi
                  ? 'Tài khoản này sẽ có thể đăng nhập lại vào hệ thống quản trị.'
                  : 'This account will be able to log into the admin console again.'
              }
              okText={isVi ? 'Mở khóa' : 'Unblock'}
              cancelText={isVi ? 'Hủy' : 'Cancel'}
              okType="primary"
              placement="topRight"
              onConfirm={() => onOpenStatusModal(user, 'unban')}
            >
              <button
                className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 transition-colors cursor-pointer"
                title={isVi ? 'Mở khóa tài khoản' : 'Unblock account'}
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

// Định nghĩa cấu hình các cột hiển thị cho bảng quản trị viên và giảng viên.

import { Shield, GraduationCap, Ban, CheckCircle } from 'lucide-react'
import type { AdminUser } from '@/features/users/helpers/admin.user.helper'
import type { DataTableColumn } from '@/components/data.table'
import { TableRowActions, ActionPopconfirmButton, renderTableDate } from '@/components/table.row.actions'

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
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors truncate" title={user.name}>
              {user.name}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate" title={user.email}>{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      title: isVi ? 'Vai trò phân quyền' : 'Assigned Role',
      width: 170,
      align: 'center',
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
      align: 'center',
      render: (user) => (
        <span className="text-xs text-slate-600 dark:text-slate-400">
          {user.phone || '—'}
        </span>
      ),
    },
    {
      key: 'created_at',
      title: isVi ? 'Ngày tạo' : 'Created At',
      width: 150,
      align: 'center',
      sortable: true,
      render: (user) => renderTableDate(user.created_at),
    },
    {
      key: 'status',
      title: isVi ? 'Trạng thái' : 'Status',
      width: 120,
      align: 'center',
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
      width: 100,
      align: 'center',
      render: (user) => (
        <TableRowActions
          isVi={isVi}
          onEdit={() => onEditUser(user.id)}
          extraActions={
            <ActionPopconfirmButton
              title={user.is_active ? (isVi ? 'Khóa tài khoản này?' : 'Block this account?') : (isVi ? 'Mở khóa tài khoản này?' : 'Unblock this account?')}
              description={
                user.is_active
                  ? (isVi ? 'Tài khoản này sẽ bị tạm dừng truy cập vào hệ thống quản trị.' : 'This account will be suspended from accessing the admin console.')
                  : (isVi ? 'Tài khoản này sẽ có thể đăng nhập lại vào hệ thống quản trị.' : 'This account will be able to log into the admin console again.')
              }
              okText={user.is_active ? (isVi ? 'Khóa tài khoản' : 'Block') : (isVi ? 'Mở khóa' : 'Unblock')}
              cancelText={isVi ? 'Hủy' : 'Cancel'}
              okType={user.is_active ? 'danger' : 'primary'}
              tooltipTitle={user.is_active ? (isVi ? 'Khóa tài khoản' : 'Block account') : (isVi ? 'Mở khóa tài khoản' : 'Unblock account')}
              danger={user.is_active}
              icon={user.is_active ? <Ban size={14} /> : <CheckCircle size={14} />}
              className={!user.is_active ? 'text-emerald-600 hover:text-emerald-700 dark:text-emerald-400' : undefined}
              onConfirm={() => onOpenStatusModal(user, user.is_active ? 'ban' : 'unban')}
            />
          }
        />
      ),
    },
  ]
}

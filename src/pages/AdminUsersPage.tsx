import { useState, useMemo, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, RotateCcw } from 'lucide-react'
import { DataTable } from '@/components/common/DataTable'
import { useAdminStore } from '@/store/admin-store'
import { userService } from '@/services/user.service'
import { toast } from '@/store/toast-store'
import type { UserProfile } from '@/types/api.types'

import type { AdminUser, FilterRole, FilterStatus } from '@/helpers/admin-user.helper'
import { AdminUserStatsOverview } from '@/components/admin-users/AdminUserStatsOverview'
import { AdminUserFilterBar } from '@/components/admin-users/AdminUserFilterBar'
import { getAdminUserColumns } from '@/components/admin-users/admin-user-table-columns'

export function AdminUsersPage() {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'
  const setActiveNavItem = useAdminStore((state) => state.setActiveNavItem)

  const [admins, setAdmins] = useState<AdminUser[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [selectedRole, setSelectedRole] = useState<FilterRole>('ALL')
  const [selectedStatus, setSelectedStatus] = useState<FilterStatus>('ALL')
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(10)

  const fetchAdmins = useCallback(async () => {
    setIsLoading(true)
    try {
      const [adminRes, teacherRes] = await Promise.allSettled([
        userService.getAllUsers({ role: 'ADMIN', limit: 50 }),
        userService.getAllUsers({ role: 'INSTRUCTOR', limit: 50 }),
      ])

      const items: UserProfile[] = []
      if (adminRes.status === 'fulfilled' && adminRes.value) {
        const adminList = Array.isArray(adminRes.value) ? adminRes.value : (adminRes.value.result || [])
        items.push(...adminList)
      }
      if (teacherRes.status === 'fulfilled' && teacherRes.value) {
        const teacherList = Array.isArray(teacherRes.value) ? teacherRes.value : (teacherRes.value.result || [])
        items.push(...teacherList)
      }

      const mapped: AdminUser[] = items.map((u: UserProfile) => ({
        id: u._id || u.user_id,
        name: u.full_name || u.email.split('@')[0],
        email: u.email,
        role: u.role === 'INSTRUCTOR' ? 'TEACHER' : 'ADMIN',
        is_active: u.status === 'ACTIVE',
        avatar: u.avatar_url,
        created_at: u.created_at || new Date().toISOString(),
        last_active: 'Vừa xong',
        phone: u.phone_number,
      }))
      setAdmins(mapped)
    } catch (err) {
      console.warn('Error fetching admin users:', err)
      setAdmins([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAdmins()
  }, [fetchAdmins])

  const filteredAdmins = useMemo(() => {
    return admins.filter((a) => {
      const matchSearch =
        a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.email.toLowerCase().includes(searchTerm.toLowerCase())
      const matchRole = selectedRole === 'ALL' || a.role === selectedRole
      const matchStatus =
        selectedStatus === 'ALL' ||
        (selectedStatus === 'ACTIVE' && a.is_active) ||
        (selectedStatus === 'INACTIVE' && !a.is_active)

      return matchSearch && matchRole && matchStatus
    })
  }, [admins, searchTerm, selectedRole, selectedStatus])

  const paginatedAdmins = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredAdmins.slice(start, start + pageSize)
  }, [filteredAdmins, currentPage, pageSize])

  const stats = useMemo(() => {
    return {
      total: admins.length,
      admins: admins.filter((a) => a.role === 'ADMIN').length,
      teachers: admins.filter((a) => a.role === 'TEACHER').length,
      active: admins.filter((a) => a.is_active).length,
    }
  }, [admins])

  const handleStatusChange = async (user: AdminUser, action: 'ban' | 'unban') => {
    const newStatus = action === 'ban' ? 'BLOCKED' : 'ACTIVE'
    try {
      await userService.updateUserStatus(user.id, newStatus)
      setAdmins((prev) =>
        prev.map((a) =>
          a.id === user.id ? { ...a, is_active: action === 'unban' } : a
        )
      )
      toast.success(
        action === 'ban'
          ? `Đã khóa tài khoản quản trị ${user.email}`
          : `Đã mở khóa tài khoản ${user.email}`
      )
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Cập nhật trạng thái thất bại'
      toast.error(msg)
    }
  }

  const handleResetFilters = () => {
    setSearchTerm('')
    setSelectedRole('ALL')
    setSelectedStatus('ALL')
    setCurrentPage(1)
  }

  const columns = useMemo(() => {
    return getAdminUserColumns({
      isVi,
      onEditUser: (userId) => setActiveNavItem(`admin-user-edit:${userId}`),
      onOpenStatusModal: handleStatusChange,
    })
  }, [isVi, setActiveNavItem])

  return (
    <div className="space-y-6">
      <AdminUserStatsOverview stats={stats} />

      <DataTable<AdminUser>
        title={isVi ? 'Quản Trị Viên & Giảng Viên' : 'Admins & Teachers'}
        subtitle={
          isVi
            ? 'Quản lý đội ngũ quản trị, cấp tài khoản giảng viên và phân quyền vận hành'
            : 'Manage administrative staff, grant instructor access, and assign operation roles'
        }
        isLoading={isLoading}
        columns={columns}
        data={paginatedAdmins}
        rowKey={(a) => a.id}
        onResetFilters={handleResetFilters}
        extraActions={
          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchAdmins}
              className="flex items-center gap-2 h-10 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer shadow-2xs"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-500' : ''}`} />
              <span>{isVi ? 'Làm mới' : 'Refresh'}</span>
            </button>
            <button
              onClick={() => setActiveNavItem('admin-user-create')}
              className="flex items-center gap-2 h-10 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isVi ? 'Thêm Thành Viên Mới' : 'Add New Member'}</span>
            </button>
          </div>
        }
        filterSlot={
          <AdminUserFilterBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedRole={selectedRole}
            onRoleChange={setSelectedRole}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
          />
        }
        pagination={{
          currentPage,
          pageSize,
          totalItems: filteredAdmins.length,
          onPageChange: setCurrentPage,
          onPageSizeChange: (limit) => {
            setPageSize(limit)
            setCurrentPage(1)
          },
        }}
      />
    </div>
  )
}

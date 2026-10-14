// Trang quản trị danh sách người dùng quản trị và giảng viên trong giao diện Admin.
import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Plus, RotateCcw } from 'lucide-react'
import { useReloadAnimation } from '@/hooks/use.reload.animation'
import { DataTable } from '@/components/data.table'
import { toast } from '@/store/toast.store'
import type { AdminUser, FilterRole, FilterStatus } from '@/features/users/helpers/admin.user.helper'
import { AdminUserStatsOverview } from '@/features/users/components/admin.user.stats.overview'
import { AdminUserFilterBar } from '@/features/users/components/admin.user.filter.bar'
import { getAdminUserColumns } from '@/features/users/components/admin.user.table.columns'
import { useAdminUsersQuery, useUpdateAdminUserStatusMutation } from '@/features/users/hooks/use.admin.users.query'

export function AdminUsersPage() {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'
  const navigate = useNavigate()

  const { data: admins = [], isLoading, refetch } = useAdminUsersQuery()
  const { isReloading: isRefreshing, trigger: handleRefresh } = useReloadAnimation(refetch)
  const { mutateAsync: updateStatusMutate } = useUpdateAdminUserStatusMutation()

  const [searchTerm, setSearchTerm] = useState<string>('')
  const [selectedRole, setSelectedRole] = useState<FilterRole>('ALL')
  const [selectedStatus, setSelectedStatus] = useState<FilterStatus>('ALL')
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(10)
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null)

  const filteredAdmins = useMemo(() => {
    const list = admins.filter((a) => {
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

    if (!sortKey || !sortOrder) return list

    return [...list].sort((a, b) => {
      if (sortKey === 'name') {
        const comp = a.name.localeCompare(b.name)
        return sortOrder === 'asc' ? comp : -comp
      }
      if (sortKey === 'created_at') {
        const timeA = new Date(a.created_at).getTime()
        const timeB = new Date(b.created_at).getTime()
        return sortOrder === 'asc' ? timeA - timeB : timeB - timeA
      }
      return 0
    })
  }, [admins, searchTerm, selectedRole, selectedStatus, sortKey, sortOrder])

  const paginatedAdmins = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredAdmins.slice(start, start + pageSize)
  }, [filteredAdmins, currentPage, pageSize])

  const stats = useMemo(() => {
    return {
      total: admins.length,
      admins: admins.filter((a) => a.role === 'ADMIN').length,
      teachers: admins.filter((a) => a.role === 'INSTRUCTOR').length,
      active: admins.filter((a) => a.is_active).length,
    }
  }, [admins])

  const handleStatusChange = async (user: AdminUser, action: 'ban' | 'unban') => {
    const newStatus = action === 'ban' ? 'BLOCKED' : 'ACTIVE'
    try {
      await updateStatusMutate({ userId: user.id, status: newStatus })
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

  const handleResetFilters = async () => {
    setSearchTerm('')
    setSelectedRole('ALL')
    setSelectedStatus('ALL')
    setSortKey(null)
    setSortOrder(null)
    setCurrentPage(1)
    await refetch()
    toast.success(isVi ? 'Đã đặt lại bộ lọc quản trị viên' : 'Admin filters reset')
  }

  const columns = useMemo(() => {
    return getAdminUserColumns({
      isVi,
      onEditUser: (userId) => navigate(`/admins/${userId}/edit`),
      onOpenStatusModal: handleStatusChange,
    })
  }, [isVi, navigate])

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
        sortKey={sortKey}
        sortOrder={sortOrder}
        onSortChange={(k, o) => {
          setSortKey(k)
          setSortOrder(o)
          setCurrentPage(1)
        }}
        onResetFilters={handleResetFilters}
        extraActions={
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => handleRefresh()}
              disabled={isRefreshing}
              className="flex items-center gap-2 h-10 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer shadow-2xs disabled:opacity-60"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-indigo-500' : ''}`} />
              <span>{isVi ? 'Làm mới' : 'Refresh'}</span>
            </button>
            <button
              onClick={() => navigate('/admins/create')}
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

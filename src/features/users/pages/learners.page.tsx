// Trang quản trị danh sách học viên trong giao diện Admin.
import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { RotateCcw } from 'lucide-react'
import { DataTable } from '@/components/data.table'
import { useAdminStore } from '@/store/admin.store'
import { toast } from '@/store/toast.store'
import type { User } from '@/features/users/types/learner.types'
import { useQueryClient } from '@tanstack/react-query'
import {
  useLearnersQuery,
  useUpdateLearnerStatusMutation,
  prefetchLearners,
} from '@/features/users/hooks/use.learners.query'

import type { FilterStatus, FilterPlan } from '@/features/users/helpers/learner.helper'
import { LearnerStatsOverview } from '@/features/users/components/learner.stats.overview'
import { LearnerFilterBar } from '@/features/users/components/learner.filter.bar'
import { getLearnerColumns } from '@/features/users/components/learner.table.columns'
import { LearnerAiQuotaModal } from '@/features/users/components/learner.ai.quota.modal'

export function LearnersPage() {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'
  const setActiveNavItem = useAdminStore((state) => state.setActiveNavItem)
  const queryClient = useQueryClient()

  const { data: users = [], isLoading, refetch } = useLearnersQuery()
  const { mutateAsync: updateLearnerStatus } = useUpdateLearnerStatusMutation()

  const [searchTerm, setSearchTerm] = useState<string>('')
  const [selectedStatus, setSelectedStatus] = useState<FilterStatus>('ALL')
  const [selectedPlan, setSelectedPlan] = useState<FilterPlan>('ALL')
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(10)
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null)

  const stats = useMemo(() => {
    return {
      total: users.length,
      active: users.filter((u) => u.status === 'ACTIVE').length,
      premium: users.filter((u) => u.is_premium).length,
      banned: users.filter((u) => u.status === 'BANNED').length,
    }
  }, [users])

  const filteredUsers = useMemo(() => {
    const list = users.filter((u) => {
      const matchSearch =
        u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
      const matchStatus =
        selectedStatus === 'ALL' || u.status === selectedStatus
      const matchPlan =
        selectedPlan === 'ALL' ||
        (selectedPlan === 'premium' && u.is_premium) ||
        (selectedPlan === 'free' && !u.is_premium)
      return matchSearch && matchStatus && matchPlan
    })

    if (!sortKey || !sortOrder) return list

    return [...list].sort((a, b) => {
      if (sortKey === 'user') {
        const nameA = (a.full_name || '').toLowerCase()
        const nameB = (b.full_name || '').toLowerCase()
        const comp = nameA.localeCompare(nameB)
        return sortOrder === 'asc' ? comp : -comp
      }
      return 0
    })
  }, [users, searchTerm, selectedStatus, selectedPlan, sortKey, sortOrder])

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredUsers.slice(start, start + pageSize)
  }, [filteredUsers, currentPage, pageSize])

  const handleResetFilters = () => {
    setSearchTerm('')
    setSelectedStatus('ALL')
    setSelectedPlan('ALL')
    setSortKey(null)
    setSortOrder(null)
    setCurrentPage(1)
  }

  const handleStatusChange = async (user: User, action: 'ban' | 'unban') => {
    try {
      const newStatus = action === 'ban' ? 'BLOCKED' : 'ACTIVE'
      await updateLearnerStatus({ userId: user.id, status: newStatus })
      toast.success(
        action === 'ban'
          ? 'Đã khóa tài khoản học viên thành công!'
          : 'Đã mở khóa tài khoản học viên thành công!'
      )
    } catch {
      toast.error('Cập nhật trạng thái học viên thất bại')
    }
  }

  const [aiQuotaModalUser, setAiQuotaModalUser] = useState<User | null>(null)

  const columns = useMemo(() => {
    return getLearnerColumns({
      isVi,
      onViewProfile: (userId) => setActiveNavItem(`user-profile:${userId}`),
      onOpenStatusModal: handleStatusChange,
      onOpenAiQuotaModal: (u) => setAiQuotaModalUser(u),
    })
  }, [isVi, setActiveNavItem])

  return (
    <div className="space-y-6">
      <LearnerStatsOverview stats={stats} />

      <DataTable<User>
        title={isVi ? 'Quản Lý Học Viên' : 'Learner Management'}
        subtitle={
          isVi
            ? 'Theo dõi mục tiêu TOEIC, tiến trình học tập, XP và trạng thái tài khoản học viên'
            : 'Track TOEIC targets, learning progress, XP, and learner account statuses'
        }
        isLoading={isLoading}
        columns={columns}
        data={paginatedUsers}
        rowKey={(u) => u.id}
        sortKey={sortKey}
        sortOrder={sortOrder}
        onSortChange={(k, o) => {
          setSortKey(k)
          setSortOrder(o)
          setCurrentPage(1)
        }}
        onResetFilters={handleResetFilters}
        extraActions={
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 h-10 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer shadow-2xs"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-500' : ''}`} />
            <span>{isVi ? 'Làm mới' : 'Refresh'}</span>
          </button>
        }
        filterSlot={
          <LearnerFilterBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
            selectedPlan={selectedPlan}
            onPlanChange={setSelectedPlan}
          />
        }
        pagination={{
          currentPage,
          pageSize,
          totalItems: filteredUsers.length,
          onPageChange: setCurrentPage,
          onPageSizeChange: (limit) => {
            setPageSize(limit)
            setCurrentPage(1)
          },
          onPrefetchPage: (nextPage) => {
            prefetchLearners(queryClient, { page: nextPage, limit: pageSize, role: 'STUDENT' })
          },
        }}
      />

      <LearnerAiQuotaModal
        user={aiQuotaModalUser}
        isOpen={Boolean(aiQuotaModalUser)}
        onClose={() => setAiQuotaModalUser(null)}
        onSuccess={() => refetch()}
      />
    </div>
  )
}

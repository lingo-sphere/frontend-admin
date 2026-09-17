// Trang quản trị danh sách học viên trong giao diện Admin.
import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { RotateCcw } from 'lucide-react'
import { useReloadAnimation } from '@/hooks/use.reload.animation'
import { DataTable } from '@/components/data.table'
import { useNavigate } from 'react-router-dom'
import { toast } from '@/store/toast.store'
import type { User } from '@/features/users/types/learner.types'
import { useQueryClient } from '@tanstack/react-query'
import {
  useLearnersQuery,
  useUpdateLearnerStatusMutation,
  useResetLearnerDataMutation,
  prefetchLearners,
} from '@/features/users/hooks/use.learners.query'

import type { FilterStatus, FilterPlan } from '@/features/users/helpers/learner.helper'
import { LearnerStatsOverview } from '@/features/users/components/learner.stats.overview'
import { LearnerFilterBar } from '@/features/users/components/learner.filter.bar'
import { getLearnerColumns } from '@/features/users/components/learner.table.columns'
import { LearnerAiQuotaModal } from '@/features/users/components/learner.ai.quota.modal'
import { useDebounce } from '@/hooks/use.debounce'

export function LearnersPage() {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [searchTerm, setSearchTerm] = useState<string>('')
  const debouncedSearch = useDebounce(searchTerm, 300)
  const [selectedStatus, setSelectedStatus] = useState<FilterStatus>('ALL')
  const [selectedPlan, setSelectedPlan] = useState<FilterPlan>('ALL')
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(10)
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null)

  const queryParams = useMemo(() => {
    return {
      role: 'STUDENT',
      page: currentPage,
      limit: pageSize,
      search: debouncedSearch.trim() || undefined,
      status: selectedStatus !== 'ALL' ? (selectedStatus === 'BANNED' ? 'BLOCKED' : selectedStatus) : undefined,
      plan: selectedPlan !== 'ALL' ? selectedPlan : undefined,
      sortBy: sortKey === 'user' ? 'full_name' : sortKey || undefined,
      sortOrder: sortOrder || undefined,
    }
  }, [currentPage, pageSize, debouncedSearch, selectedStatus, selectedPlan, sortKey, sortOrder])

  const { data, isLoading, refetch } = useLearnersQuery(queryParams)
  const { isReloading: isRefreshing, trigger: handleRefresh } = useReloadAnimation(refetch)
  const { mutateAsync: updateLearnerStatus } = useUpdateLearnerStatusMutation()
  const { mutateAsync: resetLearnerData } = useResetLearnerDataMutation()

  const stats = useMemo(() => {
    const list = data?.items || []
    return {
      total: data?.total || 0,
      active: list.filter((u) => u.status === 'ACTIVE').length,
      premium: list.filter((u) => u.is_premium).length,
      banned: list.filter((u) => u.status === 'BANNED').length,
    }
  }, [data])

  const handleResetFilters = async () => {
    setSearchTerm('')
    setSelectedStatus('ALL')
    setSelectedPlan('ALL')
    setSortKey(null)
    setSortOrder(null)
    setCurrentPage(1)
    await refetch()
    toast.success(isVi ? 'Đã đặt lại bộ lọc học viên' : 'Learner filters reset')
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

  const handleResetData = async (user: User) => {
    try {
      await resetLearnerData(user.id)
      toast.success(
        isVi
          ? `Đã khởi tạo lại dữ liệu học tập của học viên ${user.full_name || user.email} thành công!`
          : `Reset learning data for learner ${user.full_name || user.email} successfully!`
      )
      refetch()
    } catch {
      toast.error(isVi ? 'Khởi tạo lại dữ liệu học viên thất bại' : 'Failed to reset learner data')
    }
  }

  const [aiQuotaModalUser, setAiQuotaModalUser] = useState<User | null>(null)

  const columns = useMemo(() => {
    return getLearnerColumns({
      isVi,
      onViewProfile: (userId) => navigate(`/users/${userId}`),
      onOpenStatusModal: handleStatusChange,
      onOpenAiQuotaModal: (u) => setAiQuotaModalUser(u),
      onResetData: handleResetData,
    })
  }, [isVi, navigate, resetLearnerData])

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
        data={data?.items || []}
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
            onClick={() => handleRefresh()}
            disabled={isRefreshing}
            className="flex items-center gap-2 h-10 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer shadow-2xs disabled:opacity-60"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-indigo-500' : ''}`} />
            <span>{isVi ? 'Làm mới' : 'Refresh'}</span>
          </button>
        }
        filterSlot={
          <LearnerFilterBar
            searchTerm={searchTerm}
            onSearchChange={(term) => {
              setSearchTerm(term)
              setCurrentPage(1)
            }}
            selectedStatus={selectedStatus}
            onStatusChange={(status) => {
              setSelectedStatus(status)
              setCurrentPage(1)
            }}
            selectedPlan={selectedPlan}
            onPlanChange={(plan) => {
              setSelectedPlan(plan)
              setCurrentPage(1)
            }}
          />
        }
        pagination={{
          currentPage,
          pageSize,
          totalItems: data?.total || 0,
          onPageChange: setCurrentPage,
          onPageSizeChange: (limit) => {
            setPageSize(limit)
            setCurrentPage(1)
          },
          onPrefetchPage: (nextPage) => {
            prefetchLearners(queryClient, { ...queryParams, page: nextPage })
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

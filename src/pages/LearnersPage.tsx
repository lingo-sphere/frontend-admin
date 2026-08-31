import { useState, useMemo, useEffect, useCallback } from 'react'
import { RotateCcw } from 'lucide-react'
import { DataTable } from '@/components/common/DataTable'
import { ConfirmModal } from '@/components/common/ConfirmModal'
import { useAdminStore } from '@/store/admin-store'
import { userService } from '@/services/user.service'
import { toast } from '@/store/toast-store'
import type { User } from '@/data/users-data'
import type { UserProfile } from '@/types/api.types'

import type { FilterStatus, FilterPlan } from '@/helpers/learner.helper'
import { LearnerStatsOverview } from '@/components/learners/LearnerStatsOverview'
import { LearnerFilterBar } from '@/components/learners/LearnerFilterBar'
import { getLearnerColumns } from '@/components/learners/learner-table-columns'

export function LearnersPage() {
  const setActiveNavItem = useAdminStore((state) => state.setActiveNavItem)

  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [selectedStatus, setSelectedStatus] = useState<FilterStatus>('ALL')
  const [selectedPlan, setSelectedPlan] = useState<FilterPlan>('ALL')
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(10)

  const [modalUser, setModalUser] = useState<User | null>(null)
  const [modalAction, setModalAction] = useState<'ban' | 'unban' | null>(null)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false)

  const fetchLearners = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await userService.getAllUsers({
        role: 'STUDENT',
        limit: 100,
        search: searchTerm || undefined,
        status: selectedStatus !== 'ALL' ? selectedStatus : undefined,
        plan: selectedPlan !== 'ALL' ? selectedPlan : undefined,
      })

      const items: UserProfile[] = res?.result || []
      const mappedUsers: User[] = items.map((u: UserProfile) => ({
        id: u._id || u.user_id,
        email: u.email,
        full_name: u.full_name || u.email.split('@')[0],
        avatar_url: u.avatar_url,
        gender: u.gender || 'OTHER',
        target_toeic_score: u.target_toeic_score || 650,
        current_estimated_score: u.current_estimated_score || 500,
        learning_goal_minutes_per_day: u.learning_goal_minutes_per_day || 20,
        status: (u.status as 'ACTIVE' | 'INACTIVE' | 'BANNED') || 'ACTIVE',
        is_premium: u.is_premium || false,
        current_plan_slug: u.current_plan_slug || (u.is_premium ? 'vip' : 'free'),
        created_at: u.created_at || new Date().toISOString(),
        total_xp: u.total_xp || 0,
        level: u.level || 1,
        current_streak: u.current_streak || 0,
        longest_streak: 10,
        gems: 50,
        lessons_completed: 12,
        vocabulary_reviewed: 120,
        practice_sessions: 15,
        exams_completed: 2,
      }))
      setUsers(mappedUsers)
    } catch (err) {
      console.warn('Error fetching learners from backend:', err)
      setUsers([])
    } finally {
      setIsLoading(false)
    }
  }, [searchTerm, selectedStatus, selectedPlan])

  useEffect(() => {
    fetchLearners()
  }, [fetchLearners])

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
      const matchStatus = selectedStatus === 'ALL' || u.status === selectedStatus
      const matchPlan =
        selectedPlan === 'ALL' ||
        (selectedPlan === 'premium' && u.is_premium) ||
        (selectedPlan === 'free' && !u.is_premium)

      return matchSearch && matchStatus && matchPlan
    })
  }, [users, searchTerm, selectedStatus, selectedPlan])

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredUsers.slice(start, start + pageSize)
  }, [filteredUsers, currentPage, pageSize])

  const stats = useMemo(() => {
    return {
      total: users.length,
      active: users.filter((u) => u.status === 'ACTIVE').length,
      premium: users.filter((u) => u.is_premium).length,
      banned: users.filter((u) => u.status === 'BANNED').length,
    }
  }, [users])

  const handleConfirmStatusChange = async () => {
    if (!modalUser || !modalAction) return

    setIsUpdatingStatus(true)
    const newStatus = modalAction === 'ban' ? 'BLOCKED' : 'ACTIVE'

    try {
      await userService.updateUserStatus(modalUser.id, newStatus)
      setUsers((prev) =>
        prev.map((u) =>
          u.id === modalUser.id
            ? { ...u, status: modalAction === 'ban' ? 'BANNED' : 'ACTIVE' }
            : u
        )
      )
      toast.success(
        modalAction === 'ban'
          ? `Đã khóa tài khoản ${modalUser.email}`
          : `Đã mở khóa tài khoản ${modalUser.email}`
      )
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Cập nhật trạng thái thất bại'
      toast.error(msg)
    } finally {
      setIsUpdatingStatus(false)
      setModalUser(null)
      setModalAction(null)
    }
  }

  const handleResetFilters = () => {
    setSearchTerm('')
    setSelectedStatus('ALL')
    setSelectedPlan('ALL')
    setCurrentPage(1)
  }

  const handleOpenStatusModal = (user: User, action: 'ban' | 'unban') => {
    setModalUser(user)
    setModalAction(action)
  }

  const columns = useMemo(() => {
    return getLearnerColumns({
      onViewProfile: (userId) => setActiveNavItem(`user-profile:${userId}`),
      onOpenStatusModal: handleOpenStatusModal,
    })
  }, [setActiveNavItem])

  return (
    <div className="space-y-6">
      {}
      <LearnerStatsOverview stats={stats} />

      {}
      <DataTable<User>
        title="Quản Lý Học Viên"
        subtitle="Danh sách học viên, tiến độ học TOEIC và quản lý trạng thái tài khoản"
        isLoading={isLoading}
        columns={columns}
        data={paginatedUsers}
        rowKey={(u) => u.id}
        onResetFilters={handleResetFilters}
        extraActions={
          <button
            onClick={fetchLearners}
            className="flex items-center gap-2 h-10 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer shadow-2xs"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-500' : ''}`} />
            <span>Làm mới</span>
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
        }}
      />

      {}
      <ConfirmModal
        isOpen={Boolean(modalUser && modalAction)}
        onClose={() => {
          setModalUser(null)
          setModalAction(null)
        }}
        onConfirm={handleConfirmStatusChange}
        title={modalAction === 'ban' ? 'Khóa Tài Khoản Học Viên' : 'Mở Khóa Tài Khoản'}
        message={
          modalAction === 'ban'
            ? `Bạn có chắc chắn muốn khóa tài khoản "${modalUser?.full_name}" (${modalUser?.email})? Học viên sẽ không thể đăng nhập hoặc làm bài thi.`
            : `Mở khóa cho tài khoản "${modalUser?.full_name}" (${modalUser?.email})?`
        }
        confirmText={modalAction === 'ban' ? 'Khóa tài khoản' : 'Mở khóa'}
        cancelText="Hủy bỏ"
        variant={modalAction === 'ban' ? 'danger' : 'success'}
        icon={modalAction === 'ban' ? 'ban' : undefined}
        isLoading={isUpdatingStatus}
      />
    </div>
  )
}

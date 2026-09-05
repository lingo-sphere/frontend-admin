/**
 * @file learners.page.tsx
 * @description Trang quản trị LearnersPage trong giao diện Admin
 */

import { useState, useMemo, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { RotateCcw } from 'lucide-react'
import { DataTable } from '@/components/common/data.table'
import { useAdminStore } from '@/store/admin.store'
import { userService } from '@/services/user.service'
import { toast } from '@/store/toast.store'
import type { User } from '@/data/users.data'
import type { UserProfile } from '@/types/api.types'

import type { FilterStatus, FilterPlan } from '@/helpers/learner.helper'
import { LearnerStatsOverview } from '@/components/learners/learner.stats.overview'
import { LearnerFilterBar } from '@/components/learners/learner.filter.bar'
import { getLearnerColumns } from '@/components/learners/learner.table.columns'

export function LearnersPage() {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'
  const setActiveNavItem = useAdminStore((state) => state.setActiveNavItem)

  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [selectedStatus, setSelectedStatus] = useState<FilterStatus>('ALL')
  const [selectedPlan, setSelectedPlan] = useState<FilterPlan>('ALL')
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(10)
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null)

  const fetchLearners = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await userService.getAllUsers({ role: 'STUDENT', limit: 100 })
      const items: UserProfile[] = Array.isArray(res) ? res : (res?.result || [])
      const mapped: User[] = items.map((u: UserProfile) => ({
        id: u.user_id,
        full_name: u.full_name,
        email: u.email,
        target_toeic_score: u.target_toeic_score || 0,
        current_estimated_score: u.current_estimated_score || 0,
        total_xp: u.total_xp || 0,
        current_streak: u.current_streak || 0,
        is_premium: Boolean(u.is_premium),
        status: u.status === 'BLOCKED' ? 'BANNED' : 'ACTIVE',
        avatar_url: u.avatar_url,
        gender: u.gender || 'OTHER',
        learning_goal_minutes_per_day: u.learning_goal_minutes_per_day || 0,
        current_plan_slug: u.current_plan_slug || (u.is_premium ? 'vip' : 'free'),
        created_at: u.created_at || '',
        level: u.level || 1,
        longest_streak: u.current_streak || 0,
        gems: u.gems || 0,
        lessons_completed: 0,
        vocabulary_reviewed: 0,
        practice_sessions: 0,
        exams_completed: 0,
      }))
      setUsers(mapped)
    } catch {
      setUsers([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLearners()
  }, [fetchLearners])

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
      await userService.updateUserStatus(user.id, newStatus)
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, status: action === 'ban' ? 'BANNED' : 'ACTIVE' } : u
        )
      )
      toast.success(
        action === 'ban'
          ? 'Đã khóa tài khoản học viên thành công!'
          : 'Đã mở khóa tài khoản học viên thành công!'
      )
    } catch {
      toast.error('Cập nhật trạng thái học viên thất bại')
    }
  }

  const columns = useMemo(() => {
    return getLearnerColumns({
      isVi,
      onViewProfile: (userId) => setActiveNavItem(`user-profile:${userId}`),
      onOpenStatusModal: handleStatusChange,
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
            onClick={fetchLearners}
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
        }}
      />
    </div>
  )
}

// Trang chi tiết hồ sơ học viên, xem tiến độ và quản trị hạn mức AI.
import { useState, useEffect } from 'react'
import { ChevronLeft } from 'lucide-react'
import { useAdminStore } from '@/store/admin.store'
import { userService } from '@/features/users/services/user.service'
import {
  UserProfileHeader,
  type UserProfileData,
} from '@/features/users/components/learner.profile.header'
import { UserProfileStatsGrid } from '@/features/users/components/learner.profile.stats.grid'
import { LearnerAiQuotaModal } from '@/features/users/components/learner.ai.quota.modal'
import type { User } from '@/features/users/types/learner.types'

export function UserProfilePage() {
  const setActiveNavItem = useAdminStore((state) => state.setActiveNavItem)
  const activeNavItem = useAdminStore((state) => state.activeNavItem)

  const userId = activeNavItem.includes(':')
    ? activeNavItem.split(':')[1]
    : 'usr_learner_001'

  const [profileData, setProfileData] = useState<UserProfileData | null>(null)
  const [isAiQuotaModalOpen, setIsAiQuotaModalOpen] = useState<boolean>(false)

  const loadData = async () => {
    try {
      const u = await userService.getProfileById(userId)
      if (u) {
        setProfileData({
          id: u.user_id ? u.user_id : (u._id ? u._id : userId),
          full_name: u.full_name,
          email: u.email,
          avatar_url: u.avatar_url,
          phone: u.phone_number,
          status: u.status,
          is_premium: u.is_premium,
          created_at: u.created_at
            ? new Date(u.created_at).toLocaleDateString('vi-VN')
            : undefined,
          last_active: u.updated_at
            ? new Date(u.updated_at).toLocaleDateString('vi-VN')
            : undefined,
          total_xp: u.total_xp,
          level: u.level,
          current_streak: u.current_streak,
          toeic_score: u.target_toeic_score,
        })
      }
    } catch (err) {
      console.warn('Error fetching learner profile from backend:', err)
    }
  }

  useEffect(() => {
    loadData()
  }, [userId])

  if (!profileData) {
    return (
      <div className="p-8 text-center text-slate-400">
        Đang tải thông tin hồ sơ học viên...
      </div>
    )
  }

  const quotaUser: User = {
    id: profileData.id,
    full_name: profileData.full_name || '',
    email: profileData.email,
    is_premium: Boolean(profileData.is_premium),
    status: profileData.status === 'BLOCKED' ? 'BANNED' : 'ACTIVE',
    target_toeic_score: profileData.toeic_score || 0,
    current_estimated_score: profileData.toeic_score || 0,
    total_xp: profileData.total_xp || 0,
    current_streak: profileData.current_streak || 0,
    avatar_url: profileData.avatar_url,
    gender: 'OTHER',
    learning_goal_minutes_per_day: 0,
    current_plan_slug: profileData.is_premium ? 'vip' : 'free',
    created_at: profileData.created_at || '',
    level: profileData.level || 1,
    longest_streak: profileData.longest_streak || 0,
    gems: 0,
    lessons_completed: 0,
    vocabulary_reviewed: 0,
    practice_sessions: 0,
    exams_completed: 0,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setActiveNavItem('users')}
          className="p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer shadow-xs"
          type="button"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Chi Tiết Hồ Sơ Học Viên
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Xem tiến độ học tập TOEIC, lịch sử luyện tập và điểm số ước tính của học viên
          </p>
        </div>
      </div>

      <UserProfileHeader
        profileData={profileData}
        onOpenAiQuota={() => setIsAiQuotaModalOpen(true)}
      />

      <UserProfileStatsGrid profileData={profileData} />

      <LearnerAiQuotaModal
        user={quotaUser}
        isOpen={isAiQuotaModalOpen}
        onClose={() => setIsAiQuotaModalOpen(false)}
        onSuccess={loadData}
      />
    </div>
  )
}

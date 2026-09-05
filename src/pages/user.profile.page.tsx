/**
 * @file user.profile.page.tsx
 * @description Trang quản trị UserProfilePage trong giao diện Admin
 */

import { useState, useEffect } from 'react'
import { ChevronLeft } from 'lucide-react'
import { useAdminStore } from '@/store/admin.store'
import { userService } from '@/services/user.service'
import {
  UserProfileHeader,
  type UserProfileData,
} from '@/components/learners/user.profile.header'
import { UserProfileStatsGrid } from '@/components/learners/user.profile.stats.grid'

export function UserProfilePage() {
  const setActiveNavItem = useAdminStore((state) => state.setActiveNavItem)
  const activeNavItem = useAdminStore((state) => state.activeNavItem)

  const userId = activeNavItem.includes(':')
    ? activeNavItem.split(':')[1]
    : 'usr_learner_001'

  const [profileData, setProfileData] = useState<UserProfileData | null>(null)

  useEffect(() => {
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

    loadData()
  }, [userId])

  if (!profileData) {
    return (
      <div className="p-8 text-center text-slate-400">
        Đang tải thông tin hồ sơ học viên...
      </div>
    )
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

      <UserProfileHeader profileData={profileData} />

      <UserProfileStatsGrid profileData={profileData} />
    </div>
  )
}

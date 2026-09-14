// Trang chi tiết hồ sơ học viên, xem tiến độ và quản trị hạn mức AI với TanStack Query.
import { useState, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { userService } from '@/features/users/services/user.service'
import { toast } from '@/store/toast.store'
import { useResetLearnerDataMutation } from '@/features/users/hooks/use.learners.query'
import {
  UserProfileHeader,
  type UserProfileData,
} from '@/features/users/components/learner.profile.header'
import { UserProfileStatsGrid } from '@/features/users/components/learner.profile.stats.grid'
import { LearnerAiQuotaModal } from '@/features/users/components/learner.ai.quota.modal'
import type { User } from '@/features/users/types/learner.types'

export function UserProfilePage() {
  const location = useLocation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const pathParts = location.pathname.split('/users/')
  const userId = pathParts[1] || ''

  const [isAiQuotaModalOpen, setIsAiQuotaModalOpen] = useState<boolean>(false)
  const { mutateAsync: resetLearnerData } = useResetLearnerDataMutation()

  const {
    data: profileData = null,
    refetch,
  } = useQuery<UserProfileData | null>({
    queryKey: ['learner-profile', userId],
    queryFn: async () => {
      if (!userId) return null
      const u = await userService.getProfileById(userId)
      if (!u) return null
      return {
        id: u.user_id,
        full_name: u.full_name,
        email: u.email,
        avatar_url: u.avatar_url || undefined,
        phone: u.phone_number || undefined,
        status: u.status,
        is_premium: u.is_premium,
        created_at: u.created_at
          ? new Date(u.created_at).toLocaleDateString('vi-VN')
          : undefined,
        last_active: u.updated_at
          ? new Date(u.updated_at).toLocaleDateString('vi-VN')
          : undefined,
        total_xp: u.total_xp ?? 0,
        level: u.level ?? 1,
        current_streak: u.current_streak ?? 0,
        toeic_score: u.target_toeic_score ?? 0,
      }
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  })

  const quotaUser: User | null = useMemo(() => {
    if (!profileData) return null
    return {
      id: profileData.id,
      full_name: profileData.full_name || '',
      email: profileData.email,
      is_premium: Boolean(profileData.is_premium),
      status: profileData.status === 'BLOCKED' ? 'BANNED' : 'ACTIVE',
      target_toeic_score: profileData.toeic_score ?? 0,
      current_estimated_score: profileData.toeic_score ?? 0,
      total_xp: profileData.total_xp ?? 0,
      current_streak: profileData.current_streak ?? 0,
      avatar_url: profileData.avatar_url,
      gender: 'OTHER',
      learning_goal_minutes_per_day: 0,
      current_plan_slug: profileData.is_premium ? 'vip' : 'free',
      created_at: profileData.created_at || '',
      level: profileData.level ?? 1,
      longest_streak: profileData.longest_streak ?? 0,
      gems: 0,
      lessons_completed: 0,
      vocabulary_reviewed: 0,
      practice_sessions: 0,
      exams_completed: 0,
    }
  }, [profileData])

  if (!profileData || !quotaUser) {
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
          onClick={() => navigate('/users')}
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
        onResetData={async () => {
          try {
            await resetLearnerData(profileData.id)
            toast.success('Đã khởi tạo lại toàn bộ dữ liệu học tập của học viên thành công!')
            await refetch()
            queryClient.invalidateQueries({ queryKey: ['learner-profile', userId] })
          } catch {
            toast.error('Khởi tạo lại dữ liệu học viên thất bại')
          }
        }}
      />

      <UserProfileStatsGrid profileData={profileData} />

      <LearnerAiQuotaModal
        user={quotaUser}
        isOpen={isAiQuotaModalOpen}
        onClose={() => setIsAiQuotaModalOpen(false)}
        onSuccess={() => {
          refetch()
          queryClient.invalidateQueries({ queryKey: ['learner-profile', userId] })
        }}
      />
    </div>
  )
}

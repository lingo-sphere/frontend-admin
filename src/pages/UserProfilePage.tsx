import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ChevronLeft,
  Mail,
  Calendar,
  Crown,
  Flame,
  Star,
  Target,
  Clock,
  Award,
  BookOpen,
} from 'lucide-react'
import { useAdminStore } from '@/store/admin-store'
import { userService } from '@/services/user.service'

interface UserProfileData {
  id: string
  full_name?: string
  email: string
  avatar_url?: string
  phone?: string
  status?: string
  is_premium?: boolean
  created_at?: string
  last_active?: string
  total_xp?: number
  level?: number
  current_streak?: number
  longest_streak?: number
  total_lessons_completed?: number
  total_words_learned?: number
  toeic_score?: number
  accuracy_rate?: number
  avg_session_time?: number
  total_sessions?: number
  total_courses_enrolled?: number
  total_courses_completed?: number
  total_decks_studied?: number
}

export function UserProfilePage() {
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'
  const setActiveNavItem = useAdminStore((state) => state.setActiveNavItem)
  const activeNavItem = useAdminStore((state) => state.activeNavItem)

  const userId = activeNavItem.includes(':') ? activeNavItem.split(':')[1] : 'usr_learner_001'

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
            created_at: u.created_at ? new Date(u.created_at).toLocaleDateString('vi-VN') : undefined,
            last_active: u.updated_at ? new Date(u.updated_at).toLocaleDateString('vi-VN') : undefined,
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
      <div className="py-20 text-center text-xs text-slate-500">
        Đang tải thông tin học viên...
      </div>
    )
  }

  return (
    <div className="w-full px-[10px] space-y-6">

      <div className="flex items-center gap-3">
        <button
          onClick={() => setActiveNavItem('users')}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition-colors cursor-pointer"
          type="button"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
            Hồ Sơ Chi Tiết Học Viên
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Theo dõi tiến trình học từ vựng, điểm thi TOEIC và chỉ số chuyên cần
          </p>
        </div>
      </div>

      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="w-24 h-24 rounded-3xl bg-slate-800 border border-slate-700 flex items-center justify-center text-teal-400 text-3xl font-extrabold shadow-xl shrink-0">
          {profileData.avatar_url ? (
            <img
              src={profileData.avatar_url}
              alt={profileData.full_name}
              className="w-full h-full rounded-3xl object-cover"
            />
          ) : (
            profileData.full_name ? profileData.full_name.slice(0, 2).toUpperCase() : 'U'
          )}
        </div>

        <div className="space-y-3 flex-1 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h2 className="text-xl font-bold text-slate-100">{profileData.full_name}</h2>
            {profileData.is_premium ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Crown className="w-3 h-3" />
                <span>PREMIUM VIP</span>
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-400">
                FREE PLAN
              </span>
            )}
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {profileData.status}
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-slate-500" />
              <span>{profileData.email}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span>Gia nhập: {profileData.created_at}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-500" />
              <span>Hoạt động: {profileData.last_active}</span>
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
          <Star className="w-6 h-6 text-indigo-400 mx-auto mb-2" />
          <p className="text-xs text-slate-400">Cấp độ (Level)</p>
          <p className="text-xl font-bold text-slate-100 mt-1">Lv. {profileData.level}</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
          <Flame className="w-6 h-6 text-orange-400 mx-auto mb-2" />
          <p className="text-xs text-slate-400">Chuỗi ngày học (Streak)</p>
          <p className="text-xl font-bold text-slate-100 mt-1">{profileData.current_streak} ngày</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
          <Award className="w-6 h-6 text-teal-400 mx-auto mb-2" />
          <p className="text-xs text-slate-400">Tổng điểm tích lũy</p>
          <p className="text-xl font-bold text-teal-400 mt-1">
            {typeof profileData.total_xp === 'number' ? profileData.total_xp.toLocaleString('vi-VN') : profileData.total_xp} XP
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
          <Target className="w-6 h-6 text-rose-400 mx-auto mb-2" />
          <p className="text-xs text-slate-400">Mục tiêu TOEIC</p>
          <p className="text-xl font-bold text-rose-400 mt-1">{profileData.toeic_score} / 990</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <p className="text-xs text-slate-400">Bài giảng đã hoàn thành</p>
          <p className="text-xl font-bold text-slate-200">{profileData.total_lessons_completed} bài</p>
          <p className="text-[10px] text-teal-400">Trên tổng số {profileData.total_courses_enrolled} khóa học tham gia</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <p className="text-xs text-slate-400">Từ vựng đã ghi nhớ</p>
          <p className="text-xl font-bold text-slate-200">{profileData.total_words_learned} từ</p>
          <p className="text-[10px] text-indigo-400">{profileData.total_decks_studied} bộ thẻ Flashcard</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <p className="text-xs text-slate-400">Độ chính xác luyện tập</p>
          <p className="text-xl font-bold text-slate-200">{profileData.accuracy_rate}%</p>
          <p className="text-[10px] text-emerald-400">{profileData.total_sessions} phiên làm bài</p>
        </div>
      </div>
    </div>
  )
}

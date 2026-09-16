// Component hiển thị thông tin tiêu đề và hành động hồ sơ học viên.
import { Crown, Mail, Calendar, Sparkles, RotateCcw } from 'lucide-react'
import { Popconfirm } from '@/components/popconfirm'

export interface UserProfileData {
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

interface UserProfileHeaderProps {
  profileData: UserProfileData
  onOpenAiQuota?: () => void
  onResetData?: () => Promise<void> | void
}

export function UserProfileHeader({ profileData, onOpenAiQuota, onResetData }: UserProfileHeaderProps) {
  const name = profileData.full_name || profileData.email.split('@')[0]

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 text-white flex items-center justify-center font-bold text-2xl shrink-0 overflow-hidden shadow-lg shadow-indigo-500/20">
          {profileData.avatar_url ? (
            <img
              src={profileData.avatar_url}
              alt={name}
              className="w-full h-full object-cover"
            />
          ) : (
            name.slice(0, 2).toUpperCase()
          )}
        </div>

        <div className="flex-1 text-center sm:text-left space-y-1.5">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{name}</h2>
            {profileData.is_premium ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <Crown className="w-3.5 h-3.5" />
                <span>Học Viên VIP Premium</span>
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                Gói Miễn Phí (Free)
              </span>
            )}
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                profileData.status === 'ACTIVE'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
              }`}
            >
              {profileData.status === 'ACTIVE' ? 'Hoạt động' : 'Tạm khóa'}
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center sm:justify-start gap-2">
            <Mail className="w-3.5 h-3.5" />
            <span>{profileData.email}</span>
            <span>•</span>
            <Calendar className="w-3.5 h-3.5" />
            <span>Tham gia: {profileData.created_at || '01/01/2026'}</span>
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-center sm:self-start">
        {onOpenAiQuota && (
          <button
            type="button"
            onClick={onOpenAiQuota}
            className="flex items-center gap-2 h-10 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white shadow-md shadow-purple-600/20 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Hạn Mức & Reset AI</span>
          </button>
        )}

        {onResetData && (
          <Popconfirm
            title="Khởi tạo lại toàn bộ dữ liệu học tập?"
            description="Hủy đăng ký khóa học, xóa tiến độ bài học, bài nộp, lượt thi TOEIC và đơn hàng của học viên này. Tài khoản đăng nhập vẫn được giữ nguyên."
            okText="Khởi tạo lại dữ liệu"
            cancelText="Hủy"
            okType="danger"
            placement="bottomRight"
            onConfirm={onResetData}
          >
            <button
              type="button"
              className="flex items-center gap-2 h-10 px-4 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-xs font-bold text-amber-600 dark:text-amber-400 border border-amber-500/20 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset Dữ Liệu Học Viên</span>
            </button>
          </Popconfirm>
        )}
      </div>
    </div>
  )
}

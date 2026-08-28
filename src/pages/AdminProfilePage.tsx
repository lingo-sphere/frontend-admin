import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ChevronLeft,
  Mail,
  Shield,
  GraduationCap,
  Edit2,
  Lock,
  User,
  Eye,
  EyeOff,
  Calendar,
  Save,
  CheckCircle,
} from 'lucide-react'
import { useAdminStore } from '@/store/admin-store'
import { useAuthStore } from '@/store/auth-store'
import { userService } from '@/services/user.service'
import { authService } from '@/services/auth.service'
import { toast } from '@/store/toast-store'

interface AdminProfileData {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'TEACHER'
  avatar?: string
  is_active: boolean
  last_active: string
  created_at: string
  total_courses_created: number
  total_lessons_created: number
  total_users_managed: number
}

export function AdminProfilePage() {
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'
  const setActiveNavItem = useAdminStore((state) => state.setActiveNavItem)

  const authUser = useAuthStore((state) => state.user)
  const authProfile = useAuthStore((state) => state.profile)
  const fetchCurrentUser = useAuthStore((state) => state.fetchCurrentUser)

  const [profileData, setProfileData] = useState<AdminProfileData | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)

  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    bio: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const p = await userService.getMyProfile()
        if (p) {
          setProfileData({
            id: p._id || authUser?.user_id || 'me',
            name: p.full_name || authUser?.email?.split('@')[0] || 'Quản trị viên',
            email: p.email || authUser?.email || 'admin@lingosphere.local',
            role: (authUser?.role === 'INSTRUCTOR' ? 'TEACHER' : 'ADMIN') as 'ADMIN' | 'TEACHER',
            avatar: p.avatar_url,
            is_active: true,
            last_active: 'Vừa xong',
            created_at: p.created_at || '10/01/2026',
            total_courses_created: 12,
            total_lessons_created: 48,
            total_users_managed: 12840,
          })
          setEditForm((prev) => ({
            ...prev,
            name: p.full_name || '',
            phone: p.phone_number || '',
            bio: p.bio || '',
          }))
        }
      } catch (err) {
        console.warn('Using local auth profile:', err)
      }
    }
    loadProfile()
  }, [authUser, authProfile])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profileData) return

    try {
      if (editForm.newPassword) {
        if (editForm.newPassword !== editForm.confirmPassword) {
          toast.error('Mật khẩu mới không khớp')
          return
        }
        if (!editForm.currentPassword) {
          toast.error('Vui lòng nhập mật khẩu hiện tại để đổi mật khẩu')
          return
        }
        await authService.changePassword(profileData.id, {
          current_password: editForm.currentPassword,
          new_password: editForm.newPassword,
        })
        toast.success('Đổi mật khẩu thành công!')
      }

      await userService.updateMyProfile({
        full_name: editForm.name,
        phone_number: editForm.phone,
        bio: editForm.bio,
      })

      await fetchCurrentUser()
      setIsEditModalOpen(false)
      toast.success('Cập nhật thông tin quản trị viên thành công!')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Cập nhật thông tin thất bại'
      toast.error(msg)
    }
  }

  if (!profileData) {
    return (
      <div className="py-20 text-center text-xs text-slate-500">
        Đang tải thông tin quản trị viên...
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveNavItem('dashboard')}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition-colors cursor-pointer"
            type="button"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
              Hồ Sơ Quản Trị Viên
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Thông tin định danh, quyền hạn hệ thống và lịch sử hoạt động điều hành
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsEditModalOpen(true)}
          className="flex items-center gap-2 h-10 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
        >
          <Edit2 className="w-4 h-4" />
          <span>Chỉnh sửa hồ sơ</span>
        </button>
      </div>

      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-teal-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-extrabold shadow-xl shadow-teal-500/20 ring-4 ring-slate-800 shrink-0">
          {profileData.avatar ? (
            <img src={profileData.avatar} alt={profileData.name} className="w-full h-full rounded-3xl object-cover" />
          ) : (
            profileData.name.slice(0, 2).toUpperCase()
          )}
        </div>

        <div className="space-y-3 flex-1 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h2 className="text-xl font-bold text-slate-100">{profileData.name}</h2>
            {profileData.role === 'ADMIN' ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <Shield className="w-3 h-3" />
                <span>QUẢN TRỊ VIÊN TỐI CAO</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/10 text-teal-400 border border-teal-500/20">
                <GraduationCap className="w-3 h-3" />
                <span>GIẢNG VIÊN KHÓA HỌC</span>
              </span>
            )}
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Hoạt động
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-slate-500" />
              <span>{profileData.email}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span>Tham gia: {profileData.created_at}</span>
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
            {editForm.bio || 'Quản trị viên phụ trách điều hành hệ thống dữ liệu, kiểm duyệt khóa học và phân quyền bảo mật LingoSphere.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
          <p className="text-xs text-slate-400">Khóa học đã tạo</p>
          <p className="text-2xl font-bold text-teal-400 mt-1">{profileData.total_courses_created}</p>
        </div>
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
          <p className="text-xs text-slate-400">Bài giảng & Đề thi</p>
          <p className="text-2xl font-bold text-indigo-400 mt-1">{profileData.total_lessons_created}</p>
        </div>
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
          <p className="text-xs text-slate-400">Học viên quản lý</p>
          <p className="text-2xl font-bold text-amber-400 mt-1">
            {profileData.total_users_managed.toLocaleString('vi-VN')}
          </p>
        </div>
      </div>

      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-base font-bold text-slate-100">Chỉnh Sửa Thông Tin Cá Nhân</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Họ và tên
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Số điện thoại
                </label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  placeholder="0987654321"
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Giới thiệu ngắn (Bio)
                </label>
                <textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  rows={2}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 space-y-3">
                <p className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Đổi mật khẩu (Tùy chọn)</span>
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400">Mật khẩu hiện tại</label>
                    <div className="relative flex items-center">
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={editForm.currentPassword}
                        onChange={(e) => setEditForm({ ...editForm, currentPassword: e.target.value })}
                        placeholder="••••••••"
                        className="w-full h-10 px-3 pr-8 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-2.5 text-slate-500"
                      >
                        {showCurrentPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400">Mật khẩu mới</label>
                    <div className="relative flex items-center">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={editForm.newPassword}
                        onChange={(e) => setEditForm({ ...editForm, newPassword: e.target.value })}
                        placeholder="••••••••"
                        className="w-full h-10 px-3 pr-8 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-2.5 text-slate-500"
                      >
                        {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="h-10 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="h-10 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

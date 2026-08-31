import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ChevronLeft,
  Mail,
  Shield,
  GraduationCap,
  Lock,
  Eye,
  EyeOff,
  Calendar,
  Save,
  Camera,
  Loader2,
  Phone,
  User,
  FileText,
  KeyRound,
  CheckCircle2,
} from 'lucide-react'
import { useAdminStore } from '@/store/admin-store'
import { useAuthStore } from '@/store/auth-store'
import { userService } from '@/services/user.service'
import { authService } from '@/services/auth.service'
import { mediaService } from '@/services/media.service'
import { toast } from '@/store/toast-store'

interface AdminProfileData {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'TEACHER'
  avatar?: string
  phone?: string
  bio?: string
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
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)

  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [form, setForm] = useState({
    name: '',
    phone: '',
    bio: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true)
      try {
        const p = await userService.getMyProfile()
        if (p) {
          setProfileData({
            id: p._id || authUser?.user_id || 'me',
            name: p.full_name || authUser?.email?.split('@')[0] || 'Quản trị viên',
            email: p.email || authUser?.email || 'admin@lingosphere.local',
            role: (authUser?.role === 'INSTRUCTOR' ? 'TEACHER' : 'ADMIN') as 'ADMIN' | 'TEACHER',
            avatar: p.avatar_url,
            phone: p.phone_number || '',
            bio: p.bio || '',
            is_active: true,
            last_active: 'Vừa xong',
            created_at: p.created_at || '10/01/2026',
            total_courses_created: 12,
            total_lessons_created: 48,
            total_users_managed: 12840,
          })
          setForm({
            name: p.full_name || '',
            phone: p.phone_number || '',
            bio: p.bio || '',
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
          })
        }
      } catch (err) {
        console.warn('Using local auth profile fallback:', err)
        setProfileData({
          id: authUser?.user_id || 'me',
          name: authProfile?.full_name || authUser?.email?.split('@')[0] || 'LingoSphere Super Admin',
          email: authUser?.email || 'admin@lingosphere.local',
          role: (authUser?.role === 'INSTRUCTOR' ? 'TEACHER' : 'ADMIN') as 'ADMIN' | 'TEACHER',
          avatar: authProfile?.avatar_url,
          phone: authProfile?.phone_number || '',
          bio: authProfile?.bio || '',
          is_active: true,
          last_active: 'Vừa xong',
          created_at: '10/01/2026',
          total_courses_created: 12,
          total_lessons_created: 48,
          total_users_managed: 12840,
        })
        setForm({
          name: authProfile?.full_name || 'LingoSphere Super Admin',
          phone: authProfile?.phone_number || '',
          bio: authProfile?.bio || '',
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        })
      } finally {
        setIsLoading(false)
      }
    }
    loadProfile()
  }, [authUser, authProfile])

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file hình ảnh (PNG, JPG, WebP, GIF...)')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Dung lượng ảnh đại diện không được vượt quá 5MB')
      return
    }

    setIsUploadingAvatar(true)
    try {
      let avatarUrl = ''
      try {
        const uploadRes = await mediaService.uploadFile(file, 'avatars')
        avatarUrl = uploadRes.file_url || uploadRes.url || uploadRes.public_url || ''
      } catch {
        avatarUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result as string)
          reader.readAsDataURL(file)
        })
      }

      await userService.updateMyProfile({ avatar_url: avatarUrl })
      setProfileData((prev) => (prev ? { ...prev, avatar: avatarUrl } : null))
      await fetchCurrentUser()
      toast.success('Cập nhật ảnh đại diện thành công!')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Tải lên ảnh thất bại'
      toast.error(msg)
    } finally {
      setIsUploadingAvatar(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profileData) return

    setIsSaving(true)
    try {
      // 1. Password change if requested
      if (form.newPassword) {
        if (form.newPassword !== form.confirmPassword) {
          toast.error('Mật khẩu xác nhận không khớp với mật khẩu mới')
          setIsSaving(false)
          return
        }
        if (!form.currentPassword) {
          toast.error('Vui lòng nhập mật khẩu hiện tại để xác nhận đổi mật khẩu')
          setIsSaving(false)
          return
        }
        await authService.changePassword(profileData.id, {
          current_password: form.currentPassword,
          new_password: form.newPassword,
        })
        toast.success('Đổi mật khẩu bảo mật thành công!')
      }

      // 2. Profile basic info update
      await userService.updateMyProfile({
        full_name: form.name.trim(),
        phone_number: form.phone.trim(),
        bio: form.bio.trim(),
      })

      setProfileData((prev) =>
        prev
          ? {
              ...prev,
              name: form.name.trim(),
              phone: form.phone.trim(),
              bio: form.bio.trim(),
            }
          : null
      )

      await fetchCurrentUser()
      setForm((prev) => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }))
      toast.success('Cập nhật thông tin hồ sơ thành công!')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Cập nhật thông tin thất bại'
      toast.error(msg)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading && !profileData) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="text-xs font-semibold">Đang tải hồ sơ quản trị viên...</span>
      </div>
    )
  }

  if (!profileData) return null

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveNavItem('dashboard')}
            className="p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer shadow-xs"
            type="button"
            title="Quay lại Tổng quan"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Hồ Sơ Quản Trị Viên
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Chỉnh sửa thông tin định danh, ảnh đại diện và bảo mật tài khoản trực tiếp
            </p>
          </div>
        </div>

        <button
          onClick={handleSaveProfile}
          disabled={isSaving}
          className="flex items-center gap-2 h-10 px-5 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-xs font-bold text-white shadow-md shadow-blue-600/30 transition-all cursor-pointer"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>{isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
        </button>
      </div>

      {/* Profile Overview Card with Interactive Avatar */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-6">
        {/* Avatar Container with Upload Overlay */}
        <div className="relative group shrink-0">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden bg-gradient-to-tr from-teal-500 to-indigo-600 border-2 border-white dark:border-slate-800 flex items-center justify-center text-white text-3xl font-black shadow-lg ring-4 ring-slate-100 dark:ring-slate-800/80">
            {profileData.avatar ? (
              <img
                src={profileData.avatar}
                alt={profileData.name}
                className="w-full h-full object-cover"
              />
            ) : (
              profileData.name.slice(0, 2).toUpperCase()
            )}
          </div>

          {/* Hover / Click Upload Overlay */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingAvatar}
            className="absolute inset-0 rounded-3xl bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[11px] font-bold gap-1 cursor-pointer backdrop-blur-xs"
            title="Nhấp để thay đổi ảnh đại diện"
          >
            {isUploadingAvatar ? (
              <Loader2 className="w-6 h-6 animate-spin text-white" />
            ) : (
              <>
                <Camera className="w-5 h-5 text-white" />
                <span>Đổi ảnh</span>
              </>
            )}
          </button>

          {/* Quick Camera Badge at bottom-right corner */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-1.5 -right-1.5 w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-md shadow-blue-600/30 border-2 border-white dark:border-slate-900 transition-transform hover:scale-110 cursor-pointer"
            title="Đổi ảnh đại diện"
          >
            <Camera className="w-3.5 h-3.5" />
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>

        {/* Profile Identity Details */}
        <div className="space-y-3 flex-1 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{profileData.name}</h2>
            {profileData.role === 'ADMIN' ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20">
                <Shield className="w-3 h-3" />
                <span>QUẢN TRỊ VIÊN TỐI CAO</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-500/20">
                <GraduationCap className="w-3 h-3" />
                <span>GIẢNG VIÊN KHÓA HỌC</span>
              </span>
            )}
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
              Hoạt động
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-slate-400" />
              <span>{profileData.email}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>Tham gia: {profileData.created_at}</span>
            </span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl">
            {form.bio || 'Tổng quản trị viên hệ sinh thái LingoSphere, phụ trách kiểm duyệt nội dung và phân quyền bảo mật.'}
          </p>
        </div>
      </div>

      {/* Summary KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-center shadow-xs">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Khóa học đã tạo</p>
          <p className="text-2xl font-black text-teal-600 dark:text-teal-400 mt-1">{profileData.total_courses_created}</p>
        </div>
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-center shadow-xs">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Bài giảng & Đề thi</p>
          <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{profileData.total_lessons_created}</p>
        </div>
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-center shadow-xs">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Học viên quản lý</p>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {profileData.total_users_managed.toLocaleString('vi-VN')}
          </p>
        </div>
      </div>

      {/* Main Inline Editable Profile Form */}
      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Section 1: Personal & Contact Information */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-200 dark:border-slate-800">
            <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Thông Tin Định Danh & Liên Hệ
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <span>Họ và tên</span>
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Nhập họ và tên..."
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-all"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Email Quản trị viên
              </label>
              <input
                type="email"
                value={profileData.email}
                disabled
                className="w-full h-11 px-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 cursor-not-allowed"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>Số điện thoại</span>
              </label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="Ví dụ: 0987654321"
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-all"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>Giới thiệu ngắn (Bio)</span>
              </label>
              <textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                rows={3}
                placeholder="Viết một vài dòng giới thiệu về vai trò và trách nhiệm của bạn trong hệ thống..."
                className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-all leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Security & Password Change */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-200 dark:border-slate-800">
            <KeyRound className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Bảo Mật & Đổi Mật Khẩu
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Bỏ trống các ô bên dưới nếu bạn không có nhu cầu thay đổi mật khẩu đăng nhập
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Mật khẩu hiện tại
              </label>
              <div className="relative flex items-center">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={form.currentPassword}
                  onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
                  placeholder="••••••••"
                  className="w-full h-11 px-3.5 pr-10 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  tabIndex={-1}
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Mật khẩu mới
              </label>
              <div className="relative flex items-center">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={form.newPassword}
                  onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                  placeholder="••••••••"
                  className="w-full h-11 px-3.5 pr-10 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  tabIndex={-1}
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Xác nhận mật khẩu mới
              </label>
              <div className="relative flex items-center">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  placeholder="••••••••"
                  className="w-full h-11 px-3.5 pr-10 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Action Bottom Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => setActiveNavItem('dashboard')}
            className="h-11 px-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
          >
            Hủy / Quay lại
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 h-11 px-7 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-xs font-bold text-white shadow-md shadow-blue-600/30 transition-all cursor-pointer"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            <span>{isSaving ? 'Đang lưu thay đổi...' : 'Lưu Thay Đổi Hồ Sơ'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}


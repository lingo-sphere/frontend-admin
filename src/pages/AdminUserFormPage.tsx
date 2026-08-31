import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ChevronLeft,
  Save,
  Mail,
  Lock,
  Shield,
  GraduationCap,
  Eye,
  EyeOff,
  User,
} from 'lucide-react'
import { useAdminStore } from '@/store/admin-store'
import { userService } from '@/services/user.service'
import { roleService } from '@/services/role.service'
import { toast } from '@/store/toast-store'

interface AdminUserFormData {
  email: string
  password: string
  full_name: string
  role: 'ADMIN' | 'TEACHER'
  status: 'ACTIVE' | 'BLOCKED'
}

interface AdminUserFormPageProps {
  editUserId?: string
}

export function AdminUserFormPage({ editUserId }: AdminUserFormPageProps) {
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'
  const setActiveNavItem = useAdminStore((state) => state.setActiveNavItem)
  const isEditing = !!editUserId

  const [formData, setFormData] = useState<AdminUserFormData>({
    email: '',
    password: '',
    full_name: '',
    role: 'ADMIN',
    status: 'ACTIVE',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (editUserId) {
      const loadUser = async () => {
        try {
          const profile = await userService.getProfileById(editUserId)
          if (profile) {
            setFormData({
              email: profile.email || '',
              password: '',
              full_name: profile.full_name || '',
              role: profile.role === 'INSTRUCTOR' ? 'TEACHER' : 'ADMIN',
              status: profile.status === 'BLOCKED' ? 'BLOCKED' : 'ACTIVE',
            })
          }
        } catch (err) {
          console.warn('Error loading admin user profile:', err)
        }
      }
      loadUser()
    }
  }, [editUserId])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Vui lòng nhập họ và tên'
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      newErrors.email = 'Vui lòng nhập email hợp lệ'
    }
    if (!isEditing && (!formData.password || formData.password.length < 6)) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 600))
      toast.success(
        isEditing
          ? 'Cập nhật tài khoản quản trị viên thành công!'
          : 'Tạo tài khoản quản trị viên mới thành công!'
      )
      setActiveNavItem('admins')
    } catch {
      toast.error('Có lỗi xảy ra khi lưu thông tin')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full px-[10px] space-y-6">

      <div className="flex items-center gap-3">
        <button
          onClick={() => setActiveNavItem('admins')}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition-colors cursor-pointer"
          type="button"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
            {isEditing ? 'Chỉnh Sửa Quản Trị Viên' : 'Thêm Quản Trị Viên Mới'}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Cấp quyền quản trị viên tối cao hoặc giáo viên biên soạn khóa học
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-6"
      >

        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Họ và tên <span className="text-rose-400">*</span>
          </label>
          <div className="flex items-center w-full h-11 px-3.5 rounded-xl bg-slate-950/70 border border-slate-800 focus-within:border-indigo-500 transition-all gap-3">
            <User className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              placeholder="VD: Nguyễn Văn A"
              className="w-full bg-transparent border-0 outline-none text-sm text-slate-100 placeholder:text-slate-500 p-0 focus:ring-0"
            />
          </div>
          {errors.full_name && <p className="text-[11px] text-rose-400 mt-1">{errors.full_name}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Địa chỉ Email <span className="text-rose-400">*</span>
          </label>
          <div className="flex items-center w-full h-11 px-3.5 rounded-xl bg-slate-950/70 border border-slate-800 focus-within:border-indigo-500 transition-all gap-3">
            <Mail className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="admin@lingosphere.local"
              className="w-full bg-transparent border-0 outline-none text-sm text-slate-100 placeholder:text-slate-500 p-0 focus:ring-0"
            />
          </div>
          {errors.email && <p className="text-[11px] text-rose-400 mt-1">{errors.email}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            {isEditing ? 'Mật khẩu mới (Bỏ trống nếu không đổi)' : 'Mật khẩu khởi tạo'} {!isEditing && <span className="text-rose-400">*</span>}
          </label>
          <div className="flex items-center w-full h-11 px-3.5 rounded-xl bg-slate-950/70 border border-slate-800 focus-within:border-indigo-500 transition-all gap-3">
            <Lock className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              className="w-full bg-transparent border-0 outline-none text-sm text-slate-100 placeholder:text-slate-500 p-0 focus:ring-0"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-slate-400 hover:text-slate-200 p-1"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="text-[11px] text-rose-400 mt-1">{errors.password}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Vai trò quản trị <span className="text-rose-400">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div
              onClick={() => setFormData({ ...formData, role: 'ADMIN' })}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col gap-2 ${
                formData.role === 'ADMIN'
                  ? 'bg-rose-500/10 border-rose-500/40 text-rose-300 ring-1 ring-rose-500/30'
                  : 'bg-slate-950/40 border-slate-800 hover:bg-slate-800/40 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-100 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-rose-400" />
                  ADMIN
                </span>
                {formData.role === 'ADMIN' && <span className="text-xs font-bold text-rose-400">Đã chọn</span>}
              </div>
              <p className="text-xs text-slate-400">
                Toàn quyền quản trị học viên, khóa học, doanh thu, cài đặt hệ thống và bảo mật.
              </p>
            </div>

            <div
              onClick={() => setFormData({ ...formData, role: 'TEACHER' })}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col gap-2 ${
                formData.role === 'TEACHER'
                  ? 'bg-teal-500/10 border-teal-500/40 text-teal-300 ring-1 ring-teal-500/30'
                  : 'bg-slate-950/40 border-slate-800 hover:bg-slate-800/40 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-100 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-teal-400" />
                  TEACHER
                </span>
                {formData.role === 'TEACHER' && <span className="text-xs font-bold text-teal-400">Đã chọn</span>}
              </div>
              <p className="text-xs text-slate-400">
                Quyền tạo và biên soạn bài giảng khóa học, đề thi TOEIC, và quản lý học viên khóa học.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Trạng thái tài khoản
          </label>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
              <input
                type="radio"
                name="status"
                value="ACTIVE"
                checked={formData.status === 'ACTIVE'}
                onChange={() => setFormData({ ...formData, status: 'ACTIVE' })}
                className="accent-indigo-600 w-4 h-4"
              />
              <span>Hoạt động ngay</span>
            </label>
            <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
              <input
                type="radio"
                name="status"
                value="BLOCKED"
                checked={formData.status === 'BLOCKED'}
                onChange={() => setFormData({ ...formData, status: 'BLOCKED' })}
                className="accent-indigo-600 w-4 h-4"
              />
              <span>Tạm khóa tài khoản</span>
            </label>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => setActiveNavItem('admins')}
            className="h-11 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="h-11 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Đang lưu...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{isEditing ? 'Cập nhật tài khoản' : 'Tạo tài khoản'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

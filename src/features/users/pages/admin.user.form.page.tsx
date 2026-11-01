// Trang quản trị tạo mới và cập nhật tài khoản quản trị viên hoặc giảng viên.

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { userService } from '@/features/users/services/user.service'
import { toast } from '@/store/toast.store'
import { AdminUserAccountForm } from '@/features/users/components/admin.user.account.form'
import { AdminUserRoleSelector } from '@/features/users/components/admin.user.role.selector'
import { AdminUserPreviewCard } from '@/features/users/components/admin.user.preview.card'
import { StickyFormActionBar } from '@/components/sticky.form.action.bar'
import { queryClient } from '@/config/query.config'
import { adminUserKeys } from '@/features/users/keys/admin.user.keys'

interface AdminUserFormData {
  email: string
  password: string
  full_name: string
  role: 'ADMIN' | 'INSTRUCTOR'
  status: 'ACTIVE' | 'BLOCKED'
}

interface AdminUserFormPageProps {
  editUserId?: string
}

export function AdminUserFormPage({ editUserId }: AdminUserFormPageProps) {
  const navigate = useNavigate()
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
              role: profile.role === 'INSTRUCTOR' ? 'INSTRUCTOR' : 'ADMIN',
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
      if (isEditing && editUserId) {
        await userService.updateAdminUser(editUserId, {
          email: formData.email.trim(),
          full_name: formData.full_name.trim(),
          role: formData.role,
          status: formData.status,
          password: formData.password ? formData.password : undefined,
        })
        toast.success('Cập nhật tài khoản quản trị viên thành công!')
      } else {
        await userService.createAdminUser({
          email: formData.email.trim(),
          full_name: formData.full_name.trim(),
          role: formData.role,
          status: formData.status,
          password: formData.password,
        })
        toast.success('Tạo tài khoản quản trị viên mới thành công!')
      }
      await queryClient.invalidateQueries({ queryKey: adminUserKeys.all })
      navigate('/admins')
    } catch (err: unknown) {
      const errorMsg =
        err && typeof err === 'object' && 'response' in err && (err as { response?: { data?: { message?: string } } }).response?.data?.message
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : err instanceof Error
            ? err.message
            : 'Có lỗi xảy ra khi lưu thông tin'
      toast.error(errorMsg || 'Có lỗi xảy ra khi lưu thông tin')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFieldChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admins')}
            className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer shadow-xs"
            type="button"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {isEditing ? 'Chỉnh Sửa Quản Trị Viên' : 'Thêm Quản Trị Viên Mới'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isEditing
                ? 'Cập nhật thông tin phân quyền và trạng thái tài khoản quản trị'
                : 'Khởi tạo tài khoản phân quyền quản trị cho cán bộ / giáo viên'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 space-y-6">
            <AdminUserAccountForm
              formData={formData}
              isEditing={isEditing}
              showPassword={showPassword}
              errors={errors}
              onToggleShowPassword={() => setShowPassword(!showPassword)}
              onChange={handleFieldChange}
            />

            <AdminUserRoleSelector
              selectedRole={formData.role}
              selectedStatus={formData.status}
              onRoleChange={(role) => setFormData((prev) => ({ ...prev, role }))}
              onStatusChange={(status) => setFormData((prev) => ({ ...prev, status }))}
            />
          </div>

          <div className="lg:col-span-5 lg:sticky lg:top-6">
            <AdminUserPreviewCard
              fullName={formData.full_name}
              email={formData.email}
              role={formData.role}
              status={formData.status}
              editUserId={editUserId}
              isEditing={isEditing}
            />
          </div>
        </div>

        <StickyFormActionBar
          title={formData.full_name || formData.email || (isEditing ? 'Tài khoản' : 'Tài khoản mới')}
          statusText={isEditing ? 'Đang chỉnh sửa:' : 'Đang tạo mới:'}
          badgeText={formData.role === 'ADMIN' ? 'Quản trị viên' : 'Giảng viên'}
          cancelText="Hủy Bỏ"
          saveText={isEditing ? 'Cập Nhật Tài Khoản' : 'Tạo Tài Khoản'}
          savingText="Đang lưu..."
          isSubmitting={isSubmitting}
          onCancel={() => navigate('/admins')}
        />
      </form>
    </div>
  )
}

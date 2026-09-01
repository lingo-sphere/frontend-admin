/**
 * @file AdminUserFormPage.tsx
 * @description Trang quản trị AdminUserFormPage trong giao diện Admin
 */

import { useState, useEffect } from 'react'
import { ChevronLeft, Save } from 'lucide-react'
import { useAdminStore } from '@/store/admin-store'
import { userService } from '@/services/user.service'
import { toast } from '@/store/toast-store'
import { AdminUserAccountForm } from '@/components/admin-users/AdminUserAccountForm'
import { AdminUserRoleSelector } from '@/components/admin-users/AdminUserRoleSelector'

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
      setActiveNavItem('admins')
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Có lỗi xảy ra khi lưu thông tin'
      toast.error(msg)
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
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveNavItem('admins')}
            className="p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer shadow-xs"
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
                ? 'Cập nhật quyền hạn và trạng thái tài khoản quản trị'
                : 'Khởi tạo tài khoản phân quyền quản trị cho cán bộ / giáo viên'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
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

        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => setActiveNavItem('admins')}
            className="h-11 px-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 h-11 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? 'Đang lưu...' : isEditing ? 'Cập nhật tài khoản' : 'Tạo tài khoản'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}

import { authService } from '@/services/auth.service'
import { userService } from '@/services/user.service'
import { useAdminStore } from '@/store/admin-store'
import { useAuthStore } from '@/store/auth-store'
import { toast } from '@/store/toast-store'
import { CheckCircle2, ChevronLeft, Loader2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { AdminProfileHeader } from '@/components/admin-profile/AdminProfileHeader'
import { AdminProfileInfoForm } from '@/components/admin-profile/AdminProfileInfoForm'
import { AdminProfileSecurityForm } from '@/components/admin-profile/AdminProfileSecurityForm'
import type { AdminProfileData } from '@/helpers/admin-profile.helper'
import { evaluatePasswordStrength } from '@/helpers/admin-profile.helper'

export function AdminProfilePage() {
  const setActiveNavItem = useAdminStore((state) => state.setActiveNavItem)

  const authUser = useAuthStore((state) => state.user)
  const authProfile = useAuthStore((state) => state.profile)
  const fetchCurrentUser = useAuthStore((state) => state.fetchCurrentUser)

  const [profileData, setProfileData] = useState<AdminProfileData | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState<boolean>(false)

  const [form, setForm] = useState({
    name: '',
    phone: '',
    bio: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })


  const passwordStrength = useMemo(() => {
    return evaluatePasswordStrength(form.newPassword)
  }, [form.newPassword])

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true)
      try {
        const res = await userService.getMyProfile()
        const rawRole = String(authUser?.role || authProfile?.role || 'ADMIN').toUpperCase()
        const userRole: 'ADMIN' | 'TEACHER' = rawRole === 'INSTRUCTOR' || rawRole === 'TEACHER' ? 'TEACHER' : 'ADMIN'

        const loaded: AdminProfileData = {
          id: res?.user_id || authUser?.user_id || 'admin-root',
          name: res?.full_name || authUser?.full_name || 'Admin Master',
          email: res?.email || authUser?.email || 'admin@lingosphere.edu.vn',
          role: userRole,
          avatar: res?.avatar_url || authUser?.avatar_url || '',
          phone: res?.phone_number || '',
          bio: res?.bio || '',
          is_active: res?.status === 'ACTIVE',
          last_active: 'Vừa xong',
          created_at: res?.created_at ? new Date(res.created_at).toLocaleDateString('vi-VN') : '01/01/2026',
        }

        setProfileData(loaded)
        setForm((prev) => ({
          ...prev,
          name: loaded.name,
          phone: loaded.phone || '',
          bio: loaded.bio || '',
        }))
      } catch (err) {
        console.warn('Could not fetch latest profile from backend, using fallback auth state:', err)
        const fallback: AdminProfileData = {
          id: authUser?.user_id || 'admin-root',
          name: authUser?.full_name || 'Admin Master',
          email: authUser?.email || 'admin@lingosphere.edu.vn',
          role: (authUser?.role || 'ADMIN').toUpperCase() as 'ADMIN' | 'TEACHER',
          avatar: authUser?.avatar_url || '',
          phone: '',
          bio: '',
          is_active: true,
          last_active: 'Vừa xong',
          created_at: '01/01/2026',
        }
        setProfileData(fallback)
        setForm((prev) => ({
          ...prev,
          name: fallback.name,
        }))
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [authUser, authProfile])

  const handleAvatarChange = async (url: string) => {
    if (!url || !profileData) return
    setIsUploadingAvatar(true)
    try {
      await userService.updateMyProfile({ avatar_url: url })
      setProfileData((prev) => (prev ? { ...prev, avatar: url } : null))
      await fetchCurrentUser()
      toast.success('Cập nhật ảnh đại diện quản trị viên thành công!')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Tải lên ảnh đại diện thất bại'
      toast.error(msg)
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profileData) return

    setIsSaving(true)
    try {

      if (form.newPassword) {
        if (!form.currentPassword) {
          toast.error('Vui lòng nhập mật khẩu hiện tại để xác nhận đổi mật khẩu')
          setIsSaving(false)
          return
        }
        if (form.newPassword === form.currentPassword) {
          toast.error('Mật khẩu mới không được trùng với mật khẩu hiện tại')
          setIsSaving(false)
          return
        }
        if (form.newPassword !== form.confirmPassword) {
          toast.error('Mật khẩu xác nhận không khớp với mật khẩu mới')
          setIsSaving(false)
          return
        }
        await authService.changePassword(profileData.id, {
          old_password: form.currentPassword,
          current_password: form.currentPassword,
          new_password: form.newPassword,
        })
        toast.success('Đổi mật khẩu bảo mật thành công!')
      }


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
    <div className="w-full px-[10px] space-y-6">
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
      </div>

      <AdminProfileHeader
        profileData={profileData}
        bio={form.bio}
        isUploadingAvatar={isUploadingAvatar}
        onAvatarChange={handleAvatarChange}
      />

      <form onSubmit={handleSaveProfile} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AdminProfileInfoForm
            name={form.name}
            email={profileData.email}
            phone={form.phone}
            bio={form.bio}
            onNameChange={(val) => setForm((prev) => ({ ...prev, name: val }))}
            onPhoneChange={(val) => setForm((prev) => ({ ...prev, phone: val }))}
            onBioChange={(val) => setForm((prev) => ({ ...prev, bio: val }))}
          />

          <AdminProfileSecurityForm
            currentPassword={form.currentPassword}
            newPassword={form.newPassword}
            confirmPassword={form.confirmPassword}
            passwordStrength={passwordStrength}
            onCurrentPasswordChange={(val) => setForm((prev) => ({ ...prev, currentPassword: val }))}
            onNewPasswordChange={(val) => setForm((prev) => ({ ...prev, newPassword: val }))}
            onConfirmPasswordChange={(val) => setForm((prev) => ({ ...prev, confirmPassword: val }))}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => setActiveNavItem('dashboard')}
            className="h-11 px-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer shadow-xs"
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

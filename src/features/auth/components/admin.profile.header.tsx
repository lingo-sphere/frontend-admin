// Header hồ sơ cá nhân quản trị viên với avatar và thông tin vai trò.

import { Shield, GraduationCap } from 'lucide-react'
import { R2MediaUploader } from '@/features/media/components/r2.media.uploader'
import type { AdminProfileData } from '@/features/auth/helpers/admin.profile.helper'

interface AdminProfileHeaderProps {
  profileData: AdminProfileData
  bio?: string
  isUploadingAvatar?: boolean
  onAvatarChange: (url: string) => void
}

export function AdminProfileHeader({
  profileData,
  bio,
  isUploadingAvatar,
  onAvatarChange,
}: AdminProfileHeaderProps) {
  return (
    <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xs relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-indigo-500/10 via-purple-500/5 to-transparent rounded-bl-full pointer-events-none" />

      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
        <div className="shrink-0 flex flex-col items-center">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-indigo-600 to-violet-500 p-0.5 shadow-xl shadow-indigo-500/20">
            <div className="w-full h-full rounded-[22px] bg-white dark:bg-slate-900 overflow-hidden flex items-center justify-center">
              {profileData.avatar_url ? (
                <img
                  src={profileData.avatar_url}
                  alt={profileData.full_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                  {profileData.full_name.slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>
          </div>
          <div className="mt-2 w-36">
            <R2MediaUploader
              type="image"
              value={profileData.avatar_url || ''}
              onChange={onAvatarChange}
              folder="admin-avatars"
              label=""
              isVi={true}
            />
          </div>
        </div>

        <div className="flex-1 text-center sm:text-left space-y-2">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {profileData.full_name}
            </h2>
            {profileData.role === 'ADMIN' ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                <Shield className="w-3.5 h-3.5" />
                <span>Quản trị viên tối cao (Admin)</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Giảng viên hệ thống (Teacher)</span>
              </span>
            )}
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            {profileData.email} • ID: <span className="font-mono">{profileData.user_id}</span>
          </p>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-2 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{profileData.is_active ? 'Tài khoản hoạt động' : 'Tạm khóa'}</span>
            </div>
            <div>
              <span>Ngày tham gia: </span>
              <strong className="text-slate-800 dark:text-slate-200">
                {profileData.created_at}
              </strong>
            </div>
            <div>
              <span>Truy cập gần nhất: </span>
              <strong className="text-slate-800 dark:text-slate-200">
                {profileData.last_active}
              </strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

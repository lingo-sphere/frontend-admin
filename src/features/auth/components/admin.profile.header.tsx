// Header hồ sơ cá nhân quản trị viên với avatar và thông tin vai trò.

import { useState, useRef } from 'react'
import { Shield, GraduationCap, Camera, Eye, RefreshCw, Trash2, Loader2 } from 'lucide-react'
import { Image } from 'antd'
import { mediaService } from '@/features/media/services/media.service'
import { resolveMediaUrl } from '@/lib/media.utils'
import { toast } from '@/store/toast.store'
import type { AdminProfileData } from '@/features/auth/helpers/admin.profile.helper'

interface AdminProfileHeaderProps {
  profileData: AdminProfileData
  bio?: string
  isUploadingAvatar?: boolean
  onAvatarChange: (url: string) => void
}

export function AdminProfileHeader({
  profileData,
  isUploadingAvatar = false,
  onAvatarChange,
}: AdminProfileHeaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isLocalUploading, setIsLocalUploading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  const isUploading = isUploadingAvatar || isLocalUploading
  const avatarSrc = profileData.avatar_url ? resolveMediaUrl(profileData.avatar_url) : ''

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ảnh đại diện không được vượt quá 5MB')
      return
    }

    setIsLocalUploading(true)
    try {
      const res = await mediaService.uploadDirectR2(file, 'admin-avatars')
      if (res.file_url) {
        onAvatarChange(res.file_url)
      } else {
        toast.error('Máy chủ không trả về đường dẫn file')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Tải lên ảnh đại diện thất bại'
      toast.error(msg)
    } finally {
      setIsLocalUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveAvatar = () => {
    onAvatarChange('')
  }

  return (
    <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xs relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-indigo-500/10 via-purple-500/5 to-transparent rounded-bl-full pointer-events-none" />

      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
        <div className="shrink-0 flex flex-col items-center">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="hidden"
            onChange={handleFileSelect}
          />

          <div className="relative group">
            <div
              onClick={() => {
                if (avatarSrc) {
                  setShowPreview(true)
                } else {
                  fileInputRef.current?.click()
                }
              }}
              className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-indigo-600 to-violet-500 p-0.5 shadow-xl shadow-indigo-500/20 cursor-pointer overflow-hidden"
              title={avatarSrc ? 'Bấm để xem ảnh phóng to' : 'Bấm để tải ảnh lên'}
            >
              <div className="w-full h-full rounded-[22px] bg-white dark:bg-slate-900 overflow-hidden flex items-center justify-center relative">
                {avatarSrc ? (
                  <img
                    src={avatarSrc}
                    alt={profileData.full_name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                    {profileData.full_name.slice(0, 2).toUpperCase()}
                  </span>
                )}

                {isUploading ? (
                  <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-2xs flex flex-col items-center justify-center text-white gap-1 z-10">
                    <Loader2 className="w-6 h-6 animate-spin text-white" />
                    <span className="text-[10px] font-semibold">Đang tải...</span>
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <Camera className="w-5 h-5 drop-shadow-md" />
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-md border-2 border-white dark:border-slate-900 flex items-center justify-center cursor-pointer transition-transform hover:scale-110 disabled:opacity-50"
              title="Đổi ảnh đại diện"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>

          {avatarSrc ? (
            <div className="flex items-center gap-1.5 mt-3">
              <button
                type="button"
                onClick={() => setShowPreview(true)}
                className="flex items-center gap-1 h-7 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-300 text-[11px] font-semibold transition-colors cursor-pointer shadow-2xs"
                title="Xem ảnh phóng to"
              >
                <Eye className="w-3 h-3 text-slate-400" />
                <span>Xem</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex items-center gap-1 h-7 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-300 text-[11px] font-semibold transition-colors cursor-pointer shadow-2xs"
                title="Thay thế ảnh khác"
              >
                <RefreshCw className={`w-3 h-3 text-slate-400 ${isUploading ? 'animate-spin' : ''}`} />
                <span>Đổi</span>
              </button>

              <button
                type="button"
                onClick={handleRemoveAvatar}
                disabled={isUploading}
                className="flex items-center justify-center w-7 h-7 rounded-xl border border-rose-200 dark:border-rose-900/40 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors cursor-pointer shadow-2xs"
                title="Xóa ảnh đại diện"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex items-center gap-1.5 h-7 px-3 mt-3 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold transition-colors cursor-pointer shadow-2xs"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Tải ảnh lên</span>
            </button>
          )}

          {avatarSrc && (
            <Image
              style={{ display: 'none' }}
              src={avatarSrc}
              preview={{
                visible: showPreview,
                onVisibleChange: (val) => setShowPreview(val),
              }}
            />
          )}
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

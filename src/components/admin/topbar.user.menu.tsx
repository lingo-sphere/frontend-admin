/**
 * @file topbar.user.menu.tsx
 * @description Admin user profile dropdown menu with navigation shortcuts and sign out trigger
 */

import React, { RefObject } from 'react'
import { ChevronDown, User as UserIcon, Shield, LogOut } from 'lucide-react'
import type { UserProfile } from '@/types/api.types'

interface TopbarUserMenuProps {
  userDropdownRef: RefObject<HTMLDivElement | null>
  userDropdownOpen: boolean
  onToggleOpen: () => void
  profile: UserProfile | null
  user: any
  avatarError: boolean
  onAvatarError: () => void
  onNavigateProfile: () => void
  onNavigateSettings: () => void
  onTriggerLogout: () => void
  isVietnamese: boolean
}

export function TopbarUserMenu({
  userDropdownRef,
  userDropdownOpen,
  onToggleOpen,
  profile,
  user,
  avatarError,
  onAvatarError,
  onNavigateProfile,
  onNavigateSettings,
  onTriggerLogout,
  isVietnamese,
}: TopbarUserMenuProps) {
  const avatarUrl = profile?.avatar_url
  const fullName = profile?.full_name || 'Admin Console'
  const email = profile?.email || user?.email || 'admin@lingosphere.local'
  const role = (profile?.role || user?.role || 'ADMIN').toUpperCase()

  const initials = fullName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .slice(-2)
    .join('')
    .toUpperCase() || 'AD'

  return (
    <div className="relative" ref={userDropdownRef}>
      <button
        onClick={onToggleOpen}
        className="flex items-center gap-2.5 pl-2 pr-2 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700/60 cursor-pointer"
        type="button"
      >
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-indigo-600 flex items-center justify-center text-white text-xs font-extrabold shadow-sm ring-1 ring-white/20 overflow-hidden shrink-0">
          {avatarUrl && !avatarError ? (
            <img
              src={avatarUrl}
              alt={fullName}
              className="w-full h-full object-cover"
              onError={onAvatarError}
            />
          ) : (
            <span>{initials}</span>
          )}
        </div>
        <div className="hidden md:flex flex-col text-left">
          <span className="text-xs font-bold text-slate-900 dark:text-slate-200 leading-tight">
            {fullName}
          </span>
          <span className="text-[11px] font-semibold text-teal-600 dark:text-teal-400">
            {role === 'ADMIN' ? (isVietnamese ? 'Quản trị viên' : 'Administrator') : role}
          </span>
        </div>
        <ChevronDown className="w-4 h-4 text-slate-400" />
      </button>

      {userDropdownOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="px-3.5 py-2.5 border-b border-slate-100 dark:border-slate-800/80 mb-1 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-500 to-indigo-600 flex items-center justify-center text-white text-xs font-extrabold overflow-hidden shrink-0">
              {avatarUrl && !avatarError ? (
                <img
                  src={avatarUrl}
                  alt={fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{initials}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-900 dark:text-slate-200 truncate">
                {fullName}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{email}</p>
            </div>
          </div>

          <button
            onClick={onNavigateProfile}
            className="w-full px-3 py-2 text-left text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer"
            type="button"
          >
            <UserIcon className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
            <span>{isVietnamese ? 'Hồ sơ cá nhân' : 'My Profile'}</span>
          </button>

          <button
            onClick={onNavigateSettings}
            className="w-full px-3 py-2 text-left text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer"
            type="button"
          >
            <Shield className="w-3.5 h-3.5 text-teal-500 dark:text-teal-400" />
            <span>{isVietnamese ? 'Cài đặt hệ thống' : 'System Settings'}</span>
          </button>

          <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

          <button
            onClick={onTriggerLogout}
            className="w-full px-3 py-2 text-left text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer"
            type="button"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{isVietnamese ? 'Đăng xuất' : 'Sign Out'}</span>
          </button>
        </div>
      )}
    </div>
  )
}

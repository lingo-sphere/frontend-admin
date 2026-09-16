/**
 * @file settings.nav.header.tsx
 * @description Thanh điều hướng đầu trang cho khu vực Cấu hình Hệ thống & Dịch vụ
 */

import { Crown, Bot, Settings as SettingsIcon, RefreshCw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { navItemToPath } from '@/routes/navigation'

export type SettingsPageType = 'plans' | 'ai' | 'system'

interface SettingsNavHeaderProps {
  activePage: SettingsPageType
  onRefresh?: () => void
  isRefreshing?: boolean
}

export function SettingsNavHeader({ activePage, onRefresh, isRefreshing }: SettingsNavHeaderProps) {
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'
  const navigate = useNavigate()

  const navTabs = [
    { id: 'plans' as SettingsPageType, navItem: 'settings-plans', label: isVietnamese ? 'Gói dịch vụ' : 'Plans', icon: Crown },
    { id: 'ai' as SettingsPageType, navItem: 'settings-ai', label: isVietnamese ? 'AI & Mô hình' : 'AI Models', icon: Bot },
    { id: 'system' as SettingsPageType, navItem: 'settings-system', label: isVietnamese ? 'Hệ thống' : 'System', icon: SettingsIcon },
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            {isVietnamese ? 'Cấu hình hệ thống & Dịch vụ' : 'System Settings & Services'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isVietnamese
              ? 'Quản lý gói cước subscription, cấu hình kết nối AI và các thông số vận hành hệ thống'
              : 'Manage subscription plans, AI connections, and system operation settings'}
          </p>
        </div>

        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 h-9 px-3.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-xs transition-all cursor-pointer w-fit"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isVietnamese ? 'Làm mới' : 'Refresh'}</span>
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs w-fit">
        {navTabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activePage === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
              onClick={() => navigate(navItemToPath(tab.navItem))}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

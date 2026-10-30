// Thanh tiêu đề chuẩn hóa cho các trang Cấu hình Hệ thống & Dịch vụ.
import { RefreshCw } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export type SettingsPageType = 'plans' | 'ai'

interface SettingsNavHeaderProps {
  activePage: SettingsPageType
  onRefresh?: () => void
  isRefreshing?: boolean
}

export function SettingsNavHeader({ activePage, onRefresh, isRefreshing }: SettingsNavHeaderProps) {
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'

  const pageMeta: Record<SettingsPageType, { title: string; desc: string }> = {
    plans: {
      title: isVietnamese ? 'Cấu hình Gói dịch vụ' : 'Subscription Plans',
      desc: isVietnamese
        ? 'Quản lý gói cước subscription, phân quyền VIP và cấu hình mức giá dịch vụ'
        : 'Manage subscription plans, VIP access, and service pricing',
    },
    ai: {
      title: isVietnamese ? 'Cấu hình AI & Mô hình' : 'AI Models & Architecture',
      desc: isVietnamese
        ? 'Quản lý kết nối nhà cung cấp AI, hạn mức token và điều phối mô hình thông minh'
        : 'Manage AI provider connections, token quotas, and intelligent model routing',
    },
  }

  const currentMeta = pageMeta[activePage]

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          {currentMeta.title}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {currentMeta.desc}
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
  )
}


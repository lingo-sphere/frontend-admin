// Component thẻ chiến dịch gửi tin Monthly Campaign State theo phong cách Vuexy Admin.

import { useState } from 'react'
import { MoreVertical, Mail, ExternalLink, MousePointer, Users, AlertTriangle, UserX } from 'lucide-react'

interface CampaignItem {
  id: string
  label: string
  count: string
  rate: string
  isPositive: boolean
  icon: typeof Mail
  badgeColorClass: string
}

interface VuexyMonthlyCampaignCardProps {
  title?: string
  subtitle?: string
  items?: CampaignItem[]
}

const defaultCampaignItems: CampaignItem[] = [
  {
    id: 'emails',
    label: 'Thông báo đã gửi',
    count: '12,346',
    rate: '0.3%',
    isPositive: true,
    icon: Mail,
    badgeColorClass: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400',
  },
  {
    id: 'opened',
    label: 'Đã mở đọc',
    count: '8,734',
    rate: '2.1%',
    isPositive: true,
    icon: ExternalLink,
    badgeColorClass: 'bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400',
  },
  {
    id: 'clicked',
    label: 'Lượt nhấn liên kết',
    count: '967',
    rate: '1.4%',
    isPositive: false,
    icon: MousePointer,
    badgeColorClass: 'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400',
  },
  {
    id: 'subscribe',
    label: 'Tham gia học tập',
    count: '345',
    rate: '8.5%',
    isPositive: true,
    icon: Users,
    badgeColorClass: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400',
  },
  {
    id: 'complaints',
    label: 'Báo lỗi hệ thống',
    count: '10',
    rate: '1.5%',
    isPositive: false,
    icon: AlertTriangle,
    badgeColorClass: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  },
  {
    id: 'unsubscribe',
    label: 'Tắt nhận thông báo',
    count: '86',
    rate: '0.8%',
    isPositive: true,
    icon: UserX,
    badgeColorClass: 'bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400',
  },
]

export function VuexyMonthlyCampaignCard({
  title = 'Chiến Dịch Thông Báo & Tương Tác',
  subtitle = '8.52k Lượt tiếp cận học viên',
  items = defaultCampaignItems,
}: VuexyMonthlyCampaignCardProps) {
  const [showMenu, setShowMenu] = useState(false)

  return (
    <div className="h-full rounded-2xl bg-white dark:bg-[#2f3349] border border-slate-200/80 dark:border-slate-700/60 p-5 shadow-xs flex flex-col justify-between relative">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h5 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-0.5">{title}</h5>
          <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
        </div>
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-8 z-20 w-36 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg text-xs">
              <button
                type="button"
                onClick={() => setShowMenu(false)}
                className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
              >
                Gửi thông báo
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3.5 my-auto">
        {items.map((item) => {
          const IconComp = item.icon
          return (
            <div key={item.id} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${item.badgeColorClass}`}>
                  <IconComp className="w-4 h-4" />
                </span>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                  {item.label}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{item.count}</span>
                <span
                  className={`text-xs font-semibold min-w-[40px] text-right ${
                    item.isPositive
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {item.rate}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}


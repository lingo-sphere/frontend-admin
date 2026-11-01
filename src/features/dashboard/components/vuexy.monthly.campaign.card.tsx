// Component thẻ quản lý thông báo hệ thống Monthly Campaign State theo phong cách Vuexy Admin.

import { useState } from 'react'
import { MoreVertical, Bell, Mail, Bookmark, AlertCircle, Radio, CheckCheck } from 'lucide-react'

interface VuexyMonthlyCampaignCardProps {
  totalCount: number
  unreadCount: number
  pinnedCount: number
  urgentCount: number
  broadcastCount: number
  normalCount: number
}

export function VuexyMonthlyCampaignCard({
  totalCount,
  unreadCount,
  pinnedCount,
  urgentCount,
  broadcastCount,
  normalCount,
}: VuexyMonthlyCampaignCardProps) {
  const [showMenu, setShowMenu] = useState(false)

  const items = [
    {
      id: 'total',
      label: 'Tổng thông báo đã tạo',
      count: totalCount.toString(),
      statusText: 'Hệ thống',
      icon: Bell,
      badgeColorClass: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400',
    },
    {
      id: 'unread',
      label: 'Thông báo chưa đọc',
      count: unreadCount.toString(),
      statusText: unreadCount > 0 ? 'Cần đọc' : 'Đã đọc hết',
      icon: Mail,
      badgeColorClass: 'bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400',
    },
    {
      id: 'pinned',
      label: 'Thông báo được ghim',
      count: pinnedCount.toString(),
      statusText: 'Ưu tiên cao',
      icon: Bookmark,
      badgeColorClass: 'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400',
    },
    {
      id: 'urgent',
      label: 'Khẩn cấp & quan trọng',
      count: urgentCount.toString(),
      statusText: 'Cảnh báo',
      icon: AlertCircle,
      badgeColorClass: 'bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400',
    },
    {
      id: 'broadcast',
      label: 'Phát sóng toàn bộ người học',
      count: broadcastCount.toString(),
      statusText: 'Toàn sàn',
      icon: Radio,
      badgeColorClass: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400',
    },
    {
      id: 'normal',
      label: 'Thông báo thông thường',
      count: normalCount.toString(),
      statusText: 'Tiêu chuẩn',
      icon: CheckCheck,
      badgeColorClass: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
    },
  ]

  return (
    <div className="h-full rounded-2xl bg-white dark:bg-[#2f3349] border border-slate-200/80 dark:border-slate-700/60 p-5 shadow-xs flex flex-col justify-between relative">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h5 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-0.5">
            Thông Báo & Nhắc Học
          </h5>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {totalCount > 0 ? `${totalCount} thông báo trong hệ thống` : 'Chưa có thông báo nào'}
          </p>
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
                Làm mới
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

              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{item.count}</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 min-w-[65px] text-center">
                  {item.statusText}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

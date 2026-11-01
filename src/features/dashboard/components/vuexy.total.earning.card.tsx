// Component thẻ tổng giá trị khóa học & tài khoản Total Earning theo phong cách Vuexy Admin.

import { useState } from 'react'
import { MoreVertical, Wallet, Crown } from 'lucide-react'

interface VuexyTotalEarningCardProps {
  totalCoursePrice: number
  vipUsers: number
  totalUsers: number
  activeSubscriptions?: number
}

export function VuexyTotalEarningCard({
  totalCoursePrice,
  vipUsers,
  totalUsers,
  activeSubscriptions = 0,
}: VuexyTotalEarningCardProps) {
  const [showMenu, setShowMenu] = useState(false)

  const vipPercent = totalUsers > 0 ? Math.round((vipUsers / totalUsers) * 100) : 0

  const bars = [
    { top: Math.min(90, Math.max(25, vipPercent)), bottom: Math.max(10, 100 - vipPercent) },
    { top: Math.min(80, Math.max(20, vipPercent - 10)), bottom: 35 },
    { top: Math.min(95, Math.max(30, vipPercent + 15)), bottom: 25 },
    { top: 50, bottom: 45 },
    { top: 60, bottom: 20 },
    { top: 70, bottom: 30 },
    { top: 55, bottom: 20 },
    { top: Math.min(90, Math.max(25, vipPercent)), bottom: 25 },
  ]

  return (
    <div className="h-full rounded-2xl bg-white dark:bg-[#2f3349] border border-slate-200/80 dark:border-slate-700/60 p-5 shadow-xs flex flex-col justify-between relative">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h5 className="text-base font-semibold text-slate-800 dark:text-slate-100">Giá Trị Khóa Học & Thuê Bao</h5>
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

        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">{vipPercent}%</h2>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
            Tỉ lệ VIP
          </span>
        </div>
      </div>

      <div className="h-28 w-full flex items-center justify-between gap-2 px-1 my-2">
        {bars.map((bar, idx) => (
          <div key={idx} className="flex-1 flex flex-col items-center justify-center gap-1 h-full">
            <div className="w-full max-w-[14px] bg-slate-100 dark:bg-slate-800 rounded-t-sm h-full flex flex-col justify-end overflow-hidden">
              <div
                className="w-full bg-indigo-600 rounded-t-sm transition-all duration-300"
                style={{ height: `${bar.top}%` }}
              />
            </div>
            <div className="w-full max-w-[14px] bg-slate-100 dark:bg-slate-800 rounded-b-sm h-full flex flex-col justify-start overflow-hidden">
              <div
                className="w-full bg-slate-400 dark:bg-slate-500 rounded-b-sm transition-all duration-300"
                style={{ height: `${bar.bottom}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
              <Wallet className="w-4 h-4" />
            </span>
            <div>
              <h6 className="text-xs font-semibold text-slate-700 dark:text-slate-200">Giá trị niêm yết</h6>
              <p className="text-[11px] text-slate-400">Toàn bộ khóa học</p>
            </div>
          </div>
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
            {totalCoursePrice.toLocaleString('vi-VN')} đ
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              <Crown className="w-4 h-4" />
            </span>
            <div>
              <h6 className="text-xs font-semibold text-slate-700 dark:text-slate-200">Thuê bao VIP</h6>
              <p className="text-[11px] text-slate-400">
                {activeSubscriptions > 0 ? `${activeSubscriptions} gói hoạt động` : 'Tài khoản đặc quyền'}
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
            {vipUsers} học viên
          </span>
        </div>
      </div>
    </div>
  )
}

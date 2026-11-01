// Component thẻ tổng doanh thu & điểm hệ thống Total Earning theo phong cách Vuexy Admin.

import { useState } from 'react'
import { MoreVertical, ChevronUp, Wallet, DollarSign } from 'lucide-react'

interface VuexyTotalEarningCardProps {
  percentage?: string
  growth?: string
  totalRevenue?: string
  totalSales?: string
  systemXp?: number
}

export function VuexyTotalEarningCard({
  percentage = '87%',
  growth = '25.8%',
  totalRevenue = '+$126',
  totalSales = '+$98',
  systemXp = 0,
}: VuexyTotalEarningCardProps) {
  const [showMenu, setShowMenu] = useState(false)

  const bars = [
    { top: 55, bottom: 25 },
    { top: 40, bottom: 35 },
    { top: 65, bottom: 25 },
    { top: 30, bottom: 45 },
    { top: 50, bottom: 20 },
    { top: 60, bottom: 30 },
    { top: 45, bottom: 20 },
    { top: 52, bottom: 25 },
  ]

  return (
    <div className="h-full rounded-2xl bg-white dark:bg-[#2f3349] border border-slate-200/80 dark:border-slate-700/60 p-5 shadow-xs flex flex-col justify-between relative">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h5 className="text-base font-semibold text-slate-800 dark:text-slate-100">Tổng Doanh Thu</h5>
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
                  Xem chi tiết
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">{percentage}</h2>
          <div className="flex items-center text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <ChevronUp className="w-4 h-4" />
            <span>{growth}</span>
          </div>
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
              <h6 className="text-xs font-semibold text-slate-700 dark:text-slate-200">Doanh thu trả phí</h6>
              <p className="text-[11px] text-slate-400">
                {systemXp > 0 ? `${systemXp.toLocaleString('vi-VN')} XP tích lũy` : 'Gói học viên'}
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{totalRevenue}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              <DollarSign className="w-4 h-4" />
            </span>
            <div>
              <h6 className="text-xs font-semibold text-slate-700 dark:text-slate-200">Đăng ký mới</h6>
              <p className="text-[11px] text-slate-400">Gia hạn & nâng cấp VIP</p>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{totalSales}</span>
        </div>
      </div>
    </div>
  )
}


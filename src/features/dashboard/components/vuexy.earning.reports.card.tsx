// Component thẻ báo cáo học tập & doanh thu Earning Reports theo phong cách Vuexy Admin.

import { useState } from 'react'
import { MoreVertical, DollarSign, PieChart, CreditCard } from 'lucide-react'

interface VuexyEarningReportsCardProps {
  totalAmount?: string
  growthRate?: string
  subText?: string
  daysData?: { day: string; value: number; isHighlight?: boolean }[]
  earningsValue?: string
  profitValue?: string
  expenseValue?: string
}

export function VuexyEarningReportsCard({
  totalAmount = '$468.50',
  growthRate = '+4.2%',
  subText = 'Số liệu ghi nhận tăng trưởng so với tuần trước',
  daysData = [
    { day: 'Mo', value: 40 },
    { day: 'Tu', value: 65 },
    { day: 'We', value: 50 },
    { day: 'Th', value: 45 },
    { day: 'Fr', value: 90, isHighlight: true },
    { day: 'Sa', value: 55 },
    { day: 'Su', value: 70 },
  ],
  earningsValue = '$545.69',
  profitValue = '$256.34',
  expenseValue = '$74.19',
}: VuexyEarningReportsCardProps) {
  const [showMenu, setShowMenu] = useState(false)

  return (
    <div className="h-full rounded-2xl bg-white dark:bg-[#2f3349] border border-slate-200/80 dark:border-slate-700/60 p-5 shadow-xs flex flex-col justify-between relative">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h5 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-0.5">
            Báo Cáo Học Tập & Doanh Thu
          </h5>
          <p className="text-xs text-slate-500 dark:text-slate-400">Tổng quan tuần và tiến độ giải đề</p>
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
                Xem chi tiết
              </button>
              <button
                type="button"
                onClick={() => setShowMenu(false)}
                className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
              >
                Xuất dữ liệu
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        <div className="md:col-span-5 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">{totalAmount}</h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
              {growthRate}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{subText}</p>
        </div>

        <div className="md:col-span-7 flex items-end justify-between gap-2 h-36 px-2">
          {daysData.map((item, idx) => {
            const heightPercent = Math.min(100, Math.max(15, item.value))
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <div className="w-full max-w-[28px] h-full flex items-end bg-slate-50 dark:bg-slate-800/40 rounded-t-lg overflow-hidden">
                  <div
                    className={`w-full rounded-t-lg transition-all duration-300 ${
                      item.isHighlight
                        ? 'bg-indigo-600 shadow-sm shadow-indigo-500/30'
                        : 'bg-indigo-100 dark:bg-indigo-900/40 group-hover:bg-indigo-200'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>
                <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                  {item.day}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="border border-slate-100 dark:border-slate-800 rounded-xl p-4 mt-5 bg-slate-50/50 dark:bg-slate-800/20">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="p-1 rounded-md bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
                <DollarSign className="w-3.5 h-3.5" />
              </span>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Doanh thu</span>
            </div>
            <h5 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-1.5">{earningsValue}</h5>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1">
              <div className="bg-indigo-600 h-1 rounded-full" style={{ width: '65%' }} />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="p-1 rounded-md bg-sky-50 dark:bg-sky-500/15 text-sky-600 dark:text-sky-400">
                <PieChart className="w-3.5 h-3.5" />
              </span>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Lợi nhuận</span>
            </div>
            <h5 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-1.5">{profitValue}</h5>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1">
              <div className="bg-sky-500 h-1 rounded-full" style={{ width: '50%' }} />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="p-1 rounded-md bg-rose-50 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400">
                <CreditCard className="w-3.5 h-3.5" />
              </span>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Chi phí vận hành</span>
            </div>
            <h5 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-1.5">{expenseValue}</h5>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1">
              <div className="bg-rose-500 h-1 rounded-full" style={{ width: '35%' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


// Component thẻ theo dõi chấm điểm và hỗ trợ Support Tracker theo phong cách Vuexy Admin.

import { useState } from 'react'
import { MoreVertical, Ticket, CheckCircle2, Clock } from 'lucide-react'

interface VuexySupportTrackerCardProps {
  totalTickets?: number
  newTickets?: number
  openTickets?: number
  responseTime?: string
  completedPercent?: number
}

export function VuexySupportTrackerCard({
  totalTickets = 164,
  newTickets = 142,
  openTickets = 28,
  responseTime = '1 ngày',
  completedPercent = 85,
}: VuexySupportTrackerCardProps) {
  const [showMenu, setShowMenu] = useState(false)

  const radius = 64
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (completedPercent / 100) * circumference * 0.75

  return (
    <div className="h-full rounded-2xl bg-white dark:bg-[#2f3349] border border-slate-200/80 dark:border-slate-700/60 p-5 shadow-xs flex flex-col justify-between relative">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h5 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-0.5">
            Giám Sát Chấm Điểm & Hỗ Trợ
          </h5>
          <p className="text-xs text-slate-500 dark:text-slate-400">7 ngày gần nhất</p>
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
              <button
                type="button"
                onClick={() => setShowMenu(false)}
                className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
              >
                Chuyển tiếp
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center my-auto">
        <div className="md:col-span-5">
          <div className="mb-4">
            <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">{totalTickets}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Tổng yêu cầu & bài chấm</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
                <Ticket className="w-4 h-4" />
              </span>
              <div>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">Bài thi mới</p>
                <span className="text-[11px] text-slate-400">{newTickets} bài chờ duyệt</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="p-2 rounded-lg bg-sky-50 dark:bg-sky-500/15 text-sky-600 dark:text-sky-400">
                <CheckCircle2 className="w-4 h-4" />
              </span>
              <div>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">Đang xử lý</p>
                <span className="text-[11px] text-slate-400">{openTickets} bài đang chấm</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="p-2 rounded-lg bg-amber-50 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400">
                <Clock className="w-4 h-4" />
              </span>
              <div>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">Thời gian phản hồi</p>
                <span className="text-[11px] text-slate-400">Trung bình {responseTime}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-7 flex flex-col items-center justify-center relative min-h-[200px]">
          <div className="relative w-44 h-44 flex items-center justify-center">
            <svg className="w-full h-full -rotate-135" viewBox="0 0 160 160">
              <circle
                cx="80"
                cy="80"
                r={radius}
                className="text-slate-100 dark:text-slate-800"
                strokeWidth="12"
                stroke="currentColor"
                fill="none"
                strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
                strokeLinecap="round"
              />
              <circle
                cx="80"
                cy="80"
                r={radius}
                className="text-indigo-600 transition-all duration-1000 ease-out"
                strokeWidth="12"
                stroke="currentColor"
                fill="none"
                strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-xs font-medium text-slate-400 dark:text-slate-500 mb-0.5">
                Hoàn thành
              </span>
              <span className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">
                {completedPercent}%
              </span>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                Đạt tiến độ
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


// Component thẻ phân bổ học viên theo kỹ năng Sales by Countries theo phong cách Vuexy Admin.

import { useState } from 'react'
import { MoreVertical, ChevronUp, ChevronDown, Headphones, BookOpen, Mic, PenTool, Layers, Volume2 } from 'lucide-react'

interface SkillItem {
  id: string
  name: string
  category: string
  value: string
  trend: string
  isPositive: boolean
  icon: typeof Headphones
  colorClass: string
}

interface VuexySalesByCountriesCardProps {
  title?: string
  subtitle?: string
  items?: SkillItem[]
}

const defaultItems: SkillItem[] = [
  {
    id: 'listening',
    name: 'TOEIC Listening',
    category: 'Part 1 - 4 Audio',
    value: '1,450 lượt',
    trend: '25.8%',
    isPositive: true,
    icon: Headphones,
    colorClass: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400',
  },
  {
    id: 'reading',
    name: 'TOEIC Reading',
    category: 'Part 5 - 7 Reading',
    value: '1,120 lượt',
    trend: '18.4%',
    isPositive: true,
    icon: BookOpen,
    colorClass: 'bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400',
  },
  {
    id: 'speaking',
    name: 'Speaking AI',
    category: 'Phát âm & Hội thoại',
    value: '865 bài',
    trend: '12.4%',
    isPositive: true,
    icon: Mic,
    colorClass: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400',
  },
  {
    id: 'writing',
    name: 'Writing Essay',
    category: 'Chấm luận AI',
    value: '745 bài',
    trend: '6.2%',
    isPositive: false,
    icon: PenTool,
    colorClass: 'bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400',
  },
  {
    id: 'vocab',
    name: 'Flashcard SRS',
    category: 'Kho từ vựng 3000+',
    value: '4,250 từ',
    trend: '22.6%',
    isPositive: true,
    icon: Layers,
    colorClass: 'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400',
  },
  {
    id: 'ipa',
    name: 'Ngữ Âm IPA',
    category: 'Bảng phiên âm quốc tế',
    value: '520 lượt',
    trend: '9.8%',
    isPositive: true,
    icon: Volume2,
    colorClass: 'bg-purple-50 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400',
  },
]

export function VuexySalesByCountriesCard({
  title = 'Phân Bổ Kỹ Năng & Luyện Đề',
  subtitle = 'Tổng quan tương tác học tập tháng này',
  items = defaultItems,
}: VuexySalesByCountriesCardProps) {
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
                Tải xuống
              </button>
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
                <span className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${item.colorClass}`}>
                  <IconComp className="w-4 h-4" />
                </span>
                <div>
                  <h6 className="text-xs font-bold text-slate-800 dark:text-slate-100">{item.name}</h6>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">{item.category}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-right">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{item.value}</span>
                <div
                  className={`flex items-center text-xs font-semibold ${
                    item.isPositive
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {item.isPositive ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  {item.trend}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}


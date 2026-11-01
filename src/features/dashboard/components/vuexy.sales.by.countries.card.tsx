// Component thẻ phân bổ học liệu theo 4 kỹ năng Sales by Countries theo phong cách Vuexy Admin.

import { useState } from 'react'
import { MoreVertical, Headphones, BookOpen, Mic, PenTool, Layers, Volume2 } from 'lucide-react'

interface VuexySalesByCountriesCardProps {
  totalWords: number
  publicDecksCount: number
  writingCount: number
  speakingCount: number
  listeningCount: number
  grammarPointsCount: number
  title?: string
  subtitle?: string
}

export function VuexySalesByCountriesCard({
  totalWords,
  publicDecksCount,
  writingCount,
  speakingCount,
  listeningCount,
  grammarPointsCount,
  title = 'Phân Bổ Kỹ Năng & Luyện Đề',
  subtitle = 'Tổng hợp số lượng học liệu theo 4 kỹ năng',
}: VuexySalesByCountriesCardProps) {
  const [showMenu, setShowMenu] = useState(false)

  const items = [
    {
      id: 'vocab',
      name: 'Kho Từ Vựng SRS',
      category: 'Từ vựng chuẩn CEFR',
      value: `${totalWords.toLocaleString('vi-VN')} từ`,
      tag: 'Toàn sàn',
      icon: Layers,
      colorClass: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400',
    },
    {
      id: 'decks',
      name: 'Bộ Thẻ Flashcard',
      category: 'Bộ thẻ từ vựng cộng đồng',
      value: `${publicDecksCount} bộ thẻ`,
      tag: 'Công khai',
      icon: BookOpen,
      colorClass: 'bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400',
    },
    {
      id: 'writing',
      name: 'Bài Luyện Viết (Writing)',
      category: 'Viết câu & chấm luận AI',
      value: `${writingCount} bài`,
      tag: 'Luyện tập',
      icon: PenTool,
      colorClass: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400',
    },
    {
      id: 'speaking',
      name: 'Bài Luyện Nói (Speaking)',
      category: 'Phát âm & hội thoại AI',
      value: `${speakingCount} bài`,
      tag: 'Luyện tập',
      icon: Mic,
      colorClass: 'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400',
    },
    {
      id: 'listening',
      name: 'Bài Luyện Nghe (Listening)',
      category: 'Nghe hiểu ngữ cảnh Audio',
      value: `${listeningCount} bài`,
      tag: 'Luyện tập',
      icon: Headphones,
      colorClass: 'bg-purple-50 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400',
    },
    {
      id: 'grammar',
      name: 'Chủ Điểm Ngữ Pháp',
      category: 'Cấu trúc ngữ pháp TOEIC',
      value: `${grammarPointsCount} điểm`,
      tag: 'Ngữ pháp',
      icon: Volume2,
      colorClass: 'bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400',
    },
  ]

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
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {item.tag}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

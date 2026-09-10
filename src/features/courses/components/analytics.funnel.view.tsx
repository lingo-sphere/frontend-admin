/**
 * @file analytics.funnel.view.tsx
 * @description Giao diện Phễu học tập & Điểm rơi (Retention Funnel) qua từng chương học và cảnh báo rủi ro
 */

import { Activity, AlertTriangle } from 'lucide-react'
import type { ChapterFunnelItem } from '@/features/courses/hooks/use.course.analytics'

interface AnalyticsFunnelViewProps {
  chapterFunnel: ChapterFunnelItem[]
  worstChapter: ChapterFunnelItem | null
}

export function AnalyticsFunnelView({ chapterFunnel, worstChapter }: AnalyticsFunnelViewProps) {
  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Phễu Học Tập & Điểm Rơi Qua Từng Chương (Retention Funnel)</span>
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Quan sát tỷ lệ giữ chân học viên và điểm số bài kiểm tra qua từng chặng chương học.
          </p>
        </div>
      </div>

      <div className="space-y-4 pt-2">
        {chapterFunnel.map((ch, idx) => (
          <div
            key={ch.order}
            className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 space-y-2.5 transition-all hover:border-indigo-300 dark:hover:border-indigo-700"
          >
            <div className="flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-black flex items-center justify-center text-xs shrink-0">
                  {ch.order}
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                  {ch.title}
                </span>
              </div>

              <div className="flex items-center gap-3 shrink-0 text-right font-mono">
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                  {ch.reachedCount} học viên ({ch.retentionRate}%)
                </span>
                <span className="px-2 py-0.5 rounded-md font-bold text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                  Điểm TB: {ch.avgScore}/100
                </span>
              </div>
            </div>

            <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-700/60 overflow-hidden flex">
              <div
                className={`h-full transition-all duration-500 ${
                  ch.isHighDropOff
                    ? 'bg-amber-500'
                    : 'bg-indigo-600 dark:bg-indigo-500'
                }`}
                style={{ width: `${ch.retentionRate}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] pt-0.5 text-slate-400">
              <span>
                {idx === 0
                  ? 'Điểm bắt đầu khóa học'
                  : ch.dropOffFromPrev > 0
                  ? `Rơi rụng -${ch.dropOffFromPrev}% so với chương trước`
                  : 'Giữ chân 100% học viên tiếp tục'}
              </span>
              {ch.isHighDropOff && (
                <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Điểm nghẽn cần lưu ý
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {worstChapter && worstChapter.dropOffFromPrev > 0 && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-950 dark:text-amber-200 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-extrabold text-amber-900 dark:text-amber-100">
              Cảnh báo điểm rơi: {worstChapter.title} (Giảm {worstChapter.dropOffFromPrev}% học viên)
            </p>
            <p className="text-amber-800/90 dark:text-amber-200/80 leading-relaxed">
              Học viên thường gặp khó khăn hoặc giảm tốc độ học tập tại chương này. Bạn nên bổ sung tài liệu tóm tắt dạng Slide PDF hoặc mở rộng giải thích các câu hỏi kiểm tra khó.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

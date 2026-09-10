/**
 * @file analytics.recommendations.view.tsx
 * @description Bảng gợi ý sư phạm thông minh từ AI (Pedagogical Recommendations) dựa trên hành vi học viên
 */

import { Sparkles, Lightbulb, Target, Clock } from 'lucide-react'

export function AnalyticsRecommendationsView() {
  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-900/10 via-purple-900/5 to-slate-900/10 dark:from-indigo-950/40 dark:via-purple-950/20 dark:to-slate-900/40 border border-indigo-200/80 dark:border-indigo-800/80 shadow-xs space-y-5 flex flex-col justify-between">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Gợi Ý Sư Phạm Thông Minh (AI Insights)
            </h4>
            <p className="text-[11px] text-slate-400">Đề xuất tối ưu giáo án theo thời gian thực</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="p-3.5 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/70 space-y-1 shadow-2xs">
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400">
              <Lightbulb className="w-3.5 h-3.5 shrink-0" />
              <span>Củng cố tài liệu nghe Audio</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
              Học viên hoàn thành bài nghe đạt điểm cao hơn 18% ở bài kiểm tra kết khóa. Khuyến khích nhắc học viên tải file MP3 trong tab Tài liệu để ôn tập phản xạ.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/70 space-y-1 shadow-2xs">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <Target className="w-3.5 h-3.5 shrink-0" />
              <span>Hiệu quả tính năng Thi Vượt Cấp</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
              Nhóm học viên làm bài Test Thử Thách để mở khóa chương học tiết kiệm trung bình 45% thời gian và có tỷ lệ hoàn thành lộ trình TOEIC cao hơn 2.3 lần.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/70 space-y-1 shadow-2xs">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span>Thời lượng bài giảng lý tưởng</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
              Các bài học video từ 8-12 phút có tỷ lệ xem trọn vẹn (Completion retention) đạt 94%, cao hơn đáng kể so với các video trên 25 phút.
            </p>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-indigo-200/50 dark:border-indigo-800/50 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
        <span>Cập nhật tự động theo dữ liệu học viên</span>
        <span className="font-bold text-indigo-600 dark:text-indigo-400">LingoSphere AI</span>
      </div>
    </div>
  )
}

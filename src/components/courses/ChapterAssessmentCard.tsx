/**
 * @file ChapterAssessmentCard.tsx
 * @description Component quản lý bài kiểm tra đánh giá của từng chương học
 */

import { Award, FileSpreadsheet, Eye } from 'lucide-react'
import type { CourseModule } from './CourseBasicInfoTab'

interface ChapterAssessmentCardProps {
  module: CourseModule
  isVi: boolean
  onUpdateModule: (updated: Partial<CourseModule>) => void
  onOpenExcelModal: () => void
  onOpenViewerModal: () => void
}

export function ChapterAssessmentCard({
  module,
  isVi,
  onUpdateModule,
  onOpenExcelModal,
  onOpenViewerModal,
}: ChapterAssessmentCardProps) {
  const questionsList =
    module.test_questions ||
    module.post_mini_questions ||
    module.challenge_questions ||
    []
  const questionCount = questionsList.length
  const passingScore =
    module.passing_score ??
    module.post_mini_passing_score ??
    module.challenge_passing_score ??
    70

  return (
    <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-4 sm:p-5 space-y-3.5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600/15 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 ring-1 ring-indigo-500/30">
            <Award className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide flex items-center gap-2">
              {isVi ? 'Bài Kiểm Tra Đánh Giá Chương' : 'Chapter Assessment Test'}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {isVi
                ? 'Học viên làm đạt ngưỡng điểm để hoàn thành và mở khóa chương tiếp theo'
                : 'Students pass this test to complete and unlock the next chapter'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
            {isVi ? 'Ngưỡng đạt:' : 'Passing Score:'}
          </span>
          <input
            type="number"
            min={10}
            max={100}
            value={passingScore}
            onChange={(e) => {
              const val = Math.max(10, Math.min(100, Number(e.target.value) || 70))
              onUpdateModule({
                passing_score: val,
                challenge_passing_score: val,
                post_mini_passing_score: val,
              })
            }}
            className="w-12 h-7 text-center rounded-lg border border-slate-200 bg-slate-50 text-xs font-bold text-indigo-600 dark:bg-slate-950 dark:border-slate-700 dark:text-indigo-400 focus:outline-none focus:border-indigo-500"
          />
          <span className="text-[11px] font-bold text-slate-500">%</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-indigo-500/15 bg-white/70 dark:bg-slate-900/70 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            {questionCount > 0
              ? `✅ Đã có ${questionCount} câu hỏi trắc nghiệm`
              : '⚠️ Chưa có câu hỏi nào trong bài test này'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenExcelModal}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-500 transition-all cursor-pointer"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            <span>Upload File Excel (.xlsx)</span>
          </button>

          {questionCount > 0 && (
            <button
              type="button"
              onClick={onOpenViewerModal}
              className="flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50/70 px-3.5 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300 dark:hover:bg-indigo-900/40 transition-all cursor-pointer shadow-xs"
            >
              <Eye className="h-3.5 w-3.5 text-indigo-500" />
              <span>Xem/Sửa câu hỏi</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

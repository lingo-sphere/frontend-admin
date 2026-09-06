/**
 * @file chapter.assessment.summary.tsx
 * @description Thành phần hiển thị tổng quan ngân hàng câu hỏi trắc nghiệm của chương và các nút thao tác Excel/Xem sửa
 */

import { FileSpreadsheet, CheckCircle2, HelpCircle, Eye } from 'lucide-react'

interface ChapterAssessmentSummaryProps {
  questionCount: number
  isVi: boolean
  onOpenStudio: () => void
}

export function ChapterAssessmentSummary({
  questionCount,
  isVi,
  onOpenStudio,
}: ChapterAssessmentSummaryProps) {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white/90 p-3.5 dark:border-slate-800 dark:bg-slate-900/90 flex flex-col justify-between space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
          <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
          <span>{isVi ? 'Ngân hàng câu hỏi trắc nghiệm' : 'Question Bank'}</span>
        </span>
        {questionCount > 0 ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 text-[11px] font-extrabold border border-emerald-300/80 dark:border-emerald-700">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>
              {questionCount} {isVi ? 'câu hỏi' : 'questions'}
            </span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 text-[11px] font-semibold border border-amber-300/80 dark:border-amber-700">
            <HelpCircle className="w-3 h-3 text-amber-600" />
            <span>{isVi ? 'Chưa có câu hỏi' : 'Empty'}</span>
          </span>
        )}
      </div>

      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
        {isVi
          ? 'Hỗ trợ nạp gói ZIP (kèm file nghe & ảnh) hoặc file Excel (.xlsx), đồng thời xem và chỉnh sửa trực tiếp từng câu hỏi.'
          : 'Support ZIP packages (with audio & images) or Excel spreadsheets, with realtime card editing.'}
      </p>

      <div className="pt-1">
        <button
          type="button"
          onClick={onOpenStudio}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
        >
          {questionCount > 0 ? (
            <>
              <Eye className="w-3.5 h-3.5" />
              <span>
                {isVi
                  ? `Chỉnh Sửa Ngân Hàng Câu Hỏi (${questionCount} câu)`
                  : `Edit Question Bank (${questionCount} qs)`}
              </span>
            </>
          ) : (
            <>
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>
                {isVi ? 'Soạn Đề Thi / Nạp ZIP & Excel' : 'Create Exam / Import ZIP'}
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}

/**
 * @file chapter.assessment.summary.tsx
 * @description Thành phần hiển thị tổng quan ngân hàng câu hỏi trắc nghiệm của chương và các nút thao tác Excel/Xem sửa
 */

import { FileSpreadsheet, CheckCircle2, HelpCircle, Eye } from 'lucide-react'

interface ChapterAssessmentSummaryProps {
  questionCount: number
  isVi: boolean
  onOpenExcelModal: () => void
  onOpenViewerModal: () => void
}

export function ChapterAssessmentSummary({
  questionCount,
  isVi,
  onOpenExcelModal,
  onOpenViewerModal,
}: ChapterAssessmentSummaryProps) {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white/90 p-3 dark:border-slate-800 dark:bg-slate-900/90 flex flex-col justify-between space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          <span>{isVi ? 'Ngân hàng câu hỏi trắc nghiệm' : 'Question Bank'}</span>
        </span>
        {questionCount > 0 ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 text-[11px] font-extrabold border border-emerald-300/80 dark:border-emerald-700">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>
              {questionCount} {isVi ? 'câu hỏi' : 'questions'}
            </span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 text-[11px] font-semibold border border-amber-300/80 dark:border-amber-700">
            <HelpCircle className="w-3 h-3 text-amber-600" />
            <span>{isVi ? 'Chưa có câu hỏi' : 'Empty'}</span>
          </span>
        )}
      </div>

      <p className="text-[11px] text-slate-500 dark:text-slate-400">
        {isVi
          ? 'Tải file Excel mẫu câu hỏi trắc nghiệm để nhập tự động hàng loạt câu hỏi cho chương.'
          : 'Upload Excel file to bulk import multiple choice questions for this chapter.'}
      </p>

      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={onOpenExcelModal}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>{isVi ? 'Upload File Excel' : 'Import Excel'}</span>
        </button>

        {questionCount > 0 && (
          <button
            type="button"
            onClick={onOpenViewerModal}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-indigo-500" />
            <span>{isVi ? 'Xem & Sửa' : 'View/Edit'}</span>
          </button>
        )}
      </div>
    </div>
  )
}

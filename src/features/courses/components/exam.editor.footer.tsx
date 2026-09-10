// Footer điều khiển lưu bộ câu hỏi hoặc hủy bỏ trong giao diện soạn đề thi.

import { Loader2, Save } from 'lucide-react'

interface ExamEditorFooterProps {
  questionsCount: number
  isVi: boolean
  isSaving: boolean
  isCanceling?: boolean
  isCreateMode?: boolean
  onClose: () => void
  onSave: () => void
}

export function ExamEditorFooter({
  questionsCount,
  isVi,
  isSaving,
  isCanceling = false,
  isCreateMode = false,
  onClose,
  onSave,
}: ExamEditorFooterProps) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
        {isVi ? 'Tổng số câu hỏi:' : 'Total Questions:'}{' '}
        <span className="font-extrabold text-indigo-600 dark:text-indigo-400 text-sm">
          {questionsCount}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onClose}
          disabled={isCanceling}
          className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
        >
          {isCanceling
            ? isVi
              ? 'Đang hủy...'
              : 'Canceling...'
            : isVi
            ? 'Hủy'
            : 'Cancel'}
        </button>

        <button
          type="button"
          disabled={isSaving}
          onClick={onSave}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs hover:shadow-indigo-500/20 transition-all cursor-pointer disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{isVi ? 'Đang lưu bài thi...' : 'Saving...'}</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>
                {isCreateMode
                  ? isVi
                    ? 'Tạo Bài Thi & Lưu Câu Hỏi'
                    : 'Create Exam & Save Questions'
                  : isVi
                  ? 'Lưu Bài Thi & Ngân Hàng Câu Hỏi'
                  : 'Save Exam & Question Bank'}
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}

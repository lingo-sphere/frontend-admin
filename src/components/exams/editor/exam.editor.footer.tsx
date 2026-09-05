/**
 * @file exam.editor.footer.tsx
 * @description Footer điều khiển lưu bộ câu hỏi hoặc hủy bỏ trong modal soạn đề thi
 */

import { Loader2, Save } from 'lucide-react'

interface ExamEditorFooterProps {
  questionsCount: number
  isVi: boolean
  isSaving: boolean
  onClose: () => void
  onSave: () => void
}

export function ExamEditorFooter({
  questionsCount,
  isVi,
  isSaving,
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
          className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          {isVi ? 'Hủy' : 'Cancel'}
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
              <span>{isVi ? 'Đang lưu...' : 'Saving...'}</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>{isVi ? 'Lưu bộ câu hỏi đề thi' : 'Save Question Bank'}</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}

// Thanh tác vụ cố định đáy màn hình giúp quản trị viên lưu biểu mẫu nhanh chóng mà không cần cuộn trang.

import { Save, Loader2, ArrowLeft, Ban } from 'lucide-react'

export interface StickyFormActionBarProps {
  title?: string
  statusText?: string
  badgeText?: string
  cancelText?: string
  saveText?: string
  savingText?: string
  isSubmitting?: boolean
  disabled?: boolean
  onCancel?: () => void
  onAbortSave?: () => void
  abortText?: string
  onSave?: () => void
  saveButtonType?: 'submit' | 'button'
}

export function StickyFormActionBar({
  title,
  statusText = 'Đang quản lý:',
  badgeText,
  cancelText = 'Hủy Bỏ',
  saveText = 'Lưu Toàn Bộ Thay Đổi',
  savingText = 'Đang lưu...',
  isSubmitting = false,
  disabled = false,
  onCancel,
  onAbortSave,
  abortText,
  onSave,
  saveButtonType = 'submit',
}: StickyFormActionBarProps) {
  return (
    <div className="sticky bottom-0 z-30 flex items-center justify-between gap-4 py-3.5 px-4 sm:px-6 lg:px-7 -mx-4 sm:-mx-6 lg:-mx-7 -mb-4 sm:-mb-6 lg:-mb-7 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-950/5">
      <div className="flex items-center gap-2.5 min-w-0">
        {statusText && (
          <span className="text-xs font-medium text-slate-400 dark:text-slate-500 shrink-0">
            {statusText}
          </span>
        )}
        {title && (
          <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
            {title}
          </span>
        )}
        {badgeText && (
          <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80 shrink-0">
            {badgeText}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {isSubmitting && onAbortSave ? (
          <button
            type="button"
            onClick={onAbortSave}
            className="flex items-center gap-1.5 h-10 px-4 rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 dark:hover:bg-rose-900/60 text-xs font-bold transition-all cursor-pointer shadow-xs animate-pulse"
          >
            <Ban className="w-3.5 h-3.5" />
            <span>{abortText || 'Hủy Lưu & Dọn Dẹp'}</span>
          </button>
        ) : onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex items-center gap-1.5 h-10 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{cancelText}</span>
          </button>
        ) : null}
        <button
          type={saveButtonType}
          onClick={saveButtonType === 'button' ? onSave : undefined}
          disabled={isSubmitting || disabled}
          className="flex items-center gap-2 h-10 px-5 sm:px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>{isSubmitting ? savingText : saveText}</span>
        </button>
      </div>
    </div>
  )
}

// Modal xác nhận thao tác quản trị hệ thống với giao diện SaaS hiện đại hỗ trợ cả Light và Dark theme.
import { useEffect } from 'react'
import { AlertTriangle, Ban, Trash2, X } from 'lucide-react'

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  type?: 'danger' | 'warning' | 'success'
  variant?: 'danger' | 'warning' | 'success'
  icon?: 'ban' | 'delete' | 'warning'
  title: string
  message?: string
  description?: string
  confirmText?: string
  cancelText?: string
  isLoading?: boolean
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  type,
  variant = 'danger',
  icon = 'warning',
  title,
  message,
  description,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  isLoading = false,
}: ConfirmModalProps) {
  const modalType = type ? type : variant
  const modalMessage = message ? message : (description ? description : '')

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const getIcon = () => {
    switch (icon) {
      case 'ban':
        return <Ban className="w-6 h-6" />
      case 'delete':
        return <Trash2 className="w-6 h-6" />
      default:
        return <AlertTriangle className="w-6 h-6" />
    }
  }

  const getIconColorClasses = () => {
    switch (modalType) {
      case 'danger':
        return 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
      case 'warning':
        return 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
      case 'success':
        return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
      default:
        return 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
    }
  }

  const getConfirmButtonClasses = () => {
    switch (modalType) {
      case 'danger':
        return 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-600/30'
      case 'warning':
        return 'bg-amber-600 hover:bg-amber-700 text-white shadow-sm shadow-amber-600/30'
      case 'success':
        return 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/30'
      default:
        return 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-600/30'
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl relative z-10 flex flex-col items-center text-center gap-4 animate-in zoom-in-95 duration-150"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${getIconColorClasses()}`}>
          {getIcon()}
        </div>

        <div className="space-y-1">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">{title}</h2>
          {modalMessage && <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{modalMessage}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3 w-full pt-2">
          <button
            className="h-10 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors disabled:opacity-50 cursor-pointer"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </button>
          <button
            className={`h-10 px-4 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer ${getConfirmButtonClasses()}`}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

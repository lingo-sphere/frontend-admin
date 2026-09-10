/**
 * @file confirm.modal.tsx
 * @description Component giao diện ConfirmModal phục vụ khu vực Quản trị Admin
 */

import { useEffect } from 'react'
import { AlertTriangle, Ban, Trash2 } from 'lucide-react'

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
        return 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
      case 'warning':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
      case 'success':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
      default:
        return 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
    }
  }

  const getConfirmButtonClasses = () => {
    switch (modalType) {
      case 'danger':
        return 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30'
      case 'warning':
        return 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/30'
      case 'success':
        return 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
      default:
        return 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30'
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/25 dark:bg-black/35 backdrop-blur-[2px] animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-2xl ring-1 ring-black/5 dark:ring-white/10 relative z-10 flex flex-col items-center text-center gap-4 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${getIconColorClasses()}`}>
          {getIcon()}
        </div>

        <div className="space-y-1">
          <h2 className="text-lg font-bold text-slate-100">{title}</h2>
          {modalMessage && <p className="text-xs text-slate-400 leading-relaxed">{modalMessage}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3 w-full pt-2">
          <button
            className="h-10 px-4 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-xs font-semibold text-slate-300 transition-colors disabled:opacity-50 cursor-pointer"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </button>
          <button
            className={`h-10 px-4 rounded-xl text-white text-xs font-semibold shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer ${getConfirmButtonClasses()}`}
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

/**
 * @file ToastContainer.tsx
 * @description Component giao diện ToastContainer phục vụ khu vực Quản trị Admin
 */

import { useToastStore, type ToastType } from '@/store/toast-store'
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react'

function ToastIcon({ type }: { type: ToastType }) {
  switch (type) {
    case 'success':
      return <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
    case 'error':
      return <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
    case 'warning':
      return <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
    case 'info':
    default:
      return <Info className="w-5 h-5 text-sky-400 shrink-0" />
  }
}

const typeStyles: Record<ToastType, string> = {
  success: 'border-emerald-500/30 bg-emerald-950/90 text-emerald-100 shadow-emerald-950/40',
  error: 'border-rose-500/30 bg-rose-950/90 text-rose-100 shadow-rose-950/40',
  warning: 'border-amber-500/30 bg-amber-950/90 text-amber-100 shadow-amber-950/40',
  info: 'border-sky-500/30 bg-sky-950/90 text-sky-100 shadow-sky-950/40',
}

export function ToastContainer() {
  const toasts = useToastStore((state) => state.toasts)
  const removeToast = useToastStore((state) => state.removeToast)

  if (toasts.length === 0) return null

  return (
    <div
      className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-md w-full pointer-events-none px-4"
      aria-live="polite"
    >
      {toasts.map((item) => (
        <div
          key={item.id}
          className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md shadow-xl transition-all animate-in slide-in-from-right duration-200 ${typeStyles[item.type]}`}
        >
          <ToastIcon type={item.type} />
          <div className="flex-1 min-w-0">
            {item.title && <h4 className="text-sm font-semibold mb-0.5 tracking-tight">{item.title}</h4>}
            <p className="text-xs text-opacity-90 leading-relaxed break-words">{item.message}</p>
          </div>
          <button
            onClick={() => removeToast(item.id)}
            className="text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Đóng thông báo"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  )
}

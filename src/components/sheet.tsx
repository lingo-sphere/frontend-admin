// Component giao diện Sheet drawer trượt từ cạnh màn hình cho Admin.

import React, { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SheetProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children?: React.ReactNode
}

export function Sheet({ open, onOpenChange, children }: SheetProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200 cursor-pointer"
        onClick={() => onOpenChange?.(false)}
      />

      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex h-full w-[280px] sm:w-[320px] max-w-full flex-col',
          'bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 shadow-2xl',
          'animate-in slide-in-from-left duration-250 ease-out'
        )}
      >
        <button
          className="absolute right-3.5 top-3.5 z-50 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          onClick={() => onOpenChange?.(false)}
          type="button"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
        {children}
      </div>
    </div>
  )
}

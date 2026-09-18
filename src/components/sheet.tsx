// Component giao dien Sheet drawer truot tu canh man hinh cho Admin.

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
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
      />

      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex h-full w-3/4 max-w-sm flex-col',
          'bg-surface border-r border-border p-6 shadow-lg',
          'animate-in slide-in-from-left duration-300'
        )}
      >
        <button
          className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100"
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

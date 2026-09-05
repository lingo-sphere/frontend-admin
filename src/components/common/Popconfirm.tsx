/**
 * @file popconfirm.tsx
 * @description Component giao diện Popconfirm phục vụ khu vực Quản trị Admin
 */

import { useState, useRef, useEffect, useCallback, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

interface PopconfirmProps {
  title: string
  description?: string
  okText?: string
  cancelText?: string
  okType?: 'danger' | 'primary'
  onConfirm: () => void | Promise<void>
  onCancel?: () => void
  children: ReactNode
  disabled?: boolean
  placement?: 'top' | 'topRight' | 'topLeft' | 'bottom' | 'bottomRight' | 'bottomLeft'
}

export function Popconfirm({
  title,
  description,
  okText = 'Xóa',
  cancelText = 'Hủy',
  okType = 'danger',
  onConfirm,
  onCancel,
  children,
  disabled = false,
}: PopconfirmProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const triggerRef = useRef<HTMLDivElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)

  const [coords, setCoords] = useState<{ top: number; left: number; isBottom: boolean }>({
    top: 0,
    left: 0,
    isBottom: false,
  })

  const calculateCoords = useCallback(() => {
    if (!triggerRef.current) return null
    const rect = triggerRef.current.getBoundingClientRect()
    const popoverWidth = 240
    const popoverHeight = description ? 110 : 85

    const spaceAbove = rect.top
    const isBottom = spaceAbove < popoverHeight + 20

    let top = 0
    if (isBottom) {
      top = rect.bottom + 8
    } else {
      top = rect.top - popoverHeight - 8
    }

    let left = rect.right - popoverWidth
    if (left < 10) left = 10
    if (left + popoverWidth > window.innerWidth - 10) {
      left = window.innerWidth - popoverWidth - 10
    }

    return { top, left, isBottom }
  }, [description])

  const openPopconfirm = () => {
    const initialCoords = calculateCoords()
    if (initialCoords) {
      setCoords(initialCoords)
    }
    setIsMounted(true)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsVisible(true)
      })
    })
  }

  const closePopconfirm = useCallback(() => {
    setIsVisible(false)
    setTimeout(() => {
      setIsMounted(false)
    }, 150)
  }, [])

  useEffect(() => {
    if (!isMounted) return

    const handleScrollOrResize = () => {
      const nextCoords = calculateCoords()
      if (nextCoords) setCoords(nextCoords)
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node) &&
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node)
      ) {
        closePopconfirm()
        onCancel?.()
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closePopconfirm()
        onCancel?.()
      }
    }

    window.addEventListener('scroll', handleScrollOrResize, true)
    window.addEventListener('resize', handleScrollOrResize)
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true)
      window.removeEventListener('resize', handleScrollOrResize)
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isMounted, closePopconfirm, onCancel, calculateCoords])

  const handleTriggerClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (disabled) return
    if (!isMounted) {
      openPopconfirm()
    } else {
      closePopconfirm()
    }
  }

  const handleOk = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      setIsLoading(true)
      await onConfirm()
      closePopconfirm()
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation()
    closePopconfirm()
    onCancel?.()
  }

  return (
    <>
      <div
        ref={triggerRef}
        onClick={handleTriggerClick}
        className="inline-flex items-center"
      >
        {children}
      </div>

      {isMounted &&
        createPortal(
          <div
            ref={popoverRef}
            style={{
              position: 'fixed',
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              zIndex: 9999,
              width: '240px',
              transformOrigin: coords.isBottom ? 'top right' : 'bottom right',
            }}
            className={`rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xl p-3 select-none transition-all duration-150 ease-out ${
              isVisible
                ? 'opacity-100 scale-100 translate-y-0'
                : 'opacity-0 scale-90 pointer-events-none'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-2">
              <div className="w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-xs">
                <span className="text-[11px] font-black leading-none">!</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight">
                  {title}
                </p>
                {description && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                    {description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-1.5 mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isLoading}
                className="h-7 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 text-[11px] font-semibold transition-colors cursor-pointer"
              >
                {cancelText}
              </button>
              <button
                type="button"
                onClick={handleOk}
                disabled={isLoading}
                className={`h-7 px-3 rounded-lg text-[11px] font-semibold text-white transition-all shadow-xs cursor-pointer ${
                  okType === 'danger'
                    ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/20'
                    : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/20'
                }`}
              >
                {isLoading ? 'Đang xóa...' : okText}
              </button>
            </div>

            {coords.isBottom ? (
              <div className="absolute -top-1.5 right-4 w-3 h-3 bg-white dark:bg-slate-900 border-l border-t border-slate-200/90 dark:border-slate-800 rotate-45" />
            ) : (
              <div className="absolute -bottom-1.5 right-4 w-3 h-3 bg-white dark:bg-slate-900 border-r border-b border-slate-200/90 dark:border-slate-800 rotate-45" />
            )}
          </div>,
          document.body
        )}
    </>
  )
}

// Component thanh tab chuyển nội dung chuẩn dùng chung cho toàn bộ Lingo Sphere Admin.

import React, { useId, useRef, useState } from 'react'

export interface AdminTabItem {
  key: string
  label: React.ReactNode
  icon?: React.ComponentType<{ className?: string }> | React.ReactNode
  badge?: React.ReactNode
  count?: number | string
  dot?: boolean
  disabled?: boolean
  children?: React.ReactNode
  className?: string
}

export interface AdminTabsProps {
  items: AdminTabItem[]
  activeKey?: string
  defaultActiveKey?: string
  onChange?: (key: string) => void
  className?: string
  tabListClassName?: string
  tabBarExtraContent?: React.ReactNode
  size?: 'sm' | 'md'
  destroyInactiveTabPane?: boolean
}

export function AdminTabs({
  items,
  activeKey,
  defaultActiveKey,
  onChange,
  className = '',
  tabListClassName = '',
  tabBarExtraContent,
  size = 'md',
  destroyInactiveTabPane = true,
}: AdminTabsProps) {
  const baseId = useId()
  const tabListRef = useRef<HTMLDivElement>(null)
  const [internalKey, setInternalKey] = useState<string>(() => defaultActiveKey ?? items[0]?.key ?? '')

  const currentKey = activeKey !== undefined ? activeKey : internalKey

  const handleSelect = (key: string, disabled?: boolean) => {
    if (disabled || key === currentKey) return
    if (activeKey === undefined) {
      setInternalKey(key)
    }
    onChange?.(key)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const enabledItems = items.filter((item) => !item.disabled)
    const currentIndex = enabledItems.findIndex((item) => item.key === currentKey)
    if (currentIndex === -1) return

    let nextKey: string | null = null
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault()
      const nextItem = enabledItems[(currentIndex + 1) % enabledItems.length]
      nextKey = nextItem.key
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault()
      const prevItem = enabledItems[(currentIndex - 1 + enabledItems.length) % enabledItems.length]
      nextKey = prevItem.key
    } else if (e.key === 'Home') {
      e.preventDefault()
      nextKey = enabledItems[0]?.key ?? null
    } else if (e.key === 'End') {
      e.preventDefault()
      nextKey = enabledItems[enabledItems.length - 1]?.key ?? null
    }

    if (nextKey && nextKey !== currentKey) {
      handleSelect(nextKey)
      const nextBtn = tabListRef.current?.querySelector<HTMLButtonElement>(`[data-tab-key="${nextKey}"]`)
      nextBtn?.focus()
    }
  }

  const activeItem = items.find((item) => item.key === currentKey)
  const hasPanes = items.some((item) => item.children !== undefined)

  const paddingClass = size === 'sm' ? 'px-3 py-1.5 rounded-lg text-xs' : 'px-4 py-2.5 rounded-xl text-xs'

  return (
    <div className={`space-y-4 ${className}`.trim()}>
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-1 gap-3">
        <div
          ref={tabListRef}
          role="tablist"
          aria-orientation="horizontal"
          onKeyDown={handleKeyDown}
          className={`flex items-center gap-2 overflow-x-auto scrollbar-none min-w-0 ${tabListClassName}`.trim()}
        >
          {items.map((tab) => {
            const isActive = tab.key === currentKey
            const Icon = tab.icon

            const renderIcon = () => {
              if (!Icon) return null
              if (typeof Icon === 'function') {
                const IconComponent = Icon as React.ComponentType<{ className?: string }>
                return <IconComponent className="w-4 h-4 shrink-0" />
              }
              if (React.isValidElement(Icon)) {
                return <span className="w-4 h-4 shrink-0 flex items-center justify-center">{Icon}</span>
              }
              return null
            }

            return (
              <button
                key={tab.key}
                id={`${baseId}-tab-${tab.key}`}
                data-tab-key={tab.key}
                role="tab"
                type="button"
                aria-selected={isActive}
                aria-controls={`${baseId}-pane-${tab.key}`}
                tabIndex={isActive ? 0 : -1}
                disabled={tab.disabled}
                onClick={() => handleSelect(tab.key, tab.disabled)}
                className={`flex items-center gap-2 font-bold transition-all cursor-pointer select-none relative shrink-0 outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus-visible:ring-offset-1 ${paddingClass} ${
                  tab.disabled
                    ? 'opacity-40 cursor-not-allowed hover:bg-transparent text-slate-400 dark:text-slate-600'
                    : isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                } ${tab.className || ''}`.trim()}
              >
                {renderIcon()}
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
                {tab.badge && <span className="shrink-0">{tab.badge}</span>}
                {tab.dot && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 absolute top-1.5 right-1.5 animate-pulse" />
                )}
              </button>
            )
          })}
        </div>

        {tabBarExtraContent && (
          <div className="shrink-0 flex items-center gap-2">
            {tabBarExtraContent}
          </div>
        )}
      </div>

      {hasPanes && (
        <div className="min-w-0">
          {destroyInactiveTabPane ? (
            activeItem?.children ? (
              <div
                key={activeItem.key}
                role="tabpanel"
                id={`${baseId}-pane-${activeItem.key}`}
                aria-labelledby={`${baseId}-tab-${activeItem.key}`}
                className="animate-in fade-in duration-200 min-w-0"
              >
                {activeItem.children}
              </div>
            ) : null
          ) : (
            items.map((tab) => (
              <div
                key={tab.key}
                role="tabpanel"
                id={`${baseId}-pane-${tab.key}`}
                aria-labelledby={`${baseId}-tab-${tab.key}`}
                hidden={tab.key !== currentKey}
                className={tab.key === currentKey ? 'animate-in fade-in duration-200 min-w-0' : 'hidden'}
              >
                {tab.children}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

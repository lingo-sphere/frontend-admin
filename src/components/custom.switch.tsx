// Component CustomSwitch tạo nút gạt bật tắt hiện đại với hiệu ứng chuyển động mượt mà và trạng thái tải.
import React, { forwardRef } from 'react'
import { Loader2 } from 'lucide-react'

export interface CustomSwitchProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange' | 'size'> {
  checked?: boolean
  defaultChecked?: boolean
  onChange?: (checked: boolean) => void
  disabled?: boolean
  loading?: boolean
  size?: 'small' | 'default' | 'sm' | 'md' | 'lg'
  color?: 'emerald' | 'indigo' | 'blue' | 'rose'
}

export const CustomSwitch = forwardRef<HTMLButtonElement, CustomSwitchProps>(
  (
    {
      checked = false,
      onChange,
      disabled = false,
      loading = false,
      size = 'sm',
      color = 'emerald',
      className = '',
      'aria-label': ariaLabel,
      ...props
    },
    ref
  ) => {
    const isSmall = size === 'small' || size === 'sm'
    const isLarge = size === 'lg'
    const isDisabled = disabled || loading

    const trackClasses = isSmall
      ? 'w-8 h-4.5 p-0.5'
      : isLarge
      ? 'w-13 h-7.5 p-1'
      : 'w-10.5 h-6 p-0.5'

    const thumbClasses = isSmall
      ? 'w-3.5 h-3.5'
      : isLarge
      ? 'w-5.5 h-5.5'
      : 'w-5 h-5'

    const translateChecked = isSmall
      ? 'translate-x-3.5'
      : isLarge
      ? 'translate-x-5.5'
      : 'translate-x-4.5'

    const colorClasses = {
      emerald: {
        checked: 'bg-emerald-500 dark:bg-emerald-600 shadow-sm shadow-emerald-500/30 hover:ring-4 hover:ring-emerald-500/20',
        spinner: 'text-emerald-600 dark:text-emerald-400',
      },
      indigo: {
        checked: 'bg-indigo-600 dark:bg-indigo-500 shadow-sm shadow-indigo-600/30 hover:ring-4 hover:ring-indigo-500/20',
        spinner: 'text-indigo-600 dark:text-indigo-400',
      },
      blue: {
        checked: 'bg-blue-600 dark:bg-blue-500 shadow-sm shadow-blue-600/30 hover:ring-4 hover:ring-blue-500/20',
        spinner: 'text-blue-600 dark:text-blue-400',
      },
      rose: {
        checked: 'bg-rose-500 dark:bg-rose-600 shadow-sm shadow-rose-500/30 hover:ring-4 hover:ring-rose-500/20',
        spinner: 'text-rose-600 dark:text-rose-400',
      },
    }[color]

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault()
      e.stopPropagation()
      if (isDisabled) return
      onChange?.(!checked)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (isDisabled) return
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        e.stopPropagation()
        onChange?.(!checked)
      }
    }

    return (
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={ariaLabel}
        disabled={isDisabled}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={`group relative inline-flex shrink-0 items-center rounded-full transition-[background-color,box-shadow,opacity] duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-500 dark:focus-visible:ring-offset-slate-900 ${
          trackClasses
        } ${
          checked
            ? colorClasses.checked
            : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600/80 hover:ring-4 hover:ring-slate-200/50 dark:hover:ring-slate-700/50'
        } ${
          isDisabled ? 'opacity-60 cursor-not-allowed pointer-events-none' : 'cursor-pointer active:scale-98'
        } ${className}`}
        {...props}
      >
        <span
          className={`pointer-events-none flex items-center justify-center rounded-full bg-white dark:bg-slate-100 shadow-md shadow-black/20 ring-0 transition-transform duration-300 ease-[cubic-bezier(0.34,1.4,0.64,1)] ${
            thumbClasses
          } ${
            checked ? translateChecked : 'translate-x-0'
          }`}
        >
          {loading ? (
            <Loader2
              className={`animate-spin ${isSmall ? 'w-2.5 h-2.5' : isLarge ? 'w-3.5 h-3.5' : 'w-3 h-3'} ${
                checked ? colorClasses.spinner : 'text-slate-500'
              }`}
            />
          ) : null}
        </span>
      </button>
    )
  }
)

CustomSwitch.displayName = 'CustomSwitch'

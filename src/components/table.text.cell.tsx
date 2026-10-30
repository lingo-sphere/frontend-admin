// Component hiển thị văn bản ô bảng dữ liệu chuẩn hóa hỗ trợ tooltip và ellipsis tự nhiên.

import type { ReactNode } from 'react'
import { Tooltip } from 'antd'

export interface TableTextCellProps {
  text?: string | null
  subText?: string | null
  prefix?: ReactNode
  badge?: ReactNode
  className?: string
  subClassName?: string
  multiline?: boolean
  maxLines?: number
  onClick?: () => void
}

export function TableTextCell({
  text,
  subText,
  prefix,
  badge,
  className = 'font-semibold text-xs',
  subClassName = '',
  multiline = false,
  maxLines = 2,
  onClick,
}: TableTextCellProps) {
  if (!text && !subText) {
    return <span className="text-slate-400 dark:text-slate-600">—</span>
  }

  const primaryContent = (
    <span
      className={`min-w-0 flex-1 ${
        multiline
          ? maxLines === 2
            ? 'line-clamp-2 break-words'
            : maxLines === 3
            ? 'line-clamp-3 break-words'
            : 'break-words'
          : 'truncate block w-full'
      } ${
        onClick
          ? 'text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer'
          : 'text-slate-900 dark:text-slate-100'
      } ${className}`}
      onClick={onClick}
    >
      {text || '—'}
    </span>
  )

  return (
    <div className="min-w-0 w-full flex flex-col justify-center gap-0.5">
      <div className="min-w-0 w-full flex items-center gap-1.5">
        {prefix ? <span className="shrink-0 flex items-center">{prefix}</span> : null}
        {text ? (
          <Tooltip title={text} placement="topLeft" mouseEnterDelay={0.3}>
            {primaryContent}
          </Tooltip>
        ) : (
          primaryContent
        )}
        {badge ? <span className="shrink-0 flex items-center">{badge}</span> : null}
      </div>
      {subText ? (
        <Tooltip title={subText} placement="topLeft" mouseEnterDelay={0.3}>
          <span
            className={`min-w-0 truncate block text-[11px] text-slate-400 dark:text-slate-500 font-mono w-full ${subClassName}`}
          >
            {subText}
          </span>
        </Tooltip>
      ) : null}
    </div>
  )
}

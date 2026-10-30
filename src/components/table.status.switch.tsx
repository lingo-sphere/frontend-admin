// Component Switch chuẩn hóa trạng thái bật/tắt trên các bảng dữ liệu Admin LingoSphere.
import React from 'react'
import { Switch, type SwitchProps } from 'antd'

export interface TableStatusSwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void | Promise<void>
  disabled?: boolean
  loading?: boolean
  size?: 'small' | 'default'
  checkedChildren?: React.ReactNode
  unCheckedChildren?: React.ReactNode
  ariaLabel?: string
  className?: string
}

export function TableStatusSwitch({
  checked,
  onChange,
  disabled = false,
  loading = false,
  size = 'small',
  checkedChildren = 'Bật',
  unCheckedChildren = 'Ẩn',
  ariaLabel,
  className = '',
}: TableStatusSwitchProps) {
  const isDisabled = disabled || loading

  const handleChange: SwitchProps['onChange'] = (nextChecked, event) => {
    event?.stopPropagation()
    if (isDisabled) return
    void onChange(nextChecked)
  }

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
      className={`inline-flex items-center justify-center ${className}`}
    >
      <Switch
        size={size}
        checked={checked}
        onChange={handleChange}
        disabled={isDisabled}
        loading={loading}
        checkedChildren={checkedChildren}
        unCheckedChildren={unCheckedChildren}
        aria-label={ariaLabel}
      />
    </div>
  )
}


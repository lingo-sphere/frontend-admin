// Reusable DateRangeFilter component
// UI matching the filter chip style

import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'

interface DateRangeFilterProps {
  value: string // Format: 'YYYY-MM-DD_YYYY-MM-DD' or ''
  onChange: (value: string) => void
  label?: string
}

export function DateRangeFilter({ value, onChange, label }: DateRangeFilterProps) {
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'

  const [fromValue, toValue] = value ? value.split('_') : ['', '']
  const hasValue = value && (fromValue || toValue)

  const handleFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const from = e.target.value
    const newValue = `${from}_${toValue}`
    onChange(from || toValue ? newValue : '')
  }

  const handleToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const to = e.target.value
    const newValue = `${fromValue}_${to}`
    onChange(fromValue || to ? newValue : '')
  }

  const handleClear = () => {
    onChange('')
  }

  return (
    <div className="filter-group">
      {label && <label className="filter-label">{label}</label>}
      <div className="filter-chips">
        <div className="date-chip">
          <input
            type="date"
            className="date-chip-input"
            value={fromValue}
            onChange={handleFromChange}
            placeholder={isVietnamese ? 'Từ ngày' : 'From'}
          />
        </div>
        <span className="date-chip-separator">-</span>
        <div className="date-chip">
          <input
            type="date"
            className="date-chip-input"
            value={toValue}
            onChange={handleToChange}
            placeholder={isVietnamese ? 'Đến ngày' : 'To'}
          />
        </div>
        {hasValue && (
          <button
            className="date-chip-clear"
            onClick={handleClear}
            type="button"
            aria-label={isVietnamese ? 'Xóa' : 'Clear'}
          >
            <X />
          </button>
        )}
      </div>
    </div>
  )
}

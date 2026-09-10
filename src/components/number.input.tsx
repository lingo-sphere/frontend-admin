// Component input so ho tro xoa rong va ngan ngua so 0 dinh o dau.

import React, { useState, useEffect } from 'react'

export interface NumberInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value: number | undefined | null
  onChange: (val: number) => void
  min?: number
  max?: number
  fallbackValue?: number
}

export function NumberInput({
  value,
  onChange,
  min,
  max,
  fallbackValue,
  className,
  onBlur,
  onFocus,
  ...props
}: NumberInputProps) {
  const [isFocused, setIsFocused] = useState<boolean>(false)
  const [text, setText] = useState<string>(() => {
    if (value === undefined || value === null) return ''
    return String(value)
  })

  useEffect(() => {
    if (isFocused) return
    if (value === undefined || value === null) {
      setText('')
      return
    }
    const currentNum = text === '' ? null : Number(text)
    if (value !== currentNum) {
      setText(String(value))
    }
  }, [value, isFocused])

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true)
    onFocus?.(e)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    if (raw === '') {
      setText('')
      return
    }

    const sanitized = raw.replace(/^0+(?=\d)/, '')
    setText(sanitized)
    const num = Number(sanitized)
    if (!isNaN(num)) {
      onChange(num)
    }
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false)
    if (text === '') {
      const fb = fallbackValue ?? (min !== undefined ? min : 0)
      setText(String(fb))
      onChange(fb)
    } else {
      let num = Number(text)
      if (isNaN(num)) {
        num = fallbackValue ?? (min !== undefined ? min : 0)
      } else {
        if (min !== undefined && num < min) num = min
        if (max !== undefined && num > max) num = max
      }
      setText(String(num))
      onChange(num)
    }
    onBlur?.(e)
  }

  return (
    <input
      type="number"
      min={min}
      max={max}
      value={text}
      onFocus={handleFocus}
      onChange={handleChange}
      onBlur={handleBlur}
      className={className}
      {...props}
    />
  )
}

// Custom hook quản lý trạng thái tải lại kèm hiệu ứng quay mượt mà tối thiểu.
import { useState, useCallback } from 'react'

export function useReloadAnimation(
  action?: () => Promise<unknown> | unknown,
  minDurationMs = 800
) {
  const [isReloading, setIsReloading] = useState(false)

  const trigger = useCallback(
    async (overrideAction?: () => Promise<unknown> | unknown) => {
      if (isReloading) return
      setIsReloading(true)
      const startTime = Date.now()
      const fn = overrideAction || action
      try {
        if (fn) {
          await fn()
        }
      } finally {
        const elapsed = Date.now() - startTime
        const remaining = Math.max(0, minDurationMs - elapsed)
        if (remaining > 0) {
          setTimeout(() => {
            setIsReloading(false)
          }, remaining)
        } else {
          setIsReloading(false)
        }
      }
    },
    [action, isReloading, minDurationMs]
  )

  return { isReloading, trigger }
}

/**
 * @file use-theme-sync.ts
 * @description Custom React hook use-theme-sync trong ứng dụng Admin
 */

import { useEffect } from 'react'
import { useAdminStore } from '@/store/admin-store'

export function useThemeSync(): void {
  const theme = useAdminStore((state) => state.theme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('light')
    } else {
      document.documentElement.classList.add('light')
      document.documentElement.classList.remove('dark')
    }
  }, [theme])
}

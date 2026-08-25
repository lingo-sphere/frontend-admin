// Updated: 2026-08-22
// Root App component cho admin dashboard

import { useEffect } from 'react'
import { AdminShell } from '@/components/admin/AdminShell'
import { PageRouter } from '@/components/admin/PageRouter'
import { useAdminStore } from '@/store/admin-store'

export function App() {
  const theme = useAdminStore((state) => state.theme)

  // Apply theme to document on mount and when theme changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  return (
    <AdminShell>
      <PageRouter />
    </AdminShell>
  )
}

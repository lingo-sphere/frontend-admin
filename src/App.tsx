import { useEffect } from 'react'
import { AdminShell } from '@/components/admin/AdminShell'
import { PageRouter } from '@/components/admin/PageRouter'
import { useAdminStore } from '@/store/admin-store'

export function App() {
  const theme = useAdminStore((state) => state.theme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  return (
    <AdminShell>
      <PageRouter />
    </AdminShell>
  )
}

import { AdminShell } from '@/components/admin/AdminShell'
import { PageRouter } from '@/components/admin/PageRouter'
import { AuthGuard } from '@/components/admin/AuthGuard'
import { ToastContainer } from '@/components/common/ToastContainer'
import { SessionKickoutModal } from '@/components/admin/SessionKickoutModal'
import { useThemeSync } from '@/hooks/use-theme-sync'

export function App() {
  useThemeSync()

  return (
    <>
      <AuthGuard>
        <AdminShell>
          <PageRouter />
        </AdminShell>
      </AuthGuard>
      <ToastContainer />
      <SessionKickoutModal />
    </>
  )
}

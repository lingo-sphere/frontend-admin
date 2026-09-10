/**
 * @file app.tsx
 * @description Mã nguồn thành phần App.tsx
 */

import { AdminShell } from '@/layouts/admin.shell'
import { PageRouter } from '@/routes/page.router'
import { AuthGuard } from '@/layouts/auth.guard'
import { ToastContainer } from '@/components/toast.container'
import { SessionKickoutModal } from '@/layouts/session.kickout.modal'
import { useThemeSync } from '@/hooks/use.theme.sync'

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

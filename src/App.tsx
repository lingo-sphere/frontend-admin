/**
 * @file app.tsx
 * @description Mã nguồn thành phần App.tsx
 */

import { AdminShell } from '@/components/admin/admin.shell'
import { PageRouter } from '@/components/admin/page.router'
import { AuthGuard } from '@/components/admin/auth.guard'
import { ToastContainer } from '@/components/common/toast.container'
import { SessionKickoutModal } from '@/components/admin/session.kickout.modal'
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

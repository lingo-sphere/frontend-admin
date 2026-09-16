// Component gốc cấu hình giao diện Admin và cung cấp QueryClientProvider.
import { BrowserRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { queryClient } from '@/config/query.config'
import { AdminShell } from '@/layouts/admin.shell'
import { PageRouter } from '@/routes/page.router'
import { AuthGuard } from '@/layouts/auth.guard'
import { ToastContainer } from '@/components/toast.container'
import { SessionKickoutModal } from '@/layouts/session.kickout.modal'
import { AdminLayoutProvider } from '@/contexts/admin.layout.context'

export function App() {
  return (
    <BrowserRouter>
      <AdminLayoutProvider>
        <QueryClientProvider client={queryClient}>
          <AuthGuard>
            <AdminShell>
              <PageRouter />
            </AdminShell>
          </AuthGuard>
          <ToastContainer />
          <SessionKickoutModal />
          {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
        </QueryClientProvider>
      </AdminLayoutProvider>
    </BrowserRouter>
  )
}



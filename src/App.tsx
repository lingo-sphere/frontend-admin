// Component gốc cấu hình giao diện Admin và cung cấp QueryClientProvider cùng ConfigProvider quốc tế hóa.
import { useEffect } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useTranslation } from 'react-i18next'
import { ConfigProvider } from 'antd'
import viVN from 'antd/locale/vi_VN'
import enUS from 'antd/locale/en_US'
import dayjs from 'dayjs'
import 'dayjs/locale/vi'
import 'dayjs/locale/en'
import { queryClient } from '@/config/query.config'
import { AdminShell } from '@/layouts/admin.shell'
import { PageRouter } from '@/routes/page.router'
import { AuthGuard } from '@/layouts/auth.guard'
import { ToastContainer } from '@/components/toast.container'
import { SessionKickoutModal } from '@/layouts/session.kickout.modal'
import { AdminLayoutProvider } from '@/contexts/admin.layout.context'

export function App() {
  const { i18n } = useTranslation()
  const currentLanguage = ((i18n.language || 'vi').toLowerCase().startsWith('en') ? 'en' : 'vi') as 'vi' | 'en'

  useEffect(() => {
    dayjs.locale(currentLanguage)
  }, [currentLanguage])

  return (
    <ConfigProvider locale={currentLanguage === 'vi' ? viVN : enUS}>
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
    </ConfigProvider>
  )
}




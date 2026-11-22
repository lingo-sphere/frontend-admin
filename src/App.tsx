// Component gốc cấu hình giao diện Admin và cung cấp QueryClientProvider cùng ConfigProvider quốc tế hóa.
import { useEffect, useMemo, type ReactNode } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useTranslation } from 'react-i18next'
import { ConfigProvider, theme as antdTheme } from 'antd'
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
import { AdminLayoutProvider, useAdminLayout } from '@/contexts/admin.layout.context'

interface AntdAdminThemeWrapperProps {
  currentLanguage: 'vi' | 'en'
  children: ReactNode
}

function AntdAdminThemeWrapper({ currentLanguage, children }: AntdAdminThemeWrapperProps) {
  const { theme } = useAdminLayout()
  const isDark = theme === 'dark'

  const themeConfig = useMemo(
    () => ({
      algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
      token: {
        colorPrimary: '#6366f1',
        borderRadius: 8,
        colorBgContainer: isDark ? '#0f172a' : '#ffffff',
        colorBgElevated: isDark ? '#1e293b' : '#ffffff',
        colorBorder: isDark ? '#334155' : '#e2e8f0',
        colorText: isDark ? '#f8fafc' : '#0f172a',
      },
      components: {
        Table: {
          headerBg: isDark ? '#1e293b' : '#f8fafc',
          headerColor: isDark ? '#f8fafc' : '#0f172a',
          rowHoverBg: isDark ? '#1e293b' : '#f1f5f9',
          borderColor: isDark ? '#334155' : '#e2e8f0',
        },
        Modal: {
          contentBg: isDark ? '#0f172a' : '#ffffff',
          headerBg: isDark ? '#0f172a' : '#ffffff',
        },
        Select: {
          colorBgContainer: isDark ? '#0f172a' : '#ffffff',
          colorBgElevated: isDark ? '#1e293b' : '#ffffff',
          optionSelectedBg: isDark ? '#312e81' : '#e0e7ff',
        },
        Dropdown: {
          colorBgElevated: isDark ? '#1e293b' : '#ffffff',
        },
        Popover: {
          colorBgElevated: isDark ? '#1e293b' : '#ffffff',
        },
        DatePicker: {
          colorBgElevated: isDark ? '#1e293b' : '#ffffff',
        },
      },
    }),
    [isDark]
  )

  return (
    <ConfigProvider
      locale={currentLanguage === 'vi' ? viVN : enUS}
      theme={themeConfig}
    >
      {children}
    </ConfigProvider>
  )
}

export function App() {
  const { i18n } = useTranslation()
  const currentLanguage = ((i18n.language || 'vi').toLowerCase().startsWith('en') ? 'en' : 'vi') as 'vi' | 'en'

  useEffect(() => {
    dayjs.locale(currentLanguage)
  }, [currentLanguage])

  return (
    <AdminLayoutProvider>
      <AntdAdminThemeWrapper currentLanguage={currentLanguage}>
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
      </AntdAdminThemeWrapper>
    </AdminLayoutProvider>
  )
}




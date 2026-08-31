import { useEffect, useState } from 'react'
import { AdminShell } from '@/components/admin/AdminShell'
import { PageRouter } from '@/components/admin/PageRouter'
import { AuthGuard } from '@/components/admin/AuthGuard'
import { ToastContainer } from '@/components/common/ToastContainer'
import { ConfirmModal } from '@/components/common/ConfirmModal'
import { useAdminStore } from '@/store/admin-store'
import { useAuthStore } from '@/store/auth-store'
import { API_CONFIG } from '@/config/api.config'

export function App() {
  const theme = useAdminStore((state) => state.theme)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const token = useAuthStore((state) => state.token)
  const clearLocalSession = useAuthStore((state) => state.clearLocalSession)
  const logout = useAuthStore((state) => state.logout)
  const [kickoutMessage, setKickoutMessage] = useState<string | null>(null)

  const triggerKickout = (msg?: string) => {
    console.warn('🚨 [App] triggerKickout called with msg:', msg)
    clearLocalSession()
    setKickoutMessage(msg || 'Tài khoản Quản trị vừa được đăng nhập trên một thiết bị khác. Bạn đã bị đăng xuất.')
  }

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

  useEffect(() => {
    if (!isAuthenticated || !token) return

    let eventSource: EventSource | null = null
    try {
      const sseUrl = `${API_CONFIG.BASE_URL}/auth/session-stream?token=${encodeURIComponent(token)}`
      console.log('📡 [SSE] Connecting to:', sseUrl)
      eventSource = new EventSource(sseUrl)

      eventSource.onmessage = (event) => {
        console.log('📡 [SSE] Message received:', event.data)
        try {
          const data = JSON.parse(event.data)
          if (data.type === 'SESSION_TERMINATED') {
            console.warn('🚨 [SSE] SESSION_TERMINATED event:', data)
            eventSource?.close()
            triggerKickout(data.message)
          }
        } catch {

        }
      }
    } catch {

    }

    const handleSessionTerminated = (e: Event) => {
      const customEvent = e as CustomEvent<{ message?: string }>
      console.warn('🚨 [Window Event] lingosphere:session_terminated received:', customEvent.detail?.message)
      triggerKickout(customEvent.detail?.message)
    }

    const handleUnauthorized = () => {
      logout()
    }

    window.addEventListener('lingosphere:session_terminated', handleSessionTerminated)
    window.addEventListener('lingosphere:unauthorized', handleUnauthorized)

    return () => {
      eventSource?.close()
      window.removeEventListener('lingosphere:session_terminated', handleSessionTerminated)
      window.removeEventListener('lingosphere:unauthorized', handleUnauthorized)
    }
  }, [isAuthenticated, token, logout, clearLocalSession])

  return (
    <>
      <AuthGuard>
        <AdminShell>
          <PageRouter />
        </AdminShell>
      </AuthGuard>
      <ToastContainer />

      <ConfirmModal
        isOpen={Boolean(kickoutMessage)}
        onClose={() => {
          setKickoutMessage(null)
          clearLocalSession()
        }}
        onConfirm={() => {
          setKickoutMessage(null)
          clearLocalSession()
        }}
        title="Đăng Nhập Từ Thiết Bị Khác"
        message={kickoutMessage || ''}
        confirmText="Đăng nhập lại"
        cancelText="Đóng"
        variant="warning"
        icon="warning"
      />
    </>
  )
}

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
  const logout = useAuthStore((state) => state.logout)
  const [kickoutMessage, setKickoutMessage] = useState<string | null>(null)

  const triggerKickout = (msg?: string) => {
    logout()
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

  // 🚀 Real-time Session Kickout via Server-Sent Events (SSE)
  useEffect(() => {
    if (!isAuthenticated) return

    const token = localStorage.getItem(API_CONFIG.STORAGE_KEYS.ACCESS_TOKEN)
    if (!token) return

    let eventSource: EventSource | null = null
    try {
      const sseUrl = `${API_CONFIG.BASE_URL}/auth/session-stream?token=${encodeURIComponent(token)}`
      eventSource = new EventSource(sseUrl)

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.type === 'SESSION_TERMINATED') {
            triggerKickout(data.message)
          }
        } catch {
          // ignore
        }
      }
    } catch {
      // EventSource fallback
    }

    const handleSessionTerminated = (e: Event) => {
      const customEvent = e as CustomEvent<{ message?: string }>
      triggerKickout(customEvent.detail?.message)
    }

    window.addEventListener('lingosphere:session_terminated', handleSessionTerminated)

    return () => {
      eventSource?.close()
      window.removeEventListener('lingosphere:session_terminated', handleSessionTerminated)
    }
  }, [isAuthenticated, logout])

  return (
    <AuthGuard>
      <AdminShell>
        <PageRouter />
      </AdminShell>
      <ToastContainer />

      {/* 🚨 Modal Cảnh Báo An Ninh Phiên Quản Trị */}
      <ConfirmModal
        isOpen={Boolean(kickoutMessage)}
        onClose={() => {
          setKickoutMessage(null)
          window.location.href = '/'
        }}
        onConfirm={() => {
          setKickoutMessage(null)
          window.location.href = '/'
        }}
        title="Đăng Nhập Từ Thiết Bị Khác"
        message={kickoutMessage || ''}
        confirmText="Đăng nhập lại"
        cancelText="Đóng"
        variant="warning"
        icon="warning"
      />
    </AuthGuard>
  )
}

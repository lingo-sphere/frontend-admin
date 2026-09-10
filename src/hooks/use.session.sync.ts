/**
 * @file use.session.sync.ts
 * @description Custom React hook use-session-sync trong ứng dụng Admin
 */

import { useEffect, useState, useCallback } from 'react'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { API_CONFIG } from '@/config/api.config'

export function useSessionSync() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const token = useAuthStore((state) => state.token)
  const clearLocalSession = useAuthStore((state) => state.clearLocalSession)
  const logout = useAuthStore((state) => state.logout)
  const [kickoutMessage, setKickoutMessage] = useState<string | null>(null)

  const triggerKickout = useCallback((msg?: string) => {
    clearLocalSession()
    setKickoutMessage(
      msg || 'Tài khoản Quản trị vừa được đăng nhập trên một thiết bị khác. Bạn đã bị đăng xuất.'
    )
  }, [clearLocalSession])

  const dismissKickout = useCallback(() => {
    setKickoutMessage(null)
    clearLocalSession()
  }, [clearLocalSession])

  useEffect(() => {
    if (!isAuthenticated || !token) return

    let eventSource: EventSource | null = null
    try {
      const sseUrl = `${API_CONFIG.BASE_URL}/auth/session-stream?token=${encodeURIComponent(token)}`
      eventSource = new EventSource(sseUrl)

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.type === 'SESSION_TERMINATED') {
            eventSource?.close()
            triggerKickout(data.message)
          }
        } catch {}
      }
    } catch {}

    const handleSessionTerminated = (e: Event) => {
      const customEvent = e as CustomEvent<{ message?: string }>
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
  }, [isAuthenticated, token, logout, triggerKickout])

  return {
    kickoutMessage,
    dismissKickout,
  }
}

/**
 * @file auth.guard.tsx
 * @description Component giao diện AuthGuard phục vụ khu vực Quản trị Admin
 */

import { useEffect, useState, type ReactNode } from 'react'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { LoginPage } from '@/features/auth/pages/login.page'

export function AuthGuard({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)
  const initAuth = useAuthStore((state) => state.initAuth)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    initAuth().finally(() => {
      setIsChecking(false)
    })
  }, [])

  if (isChecking) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-950 text-slate-200">
        <div className="w-10 h-10 border-3 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4" />
        <p className="text-xs text-slate-400 font-medium tracking-wide animate-pulse">
          Đang khởi tạo hệ thống quản trị...
        </p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginPage />
  }

  const role = (user?.role || '').toUpperCase()
  if (role === 'STUDENT') {
    return <LoginPage initialError="Tài khoản học viên không có quyền truy cập trang quản trị." />
  }

  return <>{children}</>
}

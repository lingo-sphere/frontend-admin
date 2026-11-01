// Component giao diện AuthGuard phục vụ khu vực Quản trị Admin.
import { useEffect, useState, type ReactNode } from 'react'
import { useLocation, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { LoginPage } from '@/features/auth/pages/login.page'

export function AuthGuard({ children }: { children: ReactNode }) {
  const location = useLocation()
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

  const isLoginPage = location.pathname === '/login'

  if (isLoginPage) {
    if (isAuthenticated) {
      const searchParams = new URLSearchParams(location.search)
      const rawReturnUrl = searchParams.get('returnUrl')
      const targetUrl = (rawReturnUrl && rawReturnUrl.startsWith('/') && !rawReturnUrl.startsWith('//') && rawReturnUrl !== '/login')
        ? rawReturnUrl
        : '/dashboard'
      return <Navigate replace to={targetUrl} />
    }
    return <LoginPage />
  }

  if (!isAuthenticated) {
    const destination = location.pathname + location.search
    return <Navigate replace to={`/login?returnUrl=${encodeURIComponent(destination)}`} />
  }

  const role = (user?.role || '').toUpperCase()
  if (role !== 'ADMIN' && role !== 'INSTRUCTOR') {
    return <LoginPage initialError="Tài khoản học viên (USER/LEARNER) không có quyền truy cập trang quản trị Admin." />
  }

  return <>{children}</>
}

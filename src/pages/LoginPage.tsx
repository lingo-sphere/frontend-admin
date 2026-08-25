import { useState } from 'react'
import { Eye, EyeOff, Lock, Mail, Shield, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react'
import { useAuthStore } from '@/store/auth-store'
import { toast } from '@/store/toast-store'

export function LoginPage() {
  const [email, setEmail] = useState('admin@lingosphere.local')
  const [password, setPassword] = useState('admin123')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const login = useAuthStore((state) => state.login)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setErrorMessage('Vui lòng nhập đầy đủ Email và Mật khẩu')
      return
    }

    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      await login({ email, password })
      toast.success('Đăng nhập thành công! Chào mừng bạn quay trở lại.', 'Xác thực thành công')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Đăng nhập không thành công. Vui lòng thử lại.'
      setErrorMessage(msg)
      toast.error(msg, 'Đăng nhập thất bại')
    } finally {
      setIsSubmitting(false)
    }
  }

  const fillQuickAccount = (quickEmail: string, quickPass: string) => {
    setEmail(quickEmail)
    setPassword(quickPass)
    setErrorMessage(null)
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-4 sm:p-6 text-slate-100 font-sans relative overflow-hidden">
      {/* Background Decorative Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-indigo-600/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-violet-600/15 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/80 border border-slate-800/80 rounded-2xl p-8 backdrop-blur-xl shadow-2xl relative z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 mb-4 ring-1 ring-white/20">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            LingoSphere Admin
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Hệ thống Quản trị & Điều hành Nền tảng Học tiếng Anh
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
            <p className="flex-1">{errorMessage}</p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Email Quản trị viên
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@lingosphere.local"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Mật khẩu
              </label>
              <span className="text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer transition-colors">
                Quên mật khẩu?
              </span>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-10 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-indigo-500/50"
              />
              <span className="text-xs text-slate-300">Ghi nhớ đăng nhập</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 text-white text-sm font-semibold hover:from-indigo-500 hover:to-violet-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-lg shadow-indigo-600/30 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Đang xác thực...</span>
              </>
            ) : (
              <>
                <span>Đăng nhập Quản trị</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Accounts */}
        <div className="mt-8 pt-6 border-t border-slate-800/80">
          <p className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Tài khoản Demo nhanh:</span>
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fillQuickAccount('admin@lingosphere.local', 'admin123')}
              className="px-3 py-2 rounded-lg bg-slate-950/40 hover:bg-slate-800/60 border border-slate-800 text-left transition-colors group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-200">Admin Toàn Quyền</span>
                <CheckCircle2 className="w-3 h-3 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-[10px] text-slate-400 truncate">admin@lingosphere.local</p>
            </button>

            <button
              type="button"
              onClick={() => fillQuickAccount('teacher@lingosphere.local', 'teacher123')}
              className="px-3 py-2 rounded-lg bg-slate-950/40 hover:bg-slate-800/60 border border-slate-800 text-left transition-colors group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-200">Giáo Viên Khóa Học</span>
                <CheckCircle2 className="w-3 h-3 text-violet-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-[10px] text-slate-400 truncate">teacher@lingosphere.local</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

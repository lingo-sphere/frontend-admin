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
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 p-4 text-slate-100 font-sans relative overflow-hidden">
      {/* Background Decorative Glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-2xl p-8 shadow-2xl backdrop-blur-xl relative z-10 flex flex-col gap-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 ring-1 ring-white/20 mb-1">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            LingoSphere Admin
          </h1>
          <p className="text-xs text-slate-400">
            Hệ thống Quản trị & Điều hành Nền tảng Học tiếng Anh
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
            <p className="flex-1">{errorMessage}</p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Email Field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Email Quản trị viên
            </label>
            <div className="flex items-center w-full h-11 px-3.5 rounded-xl bg-slate-950/80 border border-slate-800 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/30 transition-all gap-3">
              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@lingosphere.local"
                required
                className="w-full h-full bg-transparent border-0 outline-none text-sm text-slate-100 placeholder:text-slate-500 p-0 m-0 focus:ring-0 focus:outline-none"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Mật khẩu
              </label>
              <button
                type="button"
                className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Quên mật khẩu?
              </button>
            </div>
            <div className="flex items-center w-full h-11 px-3.5 rounded-xl bg-slate-950/80 border border-slate-800 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/30 transition-all gap-3">
              <Lock className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full h-full bg-transparent border-0 outline-none text-sm text-slate-100 placeholder:text-slate-500 p-0 m-0 focus:ring-0 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-200 p-1 transition-colors shrink-0"
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center justify-between pt-0.5">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-indigo-500/30 accent-indigo-600 cursor-pointer"
              />
              <span className="text-xs text-slate-300">Ghi nhớ đăng nhập</span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 mt-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold active:scale-[0.99] transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
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
        <div className="pt-4 border-t border-slate-800/80 flex flex-col gap-3">
          <p className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Tài khoản Demo nhanh:</span>
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => fillQuickAccount('admin@lingosphere.local', 'admin123')}
              className="flex flex-col gap-1 p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-indigo-500/50 text-left transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200">Admin Toàn Quyền</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
              </div>
              <p className="text-[10px] text-slate-400 truncate">admin@lingosphere.local</p>
            </button>

            <button
              type="button"
              onClick={() => fillQuickAccount('teacher@lingosphere.local', 'teacher123')}
              className="flex flex-col gap-1 p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-violet-500/50 text-left transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200">Giáo Viên Khóa Học</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-violet-400" />
              </div>
              <p className="text-[10px] text-slate-400 truncate">teacher@lingosphere.local</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

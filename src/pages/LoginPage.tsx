import { useState } from 'react'
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  Shield,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  GraduationCap,
  ShieldCheck,
} from 'lucide-react'
import { useAuthStore } from '@/store/auth-store'
import { toast } from '@/store/toast-store'

export function LoginPage() {
  const [email, setEmail] = useState('admin@lingosphere.local')
  const [password, setPassword] = useState('admin123')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [selectedRole, setSelectedRole] = useState<'admin' | 'teacher'>('admin')

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
      await login({ email, password, rememberMe })
      toast.success('Đăng nhập thành công! Chào mừng bạn quay trở lại.', 'Xác thực thành công')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Đăng nhập không thành công. Vui lòng thử lại.'
      setErrorMessage(msg)
      toast.error(msg, 'Đăng nhập thất bại')
    } finally {
      setIsSubmitting(false)
    }
  }

  const fillQuickAccount = (quickEmail: string, quickPass: string, role: 'admin' | 'teacher') => {
    setEmail(quickEmail)
    setPassword(quickPass)
    setSelectedRole(role)
    setErrorMessage(null)
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4 text-slate-900 dark:text-slate-100 font-sans relative overflow-hidden">
      {}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-500/15 dark:bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-500/15 dark:bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-400/5 rounded-full blur-[140px] pointer-events-none" />

      {}
      <div className="w-full max-w-[440px] bg-white/95 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-7 sm:p-8 shadow-2xl shadow-indigo-500/5 dark:shadow-black/40 backdrop-blur-xl relative z-10 flex flex-col gap-6 transition-all">
        {}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 ring-4 ring-indigo-500/10 mb-1">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              LingoSphere <span className="text-indigo-600 dark:text-indigo-400">Admin</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Hệ thống Quản trị & Điều hành Nền tảng Học tiếng Anh
            </p>
          </div>
        </div>

        {}
        {errorMessage && (
          <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs font-medium animate-in fade-in">
            <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
            <p className="flex-1">{errorMessage}</p>
          </div>
        )}

        {}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Email Quản trị viên
            </label>
            <div className="flex items-center w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 focus-within:border-indigo-600 focus-within:bg-white dark:focus-within:bg-slate-950 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all gap-3">
              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@lingosphere.local"
                required
                className="w-full h-full bg-transparent border-0 outline-none text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 p-0 m-0 focus:ring-0 focus:outline-none font-medium"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Mật khẩu
              </label>
              <button
                type="button"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors cursor-pointer"
              >
                Quên mật khẩu?
              </button>
            </div>
            <div className="flex items-center w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 focus-within:border-indigo-600 focus-within:bg-white dark:focus-within:bg-slate-950 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all gap-3">
              <Lock className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full h-full bg-transparent border-0 outline-none text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 p-0 m-0 focus:ring-0 focus:outline-none font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 transition-colors shrink-0 cursor-pointer"
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-0.5">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-100 border-slate-300 text-indigo-600 focus:ring-indigo-500/30 accent-indigo-600 cursor-pointer"
              />
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Ghi nhớ đăng nhập</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 mt-1 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs sm:text-sm font-bold active:scale-[0.99] transition-all shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
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

        {}
        <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Tài khoản Demo nhanh:</span>
            </p>
            <span className="text-[10px] text-slate-400 font-medium">Bấm để tự điền</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {}
            <button
              type="button"
              onClick={() => fillQuickAccount('admin@lingosphere.local', 'admin123', 'admin')}
              className={`flex flex-col gap-1.5 p-3 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
                selectedRole === 'admin'
                  ? 'bg-indigo-50/80 border-indigo-500/60 shadow-xs ring-2 ring-indigo-500/20 dark:bg-indigo-950/40 dark:border-indigo-600'
                  : 'bg-slate-50/70 hover:bg-indigo-50/40 border-slate-200 dark:bg-slate-950/60 dark:border-slate-800 dark:hover:border-indigo-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-lg bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <ShieldCheck className="w-3 h-3" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Admin
                  </span>
                </div>
                {selectedRole === 'admin' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                ) : (
                  <span className="w-3 h-3 rounded-full border border-slate-300 dark:border-slate-700 group-hover:border-indigo-400" />
                )}
              </div>
              <p className="text-[10px] font-semibold text-indigo-600/90 dark:text-indigo-400/90 truncate">
                admin@lingosphere.local
              </p>
            </button>

            {}
            <button
              type="button"
              onClick={() => fillQuickAccount('teacher@lingosphere.local', 'teacher123', 'teacher')}
              className={`flex flex-col gap-1.5 p-3 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
                selectedRole === 'teacher'
                  ? 'bg-purple-50/80 border-purple-500/60 shadow-xs ring-2 ring-purple-500/20 dark:bg-purple-950/40 dark:border-purple-600'
                  : 'bg-slate-50/70 hover:bg-purple-50/40 border-slate-200 dark:bg-slate-950/60 dark:border-slate-800 dark:hover:border-purple-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-lg bg-purple-600/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <GraduationCap className="w-3 h-3" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Giáo Viên
                  </span>
                </div>
                {selectedRole === 'teacher' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                ) : (
                  <span className="w-3 h-3 rounded-full border border-slate-300 dark:border-slate-700 group-hover:border-purple-400" />
                )}
              </div>
              <p className="text-[10px] font-semibold text-purple-600/90 dark:text-purple-400/90 truncate">
                teacher@lingosphere.local
              </p>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

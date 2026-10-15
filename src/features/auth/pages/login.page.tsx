// Trang quản trị LoginPage giao diện Admin cao cấp với hiệu ứng hình nền và trình bày hệ thống.

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
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
  Sun,
  Moon,
  Globe,
  Layers,
  Activity,
  Cpu,
} from 'lucide-react'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { toast } from '@/store/toast.store'
import { storage, STORAGE_KEYS } from '@/lib/storage'
import { useAdminLayout } from '@/contexts/admin.layout.context'

export function LoginPage({ initialError }: { initialError?: string } = {}) {
  const { t, i18n } = useTranslation()
  const { theme, toggleTheme } = useAdminLayout()
  const isDark = theme === 'dark'
  const [email, setEmail] = useState('admin@lingosphere.local')
  const [password, setPassword] = useState('admin123')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(initialError || null)
  const [selectedRole, setSelectedRole] = useState<'admin' | 'teacher'>('admin')

  const login = useAuthStore((state) => state.login)

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'vi' : 'en'
    i18n.changeLanguage(nextLang)
    storage.set(STORAGE_KEYS.LANGUAGE, nextLang)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setErrorMessage(t('auth.requiredEmailPassword'))
      return
    }

    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      await login({ email, password, rememberMe })
      toast.success(t('auth.loginSuccess'))
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('auth.loginFailed')
      setErrorMessage(msg)
      toast.error(msg)
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

  const isVi = i18n.language !== 'en'

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans relative overflow-x-hidden transition-colors duration-300">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e0e7ff70_1px,transparent_1px),linear-gradient(to_bottom,#e0e7ff70_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#312e8115_1px,transparent_1px),linear-gradient(to_bottom,#312e8115_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      <div className="absolute -top-32 -left-32 w-[520px] h-[520px] bg-gradient-to-br from-indigo-500/20 via-violet-600/15 to-transparent rounded-full blur-[140px] pointer-events-none animate-pulse" />
      <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-gradient-to-tl from-purple-500/20 via-fuchsia-500/15 to-transparent rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-gradient-to-r from-blue-500/10 via-indigo-500/15 to-violet-500/10 rounded-full blur-[160px] pointer-events-none" />

      <header className="w-full relative z-20 px-6 sm:px-10 py-5 flex items-center justify-between border-b border-slate-200/80 dark:border-white/5 bg-white/75 dark:bg-slate-950/30 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 ring-2 ring-indigo-400/20">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
              LingoSphere <span className="bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">Admin</span>
            </span>
            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              Enterprise Operations Hub
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
            <span>{isVi ? 'Hệ thống: Trực tuyến (v2.4)' : 'System: Operational (v2.4)'}</span>
          </div>

          <button
            type="button"
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
            title={isVi ? 'Đổi sang Tiếng Anh' : 'Switch to Vietnamese'}
          >
            <Globe className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>{isVi ? 'VI' : 'EN'}</span>
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
            title={isDark ? 'Chế độ Sáng' : 'Chế độ Tối'}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-500 dark:text-amber-300" /> : <Moon className="w-4 h-4 text-indigo-600 dark:text-indigo-300" />}
          </button>
        </div>
      </header>

      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 relative z-10 flex-1 flex items-center justify-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          
          <div className="hidden lg:flex lg:col-span-7 flex-col gap-6 text-left pr-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300 text-xs font-semibold w-fit backdrop-blur-md shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>{isVi ? 'Hệ thống Khảo thí & Vận hành Đào tạo Ngoại ngữ' : 'Examination & Language Training Management'}</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl xl:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                {isVi ? (
                  <>
                    Quản trị Toàn diện <br />
                    <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 dark:from-indigo-400 dark:via-violet-400 dark:to-purple-300 bg-clip-text text-transparent">
                      Hệ Sinh Thái TOEIC
                    </span>
                  </>
                ) : (
                  <>
                    Comprehensive <br />
                    <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 dark:from-indigo-400 dark:via-violet-400 dark:to-purple-300 bg-clip-text text-transparent">
                      TOEIC Operations Hub
                    </span>
                  </>
                )}
              </h1>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl font-normal">
                {isVi
                  ? 'Giải pháp thống nhất cho Ban Quản trị & Giảng viên: Quản lý ngân hàng đề thi 4 kỹ năng chuẩn IIG, số hóa chấm thi AI, theo dõi tiến độ và đánh giá học lực học viên theo thời gian thực.'
                  : 'Unified solution for Academic Admins & Instructors: Manage 4-skills question banks, AI auto-grading, learner progress tracking and real-time performance analytics.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-800/80 border border-slate-200/90 dark:border-slate-800 backdrop-blur-md transition-all group flex flex-col gap-2 shadow-sm shadow-slate-200/50 dark:shadow-black/20">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
                    <span>{isVi ? 'AI Chấm Bài Đa Kỹ Năng' : 'AI Multi-Skill Evaluation'}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300">v3.5</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                    {isVi
                      ? 'Tự động chấm phát âm, bài nói Part 1-5 và bài luận Viết TOEIC theo thang điểm chuẩn quốc tế.'
                      : 'Automated pronunciation scoring, Speaking tasks and Writing essays based on official rubrics.'}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-800/80 border border-slate-200/90 dark:border-slate-800 backdrop-blur-md transition-all group flex flex-col gap-2 shadow-sm shadow-slate-200/50 dark:shadow-black/20">
                <div className="w-9 h-9 rounded-xl bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
                    <span>{isVi ? 'Ngân Hàng Đề Thi Linh Hoạt' : 'Adaptive Exam Bank'}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300">2 & 4 Skills</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                    {isVi
                      ? 'Nhập đề thông minh qua tệp nén ZIP, Excel và tự động tách audio, hình ảnh, lời giải chi tiết.'
                      : 'Smart batch import via ZIP/Excel archives, auto-parsing media audio, images and explanations.'}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-800/80 border border-slate-200/90 dark:border-slate-800 backdrop-blur-md transition-all group flex flex-col gap-2 shadow-sm shadow-slate-200/50 dark:shadow-black/20 sm:col-span-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {isVi ? 'Báo Cáo Học Lực & Giám Sát Tiến Độ' : 'Real-time Progress & Telemetry'}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-normal">
                      {isVi
                        ? 'Theo dõi tỷ lệ hoàn thành chương trình, điểm kiểm tra đầu vào và lịch nhắc nhở học tập từng học viên.'
                        : 'Track course completion rate, baseline placement scores and automated study reminder alerts.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 flex items-center gap-6 text-slate-600 dark:text-slate-400 text-xs font-medium border-t border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{isVi ? 'Phân quyền chuẩn RBAC' : 'RBAC Role-Based Access'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>{isVi ? 'Mã hóa 256-bit SSL' : '256-bit SSL Encryption'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                <span>{isVi ? '99.98% Thời gian hoạt động' : '99.98% Uptime SLA'}</span>
              </div>
            </div>
          </div>

          <div className="w-full lg:col-span-5 flex justify-center">
            <div className="w-full max-w-[450px] bg-white/95 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-7 sm:p-8 shadow-xl shadow-indigo-500/5 dark:shadow-2xl dark:shadow-black/40 backdrop-blur-2xl relative z-10 flex flex-col gap-6 transition-all ring-1 ring-slate-900/5 dark:ring-white/10">
              
              <div className="flex flex-col items-center text-center gap-2">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 ring-4 ring-indigo-500/10 dark:ring-indigo-500/20 mb-1">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    LingoSphere <span className="bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">Admin</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                    {t('auth.loginSubtitle')}
                  </p>
                </div>
              </div>

              {errorMessage && (
                <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-medium animate-in fade-in">
                  <span className="w-2 h-2 rounded-full bg-rose-500 dark:bg-rose-400 shrink-0" />
                  <p className="flex-1">{errorMessage}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    {t('auth.email')}
                  </label>
                  <div className="flex items-center w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 focus-within:border-indigo-600 focus-within:bg-white dark:focus-within:bg-slate-950 focus-within:ring-4 focus-within:ring-indigo-500/10 dark:focus-within:ring-indigo-500/20 transition-all gap-3">
                    <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@lingosphere.local"
                      required
                      className="w-full h-full bg-transparent border-0 outline-none text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 p-0 m-0 focus:ring-0 focus:outline-none font-medium"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      {t('auth.password')}
                    </label>
                    <button
                      type="button"
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors cursor-pointer"
                    >
                      {t('auth.forgotPassword')}
                    </button>
                  </div>
                  <div className="flex items-center w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 focus-within:border-indigo-600 focus-within:bg-white dark:focus-within:bg-slate-950 focus-within:ring-4 focus-within:ring-indigo-500/10 dark:focus-within:ring-indigo-500/20 transition-all gap-3">
                    <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full h-full bg-transparent border-0 outline-none text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 p-0 m-0 focus:ring-0 focus:outline-none font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 transition-colors shrink-0 cursor-pointer"
                      aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
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
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{t('auth.rememberMe')}</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 mt-1 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs sm:text-sm font-bold active:scale-[0.99] transition-all shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>{t('auth.authenticating')}</span>
                    </>
                  ) : (
                    <>
                      <span>{t('auth.loginButton')}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>{t('auth.demoAccounts')}</span>
                  </p>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">{t('auth.clickToAutofill')}</span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => fillQuickAccount('admin@lingosphere.local', 'admin123', 'admin')}
                    className={`flex flex-col gap-1.5 p-3 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
                      selectedRole === 'admin'
                        ? 'bg-indigo-50/90 border-indigo-500/70 shadow-xs ring-2 ring-indigo-500/20 dark:bg-indigo-950/60 dark:border-indigo-500/80 dark:ring-indigo-500/30'
                        : 'bg-slate-50/80 hover:bg-indigo-50/50 border-slate-200 dark:bg-slate-950/50 dark:hover:bg-indigo-950/30 dark:border-slate-800'
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
                    <p className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 truncate">
                      admin@lingosphere.local
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => fillQuickAccount('teacher@lingosphere.local', 'teacher123', 'teacher')}
                    className={`flex flex-col gap-1.5 p-3 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
                      selectedRole === 'teacher'
                        ? 'bg-purple-50/90 border-purple-500/70 shadow-xs ring-2 ring-purple-500/20 dark:bg-purple-950/60 dark:border-purple-500/80 dark:ring-purple-500/30'
                        : 'bg-slate-50/80 hover:bg-purple-50/50 border-slate-200 dark:bg-slate-950/50 dark:hover:bg-purple-950/30 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-lg bg-purple-600/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                          <GraduationCap className="w-3 h-3" />
                        </div>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {t('auth.teacher')}
                        </span>
                      </div>
                      {selectedRole === 'teacher' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                      ) : (
                        <span className="w-3 h-3 rounded-full border border-slate-300 dark:border-slate-700 group-hover:border-purple-400" />
                      )}
                    </div>
                    <p className="text-[10px] font-semibold text-purple-600 dark:text-purple-400 truncate">
                      teacher@lingosphere.local
                    </p>
                  </button>
                </div>
              </div>

              <div className="text-center pt-1 border-t border-slate-200 dark:border-slate-800">
                <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-indigo-600 dark:text-indigo-400 inline" />
                  <span>{isVi ? 'Khu vực quản trị nội bộ bảo mật cao' : 'Internal high-security management zone'}</span>
                </p>
              </div>

            </div>
          </div>

        </div>
      </main>

      <footer className="w-full relative z-20 px-6 sm:px-10 py-4 text-center border-t border-slate-200/80 dark:border-white/5 bg-white/40 dark:bg-slate-950/40 backdrop-blur-md">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          © {new Date().getFullYear()} LingoSphere International. {isVi ? 'Bản quyền được bảo hộ.' : 'All rights reserved.'}
        </p>
      </footer>
    </div>
  )
}

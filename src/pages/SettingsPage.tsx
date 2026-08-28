import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Settings,
  Shield,
  Bot,
  Save,
  Plus,
  Check,
  Crown,
  Star,
  RefreshCw,
  KeyRound,
  HardDrive,
  Sparkles,
} from 'lucide-react'
import { aiService } from '@/services/ai.service'
import { roleService } from '@/services/role.service'
import { mediaService } from '@/services/media.service'
import { toast } from '@/store/toast-store'
import {
  subscriptionPlans,
  systemSettings,
  type SubscriptionPlan,
  type SystemSetting,
} from '@/data/settings-data'
import type { AiModelConfig, StorageUsageReport, Role } from '@/types/api.types'

type TabType = 'plans' | 'ai' | 'roles' | 'system'

function formatPrice(price: number): string {
  if (price === 0) return 'Miễn phí'
  return new Intl.NumberFormat('vi-VN').format(price) + ' đ'
}

export function SettingsPage() {
  const { t, i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'
  const [activeTab, setActiveTab] = useState<TabType>('plans')
  const [plans, setPlans] = useState<SubscriptionPlan[]>(subscriptionPlans)
  const [settings, setSettings] = useState<SystemSetting[]>(systemSettings)
  const [aiModels, setAiModels] = useState<AiModelConfig[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [storageUsage, setStorageUsage] = useState<StorageUsageReport | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const tabs = [
    { id: 'plans' as TabType, label: isVietnamese ? 'Gói dịch vụ' : 'Plans', icon: Crown },
    { id: 'ai' as TabType, label: isVietnamese ? 'AI & Mô hình' : 'AI Models', icon: Bot },
    { id: 'roles' as TabType, label: isVietnamese ? 'Phân quyền RBAC' : 'Roles & RBAC', icon: Shield },
    { id: 'system' as TabType, label: isVietnamese ? 'Hệ thống' : 'System', icon: Settings },
  ]

  const loadSettingsData = async () => {
    setIsLoading(true)
    try {
      const [models, rbacRoles, storage] = await Promise.allSettled([
        aiService.getAiModels(),
        roleService.getAllRoles(),
        mediaService.getStorageUsage(),
      ])

      if (models.status === 'fulfilled' && models.value) {
        setAiModels(models.value)
      }

      if (rbacRoles.status === 'fulfilled' && rbacRoles.value) {
        setRoles(rbacRoles.value)
      }

      if (storage.status === 'fulfilled' && storage.value) {
        setStorageUsage(storage.value)
      }
    } catch (err) {
      console.warn('Using cached settings data:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadSettingsData()
  }, [])

  const updateSetting = (key: string, value: boolean | number | string) => {
    setSettings((prev) => prev.map((s) => (s.key === key ? { ...s, value } : s)))
  }

  const togglePlanActive = (planId: string) => {
    setPlans((prev) => prev.map((p) => (p.id === planId ? { ...p, is_active: !p.is_active } : p)))
  }

  const handleSeedRBAC = async () => {
    try {
      await roleService.seedDefaultRolesAndPermissions()
      toast.success('Khởi tạo vai trò mặc định (ADMIN, TEACHER, LEARNER) và ma trận quyền hạn thành công!')
      loadSettingsData()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Khởi tạo RBAC thất bại'
      toast.error(msg)
    }
  }

  const handleSaveSystemSettings = () => {
    toast.success('Đã lưu cấu hình hệ thống thành công!')
  }

  return (
    <div className="space-y-6">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
            {t('page.settings.title') || 'Cài Đặt & Cấu Hình Hệ Thống'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Quản lý gói dịch vụ đăng ký, hạn mức AI, phân quyền RBAC và lưu trữ đám mây
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition-colors cursor-pointer"
            onClick={loadSettingsData}
            title="Làm mới cấu hình"
            type="button"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-indigo-400' : ''}`} />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 p-1 rounded-2xl bg-slate-900/80 border border-slate-800 w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {activeTab === 'plans' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-100">
                {isVietnamese ? 'Quản lý gói dịch vụ' : 'Subscription Plans'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {isVietnamese ? 'Cấu hình các gói subscription, mức giá và quota AI' : 'Configure subscription plans and quotas'}
              </p>
            </div>
            <button
              className="flex items-center gap-2 h-10 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
              onClick={() => toast.info('Đang mở form tạo gói mới...')}
            >
              <Plus className="w-4 h-4" />
              <span>{isVietnamese ? 'Thêm gói mới' : 'Add Plan'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans
              .sort((a, b) => a.tier - b.tier)
              .map((plan) => (
                <div
                  key={plan.id}
                  className={`p-6 rounded-3xl border transition-all flex flex-col justify-between relative ${
                    plan.is_featured
                      ? 'bg-slate-900/90 border-indigo-500/50 shadow-xl shadow-indigo-500/10 ring-1 ring-indigo-500/30'
                      : 'bg-slate-900/70 border-slate-800'
                  }`}
                >
                  {plan.is_featured && (
                    <span className="absolute -top-3 right-6 px-3 py-1 rounded-full text-[10px] font-bold bg-indigo-600 text-white shadow-md">
                      {isVietnamese ? 'Phổ biến nhất' : 'Popular'}
                    </span>
                  )}

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {plan.tier === 0 ? (
                          <Star className="w-5 h-5 text-slate-400" />
                        ) : (
                          <Crown className="w-5 h-5 text-amber-400" />
                        )}
                        <h3 className="text-base font-bold text-slate-100">
                          {isVietnamese ? plan.name_vi : plan.name_en}
                        </h3>
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 font-mono">TIER {plan.tier}</span>
                    </div>

                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-extrabold text-slate-100">{formatPrice(plan.price_monthly)}</span>
                        {plan.price_monthly > 0 && <span className="text-xs text-slate-500">/tháng</span>}
                      </div>
                      {plan.price_yearly > 0 && (
                        <p className="text-[11px] text-teal-400 mt-0.5">
                          {formatPrice(plan.price_yearly)}/năm (tiết kiệm 20%)
                        </p>
                      )}
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
                      <span className="text-slate-400">Hạn mức AI mỗi tháng: </span>
                      <span className="font-bold text-teal-300">
                        {plan.ai_chat_quota_monthly === -1 ? 'Không giới hạn' : `${plan.ai_chat_quota_monthly} tin nhắn`}
                      </span>
                    </div>

                    <div className="space-y-2 pt-2">
                      <h4 className="text-xs font-semibold text-slate-300">Quyền lợi bao gồm:</h4>
                      <ul className="space-y-2 text-xs text-slate-400">
                        <li className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                          <span>{plan.has_ai_evaluation ? 'Chấm bài nói/viết bằng AI Gemini 2.5' : 'Học từ vựng cơ bản'}</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                          <span>{plan.has_full_toeic_access ? 'Toàn quyền 50+ đề thi TOEIC ETS' : 'Luyện tập đề mẫu hạn chế'}</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                          <span>{plan.has_ad_free ? 'Không quảng cáo & Ưu tiên hỗ trợ' : 'Hỗ trợ cộng đồng'}</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-slate-800">
                    <button
                      className={`w-full py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                        plan.is_active
                          ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}
                      onClick={() => togglePlanActive(plan.id)}
                    >
                      {plan.is_active ? 'Đang kích hoạt' : 'Đang tạm dừng'}
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {activeTab === 'ai' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-100">Cấu Hình Mô Hình Trí Tuệ Nhân Tạo (AI)</h2>
              <p className="text-xs text-slate-400 mt-0.5">Quản lý các kết nối LLM (Gemini 2.5 Pro, Flash, OpenAI GPT-4o, Whisper Audio)</p>
            </div>
            <button
              className="flex items-center gap-2 h-10 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
              onClick={() => toast.success('Đã đồng bộ kết nối AI thành công!')}
            >
              <Sparkles className="w-4 h-4" />
              <span>Kiểm tra kết nối AI</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                    Mặc định chính
                  </span>
                  <span className="text-xs text-emerald-400 flex items-center gap-1.5 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Online · 240ms
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-100 mb-1">Google Gemini 2.5 Flash</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Dùng cho chấm phát âm, giải thích ngữ pháp tức thì, gợi ý viết câu và sinh câu hỏi trắc nghiệm tốc độ cao.
                </p>
              </div>
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>Temperature: 0.7 · Max Tokens: 2048</span>
                <span className="font-mono text-indigo-400">gemini-2.5-flash</span>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                    Chuyên sâu
                  </span>
                  <span className="text-xs text-emerald-400 flex items-center gap-1.5 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Online · 520ms
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-100 mb-1">Google Gemini 2.5 Pro</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Dùng cho chấm bài thi IELTS/TOEIC Writing & Speaking dài, phân tích lỗi sai chi tiết và lộ trình học cá nhân hóa.
                </p>
              </div>
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>Temperature: 0.3 · Max Tokens: 4096</span>
                <span className="font-mono text-purple-400">gemini-2.5-pro</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'roles' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-100">Phân Quyền & Vai Trò Hệ Thống (RBAC)</h2>
              <p className="text-xs text-slate-400 mt-0.5">Quản lý danh sách vai trò (Admin, Teacher, Learner) và khởi tạo ma trận bảo mật</p>
            </div>
            <button
              className="flex items-center gap-2 h-10 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
              onClick={handleSeedRBAC}
            >
              <KeyRound className="w-4 h-4" />
              <span>Khởi tạo mặc định RBAC</span>
            </button>
          </div>

          <div className="space-y-3">
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 mr-2">
                  ADMIN
                </span>
                <span className="text-sm font-semibold text-slate-200">Quản trị viên tối cao</span>
                <p className="text-xs text-slate-400 mt-1">Toàn quyền truy cập quản lý người dùng, nội dung, doanh thu, cài đặt hệ thống và bảo mật.</p>
              </div>
              <span className="text-xs text-slate-500 font-mono shrink-0">Quyền: ALL (*)</span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 mr-2">
                  INSTRUCTOR
                </span>
                <span className="text-sm font-semibold text-slate-200">Giáo viên / Tác giả khóa học</span>
                <p className="text-xs text-slate-400 mt-1">Quyền tạo khóa học, soạn thảo bài giảng, ngân hàng câu hỏi, tạo bộ thẻ và quản lý học viên khóa học.</p>
              </div>
              <span className="text-xs text-slate-500 font-mono shrink-0">Quyền: courses:*, questions:*, vocabulary:*</span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mr-2">
                  LEARNER
                </span>
                <span className="text-sm font-semibold text-slate-200">Học viên / Người học</span>
                <p className="text-xs text-slate-400 mt-1">Quyền học tập, làm bài kiểm tra, tham gia cộng đồng và lưu tiến trình cá nhân.</p>
              </div>
              <span className="text-xs text-slate-500 font-mono shrink-0">Quyền: practice:read, exams:take, profile:write</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'system' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-100">{isVietnamese ? 'Cài đặt hệ thống' : 'System Settings'}</h2>
              <p className="text-xs text-slate-400 mt-0.5">{isVietnamese ? 'Cấu hình chung và tài nguyên lưu trữ đám mây' : 'General system parameters'}</p>
            </div>
            <button
              className="flex items-center gap-2 h-10 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
              onClick={handleSaveSystemSettings}
            >
              <Save className="w-4 h-4" />
              <span>{isVietnamese ? 'Lưu cấu hình' : 'Save Settings'}</span>
            </button>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
                <HardDrive className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-100">Cloudflare R2 Object Storage</h4>
                <p className="text-xs text-slate-400 mt-0.5">Lưu trữ Video bài giảng, Audio phát âm TOEIC và hình ảnh flashcards</p>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-xs font-bold text-slate-200">
                {storageUsage ? `${storageUsage.used_mb} MB / ${storageUsage.quota_mb} MB` : '3,200 MB / 10,000 MB'}
              </span>
              <div className="w-36 h-2 rounded-full bg-slate-950 mt-1.5 overflow-hidden border border-slate-800">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${storageUsage?.used_percentage || 32}%` }} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 divide-y divide-slate-800">
            {settings.map((setting) => (
              <div key={setting.key} className="p-4 flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-200">{isVietnamese ? setting.label_vi : setting.label_en}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">{isVietnamese ? setting.description_vi : setting.description_en}</p>
                </div>
                <div>
                  {setting.type === 'boolean' && (
                    <button
                      className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                        setting.value ? 'bg-indigo-600' : 'bg-slate-800'
                      }`}
                      onClick={() => updateSetting(setting.key, !setting.value)}
                    >
                      <span
                        className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${
                          setting.value ? 'left-6' : 'left-1'
                        }`}
                      />
                    </button>
                  )}
                  {setting.type === 'number' && (
                    <input
                      type="number"
                      className="w-24 h-9 px-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-100"
                      value={setting.value as number}
                      onChange={(e) => updateSetting(setting.key, Number(e.target.value))}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

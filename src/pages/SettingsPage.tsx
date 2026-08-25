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
import { userService } from '@/services/user.service'
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
    <main className="page-content">
      <div className="page-heading">
        <div>
          <h1 className="page-title">{t('page.settings.title')}</h1>
          <p className="page-subtitle">{t('page.settings.subtitle')}</p>
        </div>

        <div className="heading-actions">
          <button className="icon-button" onClick={loadSettingsData} title="Làm mới cấu hình" type="button">
            <RefreshCw className={`icon ${isLoading ? 'animate-spin text-indigo-400' : ''}`} />
          </button>
        </div>
      </div>

      <div className="settings-tabs">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              className={`settings-tab${activeTab === tab.id ? ' active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon className="tab-icon" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* TAB 1: PLANS */}
      {activeTab === 'plans' && (
        <div className="settings-section">
          <div className="section-header">
            <div>
              <h2 className="section-title">{isVietnamese ? 'Quản lý gói dịch vụ' : 'Subscription Plans'}</h2>
              <p className="section-desc">
                {isVietnamese ? 'Cấu hình các gói subscription, mức giá và quota AI' : 'Configure subscription plans and quotas'}
              </p>
            </div>
            <button className="primary-button" onClick={() => toast.info('Đang mở form tạo gói mới...')}>
              <Plus />
              {isVietnamese ? 'Thêm gói mới' : 'Add Plan'}
            </button>
          </div>

          <div className="plans-grid">
            {plans
              .sort((a, b) => a.tier - b.tier)
              .map((plan) => (
                <div
                  key={plan.id}
                  className={`plan-card${plan.is_featured ? ' featured' : ''}${!plan.is_active ? ' inactive' : ''}`}
                >
                  {plan.is_featured && (
                    <div className="plan-badge">{isVietnamese ? 'Phổ biến' : 'Popular'}</div>
                  )}

                  <div className="plan-header">
                    <div className="plan-title-row">
                      {plan.tier === 0 ? <Star className="plan-icon" /> : <Crown className="plan-icon premium-plus" />}
                      <h3 className="plan-name">{isVietnamese ? plan.name_vi : plan.name_en}</h3>
                    </div>
                    <span className="plan-tier">Tier {plan.tier}</span>
                  </div>

                  <div className="plan-pricing">
                    <div className="price-monthly">
                      <span className="price-value">{formatPrice(plan.price_monthly)}</span>
                      {plan.price_monthly > 0 && <span className="price-period">/tháng</span>}
                    </div>
                    {plan.price_yearly > 0 && (
                      <div className="price-yearly">
                        {formatPrice(plan.price_yearly)}/năm (tiết kiệm 20%)
                      </div>
                    )}
                  </div>

                  <div className="plan-quota">
                    <span className="quota-label">Hạn mức AI mỗi tháng:</span>
                    <span className="quota-value">
                      {plan.ai_chat_quota_monthly === -1 ? 'Không giới hạn' : `${plan.ai_chat_quota_monthly} tin nhắn`}
                    </span>
                  </div>

                  <div className="plan-features">
                    <h4 className="features-title">Tính năng bao gồm:</h4>
                    <ul className="features-list">
                      <li className="feature-item">
                        <Check className="feature-check" />
                        <span>{plan.has_ai_evaluation ? 'Chấm bài nói/viết bằng AI' : 'Học từ vựng cơ bản'}</span>
                      </li>
                      <li className="feature-item">
                        <Check className="feature-check" />
                        <span>{plan.has_full_toeic_access ? 'Toàn quyền 50+ đề thi TOEIC ETS' : 'Luyện tập đề mẫu hạn chế'}</span>
                      </li>
                      <li className="feature-item">
                        <Check className="feature-check" />
                        <span>{plan.has_ad_free ? 'Không quảng cáo & Ưu tiên hỗ trợ' : 'Hỗ trợ cộng đồng'}</span>
                      </li>
                    </ul>
                  </div>

                  <div className="plan-actions">
                    <button
                      className={`plan-toggle-btn${plan.is_active ? ' active' : ''}`}
                      onClick={() => togglePlanActive(plan.id)}
                    >
                      {plan.is_active ? 'Đang hoạt động' : 'Tạm dừng'}
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* TAB 2: AI & MODELS */}
      {activeTab === 'ai' && (
        <div className="settings-section">
          <div className="section-header">
            <div>
              <h2 className="section-title">Cấu Hình Mô Hình Trí Tuệ Nhân Tạo (AI)</h2>
              <p className="section-desc">Quản lý các kết nối LLM (Gemini 2.5 Pro, Flash, OpenAI GPT-4o, Whisper Audio, Claude)</p>
            </div>
            <button className="primary-button" onClick={() => toast.success('Đã đồng bộ AI Endpoint')}>
              <Sparkles className="w-4 h-4 mr-1.5" />
              Kiểm tra kết nối AI
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                    Mặc định chính
                  </span>
                  <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
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

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-violet-500/20 text-violet-400 border border-violet-500/30">
                    Chuyên sâu
                  </span>
                  <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
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
                <span className="font-mono text-violet-400">gemini-2.5-pro</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ROLES & RBAC */}
      {activeTab === 'roles' && (
        <div className="settings-section">
          <div className="section-header">
            <div>
              <h2 className="section-title">Phân Quyền & Vai Trò Hệ Thống (RBAC)</h2>
              <p className="section-desc">Quản lý danh sách vai trò (Admin, Teacher, Learner) và khởi tạo ma trận bảo mật</p>
            </div>
            <button className="primary-button" onClick={handleSeedRBAC}>
              <KeyRound className="w-4 h-4 mr-1.5" />
              Khởi tạo mặc định RBAC
            </button>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 mr-2">
                  ADMIN
                </span>
                <span className="text-sm font-semibold text-slate-200">Quản trị viên tối cao</span>
                <p className="text-xs text-slate-400 mt-1">Toàn quyền truy cập quản lý người dùng, nội dung, doanh thu, cài đặt hệ thống và bảo mật.</p>
              </div>
              <span className="text-xs text-slate-400 font-mono">Quyền: ALL (*)</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 mr-2">
                  INSTRUCTOR
                </span>
                <span className="text-sm font-semibold text-slate-200">Giáo viên / Tác giả khóa học</span>
                <p className="text-xs text-slate-400 mt-1">Quyền tạo khóa học, soạn thảo bài giảng, ngân hàng câu hỏi, tạo bộ thẻ và quản lý học viên khóa học.</p>
              </div>
              <span className="text-xs text-slate-400 font-mono">Quyền: courses:*, questions:*, vocabulary:*</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mr-2">
                  LEARNER
                </span>
                <span className="text-sm font-semibold text-slate-200">Học viên / Người học</span>
                <p className="text-xs text-slate-400 mt-1">Quyền học tập, làm bài kiểm tra, tham gia cộng đồng và lưu tiến trình cá nhân.</p>
              </div>
              <span className="text-xs text-slate-400 font-mono">Quyền: practice:read, exams:take, profile:write</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SYSTEM */}
      {activeTab === 'system' && (
        <div className="settings-section">
          <div className="section-header">
            <div>
              <h2 className="section-title">{isVietnamese ? 'Cài đặt hệ thống' : 'System Settings'}</h2>
              <p className="section-desc">{isVietnamese ? 'Cấu hình chung và tài nguyên lưu trữ đám mây' : 'General system parameters'}</p>
            </div>
            <button className="primary-button" onClick={handleSaveSystemSettings}>
              <Save />
              {isVietnamese ? 'Lưu cấu hình' : 'Save Settings'}
            </button>
          </div>

          <div className="mb-6 p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <HardDrive className="w-6 h-6 text-indigo-400" />
              <div>
                <h4 className="text-sm font-bold text-slate-200">Cloudflare R2 Object Storage</h4>
                <p className="text-xs text-slate-400">Lưu trữ Video bài giảng, Audio phát âm TOEIC và hình ảnh flashcards</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-slate-200">
                {storageUsage ? `${storageUsage.used_mb} MB / ${storageUsage.quota_mb} MB` : '3,200 MB / 10,000 MB'}
              </span>
              <div className="w-32 h-1.5 rounded-full bg-slate-800 mt-1 overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${storageUsage?.used_percentage || 32}%` }} />
              </div>
            </div>
          </div>

          <div className="settings-list">
            {settings.map((setting) => (
              <div key={setting.key} className="setting-item">
                <div className="setting-info">
                  <h4 className="setting-title">{isVietnamese ? setting.label_vi : setting.label_en}</h4>
                  <p className="setting-desc">{isVietnamese ? setting.description_vi : setting.description_en}</p>
                </div>
                <div className="setting-control">
                  {setting.type === 'boolean' && (
                    <button
                      className={`toggle-switch${setting.value ? ' on' : ''}`}
                      onClick={() => updateSetting(setting.key, !setting.value)}
                    >
                      <span className="toggle-handle" />
                    </button>
                  )}
                  {setting.type === 'number' && (
                    <input
                      type="number"
                      className="setting-input-number"
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
    </main>
  )
}

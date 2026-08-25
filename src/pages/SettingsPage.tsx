// Updated: 2026-08-22
// Settings page - Cài đặt hệ thống cho admin
// - Subscription plans management
// - System settings
// - Admin users

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Settings,
  Bell,
  Shield,
  Bot,
  Save,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Crown,
  Star,
} from 'lucide-react'
import {
  subscriptionPlans,
  systemSettings,
  type SubscriptionPlan,
  type SystemSetting,
} from '@/data/settings-data'

type TabType = 'plans' | 'system'

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

  const tabs = [
    { id: 'plans' as TabType, label: isVietnamese ? 'Gói dịch vụ' : 'Plans', icon: Crown },
    { id: 'system' as TabType, label: isVietnamese ? 'Hệ thống' : 'System', icon: Settings },
  ]

  const updateSetting = (key: string, value: boolean | number | string) => {
    setSettings(prev => prev.map(s => s.key === key ? { ...s, value } : s))
  }

  const togglePlanActive = (planId: string) => {
    setPlans(prev => prev.map(p => p.id === planId ? { ...p, is_active: !p.is_active } : p))
  }

  const getPlanIcon = (tier: number) => {
    if (tier === 0) return <Star className="plan-icon" />
    return <Crown className="plan-icon premium-plus" />
  }

  return (
    <main className="page-content">
      {/* Page Heading */}
      <div className="page-heading">
        <div>
          <h1 className="page-title">{t('page.settings.title')}</h1>
          <p className="page-subtitle">{t('page.settings.subtitle')}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="settings-tabs">
        {tabs.map(tab => {
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

      {/* Tab Content */}
      {activeTab === 'plans' && (
        <div className="settings-section">
          <div className="section-header">
            <div>
              <h2 className="section-title">{isVietnamese ? 'Quản lý gói dịch vụ' : 'Subscription Plans'}</h2>
              <p className="section-desc">{isVietnamese ? 'Cấu hình các gói subscription và quota' : 'Configure subscription plans and quotas'}</p>
            </div>
            <button className="primary-button">
              <Plus />
              {isVietnamese ? 'Thêm gói mới' : 'Add Plan'}
            </button>
          </div>

          {/* Plans Grid */}
          <div className="plans-grid">
            {plans.sort((a, b) => a.tier - b.tier).map(plan => (
              <div key={plan.id} className={`plan-card${plan.is_featured ? ' featured' : ''}${!plan.is_active ? ' inactive' : ''}`}>
                {plan.is_featured && (
                  <div className="plan-badge">{isVietnamese ? 'Phổ biến' : 'Popular'}</div>
                )}
                <div className="plan-header">
                  <div className="plan-icon-wrapper">
                    {getPlanIcon(plan.tier)}
                  </div>
                  <div>
                    <h3 className="plan-name">{isVietnamese ? plan.name_vi : plan.name_en}</h3>
                    <p className="plan-type">{plan.plan_type}</p>
                  </div>
                  <div className={`plan-status ${plan.is_active ? 'active' : 'inactive'}`}>
                    {plan.is_active ? (isVietnamese ? 'Hoạt động' : 'Active') : (isVietnamese ? 'Tắt' : 'Inactive')}
                  </div>
                </div>

                <div className="plan-pricing">
                  <div className="price-main">
                    <span className="price-value">{formatPrice(plan.price_monthly)}</span>
                    <span className="price-period">/{isVietnamese ? 'tháng' : 'month'}</span>
                  </div>
                  {plan.price_yearly > 0 && (
                    <p className="price-yearly">
                      {formatPrice(plan.price_yearly)}/{isVietnamese ? 'năm' : 'year'}
                    </p>
                  )}
                </div>

                <div className="plan-quotas">
                  <h4 className="quotas-title">{isVietnamese ? 'AI Quotas' : 'AI Quotas'}</h4>
                  <div className="quota-row">
                    <span className="quota-label">AI Evaluation</span>
                    <span className="quota-value">{plan.ai_evaluation_quota_monthly === 0 ? '—' : plan.ai_evaluation_quota_monthly + '/tháng'}</span>
                  </div>
                  <div className="quota-row">
                    <span className="quota-label">AI Translation</span>
                    <span className="quota-value">{plan.ai_translation_quota_monthly === 0 ? '—' : plan.ai_translation_quota_monthly + '/tháng'}</span>
                  </div>
                  <div className="quota-row">
                    <span className="quota-label">AI Chat</span>
                    <span className="quota-value">{plan.ai_chat_quota_monthly === 0 ? '—' : plan.ai_chat_quota_monthly + '/tháng'}</span>
                  </div>
                </div>

                <div className="plan-features">
                  <h4 className="features-title">{isVietnamese ? 'Tính năng' : 'Features'}</h4>
                  <ul className="features-list">
                    <li className={plan.has_ai_evaluation ? 'included' : 'excluded'}>
                      {plan.has_ai_evaluation ? <Check className="feature-check" /> : <X className="feature-x" />}
                      {isVietnamese ? 'Đánh giá AI Speaking/Writing' : 'AI Speaking/Writing Evaluation'}
                    </li>
                    <li className={plan.has_ai_translation ? 'included' : 'excluded'}>
                      {plan.has_ai_translation ? <Check className="feature-check" /> : <X className="feature-x" />}
                      {isVietnamese ? 'Dịch thuật AI' : 'AI Translation'}
                    </li>
                    <li className={plan.has_ai_chat ? 'included' : 'excluded'}>
                      {plan.has_ai_chat ? <Check className="feature-check" /> : <X className="feature-x" />}
                      {isVietnamese ? 'AI Chat/Tutor' : 'AI Chat/Tutor'}
                    </li>
                    <li className={plan.has_full_toeic_access ? 'included' : 'excluded'}>
                      {plan.has_full_toeic_access ? <Check className="feature-check" /> : <X className="feature-x" />}
                      {isVietnamese ? 'Full TOEIC Access' : 'Full TOEIC Access'}
                    </li>
                    <li className={plan.has_ad_free ? 'included' : 'excluded'}>
                      {plan.has_ad_free ? <Check className="feature-check" /> : <X className="feature-x" />}
                      {isVietnamese ? 'Không quảng cáo' : 'Ad-free'}
                    </li>
                    <li className={plan.has_priority_support ? 'included' : 'excluded'}>
                      {plan.has_priority_support ? <Check className="feature-check" /> : <X className="feature-x" />}
                      {isVietnamese ? 'Hỗ trợ ưu tiên' : 'Priority Support'}
                    </li>
                  </ul>
                </div>

                <div className="plan-actions">
                  <button className="plan-action-btn">
                    <Edit2 />
                    {isVietnamese ? 'Sửa' : 'Edit'}
                  </button>
                  <button
                    className={`plan-action-btn ${plan.is_active ? 'danger' : 'success'}`}
                    onClick={() => togglePlanActive(plan.id)}
                  >
                    {plan.is_active ? <Trash2 /> : <Plus />}
                    {plan.is_active ? (isVietnamese ? 'Tắt' : 'Deactivate') : (isVietnamese ? 'Bật' : 'Activate')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'system' && (
        <div className="settings-section">
          <div className="section-header">
            <div>
              <h2 className="section-title">{isVietnamese ? 'Cài đặt hệ thống' : 'System Settings'}</h2>
              <p className="section-desc">{isVietnamese ? 'Cấu hình các thông số hoạt động của nền tảng' : 'Configure platform operating parameters'}</p>
            </div>
            <button className="primary-button">
              <Save />
              {isVietnamese ? 'Lưu thay đổi' : 'Save Changes'}
            </button>
          </div>

          {/* Settings by Category */}
          {['GENERAL', 'NOTIFICATION', 'SECURITY', 'AI'].map(category => {
            const categorySettings = settings.filter(s => s.category === category)
            const categoryIcons: Record<string, React.ReactNode> = {
              GENERAL: <Settings />,
              NOTIFICATION: <Bell />,
              SECURITY: <Shield />,
              AI: <Bot />,
            }
            const categoryLabels: Record<string, { vi: string; en: string }> = {
              GENERAL: { vi: 'Chung', en: 'General' },
              NOTIFICATION: { vi: 'Thông báo', en: 'Notifications' },
              SECURITY: { vi: 'Bảo mật', en: 'Security' },
              AI: { vi: 'Trí tuệ nhân tạo', en: 'AI' },
            }

            return (
              <div key={category} className="settings-category">
                <div className="category-header">
                  {categoryIcons[category]}
                  <h3>{categoryLabels[category]?.[isVietnamese ? 'vi' : 'en'] || category}</h3>
                </div>
                <div className="settings-list">
                  {categorySettings.map(setting => (
                    <div key={setting.id} className="setting-row">
                      <div className="setting-info">
                        <label className="setting-label">
                          {isVietnamese ? setting.label_vi : setting.label_en}
                        </label>
                        {setting.description_en && (
                          <p className="setting-desc">
                            {isVietnamese ? setting.description_vi : setting.description_en}
                          </p>
                        )}
                      </div>
                      <div className="setting-control">
                        {setting.type === 'boolean' && (
                          <label className="toggle-switch">
                            <input
                              type="checkbox"
                              checked={setting.value as boolean}
                              onChange={e => updateSetting(setting.key, e.target.checked)}
                            />
                            <span className="toggle-slider" />
                          </label>
                        )}
                        {setting.type === 'number' && (
                          <input
                            type="number"
                            className="setting-number"
                            value={setting.value as number}
                            onChange={e => updateSetting(setting.key, parseInt(e.target.value))}
                          />
                        )}
                        {setting.type === 'select' && (
                          <select
                            className="setting-select"
                            value={setting.value as string}
                            onChange={e => updateSetting(setting.key, e.target.value)}
                          >
                            {setting.options?.map(opt => (
                              <option key={opt.value} value={opt.value}>
                                {isVietnamese ? opt.label_vi : opt.label_en}
                              </option>
                            ))}
                          </select>
                        )}
                        {setting.type === 'text' && (
                          <input
                            type="text"
                            className="setting-text"
                            value={setting.value as string}
                            onChange={e => updateSetting(setting.key, e.target.value)}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}

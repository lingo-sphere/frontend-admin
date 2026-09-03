/**
 * @file SettingsPlansTab.tsx
 * @description Component giao diện SettingsPlansTab phục vụ khu vực Quản trị Admin, hỗ trợ đầy đủ giao diện sáng và tối
 */

import { useState } from 'react'
import { Crown, Star, Check, Edit3, Sparkles } from 'lucide-react'
import type { SubscriptionPlan } from '@/types/api.types'
import { formatPrice } from '@/helpers/settings.helper'
import { EditSubscriptionPlanModal } from '@/components/settings/EditSubscriptionPlanModal'

interface SettingsPlansTabProps {
  plans: SubscriptionPlan[]
  isVietnamese: boolean
  onTogglePlanActive: (planId: string) => void
  onUpdatePlan?: (updatedPlan: SubscriptionPlan) => Promise<void>
}

export function SettingsPlansTab({
  plans,
  isVietnamese,
  onTogglePlanActive,
  onUpdatePlan,
}: SettingsPlansTabProps) {
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const handleOpenEdit = (plan: SubscriptionPlan) => {
    setEditingPlan(plan)
    setIsEditModalOpen(true)
  }

  const handleSavePlan = async (updatedPlan: SubscriptionPlan) => {
    if (onUpdatePlan) {
      await onUpdatePlan(updatedPlan)
    }
  }

  const paidPlans = plans
    .filter((p) => p.slug !== 'free' && p.tier > 0)
    .sort((a, b) => a.tier - b.tier)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>{isVietnamese ? 'Quản lý gói dịch vụ' : 'Subscription Plans'}</span>
            <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 text-[11px] font-mono font-bold">
              {paidPlans.length} {isVietnamese ? 'gói VIP' : 'VIP plans'}
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isVietnamese
              ? 'Cấu hình và chỉnh sửa giá của 4 gói dịch vụ tính phí hệ thống'
              : 'Configure and edit prices of 4 paid system subscription packages'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {paidPlans.map((plan) => {
            const planId = plan._id ? plan._id : plan.id ? plan.id : plan.slug
            const displayName = plan.name_vi || plan.name || plan.name_en || plan.slug
            const durationText =
              plan.duration_days >= 36500
                ? isVietnamese ? 'trọn đời' : 'lifetime'
                : plan.duration_days >= 365
                ? isVietnamese ? 'năm' : 'year'
                : plan.duration_days >= 90
                ? isVietnamese ? '3 tháng' : 'quarter'
                : isVietnamese ? 'tháng' : 'month'

            return (
              <div
                key={planId}
                className={`p-5 rounded-3xl border transition-all flex flex-col justify-between relative group ${
                  plan.is_popular
                    ? 'bg-indigo-50/70 dark:bg-slate-900/95 border-indigo-400/80 dark:border-indigo-500/60 shadow-xl shadow-indigo-500/10 ring-2 ring-indigo-500/20 dark:ring-indigo-500/40'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
                }`}
              >
                {plan.is_popular && (
                  <span className="absolute -top-3 right-5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600 text-white shadow-md flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>{isVietnamese ? 'Phổ biến nhất' : 'Popular'}</span>
                  </span>
                )}

                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {plan.tier === 0 ? (
                        <Star className="w-5 h-5 text-slate-400 shrink-0" />
                      ) : (
                        <Crown className="w-5 h-5 text-amber-500 shrink-0" />
                      )}
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-1">{displayName}</h3>
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 font-mono">
                          TIER {plan.tier} • {plan.slug}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-1">
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <span className="text-2xl font-extrabold text-amber-500 dark:text-amber-400">
                        {formatPrice(plan.price)}
                      </span>
                      {plan.price > 0 && (
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                          /{durationText}
                        </span>
                      )}
                    </div>

                    {plan.original_price && plan.original_price > plan.price ? (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-slate-400 dark:text-slate-500 line-through">
                          {formatPrice(plan.original_price)}
                        </span>
                        {plan.discount && (
                          <span className="px-1.5 py-0.5 rounded-md bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 text-[10px] font-bold">
                            {plan.discount}
                          </span>
                        )}
                      </div>
                    ) : null}
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    <h4 className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {isVietnamese ? 'Quyền lợi bao gồm:' : 'Benefits included:'}
                    </h4>
                    <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                      {plan.features && plan.features.length > 0 ? (
                        plan.features.slice(0, 4).map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Check className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                            <span className="line-clamp-2 leading-relaxed">{feat}</span>
                          </li>
                        ))
                      ) : (
                        <li className="flex items-center gap-2 text-slate-400 dark:text-slate-500 italic">
                          <span>{isVietnamese ? 'Đặc quyền đầy đủ' : 'Full perks included'}</span>
                        </li>
                      )}
                    </ul>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(plan)}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-600/20 dark:hover:bg-indigo-600/30 border border-indigo-200 dark:border-indigo-500/40 text-indigo-700 dark:text-indigo-300 text-xs font-bold transition-all cursor-pointer shadow-xs"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>{isVietnamese ? 'Chỉnh sửa giá & gói' : 'Edit Plan & Price'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onTogglePlanActive(planId)}
                    className={`w-full py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                      plan.is_active
                        ? 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/50'
                        : 'bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20'
                    }`}
                  >
                    {plan.is_active
                      ? isVietnamese ? 'Đang kích hoạt' : 'Active'
                      : isVietnamese ? 'Đang tạm dừng' : 'Inactive'}
                  </button>
                </div>
              </div>
            )
          })}
      </div>

      <EditSubscriptionPlanModal
        isOpen={isEditModalOpen}
        plan={editingPlan}
        isVietnamese={isVietnamese}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSavePlan}
      />
    </div>
  )
}

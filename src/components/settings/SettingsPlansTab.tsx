import { Crown, Star, Check, Plus } from 'lucide-react'
import type { SubscriptionPlan } from '@/types/api.types'
import { formatPrice } from '@/helpers/settings.helper'
import { toast } from '@/store/toast-store'

interface SettingsPlansTabProps {
  plans: SubscriptionPlan[]
  isVietnamese: boolean
  onTogglePlanActive: (planId: string) => void
}

export function SettingsPlansTab({
  plans,
  isVietnamese,
  onTogglePlanActive,
}: SettingsPlansTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-100">
            {isVietnamese ? 'Quản lý gói dịch vụ' : 'Subscription Plans'}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {isVietnamese
              ? 'Cấu hình các gói subscription, mức giá và quota AI'
              : 'Configure subscription plans and quotas'}
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
          .slice()
          .sort((a, b) => a.tier - b.tier)
          .map((plan) => {
            const planId = plan._id ? plan._id : plan.id ? plan.id : ''
            return (
              <div
                key={planId}
                className={`p-6 rounded-3xl border transition-all flex flex-col justify-between relative ${
                  plan.is_popular
                    ? 'bg-slate-900/90 border-indigo-500/50 shadow-xl shadow-indigo-500/10 ring-1 ring-indigo-500/30'
                    : 'bg-slate-900/70 border-slate-800'
                }`}
              >
                {plan.is_popular && (
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
                      <h3 className="text-base font-bold text-slate-100">{plan.name}</h3>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 font-mono">
                      TIER {plan.tier}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-extrabold text-slate-100">
                        {formatPrice(plan.price)}
                      </span>
                      {plan.price > 0 && (
                        <span className="text-xs text-slate-500">
                          /{plan.duration_days >= 365 ? 'năm' : `${plan.duration_days} ngày`}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <h4 className="text-xs font-semibold text-slate-300">
                      Quyền lợi bao gồm:
                    </h4>
                    <ul className="space-y-2 text-xs text-slate-400">
                      {plan.features && plan.features.length > 0 ? (
                        plan.features.map((feat, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <Check className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                            <span>{feat}</span>
                          </li>
                        ))
                      ) : (
                        <li className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                          <span>
                            {plan.tier === 0
                              ? 'Quyền truy cập miễn phí cơ bản'
                              : 'Toàn quyền truy cập tất cả tính năng VIP'}
                          </span>
                        </li>
                      )}
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
                    onClick={() => onTogglePlanActive(planId)}
                  >
                    {plan.is_active ? 'Đang kích hoạt' : 'Đang tạm dừng'}
                  </button>
                </div>
              </div>
            )
          })}
      </div>
    </div>
  )
}

// Trang quản trị quản lý các gói cước subscription dịch vụ trong giao diện Admin.
import { useTranslation } from 'react-i18next'
import { toast } from '@/store/toast.store'
import type { SubscriptionPlan } from '@/types/api.types'
import { SettingsNavHeader } from '@/features/settings/components/settings.nav.header'
import { SettingsPlansTab } from '@/features/settings/components/settings.plans.tab'
import {
  useSubscriptionPlansQuery,
  useUpdateSubscriptionPlanMutation,
} from '@/features/settings/hooks/use.settings.plans.query'

export function SettingsPlansPage() {
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'

  const { data: plans = [], isLoading, refetch } = useSubscriptionPlansQuery()
  const { mutateAsync: updatePlanMutate } = useUpdateSubscriptionPlanMutation()

  const handleTogglePlanActive = async (planId: string) => {
    const targetPlan = plans.find((p) => (p._id || p.slug) === planId)
    if (!targetPlan) return
    const newStatus = !targetPlan.is_active

    try {
      await updatePlanMutate({ planId, payload: { is_active: newStatus } })
      toast.success('Đã cập nhật trạng thái gói dịch vụ!')
    } catch {
      toast.error('Không thể cập nhật trạng thái gói')
    }
  }

  const handleUpdatePlan = async (updatedPlan: SubscriptionPlan) => {
    const planId = updatedPlan._id || updatedPlan.slug
    try {
      await updatePlanMutate({ planId, payload: updatedPlan })
      toast.success(isVietnamese ? 'Cập nhật giá và gói dịch vụ thành công!' : 'Plan updated successfully!')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : (isVietnamese ? 'Không thể cập nhật gói dịch vụ' : 'Failed to update plan')
      toast.error(msg)
      throw err
    }
  }

  return (
    <div className="space-y-6">
      <SettingsNavHeader
        activePage="plans"
        onRefresh={() => refetch()}
        isRefreshing={isLoading}
      />

      <SettingsPlansTab
        plans={plans}
        isVietnamese={isVietnamese}
        onTogglePlanActive={handleTogglePlanActive}
        onUpdatePlan={handleUpdatePlan}
      />
    </div>
  )
}

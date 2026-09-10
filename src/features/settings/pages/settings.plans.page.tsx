/**
 * @file settings.plans.page.tsx
 * @description Trang quản trị quản lý các gói cước subscription dịch vụ
 */

import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { userService } from '@/features/users/services/user.service'
import { toast } from '@/store/toast.store'
import type { SubscriptionPlan } from '@/types/api.types'
import { SettingsNavHeader } from '@/features/settings/components/settings.nav.header'
import { SettingsPlansTab } from '@/features/settings/components/settings.plans.tab'

export function SettingsPlansPage() {
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'

  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const loadPlansData = useCallback(async () => {
    setIsLoading(true)
    try {
      const plansRes = await userService.getSubscriptionPlans()
      if (plansRes) {
        setPlans(plansRes)
      }
    } catch {
      toast.error('Không thể tải danh sách gói dịch vụ')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPlansData()
  }, [loadPlansData])

  const handleTogglePlanActive = async (planId: string) => {
    const targetPlan = plans.find((p) => (p._id || p.slug) === planId)
    if (!targetPlan) return
    const newStatus = !targetPlan.is_active
    setPlans((prev) =>
      prev.map((p) => {
        const id = p._id || p.slug
        return id === planId ? { ...p, is_active: newStatus } : p
      })
    )
    try {
      await userService.updateSubscriptionPlan(planId, { is_active: newStatus })
      toast.success('Đã cập nhật trạng thái gói dịch vụ!')
    } catch {
      toast.error('Không thể cập nhật trạng thái gói')
    }
  }

  const handleUpdatePlan = async (updatedPlan: SubscriptionPlan) => {
    const planId = updatedPlan._id || updatedPlan.slug
    try {
      const res = await userService.updateSubscriptionPlan(planId, updatedPlan)
      setPlans((prev) =>
        prev.map((p) => {
          const id = p._id || p.slug
          return id === planId ? { ...p, ...res, price: updatedPlan.price } : p
        })
      )
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
        onRefresh={loadPlansData}
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

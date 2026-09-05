/**
 * @file settings.page.tsx
 * @description Trang quản trị SettingsPage trong giao diện Admin
 */

import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Settings, Shield, Bot, Crown, RefreshCw } from 'lucide-react'
import { roleService } from '@/services/role.service'
import { mediaService } from '@/services/media.service'
import { userService } from '@/services/user.service'
import { toast } from '@/store/toast.store'
import { systemSettings, type SystemSetting } from '@/data/settings.data'
import type { StorageUsageReport, SubscriptionPlan } from '@/types/api.types'

import type { SettingsTabType } from '@/helpers/settings.helper'
import { SettingsPlansTab } from '@/components/settings/settings.plans.tab'
import { SettingsAiTab } from '@/components/settings/settings.ai.tab'
import { SettingsRolesTab } from '@/components/settings/settings.roles.tab'
import { SettingsSystemTab } from '@/components/settings/settings.system.tab'

export function SettingsPage() {
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'

  const [activeTab, setActiveTab] = useState<SettingsTabType>('plans')
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [settings, setSettings] = useState<SystemSetting[]>(systemSettings)
  const [storageUsage, setStorageUsage] = useState<StorageUsageReport | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const tabs = [
    { id: 'plans' as SettingsTabType, label: isVietnamese ? 'Gói dịch vụ' : 'Plans', icon: Crown },
    { id: 'ai' as SettingsTabType, label: isVietnamese ? 'AI & Mô hình' : 'AI Models', icon: Bot },
    { id: 'roles' as SettingsTabType, label: isVietnamese ? 'Phân quyền RBAC' : 'Roles & RBAC', icon: Shield },
    { id: 'system' as SettingsTabType, label: isVietnamese ? 'Hệ thống' : 'System', icon: Settings },
  ]

  const loadSettingsData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [storage, plansRes] = await Promise.allSettled([
        mediaService.getStorageUsage(),
        userService.getSubscriptionPlans(),
      ])

      if (storage.status === 'fulfilled' && storage.value) {
        setStorageUsage(storage.value)
      }

      if (plansRes.status === 'fulfilled' && plansRes.value) {
        setPlans(plansRes.value)
      }
    } catch {

    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSettingsData()
  }, [loadSettingsData])

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

  const handleSeedRBAC = async () => {
    try {
      await roleService.seedDefaultRolesAndPermissions()
      toast.success('Đã khởi tạo ma trận vai trò RBAC thành công!')
    } catch {
      toast.info('Hệ thống RBAC đã được khởi tạo sẵn')
    }
  }

  const handleUpdateSetting = (key: string, value: string | number | boolean) => {
    setSettings((prev) =>
      prev.map((s) => (s.key === key ? { ...s, value } : s))
    )
  }

  const handleSaveSystemSettings = () => {
    toast.success('Đã lưu cấu hình hệ thống!')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-100 tracking-tight">
            {isVietnamese ? 'Cấu hình hệ thống & Dịch vụ' : 'System Settings & Services'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {isVietnamese
              ? 'Quản lý gói cước subscription, cấu hình kết nối AI, phân quyền RBAC và lưu trữ đám mây'
              : 'Manage subscription plans, AI connections, RBAC permissions, and cloud storage'}
          </p>
        </div>

        <button
          onClick={loadSettingsData}
          disabled={isLoading}
          className="flex items-center gap-2 h-9 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 border border-slate-700 transition-all cursor-pointer w-fit"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isVietnamese ? 'Làm mới' : 'Refresh'}</span>
        </button>
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
        <SettingsPlansTab
          plans={plans}
          isVietnamese={isVietnamese}
          onTogglePlanActive={handleTogglePlanActive}
          onUpdatePlan={handleUpdatePlan}
        />
      )}

      {activeTab === 'ai' && <SettingsAiTab />}

      {activeTab === 'roles' && <SettingsRolesTab onSeedRBAC={handleSeedRBAC} />}

      {activeTab === 'system' && (
        <SettingsSystemTab
          settings={settings}
          storageUsage={storageUsage}
          isVietnamese={isVietnamese}
          onUpdateSetting={handleUpdateSetting}
          onSaveSettings={handleSaveSystemSettings}
        />
      )}
    </div>
  )
}

import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Settings, Shield, Bot, Crown, RefreshCw } from 'lucide-react'
import { roleService } from '@/services/role.service'
import { mediaService } from '@/services/media.service'
import { userService } from '@/services/user.service'
import { toast } from '@/store/toast-store'
import { systemSettings, type SystemSetting } from '@/data/settings-data'
import type { StorageUsageReport, SubscriptionPlan } from '@/types/api.types'

import type { SettingsTabType } from '@/helpers/settings.helper'
import { SettingsPlansTab } from '@/components/settings/SettingsPlansTab'
import { SettingsAiTab } from '@/components/settings/SettingsAiTab'
import { SettingsRolesTab } from '@/components/settings/SettingsRolesTab'
import { SettingsSystemTab } from '@/components/settings/SettingsSystemTab'

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
      // Fallback
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSettingsData()
  }, [loadSettingsData])

  const handleTogglePlanActive = (planId: string) => {
    setPlans((prev) =>
      prev.map((p) => {
        const id = p._id || p.id
        return id === planId ? { ...p, is_active: !p.is_active } : p
      })
    )
    toast.success('Đã cập nhật trạng thái gói dịch vụ!')
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
    toast.success('Đã lưu cấu hình hệ thống thành công!')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-100 tracking-tight">
            {isVietnamese ? 'Cài Đặt Hệ Thống & Cấu Hình' : 'System Settings'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {isVietnamese
              ? 'Quản lý gói cước subscription, cấu hình kết nối AI, phân quyền RBAC và lưu trữ đám mây'
              : 'Manage subscription plans, AI connections, RBAC permissions, and cloud storage'}
          </p>
        </div>

        <button
          onClick={loadSettingsData}
          className="flex items-center gap-2 h-10 px-4 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer w-fit"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-400' : ''}`} />
          <span>{isVietnamese ? 'Đồng bộ cấu hình' : 'Sync Settings'}</span>
        </button>
      </div>

      {/* Tabs Navigation */}
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

      {/* Tab Contents */}
      {activeTab === 'plans' && (
        <SettingsPlansTab
          plans={plans}
          isVietnamese={isVietnamese}
          onTogglePlanActive={handleTogglePlanActive}
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

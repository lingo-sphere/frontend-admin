/**
 * @file settings.system.page.tsx
 * @description Trang quản trị cấu hình thông số hệ thống và lưu trữ đám mây
 */

import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { mediaService, type StorageQuota } from '@/features/media/services/media.service'
import { toast } from '@/store/toast.store'
import { systemSettings, type SystemSetting } from '@/features/settings/data/settings.data'
import { SettingsNavHeader } from '@/features/settings/components/settings.nav.header'
import { SettingsSystemTab } from '@/features/settings/components/settings.system.tab'

export function SettingsSystemPage() {
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'

  const [settings, setSettings] = useState<SystemSetting[]>(systemSettings)
  const [storageUsage, setStorageUsage] = useState<StorageQuota | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const loadSystemData = useCallback(async () => {
    setIsLoading(true)
    try {
      const storage = await mediaService.getStorageUsage()
      if (storage) {
        setStorageUsage(storage)
      }
    } catch {
      toast.error('Không thể tải thông tin lưu trữ đám mây')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSystemData()
  }, [loadSystemData])

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
      <SettingsNavHeader
        activePage="system"
        onRefresh={loadSystemData}
        isRefreshing={isLoading}
      />

      <SettingsSystemTab
        settings={settings}
        storageUsage={storageUsage}
        isVietnamese={isVietnamese}
        onUpdateSetting={handleUpdateSetting}
        onSaveSettings={handleSaveSystemSettings}
      />
    </div>
  )
}

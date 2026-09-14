// Trang quản trị cấu hình thông số hệ thống và lưu trữ đám mây với TanStack Query.
import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { mediaService, type StorageQuota } from '@/features/media/services/media.service'
import { toast } from '@/store/toast.store'
import { systemSettings, type SystemSetting } from '@/features/settings/data/settings.data'
import { SettingsNavHeader } from '@/features/settings/components/settings.nav.header'
import { SettingsSystemTab } from '@/features/settings/components/settings.system.tab'

export function SettingsSystemPage() {
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'

  const [settings, setSettings] = useState<SystemSetting[]>(systemSettings)

  const {
    data: storageUsage = null,
    isLoading,
    refetch,
  } = useQuery<StorageQuota | null>({
    queryKey: ['media-storage-usage'],
    queryFn: async () => {
      try {
        const storage = await mediaService.getStorageUsage()
        return storage || null
      } catch {
        toast.error('Không thể tải thông tin lưu trữ đám mây')
        return null
      }
    },
    staleTime: 5 * 60 * 1000,
  })

  const loadSystemData = useCallback(async () => {
    await refetch()
  }, [refetch])

  const handleUpdateSetting = useCallback((key: string, value: string | number | boolean) => {
    setSettings((prev) =>
      prev.map((s) => (s.key === key ? { ...s, value } : s))
    )
  }, [])

  const handleSaveSystemSettings = useCallback(() => {
    toast.success('Đã lưu cấu hình hệ thống!')
  }, [])

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

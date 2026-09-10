/**
 * @file settings.ai.page.tsx
 * @description Trang quản trị cấu hình hạ tầng và điều phối mô hình AI
 */

import { SettingsNavHeader } from '@/features/settings/components/settings.nav.header'
import { SettingsAiTab } from '@/features/settings/components/settings.ai.tab'

export function SettingsAiPage() {
  return (
    <div className="space-y-6">
      <SettingsNavHeader activePage="ai" />
      <SettingsAiTab />
    </div>
  )
}

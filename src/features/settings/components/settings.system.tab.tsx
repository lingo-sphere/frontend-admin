// Tab cài đặt thông số hệ thống và lưu trữ đám mây.
import { HardDrive, Save } from 'lucide-react'
import { NumberInput } from '@/components/number.input'
import type { StorageQuota } from '@/features/media/services/media.service'
import { formatMb, formatGb } from '@/features/media/helpers/media.helper'
import type { SystemSetting } from '@/features/settings/data/settings.data'

interface SettingsSystemTabProps {
  settings: SystemSetting[]
  storageUsage: StorageQuota | null
  isVietnamese: boolean
  onUpdateSetting: (key: string, value: string | number | boolean) => void
  onSaveSettings: () => void
}

export function SettingsSystemTab({
  settings,
  storageUsage,
  isVietnamese,
  onUpdateSetting,
  onSaveSettings,
}: SettingsSystemTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            {isVietnamese ? 'Cài đặt hệ thống' : 'System Settings'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isVietnamese
              ? 'Cấu hình chung và tài nguyên lưu trữ đám mây'
              : 'General system parameters'}
          </p>
        </div>
        <button
          type="button"
          className="flex items-center gap-2 h-10 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          onClick={onSaveSettings}
        >
          <Save className="w-4 h-4" />
          <span>{isVietnamese ? 'Lưu cấu hình' : 'Save Settings'}</span>
        </button>
      </div>

      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/20">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Hệ Thống Lưu Trữ Đám Mây (Cloud Storage)
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Lưu trữ Video bài giảng, Audio phát âm TOEIC và hình ảnh flashcards
            </p>
          </div>
        </div>
        <div className="text-left sm:text-right">
          <span className="text-xs font-bold text-slate-900 dark:text-slate-200">
            {storageUsage
              ? `${formatMb(storageUsage.used_bytes)} MB / ${formatGb(storageUsage.total_quota_bytes)} GB`
              : (isVietnamese ? 'Đang tải...' : 'Loading...')}
          </span>
          <div className="w-36 h-2 rounded-full bg-slate-100 dark:bg-slate-950 mt-1.5 overflow-hidden border border-slate-200 dark:border-slate-800">
            <div
              className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${storageUsage?.used_percentage || 0}%` }}
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs divide-y divide-slate-100 dark:divide-slate-800">
        {settings.map((setting) => (
          <div key={setting.key} className="p-4 flex items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200">
                {isVietnamese ? setting.label_vi : setting.label_en}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {isVietnamese ? setting.description_vi : setting.description_en}
              </p>
            </div>
            <div>
              {setting.type === 'boolean' && (
                <button
                  type="button"
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    setting.value ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-800'
                  }`}
                  onClick={() => onUpdateSetting(setting.key, !setting.value)}
                >
                  <span
                    className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${
                      setting.value ? 'left-6' : 'left-1'
                    }`}
                  />
                </button>
              )}
              {setting.type === 'number' && (
                <NumberInput
                  className="w-24 h-9 px-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100"
                  value={setting.value as number}
                  onChange={(val) => onUpdateSetting(setting.key, val)}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

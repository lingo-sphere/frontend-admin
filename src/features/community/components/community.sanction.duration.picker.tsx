// Component lựa chọn thời lượng tắt tiếng (Mute) hoặc thời gian chờ tái tham gia (Kick).
import { useTranslation } from 'react-i18next'
import type { SanctionActionType } from '@/features/community/types/community.admin.types'

export function getMuteDurationLabel(value: number, t: (key: string) => string): string {
  switch (value) {
    case 15:
      return t('community.min15')
    case 60:
      return t('community.hour1')
    case 1440:
      return t('community.hours24')
    case 10080:
      return t('community.days7')
    default:
      return `${value}m`
  }
}

export function getKickCooldownLabel(value: number, t: (key: string) => string): string {
  switch (value) {
    case 15:
      return t('community.min15')
    case 60:
      return t('community.hour1')
    case 1440:
      return t('community.hours24')
    default:
      return `${value}m`
  }
}

export const MUTE_DURATION_VALUES = [15, 60, 1440, 10080]
export const KICK_COOLDOWN_VALUES = [15, 60, 1440]

export interface CommunitySanctionDurationPickerProps {
  action: SanctionActionType
  muteDuration: number
  kickCooldown: number
  onChangeMuteDuration: (value: number) => void
  onChangeKickCooldown: (value: number) => void
}

export function CommunitySanctionDurationPicker({
  action,
  muteDuration,
  kickCooldown,
  onChangeMuteDuration,
  onChangeKickCooldown,
}: CommunitySanctionDurationPickerProps) {
  const { t } = useTranslation()

  if (action === 'MUTE') {
    return (
      <div className="space-y-1.5 p-3 rounded-2xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40">
        <label className="block text-xs font-bold text-amber-900 dark:text-amber-200">
          {t('community.muteDurationLabel')}
        </label>
        <div className="grid grid-cols-4 gap-2">
          {MUTE_DURATION_VALUES.map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => onChangeMuteDuration(val)}
              className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                muteDuration === val
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-amber-400'
              }`}
            >
              {getMuteDurationLabel(val, t)}
            </button>
          ))}
        </div>
      </div>
    )
  }

  if (action === 'KICK') {
    return (
      <div className="space-y-1.5 p-3 rounded-2xl bg-orange-50/40 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/40">
        <label className="block text-xs font-bold text-orange-900 dark:text-orange-200">
          {t('community.kickCooldownLabel')}
        </label>
        <div className="grid grid-cols-3 gap-2">
          {KICK_COOLDOWN_VALUES.map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => onChangeKickCooldown(val)}
              className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                kickCooldown === val
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-orange-400'
              }`}
            >
              {getKickCooldownLabel(val, t)}
            </button>
          ))}
        </div>
      </div>
    )
  }

  return null
}

// Component lựa chọn thời lượng tắt tiếng (Mute) hoặc thời gian chờ tái tham gia (Kick)
import type { SanctionActionType } from '@/features/community/types/community.admin.types'

export const MUTE_DURATION_OPTIONS = [
  { label: '15 phút', value: 15 },
  { label: '1 giờ', value: 60 },
  { label: '24 giờ', value: 1440 },
  { label: '7 ngày', value: 10080 },
]

export const KICK_COOLDOWN_OPTIONS = [
  { label: '15 phút', value: 15 },
  { label: '1 giờ', value: 60 },
  { label: '24 giờ', value: 1440 },
]

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
  if (action === 'MUTE') {
    return (
      <div className="space-y-1.5 p-3 rounded-2xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40">
        <label className="block text-xs font-bold text-amber-900 dark:text-amber-200">
          Thời lượng tắt tiếng (Mute Duration):
        </label>
        <div className="grid grid-cols-4 gap-2">
          {MUTE_DURATION_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChangeMuteDuration(opt.value)}
              className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                muteDuration === opt.value
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-amber-400'
              }`}
            >
              {opt.label}
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
          Thời gian chờ tái tham gia (Kick Cooldown):
        </label>
        <div className="grid grid-cols-3 gap-2">
          {KICK_COOLDOWN_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChangeKickCooldown(opt.value)}
              className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                kickCooldown === opt.value
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-orange-400'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    )
  }

  return null
}

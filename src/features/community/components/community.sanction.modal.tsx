// Modal kỷ luật học viên gồm cấm vĩnh viễn, tắt tiếng và trục xuất có thời gian chờ.
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Ban, VolumeX, ShieldAlert, X, Loader2, Clock, Check } from 'lucide-react'
import { CommunityUserPicker } from '@/features/community/components/community.user.picker'
import {
  CommunitySanctionDurationPicker,
  getMuteDurationLabel,
  getKickCooldownLabel,
} from '@/features/community/components/community.sanction.duration.picker'
import type { UserProfile } from '@/features/users/schemas/user.schema'
import type { SanctionActionType } from '@/features/community/types/community.admin.types'

export interface SanctionTargetUser {
  user_id: string
  user_name: string
  user_avatar?: string
  sender_badge?: string
}

interface CommunitySanctionModalProps {
  isOpen: boolean
  onClose: () => void
  initialTargetUser?: SanctionTargetUser | null
  onSanction: (
    action: SanctionActionType,
    data: {
      target_user_id: string
      reason: string
      duration_minutes?: number
      cooldown_minutes?: number
      user_name?: string
      user_avatar?: string
    }
  ) => Promise<void>
}

export function CommunitySanctionModal({
  isOpen,
  onClose,
  initialTargetUser,
  onSanction,
}: CommunitySanctionModalProps) {
  const { t } = useTranslation()
  const [action, setAction] = useState<SanctionActionType>('MUTE')
  const [targetUserId, setTargetUserId] = useState('')
  const [selectedLearner, setSelectedLearner] = useState<UserProfile | null>(null)
  const [reason, setReason] = useState('')
  const [muteDuration, setMuteDuration] = useState<number>(60)
  const [kickCooldown, setKickCooldown] = useState<number>(15)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      if (initialTargetUser) {
        setTargetUserId(initialTargetUser.user_id)
        setSelectedLearner(null)
      } else {
        setTargetUserId('')
        setSelectedLearner(null)
      }
      setReason('')
      setAction('MUTE')
      setMuteDuration(60)
      setKickCooldown(15)
      setIsSubmitting(false)
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen, initialTargetUser])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, isSubmitting, onClose])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const finalUserId = targetUserId.trim()
    const finalReason = reason.trim()
    if (!finalUserId || !finalReason || isSubmitting) return

    setIsSubmitting(true)
    try {
      await onSanction(action, {
        target_user_id: finalUserId,
        reason: finalReason,
        duration_minutes: action === 'MUTE' ? muteDuration : undefined,
        cooldown_minutes: action === 'KICK' ? kickCooldown : undefined,
        user_name: initialTargetUser?.user_name || selectedLearner?.full_name,
        user_avatar: (initialTargetUser?.user_avatar || selectedLearner?.avatar_url) || undefined,
      })
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  const getActionButtonStyle = () => {
    switch (action) {
      case 'BAN':
        return 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
      case 'MUTE':
        return 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
      case 'KICK':
        return 'bg-orange-600 hover:bg-orange-700 shadow-orange-600/20'
    }
  }

  const getActionSubmitText = () => {
    switch (action) {
      case 'BAN':
        return t('community.confirmBan')
      case 'MUTE':
        return t('community.confirmMute', { duration: getMuteDurationLabel(muteDuration, t) })
      case 'KICK':
        return t('community.confirmKick', { duration: getKickCooldownLabel(kickCooldown, t) })
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-150"
      onClick={() => !isSubmitting && onClose()}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative z-10 animate-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 flex items-center justify-center flex-shrink-0">
              <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {t('community.sanctionModalTitle')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('community.sanctionModalSubtitle')}
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 space-y-4 overflow-y-auto flex-1">
            {initialTargetUser ? (
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-200 overflow-hidden flex-shrink-0">
                    {initialTargetUser.user_avatar ? (
                      <img
                        src={initialTargetUser.user_avatar}
                        alt={initialTargetUser.user_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      initialTargetUser.user_name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                        {initialTargetUser.user_name}
                      </span>
                      {initialTargetUser.sender_badge && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                          {initialTargetUser.sender_badge}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">
                      ID: {initialTargetUser.user_id}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/50 flex-shrink-0">
                  {t('community.fromMessage')}
                </span>
              </div>
            ) : (
              <CommunityUserPicker
                selectedUser={selectedLearner}
                onSelectUser={(u) => {
                  setSelectedLearner(u)
                  setTargetUserId(u?.user_id || '')
                }}
                manualUserId={targetUserId}
                onChangeManualUserId={setTargetUserId}
                disabledRoles={['ADMIN', 'SUPER_ADMIN']}
                themeColor="rose"
              />
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {t('community.actionTypeLabel')}
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setAction('BAN')}
                  className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                    action === 'BAN'
                      ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 ring-2 ring-rose-500/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-700 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-800/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Ban className="w-4 h-4 text-rose-600" />
                    {action === 'BAN' && <Check className="w-3.5 h-3.5 text-rose-600" />}
                  </div>
                  <span className="text-xs font-bold">{t('community.banLabel')}</span>
                  <span className="text-[10px] text-slate-400 line-clamp-1">{t('community.banSub')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAction('MUTE')}
                  className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                    action === 'MUTE'
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 ring-2 ring-amber-500/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-700 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-800/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <VolumeX className="w-4 h-4 text-amber-600" />
                    {action === 'MUTE' && <Check className="w-3.5 h-3.5 text-amber-600" />}
                  </div>
                  <span className="text-xs font-bold">{t('community.muteLabel')}</span>
                  <span className="text-[10px] text-slate-400 line-clamp-1">{t('community.muteSub')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAction('KICK')}
                  className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                    action === 'KICK'
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 ring-2 ring-orange-500/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-700 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-800/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Clock className="w-4 h-4 text-orange-600" />
                    {action === 'KICK' && <Check className="w-3.5 h-3.5 text-orange-600" />}
                  </div>
                  <span className="text-xs font-bold">{t('community.kickLabel')}</span>
                  <span className="text-[10px] text-slate-400 line-clamp-1">{t('community.kickSub')}</span>
                </button>
              </div>
            </div>

            <CommunitySanctionDurationPicker
              action={action}
              muteDuration={muteDuration}
              kickCooldown={kickCooldown}
              onChangeMuteDuration={setMuteDuration}
              onChangeKickCooldown={setKickCooldown}
            />

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('community.reasonLabel')}
              </label>
              <textarea
                required
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={t('community.reasonPlaceholder')}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
              />
            </div>
          </div>

          <div className="p-4 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !targetUserId.trim() || !reason.trim()}
              className={`px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-lg transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer ${getActionButtonStyle()}`}
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <span>{getActionSubmitText()}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

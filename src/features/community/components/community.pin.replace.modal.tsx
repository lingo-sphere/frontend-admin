// Modal chọn thay thế tin nhắn khi phòng chat đã đạt tối đa 3 tin nhắn ghim.
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Image } from 'antd'
import { Pin, X, CheckCircle2, Circle, Loader2, ArrowRight } from 'lucide-react'
import type { AdminChatMessage } from '@/features/community/types/community.admin.types'
import { resolveMediaUrl, IMAGE_FALLBACK_PLACEHOLDER } from '@/lib/media.utils'

interface CommunityPinReplaceModalProps {
  isOpen: boolean
  onClose: () => void
  targetMessage: AdminChatMessage | null
  pinnedMessages: AdminChatMessage[]
  onConfirmReplace: (unpinMessageId: string, targetMessageId: string) => Promise<void>
}

export function CommunityPinReplaceModal({
  isOpen,
  onClose,
  targetMessage,
  pinnedMessages,
  onConfirmReplace,
}: CommunityPinReplaceModalProps) {
  const { t, i18n } = useTranslation()
  const isVi = i18n.language === 'vi'

  const [selectedPinId, setSelectedPinId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      if (pinnedMessages.length > 0) {
        setSelectedPinId(pinnedMessages[0]._id)
      }
    } else {
      document.body.style.overflow = ''
      setSelectedPinId(null)
      setIsSubmitting(false)
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen, pinnedMessages])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, isSubmitting, onClose])

  if (!isOpen || !targetMessage) return null

  const handleConfirm = async () => {
    if (!selectedPinId || isSubmitting) return
    setIsSubmitting(true)
    try {
      await onConfirmReplace(selectedPinId, targetMessage._id)
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/80 flex items-center justify-center flex-shrink-0">
              <Pin className="w-5 h-5 text-amber-600 dark:text-amber-400 fill-amber-500" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {t('community.pinLimitReachedTitle')}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t('community.pinLimitReachedSubtitle')}
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

        <div className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-indigo-700 dark:text-indigo-300">
            <span>{t('community.newMsgToPin')}</span>
            <span className="font-normal font-mono opacity-80">
              {new Date(targetMessage.created_at).toLocaleTimeString(isVi ? 'vi-VN' : 'en-US')}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-indigo-200 dark:bg-indigo-800 flex items-center justify-center text-[10px] font-bold text-indigo-900 dark:text-indigo-100 flex-shrink-0 overflow-hidden">
              {targetMessage.sender_avatar ? (
                <img
                  src={resolveMediaUrl(targetMessage.sender_avatar)}
                  alt={targetMessage.sender_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                targetMessage.sender_name.charAt(0).toUpperCase()
              )}
            </div>
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
              {targetMessage.sender_name}
            </span>
          </div>
          {targetMessage.content && (
            <p className="text-xs text-slate-700 dark:text-slate-300 pl-8 break-words line-clamp-2 italic">
              "{targetMessage.content}"
            </p>
          )}
          {targetMessage.attachments && targetMessage.attachments.length > 0 && (
            <div className="flex items-center gap-1.5 pl-8 pt-0.5">
              <Image.PreviewGroup>
                {targetMessage.attachments.map((url, idx) => (
                  <Image
                    key={idx}
                    src={resolveMediaUrl(url)}
                    fallback={IMAGE_FALLBACK_PLACEHOLDER}
                    alt={`target-att-${idx + 1}`}
                    width={36}
                    height={36}
                    style={{ objectFit: 'cover', borderRadius: 6 }}
                  />
                ))}
              </Image.PreviewGroup>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            {t('community.selectOldPinLabel', { count: pinnedMessages.length })}
          </label>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {pinnedMessages.map((msg) => {
              const isSelected = selectedPinId === msg._id
              return (
                <div
                  key={msg._id}
                  onClick={() => !isSubmitting && setSelectedPinId(msg._id)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                    isSelected
                      ? 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/40 ring-2 ring-amber-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-700/80 bg-slate-50/50 dark:bg-slate-800/30'
                  }`}
                >
                  <div className="mt-0.5 flex-shrink-0">
                    {isSelected ? (
                      <CheckCircle2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                          {msg.sender_name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          ID: {msg.sender_id.slice(-6)}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono flex-shrink-0">
                        {new Date(msg.created_at).toLocaleTimeString(isVi ? 'vi-VN' : 'en-US')}
                      </span>
                    </div>
                    {msg.content && (
                      <p className="text-xs text-amber-700 dark:text-amber-300 font-medium break-words line-clamp-2">
                        {msg.content}
                      </p>
                    )}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="flex items-center gap-1 pt-0.5" onClick={(e) => e.stopPropagation()}>
                        <Image.PreviewGroup>
                          {msg.attachments.map((url, idx) => (
                            <Image
                              key={idx}
                              src={resolveMediaUrl(url)}
                              fallback={IMAGE_FALLBACK_PLACEHOLDER}
                              alt={`pinned-att-${idx + 1}`}
                              width={32}
                              height={32}
                              style={{ objectFit: 'cover', borderRadius: 4 }}
                            />
                          ))}
                        </Image.PreviewGroup>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="h-10 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {t('common.cancel')}
          </button>
          <button
            type="button"
            disabled={!selectedPinId || isSubmitting}
            onClick={handleConfirm}
            className="h-10 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-lg shadow-amber-600/20 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>{t('community.replacePin')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

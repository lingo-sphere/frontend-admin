// Modal quản trị hạn mức AI riêng và reset số lượt dùng cho từng học viên.
import { useEffect } from 'react'
import { X, RotateCcw, Sparkles, MessageSquare, Crown, Save, CheckCircle, RefreshCw } from 'lucide-react'
import type { User } from '@/features/users/types/learner.types'
import { useLearnerAiQuota } from '@/features/users/hooks/use.learner.ai.quota'

interface LearnerAiQuotaModalProps {
  user: User | null
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function LearnerAiQuotaModal({
  user,
  isOpen,
  onClose,
  onSuccess,
}: LearnerAiQuotaModalProps) {
  const {
    quotaStatus,
    isLoading,
    isResetting,
    isSavingCustom,
    customChatLimit,
    setCustomChatLimit,
    customContextTokens,
    setCustomContextTokens,
    isUnlimited,
    chatUsed,
    chatLimit,
    chatPercent,
    handleResetQuota,
    handleSaveCustomLimits,
  } = useLearnerAiQuota({ user, isOpen, onSuccess })

  useEffect(() => {
    if (isOpen && user) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen, user])

  if (!isOpen || !user) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 dark:bg-black/50 backdrop-blur-[2px] animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-purple-600/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Hạn Mức AI Học Viên
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {user.full_name} · <span className="font-mono">{user.email}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${
                user.is_premium
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700'
              }`}
            >
              {user.is_premium && <Crown className="w-3.5 h-3.5 text-amber-500" />}
              <span>{user.is_premium ? 'VIP Premium' : 'Gói Miễn Phí'}</span>
            </span>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin text-purple-500" />
              <span className="text-xs">Đang tải thông tin hạn mức AI...</span>
            </div>
          ) : (
            <>
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-slate-100">
                    <MessageSquare className="w-4 h-4 text-purple-500" />
                    <span>Lượt Trò Chuyện Với Gia Sư AI</span>
                  </div>
                  <span className="text-xs font-bold text-purple-600 dark:text-purple-400 font-mono">
                    {isUnlimited ? 'Vô Hạn (VIP)' : `${chatUsed} / ${chatLimit} câu hỏi`}
                  </span>
                </div>

                {!isUnlimited && (
                  <div className="space-y-1.5">
                    <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          chatPercent >= 100
                            ? 'bg-rose-500'
                            : chatPercent >= 80
                            ? 'bg-amber-500'
                            : 'bg-purple-600'
                        }`}
                        style={{ width: `${chatPercent}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      <span>Đã dùng: {chatPercent}%</span>
                      <span>Còn lại: {Math.max(0, chatLimit - chatUsed)} câu</span>
                    </div>
                  </div>
                )}

                <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800/60 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 text-[11px] block">Lượt dịch thuật:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                      {isUnlimited ? 'Vô hạn' : `${quotaStatus?.translation.used || 0} lượt`}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 text-[11px] block">Context tokens:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                      {quotaStatus?.context_token_limit || 1000} tokens
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/80 dark:border-indigo-900/40 flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                    <RotateCcw className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    Reset Lượt Sử Dụng AI (Cá Nhân)
                  </span>
                  <p className="text-[11px] text-indigo-700 dark:text-indigo-300">
                    Đưa số câu hỏi và lượt dịch đã dùng về 0 để học viên tiếp tục học ngay.
                  </p>
                </div>

                <button
                  type="button"
                  disabled={isResetting || chatUsed === 0}
                  onClick={handleResetQuota}
                  className="flex items-center gap-1.5 h-9 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-xs transition-all cursor-pointer disabled:opacity-50 shrink-0"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
                  <span>{isResetting ? 'Đang reset...' : 'Reset Về 0'}</span>
                </button>
              </div>

              <form onSubmit={handleSaveCustomLimits} className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-slate-100">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span>Thiết Lập Hạn Mức Riêng Cho Học Viên Này</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                      Số câu hỏi tối đa / tháng
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={1000}
                      required
                      value={customChatLimit}
                      onChange={(e) => setCustomChatLimit(Number(e.target.value))}
                      className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                      Độ dài ngữ cảnh (Tokens)
                    </label>
                    <input
                      type="number"
                      min={256}
                      max={16000}
                      step={256}
                      required
                      value={customContextTokens}
                      onChange={(e) => setCustomContextTokens(Number(e.target.value))}
                      className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={isSavingCustom}
                    className="flex items-center gap-1.5 h-9 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white shadow-xs transition-all cursor-pointer disabled:opacity-60"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSavingCustom ? 'Đang lưu...' : 'Lưu Hạn Mức Riêng'}</span>
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

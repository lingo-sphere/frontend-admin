// Quản lý danh sách đen, học viên bị cấm hoặc phạt tắt tiếng trong cộng đồng
import { useState } from 'react'
import { Ban, VolumeX, ShieldAlert, CheckCircle, Clock, UserX, X } from 'lucide-react'
import type {
  AdminCommunityMember,
  BanMemberPayload,
} from '@/features/community/types/community.admin.types'
import { ConfirmModal } from '@/components/confirm.modal'
import { CommunityUserPicker } from '@/features/community/components/community.user.picker'
import type { UserProfile } from '@/features/users/schemas/user.schema'

interface CommunitySanctionsTabProps {
  bannedMembers: AdminCommunityMember[]
  isLoading: boolean
  onBanMember: (payload: BanMemberPayload) => Promise<void>
  onUnbanMember: (userId: string) => Promise<void>
  onUnmuteMember: (userId: string) => Promise<void>
}

export function CommunitySanctionsTab({
  bannedMembers,
  isLoading,
  onBanMember,
  onUnbanMember,
  onUnmuteMember,
}: CommunitySanctionsTabProps) {
  const [isBanModalOpen, setIsBanModalOpen] = useState(false)
  const [targetUserId, setTargetUserId] = useState('')
  const [banReason, setBanReason] = useState('')
  const [selectedLearner, setSelectedLearner] = useState<UserProfile | null>(null)
  const [isSubmittingBan, setIsSubmittingBan] = useState(false)
  const [unbanTargetUserId, setUnbanTargetUserId] = useState<string | null>(null)
  const [unmuteTargetUserId, setUnmuteTargetUserId] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleOpenBanModal = () => {
    setTargetUserId('')
    setBanReason('')
    setSelectedLearner(null)
    setIsBanModalOpen(true)
  }

  const handleBanSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!targetUserId.trim() || !banReason.trim()) return
    setIsSubmittingBan(true)
    try {
      await onBanMember({
        target_user_id: targetUserId.trim(),
        reason: banReason.trim(),
        user_name: selectedLearner?.full_name,
        user_avatar: selectedLearner?.avatar_url,
      })
      setIsBanModalOpen(false)
    } finally {
      setIsSubmittingBan(false)
    }
  }

  const handleConfirmUnban = async () => {
    if (!unbanTargetUserId) return
    setIsProcessing(true)
    try {
      await onUnbanMember(unbanTargetUserId)
      setUnbanTargetUserId(null)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleConfirmUnmute = async () => {
    if (!unmuteTargetUserId) return
    setIsProcessing(true)
    try {
      await onUnmuteMember(unmuteTargetUserId)
      setUnmuteTargetUserId(null)
    } finally {
      setIsProcessing(false)
    }
  }

  const isMutedActive = (mutedUntil?: string) => {
    if (!mutedUntil) return false
    return new Date(mutedUntil).getTime() > Date.now()
  }

  const isKickedActive = (cooldownUntil?: string) => {
    if (!cooldownUntil) return false
    return new Date(cooldownUntil).getTime() > Date.now()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            <span>Kỷ Luật & Danh Sách Đen (Sanctions & Blacklist)</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Danh sách các học viên vi phạm quy tắc phòng chat bị cấm vĩnh viễn, tắt tiếng hoặc đang trong thời gian cooldown
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenBanModal}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 shadow-sm transition-all cursor-pointer self-start sm:self-auto"
        >
          <UserX className="w-4 h-4" />
          <span>Thêm vào danh sách đen</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 text-xs uppercase font-bold border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-5 py-3">Học viên vi phạm</th>
                <th className="px-5 py-3">Hình thức kỷ luật</th>
                <th className="px-5 py-3">Lý do xử lý</th>
                <th className="px-5 py-3">Thời hạn</th>
                <th className="px-5 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {bannedMembers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-slate-400">
                    {isLoading ? 'Đang tải danh sách...' : 'Không có học viên nào đang bị kỷ luật'}
                  </td>
                </tr>
              ) : (
                bannedMembers.map((member) => {
                  const muted = isMutedActive(member.muted_until)
                  const kicked = isKickedActive(member.kicked_cooldown_until)

                  return (
                    <tr key={member.user_id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-200 overflow-hidden flex-shrink-0">
                            {member.user_avatar ? (
                              <img src={member.user_avatar} alt={member.user_name} className="w-full h-full object-cover" />
                            ) : (
                              member.user_name.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                              {member.user_name}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              User ID: {member.user_id}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-1">
                          {member.is_banned && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 w-fit">
                              <Ban className="w-3 h-3" />
                              CẤM VĨNH VIỄN
                            </span>
                          )}
                          {muted && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900 w-fit">
                              <VolumeX className="w-3 h-3" />
                              TẮT TIẾNG
                            </span>
                          )}
                          {kicked && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-900 w-fit">
                              <Clock className="w-3 h-3" />
                              COOLDOWN KICK
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4 max-w-xs">
                        <p className="text-xs text-slate-700 dark:text-slate-300 break-words">
                          {member.banned_reason || 'Vi phạm điều khoản cộng đồng'}
                        </p>
                        {member.banned_by && (
                          <span className="text-[10px] text-slate-400">
                            Bởi Admin/Mod ID: {member.banned_by.slice(-6)}
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-xs font-mono text-slate-500 whitespace-nowrap">
                        {member.is_banned ? (
                          <span className="text-rose-600 font-semibold">Vô thời hạn</span>
                        ) : muted && member.muted_until ? (
                          <span>Đến {new Date(member.muted_until).toLocaleString('vi-VN')}</span>
                        ) : kicked && member.kicked_cooldown_until ? (
                          <span>Đến {new Date(member.kicked_cooldown_until).toLocaleString('vi-VN')}</span>
                        ) : (
                          <span>Đã hết hạn</span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          {member.is_banned && (
                            <button
                              onClick={() => setUnbanTargetUserId(member.user_id)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors cursor-pointer"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Gỡ cấm</span>
                            </button>
                          )}
                          {muted && (
                            <button
                              onClick={() => setUnmuteTargetUserId(member.user_id)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors cursor-pointer"
                            >
                              <VolumeX className="w-3.5 h-3.5" />
                              <span>Mở khóa chat</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        isOpen={Boolean(unbanTargetUserId)}
        onClose={() => setUnbanTargetUserId(null)}
        onConfirm={handleConfirmUnban}
        title="Gỡ cấm học viên"
        message="Học viên này sẽ được phép truy cập lại phòng chat cộng đồng nếu họ đáp ứng đủ điều kiện (mua khóa học hoặc gói PRO)."
        type="success"
        confirmText="Xác nhận gỡ cấm"
        cancelText="Hủy bỏ"
        isLoading={isProcessing}
      />

      <ConfirmModal
        isOpen={Boolean(unmuteTargetUserId)}
        onClose={() => setUnmuteTargetUserId(null)}
        onConfirm={handleConfirmUnmute}
        title="Mở khóa chat cho học viên"
        message="Học viên sẽ có thể gửi tin nhắn trở lại ngay lập tức."
        type="success"
        confirmText="Mở khóa chat"
        cancelText="Hủy bỏ"
        isLoading={isProcessing}
      />

      {isBanModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 dark:bg-black/40 backdrop-blur-[1px] animate-in fade-in duration-150"
          onClick={() => setIsBanModalOpen(false)}
        >
          <div
            className="w-full max-w-lg max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative z-10 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Ban className="w-4 h-4 text-rose-600" />
                <span>Thêm thành viên vào Danh sách đen</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsBanModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleBanSubmit} className="flex-1 flex flex-col min-h-0">
              <div className="p-6 space-y-4 overflow-y-auto flex-1">
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

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Lý do kỷ luật / đưa vào danh sách đen
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={banReason}
                    onChange={(e) => setBanReason(e.target.value)}
                    placeholder="Ví dụ: Spam tin nhắn, phát ngôn thô tục vi phạm tiêu chuẩn cộng đồng..."
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
                  />
                </div>
              </div>

              <div className="p-4 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsBanModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingBan || !targetUserId.trim() || !banReason.trim()}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Ban className="w-3.5 h-3.5" />
                  <span>{isSubmittingBan ? 'Đang xử lý...' : 'Xác nhận cấm'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

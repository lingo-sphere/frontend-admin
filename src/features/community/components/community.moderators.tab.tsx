// Quản lý ban điều hành và phân quyền chi tiết cho phó nhóm phòng chat
import { useState } from 'react'
import {
  ShieldCheck,
  UserPlus,
  Trash2,
  Edit3,
  Check,
  X,
  ShieldAlert,
  Pin,
  VolumeX,
  UserMinus,
  Ban,
  Lock,
} from 'lucide-react'
import type {
  AdminCommunityMember,
  AdminModeratorPermissions,
  SetModeratorPayload,
} from '@/features/community/types/community.admin.types'
import { ConfirmModal } from '@/components/confirm.modal'
import { CommunityUserPicker } from '@/features/community/components/community.user.picker'
import type { UserProfile } from '@/features/users/schemas/user.schema'

interface CommunityModeratorsTabProps {
  moderators: AdminCommunityMember[]
  isLoading: boolean
  onSetModerator: (payload: SetModeratorPayload) => Promise<void>
  onRemoveModerator: (userId: string) => Promise<void>
}

const DEFAULT_PERMISSIONS: AdminModeratorPermissions = {
  can_delete_messages: true,
  can_mute_members: true,
  can_kick_members: true,
  can_ban_members: false,
  can_toggle_room_chat: false,
  can_pin_messages: true,
}

const PERMISSION_CONFIG: {
  key: keyof AdminModeratorPermissions
  title: string
  description: string
  icon: typeof Trash2
  color: string
}[] = [
  {
    key: 'can_delete_messages',
    title: 'Xóa tin nhắn vi phạm',
    description: 'Xóa các tin nhắn rác hoặc vi phạm tiêu chuẩn phòng chat',
    icon: Trash2,
    color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/40',
  },
  {
    key: 'can_pin_messages',
    title: 'Ghim tin nhắn quan trọng',
    description: 'Ghim hoặc bỏ ghim thông báo, quy tắc lên đầu phòng chat',
    icon: Pin,
    color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/40',
  },
  {
    key: 'can_mute_members',
    title: 'Cấm phát ngôn (Mute)',
    description: 'Tắt tiếng tạm thời đối với học viên spam nội dung',
    icon: VolumeX,
    color: 'text-orange-500 bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-900/40',
  },
  {
    key: 'can_kick_members',
    title: 'Đuổi khỏi phòng (Kick)',
    description: 'Đuổi học viên ra khỏi phòng chat kèm thời gian chờ',
    icon: UserMinus,
    color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-900/40',
  },
  {
    key: 'can_ban_members',
    title: 'Cấm vĩnh viễn (Ban)',
    description: 'Đưa học viên vào danh sách đen, chặn quyền trò chuyện',
    icon: Ban,
    color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/40',
  },
  {
    key: 'can_toggle_room_chat',
    title: 'Khóa / mở chat toàn phòng',
    description: 'Bật hoặc tắt tính năng trò chuyện của toàn bộ phòng học',
    icon: Lock,
    color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900/40',
  },
]

export function CommunityModeratorsTab({
  moderators,
  isLoading,
  onSetModerator,
  onRemoveModerator,
}: CommunityModeratorsTabProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [targetUserId, setTargetUserId] = useState('')
  const [permissions, setPermissions] = useState<AdminModeratorPermissions>(DEFAULT_PERMISSIONS)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [removeTargetUserId, setRemoveTargetUserId] = useState<string | null>(null)
  const [isRemoving, setIsRemoving] = useState(false)
  const [selectedLearner, setSelectedLearner] = useState<UserProfile | null>(null)

  const handleOpenAdd = () => {
    setTargetUserId('')
    setSelectedLearner(null)
    setPermissions(DEFAULT_PERMISSIONS)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (mod: AdminCommunityMember) => {
    setTargetUserId(mod.user_id)
    setSelectedLearner(null)
    setPermissions(mod.moderator_permissions || DEFAULT_PERMISSIONS)
    setIsModalOpen(true)
  }

  const handleTogglePermission = (key: keyof AdminModeratorPermissions) => {
    setPermissions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!targetUserId.trim()) return
    setIsSubmitting(true)
    try {
      await onSetModerator({
        user_id: targetUserId.trim(),
        permissions,
      })
      setIsModalOpen(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleConfirmRemove = async () => {
    if (!removeTargetUserId) return
    setIsRemoving(true)
    try {
      await onRemoveModerator(removeTargetUserId)
      setRemoveTargetUserId(null)
    } finally {
      setIsRemoving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Danh Sách Phó Nhóm (Moderators)</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Phó nhóm hỗ trợ quản lý trật tự, xóa tin nhắn rác và xử lý thành viên vi phạm trong phòng chat
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all cursor-pointer self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Bổ nhiệm phó nhóm</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 text-xs uppercase font-bold border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-5 py-3">Phó nhóm</th>
                <th className="px-5 py-3">Quyền kiểm duyệt tin</th>
                <th className="px-5 py-3">Quyền kỷ luật học viên</th>
                <th className="px-5 py-3">Quyền cấu hình phòng</th>
                <th className="px-5 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {moderators.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-slate-400">
                    {isLoading ? 'Đang tải danh sách...' : 'Chưa có phó nhóm nào được bổ nhiệm'}
                  </td>
                </tr>
              ) : (
                moderators.map((mod) => (
                  <tr key={mod.user_id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold text-xs overflow-hidden flex-shrink-0">
                          {mod.user_avatar ? (
                            <img src={mod.user_avatar} alt={mod.user_name} className="w-full h-full object-cover" />
                          ) : (
                            mod.user_name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                            {mod.user_name}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            User ID: {mod.user_id}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1 text-[11px]">
                        <span className={`inline-flex items-center gap-1 ${mod.moderator_permissions?.can_delete_messages ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                          {mod.moderator_permissions?.can_delete_messages ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                          Xóa tin nhắn
                        </span>
                        <span className={`inline-flex items-center gap-1 ${mod.moderator_permissions?.can_pin_messages ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                          {mod.moderator_permissions?.can_pin_messages ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                          Ghim tin nhắn
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1 text-[11px]">
                        <span className={`inline-flex items-center gap-1 ${mod.moderator_permissions?.can_mute_members ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                          {mod.moderator_permissions?.can_mute_members ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                          Tắt tiếng học viên (Mute)
                        </span>
                        <span className={`inline-flex items-center gap-1 ${mod.moderator_permissions?.can_kick_members ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                          {mod.moderator_permissions?.can_kick_members ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                          Kick khỏi phòng (Có Cooldown)
                        </span>
                        <span className={`inline-flex items-center gap-1 ${mod.moderator_permissions?.can_ban_members ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                          {mod.moderator_permissions?.can_ban_members ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                          Cấm vĩnh viễn (Blacklist)
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1 text-[11px] ${mod.moderator_permissions?.can_toggle_room_chat ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                        {mod.moderator_permissions?.can_toggle_room_chat ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        Bật/Tắt chat phòng
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(mod)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Chỉnh sửa quyền"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setRemoveTargetUserId(mod.user_id)}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                          title="Tước quyền phó nhóm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 dark:bg-black/40 backdrop-blur-[1px] animate-in fade-in duration-150"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="w-full max-w-2xl max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative z-10 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>Thiết lập phó nhóm & phân quyền</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
              <div className="p-6 space-y-5 overflow-y-auto flex-1">
                <CommunityUserPicker
                  selectedUser={selectedLearner}
                  onSelectUser={(u) => {
                    setSelectedLearner(u)
                    setTargetUserId(u?.user_id || '')
                  }}
                  manualUserId={targetUserId}
                  onChangeManualUserId={setTargetUserId}
                  disabledRoles={['ADMIN', 'SUPER_ADMIN']}
                  themeColor="indigo"
                />

                <div className="space-y-2.5 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Tùy chọn phân quyền chi tiết
                    </span>
                    <span className="text-[11px] font-medium text-slate-400">
                      {Object.values(permissions).filter(Boolean).length} / {PERMISSION_CONFIG.length} quyền kích hoạt
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {PERMISSION_CONFIG.map((perm) => {
                      const isEnabled = Boolean(permissions[perm.key])
                      const Icon = perm.icon

                      return (
                        <div
                          key={perm.key}
                          onClick={() => handleTogglePermission(perm.key)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                            isEnabled
                              ? 'bg-indigo-50/60 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800/70 shadow-xs'
                              : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                          }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${perm.color}`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span
                                className={`text-xs font-semibold truncate ${
                                  isEnabled
                                    ? 'text-indigo-900 dark:text-indigo-200'
                                    : 'text-slate-700 dark:text-slate-300'
                                }`}
                              >
                                {perm.title}
                              </span>

                              <div
                                className={`w-8 h-4.5 rounded-full transition-colors relative shrink-0 p-0.5 ${
                                  isEnabled ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'
                                }`}
                              >
                                <div
                                  className={`w-3.5 h-3.5 rounded-full bg-white transition-transform ${
                                    isEnabled ? 'translate-x-3.5' : 'translate-x-0'
                                  }`}
                                />
                              </div>
                            </div>

                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug line-clamp-2">
                              {perm.description}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              <div className="p-4 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !targetUserId.trim()}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 shadow-sm transition-all cursor-pointer"
                >
                  {isSubmitting ? 'Đang lưu...' : 'Lưu bổ nhiệm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={Boolean(removeTargetUserId)}
        onClose={() => setRemoveTargetUserId(null)}
        onConfirm={handleConfirmRemove}
        title="Tước quyền phó nhóm"
        message="Học viên này sẽ quay trở về cấp bậc thành viên thông thường và mất toàn bộ quyền kiểm duyệt phòng chat."
        type="warning"
        confirmText="Xác nhận tước quyền"
        cancelText="Hủy bỏ"
        isLoading={isRemoving}
      />
    </div>
  )
}

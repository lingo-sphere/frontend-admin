// Quản lý ban điều hành và phân quyền chi tiết cho phó nhóm phòng chat
import { useState } from 'react'
import {
  ShieldCheck,
  UserPlus,
  Trash2,
  Edit3,
  Check,
  X,
} from 'lucide-react'
import type {
  AdminCommunityMember,
  AdminModeratorPermissions,
  SetModeratorPayload,
} from '@/features/community/types/community.admin.types'
import { ConfirmModal } from '@/components/confirm.modal'
import {
  CommunityModeratorModal,
  DEFAULT_MODERATOR_PERMISSIONS,
} from '@/features/community/components/community.moderator.modal'

interface CommunityModeratorsTabProps {
  moderators: AdminCommunityMember[]
  isLoading: boolean
  onSetModerator: (payload: SetModeratorPayload) => Promise<void>
  onRemoveModerator: (userId: string) => Promise<void>
}

export function CommunityModeratorsTab({
  moderators,
  isLoading,
  onSetModerator,
  onRemoveModerator,
}: CommunityModeratorsTabProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState('')
  const [selectedPermissions, setSelectedPermissions] = useState<AdminModeratorPermissions>(
    DEFAULT_MODERATOR_PERMISSIONS
  )
  const [removeTargetUserId, setRemoveTargetUserId] = useState<string | null>(null)
  const [isRemoving, setIsRemoving] = useState(false)

  const handleOpenAdd = () => {
    setSelectedUserId('')
    setSelectedPermissions(DEFAULT_MODERATOR_PERMISSIONS)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (mod: AdminCommunityMember) => {
    setSelectedUserId(mod.user_id)
    setSelectedPermissions(mod.moderator_permissions || DEFAULT_MODERATOR_PERMISSIONS)
    setIsModalOpen(true)
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
            <tbody className="divide-y divide-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300">
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

      <CommunityModeratorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialUserId={selectedUserId}
        initialPermissions={selectedPermissions}
        onSave={onSetModerator}
      />

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

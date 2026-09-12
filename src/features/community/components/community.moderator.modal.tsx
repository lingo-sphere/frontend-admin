// Modal thiết lập phó nhóm phòng chat và cấu hình phân quyền kiểm duyệt chi tiết với hỗ trợ chọn nhiều người dùng bằng checkbox.
import { useState, useEffect } from 'react'
import { toast } from '@/store/toast.store'
import {
  ShieldCheck,
  X,
  Trash2,
  Pin,
  VolumeX,
  UserMinus,
  Ban,
  Lock,
} from 'lucide-react'
import type {
  AdminModeratorPermissions,
  SetModeratorPayload,
} from '@/features/community/types/community.admin.types'
import { CommunityUserPicker } from '@/features/community/components/community.user.picker'
import type { UserProfile } from '@/features/users/schemas/user.schema'

export interface CommunityModeratorModalProps {
  isOpen: boolean
  onClose: () => void
  initialUserId?: string
  initialPermissions?: AdminModeratorPermissions
  onSave: (payload: SetModeratorPayload | SetModeratorPayload[]) => Promise<void>
}

export const DEFAULT_MODERATOR_PERMISSIONS: AdminModeratorPermissions = {
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

export function CommunityModeratorModal({
  isOpen,
  onClose,
  initialUserId = '',
  initialPermissions,
  onSave,
}: CommunityModeratorModalProps) {
  const [targetUserIdInput, setTargetUserIdInput] = useState(initialUserId)
  const [permissions, setPermissions] = useState<AdminModeratorPermissions>(
    initialPermissions || DEFAULT_MODERATOR_PERMISSIONS
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedLearners, setSelectedLearners] = useState<UserProfile[]>([])

  useEffect(() => {
    if (isOpen) {
      setTargetUserIdInput(initialUserId)
      setSelectedLearners([])
      setPermissions(initialPermissions || DEFAULT_MODERATOR_PERMISSIONS)
      setIsSubmitting(false)
    }
  }, [isOpen, initialUserId, initialPermissions])

  if (!isOpen) return null

  const handleTogglePermission = (key: keyof AdminModeratorPermissions) => {
    setPermissions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const selectedCount = selectedLearners.length > 0
    ? selectedLearners.length
    : targetUserIdInput
        .split(/[\s,]+/)
        .map((s) => s.trim())
        .filter(Boolean).length

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const targetIds = selectedLearners.length > 0
      ? selectedLearners.map((u) => u.user_id)
      : targetUserIdInput
          .split(/[\s,]+/)
          .map((s) => s.trim())
          .filter(Boolean)

    if (targetIds.length === 0) {
      toast.error('Vui lòng chọn ít nhất một người dùng để bổ nhiệm làm phó nhóm')
      return
    }

    for (const learner of selectedLearners) {
      const role = (learner.role || '').toUpperCase()
      const isAllowed = ['ADMIN', 'SUPER_ADMIN', 'INSTRUCTOR', 'TEACHER'].includes(role)
      if (!isAllowed) {
        toast.error(`Tài khoản ${learner.full_name} không phải Quản trị viên hoặc Giáo viên`)
        return
      }
    }

    setIsSubmitting(true)
    try {
      const payloads: SetModeratorPayload[] = targetIds.map((uid) => ({
        user_id: uid,
        permissions,
      }))
      await onSave(payloads)
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 dark:bg-black/40 backdrop-blur-[1px] animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative z-10 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span>Thiết lập phó nhóm & phân quyền</span>
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <CommunityUserPicker
              multiple={true}
              selectedUsers={selectedLearners}
              onSelectUsers={setSelectedLearners}
              manualUserId={targetUserIdInput}
              onChangeManualUserId={setTargetUserIdInput}
              allowedRoles={['ADMIN', 'SUPER_ADMIN', 'INSTRUCTOR', 'TEACHER']}
              themeColor="indigo"
            />

            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Tùy chọn phân quyền chi tiết
                </span>
                <span className="text-[11px] font-medium text-slate-400">
                  {Object.values(permissions).filter(Boolean).length} / {PERMISSION_CONFIG.length} quyền kích hoạt
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PERMISSION_CONFIG.map((perm) => {
                  const isEnabled = Boolean(permissions[perm.key])
                  const Icon = perm.icon

                  return (
                    <div
                      key={perm.key}
                      onClick={() => handleTogglePermission(perm.key)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 select-none ${
                        isEnabled
                          ? 'bg-indigo-50/60 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800/70 shadow-xs'
                          : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${perm.color}`}
                      >
                        <Icon className="w-3.5 h-3.5" />
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
                            className={`w-7 h-4 rounded-full transition-colors relative shrink-0 p-0.5 ${
                              isEnabled ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'
                            }`}
                          >
                            <div
                              className={`w-3 h-3 rounded-full bg-white transition-transform ${
                                isEnabled ? 'translate-x-3' : 'translate-x-0'
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

          <div className="p-4 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting || selectedCount === 0}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 shadow-sm transition-all cursor-pointer"
            >
              {isSubmitting
                ? 'Đang lưu...'
                : selectedCount > 1
                ? `Lưu bổ nhiệm (${selectedCount} người)`
                : 'Lưu bổ nhiệm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

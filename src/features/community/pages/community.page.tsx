// Trang quản trị trung tâm kênh chat cộng đồng, phân quyền phó nhóm và kỷ luật vi phạm
import { useState } from 'react'
import { MessageSquare, ShieldCheck, ShieldAlert, RefreshCw } from 'lucide-react'
import { toast } from '@/store/toast.store'
import { communityAdminService } from '@/features/community/services/community.admin.service'
import {
  useCommunityRoomQuery,
  useCommunityMessagesQuery,
  useCommunityModeratorsQuery,
  useCommunityBannedMembersQuery,
  useUpdateRoomSettingsMutation,
  useDeleteMessageMutation,
  usePinMessageMutation,
  useUnpinMessageMutation,
} from '@/features/community/hooks/use.community.admin.query'
import type {
  SetModeratorPayload,
  UpdateRoomSettingPayload,
  SanctionActionType,
} from '@/features/community/types/community.admin.types'
import { CommunityRoomControls } from '@/features/community/components/community.room.controls'
import { CommunityMessagesTable } from '@/features/community/components/community.messages.table'
import { CommunityModeratorsTab } from '@/features/community/components/community.moderators.tab'
import { CommunitySanctionsTab } from '@/features/community/components/community.sanctions.tab'
import {
  CommunitySanctionModal,
  type SanctionTargetUser,
} from '@/features/community/components/community.sanction.modal'

export function CommunityPage() {
  const [activeTab, setActiveTab] = useState<'MONITOR' | 'MODERATORS' | 'SANCTIONS'>('MONITOR')
  const [isSanctionModalOpen, setIsSanctionModalOpen] = useState(false)
  const [sanctionTargetUser, setSanctionTargetUser] = useState<SanctionTargetUser | null>(null)

  const { data: room = null, isLoading: isRoomLoading, refetch: refetchRoom } = useCommunityRoomQuery()
  const { data: messagesData, isLoading: isMessagesLoading, refetch: refetchMessages } = useCommunityMessagesQuery(50)
  const { data: moderators = [], isLoading: isModsLoading, refetch: refetchMods } = useCommunityModeratorsQuery()
  const { data: bannedMembers = [], isLoading: isBannedLoading, refetch: refetchBanned } = useCommunityBannedMembersQuery()

  const { mutateAsync: updateRoomSettingsMutate } = useUpdateRoomSettingsMutation()
  const { mutateAsync: deleteMessageMutate } = useDeleteMessageMutation()
  const { mutateAsync: pinMessageMutate } = usePinMessageMutation()
  const { mutateAsync: unpinMessageMutate } = useUnpinMessageMutation()

  const messages = messagesData?.messages || []
  const isLoading = isRoomLoading || isMessagesLoading || isModsLoading || isBannedLoading

  const loadData = () => {
    refetchRoom()
    refetchMessages()
    refetchMods()
    refetchBanned()
  }

  const handleUpdateRoomSettings = async (payload: UpdateRoomSettingPayload) => {
    try {
      await updateRoomSettingsMutate(payload)
      toast.success('Đã cập nhật cấu hình phòng chat thành công')
    } catch {
      toast.error('Không thể cập nhật cấu hình phòng chat')
    }
  }

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await deleteMessageMutate(messageId)
      toast.success('Đã xóa tin nhắn vi phạm thành công')
    } catch {
      toast.error('Không thể xóa tin nhắn')
    }
  }

  const handleTogglePin = async (messageId: string, isPinned: boolean) => {
    try {
      if (isPinned) {
        await pinMessageMutate(messageId)
      } else {
        await unpinMessageMutate(messageId)
      }
      toast.success(isPinned ? 'Đã ghim tin nhắn lên đầu phòng chat' : 'Đã bỏ ghim tin nhắn')
    } catch {
      toast.error(isPinned ? 'Không thể ghim tin nhắn' : 'Không thể bỏ ghim tin nhắn')
    }
  }

  const handleSetModerator = async (payload: SetModeratorPayload) => {
    try {
      await communityAdminService.setModerator(payload)
      refetchMods()
      toast.success('Đã bổ nhiệm và cập nhật quyền phó nhóm thành công')
    } catch {
      toast.error('Không thể thiết lập quyền phó nhóm')
    }
  }

  const handleRemoveModerator = async (userId: string) => {
    try {
      await communityAdminService.removeModerator(userId)
      refetchMods()
      toast.success('Đã tước quyền phó nhóm thành công')
    } catch {
      toast.error('Không thể tước quyền phó nhóm')
    }
  }

  const handleOpenSanctionModal = (user?: SanctionTargetUser) => {
    setSanctionTargetUser(user || null)
    setIsSanctionModalOpen(true)
  }

  const handleSanction = async (
    action: SanctionActionType,
    data: {
      target_user_id: string
      reason: string
      duration_minutes?: number
      cooldown_minutes?: number
      user_name?: string
      user_avatar?: string
    }
  ) => {
    try {
      if (action === 'BAN') {
        await communityAdminService.banMember({
          target_user_id: data.target_user_id,
          reason: data.reason,
          user_name: data.user_name,
          user_avatar: data.user_avatar,
        })
        toast.success('Đã cấm học viên tham gia cộng đồng thành công')
      } else if (action === 'MUTE') {
        await communityAdminService.muteMember({
          target_user_id: data.target_user_id,
          duration_minutes: data.duration_minutes || 60,
          reason: data.reason,
          user_name: data.user_name,
          user_avatar: data.user_avatar,
        })
        toast.success('Đã tắt tiếng học viên thành công')
      } else if (action === 'KICK') {
        await communityAdminService.kickMember({
          target_user_id: data.target_user_id,
          cooldown_minutes: data.cooldown_minutes || 15,
          reason: data.reason,
          user_name: data.user_name,
          user_avatar: data.user_avatar,
        })
        toast.success('Đã trục xuất học viên khỏi phòng chat thành công')
      }
      refetchBanned()
    } catch {
      toast.error('Không thể thực hiện biện pháp kỷ luật học viên')
    }
  }

  const handleUnbanMember = async (userId: string) => {
    try {
      await communityAdminService.unbanMember(userId)
      refetchBanned()
      toast.success('Đã gỡ lệnh cấm tham gia phòng chat cho học viên')
    } catch {
      toast.error('Không thể gỡ cấm cho học viên')
    }
  }

  const handleUnmuteMember = async (userId: string) => {
    try {
      await communityAdminService.unmuteMember(userId)
      refetchBanned()
      toast.success('Đã mở khóa chat cho học viên')
    } catch {
      toast.error('Không thể mở khóa chat')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <MessageSquare className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            <span>Quản Lý Kênh Chat Cộng Đồng</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Theo dõi thảo luận trực tiếp, phân quyền ban điều hành và xử lý kỷ luật vi phạm
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer self-start sm:self-auto shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Làm mới toàn bộ</span>
        </button>
      </div>

      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('MONITOR')}
          className={`pb-3 px-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
            activeTab === 'MONITOR'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Giám sát & Điều khiển</span>
        </button>

        <button
          onClick={() => setActiveTab('MODERATORS')}
          className={`pb-3 px-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
            activeTab === 'MODERATORS'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Phó nhóm ({moderators.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('SANCTIONS')}
          className={`pb-3 px-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
            activeTab === 'SANCTIONS'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Kỷ luật & Danh sách đen ({bannedMembers.length})</span>
        </button>
      </div>

      {activeTab === 'MONITOR' && (
        <div className="space-y-6">
          <CommunityRoomControls
            room={room}
            isLoading={isLoading}
            onUpdate={handleUpdateRoomSettings}
          />
          <CommunityMessagesTable
            messages={messages}
            isLoading={isLoading}
            onRefresh={loadData}
            onDeleteMessage={handleDeleteMessage}
            onTogglePin={handleTogglePin}
            onOpenSanctionModal={handleOpenSanctionModal}
          />
        </div>
      )}

      {activeTab === 'MODERATORS' && (
        <CommunityModeratorsTab
          moderators={moderators}
          isLoading={isLoading}
          onSetModerator={handleSetModerator}
          onRemoveModerator={handleRemoveModerator}
        />
      )}

      {activeTab === 'SANCTIONS' && (
        <CommunitySanctionsTab
          bannedMembers={bannedMembers}
          isLoading={isLoading}
          onOpenSanctionModal={() => handleOpenSanctionModal()}
          onUnbanMember={handleUnbanMember}
          onUnmuteMember={handleUnmuteMember}
        />
      )}

      <CommunitySanctionModal
        isOpen={isSanctionModalOpen}
        onClose={() => {
          setIsSanctionModalOpen(false)
          setSanctionTargetUser(null)
        }}
        initialTargetUser={sanctionTargetUser}
        onSanction={handleSanction}
      />
    </div>
  )
}

// Trang quản trị trung tâm kênh chat cộng đồng, phân quyền phó nhóm và kỷ luật vi phạm.
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<'MONITOR' | 'MODERATORS' | 'SANCTIONS'>('MONITOR')
  const [isSanctionModalOpen, setIsSanctionModalOpen] = useState(false)
  const [sanctionTargetUser, setSanctionTargetUser] = useState<SanctionTargetUser | null>(null)

  const { data: room = null, isLoading: isRoomLoading, refetch: refetchRoom } = useCommunityRoomQuery()
  const { data: messagesData, isLoading: isMessagesLoading, refetch: refetchMessages } = useCommunityMessagesQuery(100)
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
      toast.success(t('community.updateRoomSuccess'))
    } catch {
      toast.error(t('community.updateRoomError'))
    }
  }

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await deleteMessageMutate(messageId)
      toast.success(t('community.deleteMessageSuccess'))
    } catch {
      toast.error(t('community.deleteMessageError'))
    }
  }

  const handleTogglePin = async (messageId: string, isPinned: boolean) => {
    try {
      if (isPinned) {
        await pinMessageMutate(messageId)
      } else {
        await unpinMessageMutate(messageId)
      }
      toast.success(isPinned ? t('community.pinSuccess') : t('community.unpinSuccess'))
    } catch {
      toast.error(isPinned ? t('community.pinError') : t('community.unpinError'))
    }
  }

  const handleSetModerator = async (payload: SetModeratorPayload | SetModeratorPayload[]) => {
    const list = Array.isArray(payload) ? payload : [payload]
    try {
      await Promise.all(list.map((p) => communityAdminService.setModerator(p)))
      refetchMods()
      toast.success(
        list.length > 1
          ? t('community.setModeratorSuccessMultiple', { count: list.length })
          : t('community.setModeratorSuccessSingle')
      )
    } catch {
      toast.error(t('community.setModeratorError'))
    }
  }

  const handleRemoveModerator = async (userId: string) => {
    try {
      await communityAdminService.removeModerator(userId)
      refetchMods()
      toast.success(t('community.removeModeratorSuccess'))
    } catch {
      toast.error(t('community.removeModeratorError'))
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
        toast.success(t('community.banSuccess'))
      } else if (action === 'MUTE') {
        await communityAdminService.muteMember({
          target_user_id: data.target_user_id,
          duration_minutes: data.duration_minutes || 60,
          reason: data.reason,
          user_name: data.user_name,
          user_avatar: data.user_avatar,
        })
        toast.success(t('community.muteSuccess'))
      } else if (action === 'KICK') {
        await communityAdminService.kickMember({
          target_user_id: data.target_user_id,
          cooldown_minutes: data.cooldown_minutes || 15,
          reason: data.reason,
          user_name: data.user_name,
          user_avatar: data.user_avatar,
        })
        toast.success(t('community.kickSuccess'))
      }
      refetchBanned()
    } catch {
      toast.error(t('community.sanctionError'))
    }
  }

  const handleUnbanMember = async (userId: string) => {
    try {
      await communityAdminService.unbanMember(userId)
      refetchBanned()
      toast.success(t('community.unbanSuccess'))
    } catch {
      toast.error(t('community.unbanError'))
    }
  }

  const handleUnmuteMember = async (userId: string) => {
    try {
      await communityAdminService.unmuteMember(userId)
      refetchBanned()
      toast.success(t('community.unmuteSuccess'))
    } catch {
      toast.error(t('community.unmuteError'))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <MessageSquare className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            <span>{t('community.pageTitle')}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t('community.pageSubtitle')}
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer self-start sm:self-auto shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{t('community.refreshAll')}</span>
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
          <span>{t('community.tabMonitor')}</span>
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
          <span>{t('community.tabModerators', { count: moderators.length })}</span>
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
          <span>{t('community.tabSanctions', { count: bannedMembers.length })}</span>
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
          onRefresh={loadData}
        />
      )}

      {activeTab === 'SANCTIONS' && (
        <CommunitySanctionsTab
          bannedMembers={bannedMembers}
          isLoading={isLoading}
          onOpenSanctionModal={() => handleOpenSanctionModal()}
          onUnbanMember={handleUnbanMember}
          onUnmuteMember={handleUnmuteMember}
          onRefresh={loadData}
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

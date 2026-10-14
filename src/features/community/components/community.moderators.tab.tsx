// Quản lý ban điều hành và phân quyền chi tiết cho phó nhóm phòng chat với phân trang DataTable.
import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ShieldCheck,
  UserPlus,
  Trash2,
  Edit3,
  Check,
  X,
  Search,
} from 'lucide-react'
import type {
  AdminCommunityMember,
  AdminModeratorPermissions,
  SetModeratorPayload,
} from '@/features/community/types/community.admin.types'
import { DataTable, type DataTableColumn } from '@/components/data.table'
import { ConfirmModal } from '@/components/confirm.modal'
import {
  CommunityModeratorModal,
  DEFAULT_MODERATOR_PERMISSIONS,
} from '@/features/community/components/community.moderator.modal'
import { toast } from '@/store/toast.store'

interface CommunityModeratorsTabProps {
  moderators: AdminCommunityMember[]
  isLoading: boolean
  onSetModerator: (payload: SetModeratorPayload | SetModeratorPayload[]) => Promise<void>
  onRemoveModerator: (userId: string) => Promise<void>
  onRefresh?: () => void | Promise<void>
}

export function CommunityModeratorsTab({
  moderators,
  isLoading,
  onSetModerator,
  onRemoveModerator,
  onRefresh,
}: CommunityModeratorsTabProps) {
  const { t, i18n } = useTranslation()
  const isVi = i18n.language === 'vi'
  const [filterText, setFilterText] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState('')
  const [selectedPermissions, setSelectedPermissions] = useState<AdminModeratorPermissions>(
    DEFAULT_MODERATOR_PERMISSIONS
  )
  const [removeTargetUserId, setRemoveTargetUserId] = useState<string | null>(null)
  const [isRemoving, setIsRemoving] = useState(false)

  const safeModerators = Array.isArray(moderators) ? moderators : []

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setSearchQuery(filterText.trim().toLowerCase())
    setCurrentPage(1)
  }

  const handleResetFilters = async () => {
    setFilterText('')
    setSearchQuery('')
    setCurrentPage(1)
    if (onRefresh) {
      await onRefresh()
    }
    toast.success(isVi ? 'Đã đặt lại bộ lọc ban điều hành' : 'Moderator filters reset')
  }

  const filteredModerators = useMemo(() => {
    if (!searchQuery) return safeModerators
    return safeModerators.filter(
      (m) =>
        m.user_name.toLowerCase().includes(searchQuery) ||
        m.user_id.toLowerCase().includes(searchQuery)
    )
  }, [safeModerators, searchQuery])

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredModerators.slice(start, start + pageSize)
  }, [filteredModerators, currentPage, pageSize])

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

  const columns: DataTableColumn<AdminCommunityMember>[] = [
    {
      key: 'moderator',
      title: t('community.colModerator'),
      width: '260px',
      render: (mod) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold text-xs overflow-hidden shrink-0">
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
      ),
    },
    {
      key: 'message_perms',
      title: t('community.colMsgPerms'),
      render: (mod) => (
        <div className="flex flex-col gap-1 text-[11px]">
          <span className={`inline-flex items-center gap-1 ${mod.moderator_permissions?.can_delete_messages ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
            {mod.moderator_permissions?.can_delete_messages ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
            {t('community.permDeleteMsg')}
          </span>
          <span className={`inline-flex items-center gap-1 ${mod.moderator_permissions?.can_pin_messages ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
            {mod.moderator_permissions?.can_pin_messages ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
            {t('community.permPinMsg')}
          </span>
        </div>
      ),
    },
    {
      key: 'sanction_perms',
      title: t('community.colSanctionPerms'),
      render: (mod) => (
        <div className="flex flex-col gap-1 text-[11px]">
          <span className={`inline-flex items-center gap-1 ${mod.moderator_permissions?.can_mute_members ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
            {mod.moderator_permissions?.can_mute_members ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
            {t('community.permMute')}
          </span>
          <span className={`inline-flex items-center gap-1 ${mod.moderator_permissions?.can_kick_members ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
            {mod.moderator_permissions?.can_kick_members ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
            {t('community.permKick')}
          </span>
          <span className={`inline-flex items-center gap-1 ${mod.moderator_permissions?.can_ban_members ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
            {mod.moderator_permissions?.can_ban_members ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
            {t('community.permBan')}
          </span>
        </div>
      ),
    },
    {
      key: 'room_perms',
      title: t('community.colRoomPerms'),
      render: (mod) => (
        <span className={`inline-flex items-center gap-1 text-[11px] ${mod.moderator_permissions?.can_toggle_room_chat ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
          {mod.moderator_permissions?.can_toggle_room_chat ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
          {t('community.permToggleChat')}
        </span>
      ),
    },
    {
      key: 'actions',
      title: t('community.colActions'),
      align: 'right',
      render: (mod) => (
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => handleOpenEdit(mod)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title={t('community.editPermsTitle')}
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setRemoveTargetUserId(mod.user_id)}
            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
            title={t('community.removeModTitle')}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ]

  const filterSlot = (
    <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-3 w-full">
      <div className="relative flex-1 min-w-[200px] sm:max-w-xs">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          placeholder={t('community.searchModPlaceholder')}
          className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 transition-all"
        />
      </div>
      <button
        type="submit"
        className="h-9 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors cursor-pointer"
      >
        {t('community.searchButton')}
      </button>
    </form>
  )

  const extraActions = (
    <button
      type="button"
      onClick={handleOpenAdd}
      className="flex items-center gap-1.5 h-9 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-sm shadow-indigo-600/30 transition-all cursor-pointer"
    >
      <UserPlus className="w-4 h-4" />
      <span>{t('community.assignModerator')}</span>
    </button>
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>{t('community.moderatorsTitle')}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t('community.moderatorsDesc')}
          </p>
        </div>
      </div>

      <DataTable<AdminCommunityMember>
        columns={columns}
        data={paginatedData}
        rowKey={(m) => m.user_id}
        isLoading={isLoading}
        emptyText={t('community.emptyModerators')}
        filterSlot={filterSlot}
        extraActions={extraActions}
        onResetFilters={handleResetFilters}
        pagination={{
          currentPage,
          pageSize,
          totalItems: filteredModerators.length,
          onPageChange: setCurrentPage,
          onPageSizeChange: (size) => {
            setPageSize(size)
            setCurrentPage(1)
          },
        }}
      />

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
        title={t('community.removeModConfirmTitle')}
        message={t('community.removeModConfirmMessage')}
        type="warning"
        confirmText={t('community.confirmRemoveMod')}
        cancelText={t('common.cancel')}
        isLoading={isRemoving}
      />
    </div>
  )
}

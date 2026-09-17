// Quản lý danh sách đen, học viên bị cấm hoặc phạt tắt tiếng trong cộng đồng với phân trang DataTable.
import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Ban, VolumeX, ShieldAlert, CheckCircle, Clock, UserX, Search } from 'lucide-react'
import type { AdminCommunityMember } from '@/features/community/types/community.admin.types'
import { DataTable, type DataTableColumn } from '@/components/data.table'
import { ConfirmModal } from '@/components/confirm.modal'
import { toast } from '@/store/toast.store'

interface CommunitySanctionsTabProps {
  bannedMembers: AdminCommunityMember[]
  isLoading: boolean
  onOpenSanctionModal: () => void
  onUnbanMember: (userId: string) => Promise<void>
  onUnmuteMember: (userId: string) => Promise<void>
  onRefresh?: () => void | Promise<void>
}

export function CommunitySanctionsTab({
  bannedMembers,
  isLoading,
  onOpenSanctionModal,
  onUnbanMember,
  onUnmuteMember,
  onRefresh,
}: CommunitySanctionsTabProps) {
  const { t, i18n } = useTranslation()
  const isVi = i18n.language === 'vi'

  const [filterText, setFilterText] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const [unbanTargetUserId, setUnbanTargetUserId] = useState<string | null>(null)
  const [unmuteTargetUserId, setUnmuteTargetUserId] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const safeMembers = Array.isArray(bannedMembers) ? bannedMembers : []

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
    toast.success(isVi ? 'Đã đặt lại bộ lọc kỷ luật' : 'Sanction filters reset')
  }

  const filteredMembers = useMemo(() => {
    if (!searchQuery) return safeMembers
    return safeMembers.filter(
      (m) =>
        m.user_name.toLowerCase().includes(searchQuery) ||
        m.user_id.toLowerCase().includes(searchQuery) ||
        (m.banned_reason && m.banned_reason.toLowerCase().includes(searchQuery))
    )
  }, [safeMembers, searchQuery])

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredMembers.slice(start, start + pageSize)
  }, [filteredMembers, currentPage, pageSize])

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

  const columns: DataTableColumn<AdminCommunityMember>[] = [
    {
      key: 'member',
      title: t('community.colViolator'),
      width: '240px',
      render: (member) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-200 overflow-hidden shrink-0">
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
      ),
    },
    {
      key: 'sanction_type',
      title: t('community.colSanctionType'),
      render: (member) => {
        const muted = isMutedActive(member.muted_until)
        const kicked = isKickedActive(member.kicked_cooldown_until)
        return (
          <div className="flex flex-col gap-1">
            {member.is_banned && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 w-fit">
                <Ban className="w-3 h-3" />
                {t('community.badgeBan')}
              </span>
            )}
            {muted && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900 w-fit">
                <VolumeX className="w-3 h-3" />
                {t('community.badgeMute')}
              </span>
            )}
            {kicked && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-900 w-fit">
                <Clock className="w-3 h-3" />
                {t('community.badgeKick')}
              </span>
            )}
          </div>
        )
      },
    },
    {
      key: 'reason',
      title: t('community.colReason'),
      render: (member) => (
        <div className="max-w-xs">
          <p className="text-xs text-slate-700 dark:text-slate-300 break-words">
            {member.banned_reason || t('community.reasonDefault')}
          </p>
          {member.banned_by && (
            <span className="text-[10px] text-slate-400">
              {t('community.byAdminMod', { id: member.banned_by.slice(-6) })}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'duration',
      title: t('community.colDuration'),
      render: (member) => {
        const muted = isMutedActive(member.muted_until)
        const kicked = isKickedActive(member.kicked_cooldown_until)
        return (
          <span className="text-xs font-mono text-slate-500 whitespace-nowrap">
            {member.is_banned ? (
              <span className="text-rose-600 font-semibold">{t('community.durationIndefinite')}</span>
            ) : muted && member.muted_until ? (
              <span>{t('community.durationUntil', { time: new Date(member.muted_until).toLocaleString(isVi ? 'vi-VN' : 'en-US') })}</span>
            ) : kicked && member.kicked_cooldown_until ? (
              <span>{t('community.durationUntil', { time: new Date(member.kicked_cooldown_until).toLocaleString(isVi ? 'vi-VN' : 'en-US') })}</span>
            ) : (
              <span>{t('community.durationExpired')}</span>
            )}
          </span>
        )
      },
    },
    {
      key: 'actions',
      title: t('community.colActions'),
      align: 'right',
      render: (member) => {
        const muted = isMutedActive(member.muted_until)
        return (
          <div className="inline-flex items-center gap-2 justify-end whitespace-nowrap">
            {member.is_banned && (
              <button
                type="button"
                onClick={() => setUnbanTargetUserId(member.user_id)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors cursor-pointer"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>{t('community.unban')}</span>
              </button>
            )}
            {muted && (
              <button
                type="button"
                onClick={() => setUnmuteTargetUserId(member.user_id)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-colors cursor-pointer"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>{t('community.unmute')}</span>
              </button>
            )}
          </div>
        )
      },
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
          placeholder={t('community.searchSanctionsPlaceholder')}
          className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-rose-500 transition-all"
        />
      </div>
      <button
        type="submit"
        className="h-9 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors cursor-pointer"
      >
        {t('community.searchButton')}
      </button>
    </form>
  )

  const extraActions = (
    <button
      type="button"
      onClick={onOpenSanctionModal}
      className="flex items-center gap-1.5 h-9 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-sm shadow-rose-600/30 transition-all cursor-pointer"
    >
      <UserX className="w-4 h-4" />
      <span>{t('community.disciplineLearner')}</span>
    </button>
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            <span>{t('community.sanctionsTitle')}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t('community.sanctionsDesc')}
          </p>
        </div>
      </div>

      <DataTable<AdminCommunityMember>
        columns={columns}
        data={paginatedData}
        rowKey={(m) => m.user_id}
        isLoading={isLoading}
        emptyText={t('community.emptySanctions')}
        filterSlot={filterSlot}
        extraActions={extraActions}
        onResetFilters={handleResetFilters}
        pagination={{
          currentPage,
          pageSize,
          totalItems: filteredMembers.length,
          onPageChange: setCurrentPage,
          onPageSizeChange: (size) => {
            setPageSize(size)
            setCurrentPage(1)
          },
        }}
      />

      <ConfirmModal
        isOpen={Boolean(unbanTargetUserId)}
        onClose={() => setUnbanTargetUserId(null)}
        onConfirm={handleConfirmUnban}
        title={t('community.unbanConfirmTitle')}
        message={t('community.unbanConfirmMessage')}
        type="success"
        confirmText={t('community.confirmUnban')}
        cancelText={t('common.cancel')}
        isLoading={isProcessing}
      />

      <ConfirmModal
        isOpen={Boolean(unmuteTargetUserId)}
        onClose={() => setUnmuteTargetUserId(null)}
        onConfirm={handleConfirmUnmute}
        title={t('community.unmuteConfirmTitle')}
        message={t('community.unmuteConfirmMessage')}
        type="success"
        confirmText={t('community.confirmUnmute')}
        cancelText={t('common.cancel')}
        isLoading={isProcessing}
      />
    </div>
  )
}

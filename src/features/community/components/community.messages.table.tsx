// Bảng giám sát tin nhắn trực tiếp trong phòng chat cộng đồng với phân trang và bộ lọc dữ liệu.
import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Trash2,
  Pin,
  PinOff,
  CornerDownRight,
  Image as ImageIcon,
  Search,
  RotateCcw,
  AlertCircle,
  Loader2,
  ShieldAlert,
} from 'lucide-react'
import type { AdminChatMessage } from '@/features/community/types/community.admin.types'
import { DataTable, type DataTableColumn } from '@/components/data.table'
import { CustomSelect } from '@/components/custom.select'
import { ConfirmModal } from '@/components/confirm.modal'
import { CommunityPinReplaceModal } from '@/features/community/components/community.pin.replace.modal'
import type { SanctionTargetUser } from '@/features/community/components/community.sanction.modal'
import { toast } from '@/store/toast.store'

interface CommunityMessagesTableProps {
  messages: AdminChatMessage[]
  isLoading: boolean
  onRefresh: () => void
  onDeleteMessage: (messageId: string) => Promise<void>
  onTogglePin?: (messageId: string, isPinned: boolean) => Promise<void>
  onOpenSanctionModal?: (user: SanctionTargetUser) => void
}

export function CommunityMessagesTable({
  messages,
  isLoading,
  onRefresh,
  onDeleteMessage,
  onTogglePin,
  onOpenSanctionModal,
}: CommunityMessagesTableProps) {
  const { t, i18n } = useTranslation()
  const isVi = i18n.language === 'vi'

  const [filterText, setFilterText] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState({ text: '', status: 'ALL' })
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null)

  const [targetMessageId, setTargetMessageId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [pinningId, setPinningId] = useState<string | null>(null)
  const [replaceTargetMessage, setReplaceTargetMessage] = useState<AdminChatMessage | null>(null)

  const safeMessages = Array.isArray(messages) ? messages : []

  const pinnedMessages = useMemo(
    () => safeMessages.filter((m) => m.is_pinned && !m.is_deleted),
    [safeMessages]
  )
  const pinnedCount = pinnedMessages.length

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setSearchQuery({
      text: filterText.trim().toLowerCase(),
      status: statusFilter,
    })
    setCurrentPage(1)
  }

  const handleResetFilters = async () => {
    setFilterText('')
    setStatusFilter('ALL')
    setSearchQuery({ text: '', status: 'ALL' })
    setSortKey(null)
    setSortOrder(null)
    setCurrentPage(1)
    await onRefresh()
    toast.success(isVi ? 'Đã đặt lại bộ lọc tin nhắn' : 'Message filters reset')
  }

  const filteredMessages = useMemo(() => {
    const list = safeMessages.filter((m) => {
      const matchText =
        !searchQuery.text ||
        m.content.toLowerCase().includes(searchQuery.text) ||
        m.sender_name.toLowerCase().includes(searchQuery.text) ||
        m.sender_id.toLowerCase().includes(searchQuery.text)

      let matchStatus = true
      if (searchQuery.status === 'PINNED') {
        matchStatus = Boolean(m.is_pinned && !m.is_deleted)
      } else if (searchQuery.status === 'DELETED') {
        matchStatus = Boolean(m.is_deleted)
      } else if (searchQuery.status === 'ACTIVE') {
        matchStatus = !m.is_deleted
      }

      return matchText && matchStatus
    })

    if (sortKey) {
      return [...list].sort((a, b) => {
        if (sortKey === 'created_at') {
          const timeA = new Date(a.created_at).getTime()
          const timeB = new Date(b.created_at).getTime()
          return sortOrder === 'asc' ? timeA - timeB : timeB - timeA
        }
        return 0
      })
    }

    return [...list].sort((a, b) => {
      const aPinned = Boolean(a.is_pinned && !a.is_deleted)
      const bPinned = Boolean(b.is_pinned && !b.is_deleted)
      if (aPinned !== bPinned) {
        return aPinned ? -1 : 1
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
  }, [safeMessages, searchQuery, sortKey, sortOrder])

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredMessages.slice(start, start + pageSize)
  }, [filteredMessages, currentPage, pageSize])

  const handleDeleteConfirm = async () => {
    if (!targetMessageId) return
    setIsDeleting(true)
    try {
      await onDeleteMessage(targetMessageId)
      setTargetMessageId(null)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleTogglePin = async (messageId: string, isPinned: boolean) => {
    if (!onTogglePin || pinningId) return
    setPinningId(messageId)
    try {
      await onTogglePin(messageId, isPinned)
    } finally {
      setPinningId(null)
    }
  }

  const handleTogglePinClick = (msg: AdminChatMessage) => {
    if (!onTogglePin || pinningId) return
    const isCurrentlyPinned = Boolean(msg.is_pinned)
    if (!isCurrentlyPinned && pinnedCount >= 3) {
      setReplaceTargetMessage(msg)
      return
    }
    handleTogglePin(msg._id, !isCurrentlyPinned)
  }

  const handleConfirmReplacePin = async (unpinId: string, pinId: string) => {
    if (!onTogglePin) return
    setPinningId(pinId)
    try {
      await onTogglePin(unpinId, false)
      await onTogglePin(pinId, true)
    } finally {
      setPinningId(null)
    }
  }

  const getBadgeStyle = (badge: string) => {
    switch (badge) {
      case 'ADMIN':
        return 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800'
      case 'MODERATOR':
        return 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800'
      case 'PRO':
        return 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800'
      default:
        return 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
    }
  }

  const columns: DataTableColumn<AdminChatMessage>[] = [
    {
      key: 'sender',
      title: t('community.colSender'),
      width: '230px',
      render: (msg) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-200 overflow-hidden shrink-0">
            {msg.sender_avatar ? (
              <img
                src={msg.sender_avatar}
                alt={msg.sender_name}
                className="w-full h-full object-cover"
              />
            ) : (
              msg.sender_name.charAt(0).toUpperCase()
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-xs text-slate-900 dark:text-slate-100 truncate max-w-[110px]">
                {msg.sender_name}
              </span>
              <span
                className={`px-1.5 py-0.2 rounded text-[10px] font-bold border ${getBadgeStyle(
                  msg.sender_badge
                )}`}
              >
                {msg.sender_badge}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              ID: {msg.sender_id.slice(-6)}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'content',
      title: t('community.colContent'),
      render: (msg) => (
        <div className="max-w-md">
          {msg.is_deleted ? (
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-rose-500 dark:text-rose-400">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{t('community.removedByAdmin')}</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 italic break-words whitespace-pre-wrap pl-5">
                "{msg.content}"
              </p>
            </div>
          ) : (
            <p
              className={`text-xs break-words whitespace-pre-wrap ${
                msg.is_pinned && !msg.is_deleted
                  ? 'text-amber-600 dark:text-amber-400 font-semibold'
                  : 'text-slate-800 dark:text-slate-200'
              }`}
            >
              {msg.content}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'attachments',
      title: t('community.colAttachments'),
      render: (msg) => (
        <div>
          {msg.reply_to && (
            <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md mb-1 max-w-xs truncate">
              <CornerDownRight className="w-3 h-3 text-indigo-500 shrink-0" />
              <span className="font-medium text-indigo-600 dark:text-indigo-400">
                @{msg.reply_to.sender_name}:
              </span>
              <span className="truncate">{msg.reply_to.content}</span>
            </div>
          )}
          {msg.attachments && msg.attachments.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {msg.attachments.map((url, idx) => (
                <a
                  key={idx}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600"
                >
                  <ImageIcon className="w-3 h-3" />
                  {t('community.imageAttachment', { index: idx + 1 })}
                </a>
              ))}
            </div>
          )}
          {!msg.reply_to && (!msg.attachments || msg.attachments.length === 0) && (
            <span className="text-xs text-slate-400">-</span>
          )}
        </div>
      ),
    },
    {
      key: 'created_at',
      title: t('community.colTime'),
      sortable: true,
      render: (msg) => (
        <span className="text-xs text-slate-500 font-mono whitespace-nowrap">
          {new Date(msg.created_at).toLocaleString(isVi ? 'vi-VN' : 'en-US')}
        </span>
      ),
    },
    {
      key: 'actions',
      title: t('community.colActions'),
      align: 'right',
      render: (msg) => (
        <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
          {!msg.is_deleted ? (
            <>
              {onTogglePin && (
                <button
                  type="button"
                  disabled={pinningId === msg._id}
                  onClick={() => handleTogglePinClick(msg)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    msg.is_pinned
                      ? 'text-amber-700 dark:text-amber-300 bg-amber-100/80 dark:bg-amber-950/60 hover:bg-amber-200/70 dark:hover:bg-amber-900/60 border border-amber-200 dark:border-amber-800'
                      : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40'
                  }`}
                  title={msg.is_pinned ? t('community.unpinTitle') : t('community.pinTitle')}
                >
                  {pinningId === msg._id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                  ) : msg.is_pinned ? (
                    <PinOff className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  ) : (
                    <Pin className="w-3.5 h-3.5" />
                  )}
                  <span>{msg.is_pinned ? t('community.unpin') : t('community.pin')}</span>
                </button>
              )}

              {onOpenSanctionModal && msg.sender_badge !== 'ADMIN' && (
                <button
                  type="button"
                  onClick={() =>
                    onOpenSanctionModal({
                      user_id: msg.sender_id,
                      user_name: msg.sender_name,
                      user_avatar: msg.sender_avatar,
                      sender_badge: msg.sender_badge,
                    })
                  }
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/40 transition-colors cursor-pointer"
                  title={t('community.disciplineTitle')}
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>{t('community.discipline')}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setTargetMessageId(msg._id)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                title={t('community.deleteTitle')}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t('community.delete')}</span>
              </button>
            </>
          ) : (
            <span className="text-xs text-slate-400 italic">{t('community.removed')}</span>
          )}
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
          placeholder={t('community.searchPlaceholder')}
          className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 transition-all"
        />
      </div>

      <CustomSelect
        size="sm"
        value={statusFilter}
        onChange={(val) => {
          setStatusFilter(val)
          setSearchQuery((prev) => ({ ...prev, status: val }))
          setCurrentPage(1)
        }}
        options={[
          { value: 'ALL', label: t('community.statusAll') },
          { value: 'PINNED', label: t('community.statusPinned') },
          { value: 'ACTIVE', label: t('community.statusActive') },
          { value: 'DELETED', label: t('community.statusDeleted') },
        ]}
        className="w-44"
      />

      <button
        type="submit"
        className="h-9 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors cursor-pointer"
      >
        {t('community.searchButton')}
      </button>
    </form>
  )

  const extraActions = (
    <div className="flex items-center gap-2">
      {pinnedCount > 0 && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80">
          <Pin className="w-3.5 h-3.5 fill-amber-500 text-amber-600" />
          <span>{t('community.pinnedCount', { count: pinnedCount })}</span>
        </span>
      )}

      <button
        type="button"
        onClick={onRefresh}
        disabled={isLoading}
        className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
        title={t('community.refreshTooltip')}
      >
        <RotateCcw className={`w-4 h-4 ${isLoading ? 'animate-spin text-indigo-600' : ''}`} />
      </button>
    </div>
  )

  return (
    <div className="space-y-4">
      <DataTable<AdminChatMessage>
        columns={columns}
        data={paginatedData}
        rowKey={(m) => m._id}
        isLoading={isLoading}
        emptyText={t('community.emptyMessages')}
        sortKey={sortKey}
        sortOrder={sortOrder}
        onSortChange={(k, o) => {
          setSortKey(k)
          setSortOrder(o)
          setCurrentPage(1)
        }}
        filterSlot={filterSlot}
        extraActions={extraActions}
        onResetFilters={handleResetFilters}
        pagination={{
          currentPage,
          pageSize,
          totalItems: filteredMessages.length,
          onPageChange: setCurrentPage,
          onPageSizeChange: (size) => {
            setPageSize(size)
            setCurrentPage(1)
          },
        }}
      />

      <ConfirmModal
        isOpen={Boolean(targetMessageId)}
        onClose={() => setTargetMessageId(null)}
        onConfirm={handleDeleteConfirm}
        title={t('community.confirmDeleteTitle')}
        message={t('community.confirmDeleteMessage')}
        type="danger"
        confirmText={t('community.deleteNow')}
        cancelText={t('common.cancel')}
        isLoading={isDeleting}
      />

      <CommunityPinReplaceModal
        isOpen={Boolean(replaceTargetMessage)}
        onClose={() => setReplaceTargetMessage(null)}
        targetMessage={replaceTargetMessage}
        pinnedMessages={pinnedMessages}
        onConfirmReplace={handleConfirmReplacePin}
      />
    </div>
  )
}

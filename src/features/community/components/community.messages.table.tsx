// Bảng giám sát tin nhắn trực tiếp trong phòng chat cộng đồng
import { useState } from 'react'
import {
  Trash2,
  Pin,
  PinOff,
  CornerDownRight,
  Image as ImageIcon,
  Search,
  RefreshCw,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import type { AdminChatMessage } from '@/features/community/types/community.admin.types'
import { ConfirmModal } from '@/components/confirm.modal'

interface CommunityMessagesTableProps {
  messages: AdminChatMessage[]
  isLoading: boolean
  onRefresh: () => void
  onDeleteMessage: (messageId: string) => Promise<void>
  onTogglePin?: (messageId: string, isPinned: boolean) => Promise<void>
}

export function CommunityMessagesTable({
  messages,
  isLoading,
  onRefresh,
  onDeleteMessage,
  onTogglePin,
}: CommunityMessagesTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [targetMessageId, setTargetMessageId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [pinningId, setPinningId] = useState<string | null>(null)

  const safeMessages = Array.isArray(messages) ? messages : []
  const sortedMessages = [...safeMessages].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
  const filteredMessages = sortedMessages.filter(
    (m) =>
      m.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.sender_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.sender_id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const pinnedCount = safeMessages.filter((m) => m.is_pinned && !m.is_deleted).length

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

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo nội dung, tên hoặc User ID..."
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {pinnedCount > 0 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80">
              <Pin className="w-3 h-3 fill-amber-500 text-amber-600" />
              <span>{pinnedCount} tin đang ghim</span>
            </span>
          )}

          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Làm mới</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 text-xs uppercase font-bold border-b border-slate-100 dark:border-slate-800">
            <tr>
              <th className="px-5 py-3">Người gửi</th>
              <th className="px-5 py-3">Nội dung tin nhắn</th>
              <th className="px-5 py-3">Đính kèm / Trích dẫn</th>
              <th className="px-5 py-3">Thời gian</th>
              <th className="px-5 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
            {filteredMessages.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-slate-400">
                  {isLoading ? 'Đang tải danh sách tin nhắn...' : 'Không có tin nhắn nào'}
                </td>
              </tr>
            ) : (
              filteredMessages.map((msg) => (
                <tr
                  key={msg._id}
                  className={`hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors ${
                    msg.is_pinned ? 'bg-amber-50/20 dark:bg-amber-950/10' : ''
                  } ${msg.is_deleted ? 'opacity-50 bg-rose-50/20 dark:bg-rose-950/10' : ''}`}
                >
                  <td className="px-5 py-3.5 align-top">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-200 overflow-hidden flex-shrink-0">
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
                          <span className="font-semibold text-xs text-slate-900 dark:text-slate-100 truncate">
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
                  </td>

                  <td className="px-5 py-3.5 align-top max-w-md">
                    {msg.is_deleted ? (
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-[11px] font-medium text-rose-500 dark:text-rose-400">
                          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>Đã bị gỡ bỏ bởi quản trị</span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 italic break-words whitespace-pre-wrap pl-5">
                          "{msg.content}"
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-800 dark:text-slate-200 break-words whitespace-pre-wrap">
                        {msg.content}
                      </p>
                    )}
                    {msg.is_pinned && !msg.is_deleted && (
                      <div className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                        <Pin className="w-3 h-3 fill-amber-500 text-amber-600 dark:text-amber-400" />
                        <span>Đang ghim ở đầu phòng</span>
                      </div>
                    )}
                  </td>

                  <td className="px-5 py-3.5 align-top">
                    {msg.reply_to && (
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md mb-1 max-w-xs truncate">
                        <CornerDownRight className="w-3 h-3 text-indigo-500 flex-shrink-0" />
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
                            Ảnh {idx + 1}
                          </a>
                        ))}
                      </div>
                    )}
                    {!msg.reply_to && (!msg.attachments || msg.attachments.length === 0) && (
                      <span className="text-xs text-slate-400">-</span>
                    )}
                  </td>

                  <td className="px-5 py-3.5 align-top text-xs text-slate-500 font-mono whitespace-nowrap">
                    {new Date(msg.created_at).toLocaleString('vi-VN')}
                  </td>

                  <td className="px-5 py-3.5 align-top text-right whitespace-nowrap">
                    {!msg.is_deleted ? (
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        {onTogglePin && (
                          <button
                            type="button"
                            disabled={pinningId === msg._id}
                            onClick={() => handleTogglePin(msg._id, !msg.is_pinned)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                              msg.is_pinned
                                ? 'text-amber-700 dark:text-amber-300 bg-amber-100/80 dark:bg-amber-950/60 hover:bg-amber-200/70 dark:hover:bg-amber-900/60 border border-amber-200 dark:border-amber-800'
                                : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40'
                            }`}
                            title={msg.is_pinned ? 'Bỏ ghim tin nhắn' : 'Ghim tin nhắn lên đầu phòng chat'}
                          >
                            {pinningId === msg._id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                            ) : msg.is_pinned ? (
                              <PinOff className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                            ) : (
                              <Pin className="w-3.5 h-3.5" />
                            )}
                            <span>{msg.is_pinned ? 'Bỏ ghim' : 'Ghim'}</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => setTargetMessageId(msg._id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                          title="Xóa tin nhắn này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Xóa</span>
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Đã gỡ</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        isOpen={Boolean(targetMessageId)}
        onClose={() => setTargetMessageId(null)}
        onConfirm={handleDeleteConfirm}
        title="Xác nhận xóa tin nhắn vi phạm"
        message="Tin nhắn này sẽ được gỡ bỏ khỏi phòng chat của toàn bộ học viên. Bạn có chắc chắn muốn thực hiện?"
        type="danger"
        confirmText="Xóa ngay"
        cancelText="Hủy bỏ"
        isLoading={isDeleting}
      />
    </div>
  )
}

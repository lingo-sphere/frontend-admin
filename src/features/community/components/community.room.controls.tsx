// Bảng điều khiển cấu hình phòng chat cộng đồng (Bật/tắt chat, chế độ chậm)
import { useState, useEffect } from 'react'
import { MessageSquare, ShieldAlert, Clock, Save, Lock, Unlock } from 'lucide-react'
import type { AdminChatRoom, UpdateRoomSettingPayload } from '@/features/community/types/community.admin.types'

interface CommunityRoomControlsProps {
  room: AdminChatRoom | null
  isLoading: boolean
  onUpdate: (payload: UpdateRoomSettingPayload) => Promise<void>
}

export function CommunityRoomControls({ room, isLoading, onUpdate }: CommunityRoomControlsProps) {
  const [isChatEnabled, setIsChatEnabled] = useState<boolean>(true)
  const [slowModeSeconds, setSlowModeSeconds] = useState<number>(0)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (room) {
      setIsChatEnabled(room.is_chat_enabled)
      setSlowModeSeconds(room.slow_mode_seconds || 0)
    }
  }, [room])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onUpdate({
        is_chat_enabled: isChatEnabled,
        slow_mode_seconds: slowModeSeconds,
      })
    } finally {
      setIsSaving(false)
    }
  }

  const hasChanges = room
    ? room.is_chat_enabled !== isChatEnabled || (room.slow_mode_seconds || 0) !== slowModeSeconds
    : false

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {room?.title || 'Phòng Chat Cộng Đồng'}
              </h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300">
                #{room?.room_code || 'general-lounge'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Kênh giao lưu học tập trực tiếp cho học viên đã mua khóa học hoặc có gói PRO
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={!hasChanges || isSaving || isLoading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white shadow-sm transition-all self-start md:self-auto cursor-pointer"
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Đang lưu...' : 'Lưu cài đặt'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
        <div className="flex items-start justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {isChatEnabled ? (
                <Unlock className="w-4 h-4 text-emerald-600" />
              ) : (
                <Lock className="w-4 h-4 text-rose-600" />
              )}
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Quyền trò chuyện toàn phòng
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
              {isChatEnabled
                ? 'Đang mở: Mọi học viên đủ điều kiện đều có thể gửi tin nhắn tự do.'
                : 'Chế độ khóa: Chỉ Quản trị viên và Phó nhóm mới có quyền gửi tin nhắn thông báo.'}
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isChatEnabled}
              onChange={(e) => setIsChatEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>

        <div className="flex items-start justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Chế độ gửi tin chậm (Slow Mode)
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
              Giãn cách thời gian tối thiểu giữa 2 lần gửi tin của học viên để ngăn chặn spam.
            </p>
          </div>

          <select
            value={slowModeSeconds}
            onChange={(e) => setSlowModeSeconds(Number(e.target.value))}
            className="text-xs font-semibold px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value={0}>Tắt</option>
            <option value={3}>3 giây</option>
            <option value={5}>5 giây</option>
            <option value={10}>10 giây</option>
            <option value={30}>30 giây</option>
            <option value={60}>60 giây</option>
          </select>
        </div>
      </div>
    </div>
  )
}

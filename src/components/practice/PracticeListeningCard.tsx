import { Headphones, Trash2 } from 'lucide-react'
import type { ListeningExercise } from '@/types/api.types'
import { Popconfirm } from '@/components/common/Popconfirm'

interface PracticeListeningCardProps {
  item: ListeningExercise
  onToggleStatus?: (id: string, current: boolean) => void
  onDelete: (id: string) => Promise<void> | void
}

export function PracticeListeningCard({
  item,
  onDelete,
}: PracticeListeningCardProps) {
  const itemId = item._id || ''

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-sky-500/50 transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
            <Headphones className="w-5 h-5" />
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
            {item.exercise_type || 'DICTATION'}
          </span>
        </div>

        <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{item.title}</h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1.5 font-mono">
          {item.audio_url || 'https://r2.lingosphere.vn/listening/default.mp3'}
        </p>
      </div>

      <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
        <span className="text-slate-500">{item.duration_seconds || 45} giây</span>

        <div className="flex items-center gap-2">
          <Popconfirm
            title="Xóa bài luyện nghe này?"
            description="Hành động này không thể hoàn tác."
            okText="Xóa"
            cancelText="Hủy"
            okType="danger"
            placement="topRight"
            onConfirm={() => onDelete(itemId)}
          >
            <button
              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 transition-colors cursor-pointer"
              title="Xóa bài nghe"
              type="button"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </Popconfirm>
        </div>
      </div>
    </div>
  )
}

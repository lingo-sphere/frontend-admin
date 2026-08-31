import { Mic, Trash2 } from 'lucide-react'
import type { SpeakingExercise } from '@/types/api.types'
import { Popconfirm } from '@/components/common/Popconfirm'

interface PracticeSpeakingCardProps {
  item: SpeakingExercise
  onToggleStatus?: (id: string, current: boolean) => void
  onDelete: (id: string) => Promise<void> | void
}

export function PracticeSpeakingCard({
  item,
  onDelete,
}: PracticeSpeakingCardProps) {
  const itemId = item._id || ''

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-500/50 transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <Mic className="w-5 h-5" />
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            {item.difficulty || 'BEGINNER'}
          </span>
        </div>

        <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{item.title}</h4>
        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 font-medium">
          &ldquo;{item.prompt_text}&rdquo;
        </p>
      </div>

      <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
        <span className="text-emerald-600 dark:text-emerald-400 font-mono text-[11px]">
          {item.phonetic_guide || '/.../'}
        </span>

        <div className="flex items-center gap-2">
          <Popconfirm
            title="Xóa bài luyện nói này?"
            description="Hành động này không thể hoàn tác."
            okText="Xóa"
            cancelText="Hủy"
            okType="danger"
            placement="topRight"
            onConfirm={() => onDelete(itemId)}
          >
            <button
              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 transition-colors cursor-pointer"
              title="Xóa bài nói"
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

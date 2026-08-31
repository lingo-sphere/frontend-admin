import { PenTool, Trash2 } from 'lucide-react'
import type { WritingExercise } from '@/types/api.types'

interface PracticeWritingCardProps {
  item: WritingExercise
  onToggleStatus?: (id: string, current: boolean) => void
  onDelete: (id: string) => void
}

export function PracticeWritingCard({
  item,
  onToggleStatus,
  onDelete,
}: PracticeWritingCardProps) {
  const itemId = item._id || ''

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-purple-500/50 transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
            <PenTool className="w-5 h-5" />
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
            {item.topic || 'General'}
          </span>
        </div>

        <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{item.title}</h4>
        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mt-1.5">
          {item.prompt}
        </p>
      </div>

      <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
        <span className="text-slate-500 font-semibold">Tối thiểu {item.min_words || 50} từ</span>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onDelete(itemId)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
            title="Xóa đề viết"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

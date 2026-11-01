// Component hiển thị thẻ bộ flashcard công khai trong Admin.

import { BookOpen, Layers3, Users, Trash2, Edit2 } from 'lucide-react'
import { Tooltip } from 'antd'
import type { FlashcardDeck } from '@/features/vocabulary/data/vocabulary.data'
import { Popconfirm } from '@/components/popconfirm'

interface PublicDeckCardProps {
  deck: FlashcardDeck
  onClick?: (deck: FlashcardDeck) => void
  onEdit?: (deck: FlashcardDeck) => void
  onDelete: (id: string) => Promise<void> | void
}

export function PublicDeckCard({ deck, onClick, onEdit, onDelete }: PublicDeckCardProps) {
  const deckId = deck._id || deck.id || ''
  const cardCount = deck.card_count ?? deck.total_cards ?? 0

  return (
    <div
      onClick={() => onClick?.(deck)}
      className="group p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-indigo-500/50 hover:shadow-md transition-all flex flex-col justify-between cursor-pointer min-h-[200px]"
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold border border-indigo-100 dark:border-indigo-900/40 group-hover:scale-105 transition-transform">
            <Layers3 className="w-5 h-5" />
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            Công khai
          </span>
        </div>

        <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {deck.name_vi || deck.name || deck.title || 'Bộ thẻ từ vựng'}
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1.5 leading-relaxed">
          {deck.description_vi || deck.description || 'Bộ từ vựng công khai dành cho cộng đồng học viên TOEIC.'}
        </p>
      </div>

      <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 font-medium text-slate-600 dark:text-slate-300">
            <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
            {cardCount} thẻ
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-teal-500" />
            {(deck.enrolled_count ?? deck.total_users ?? 0).toLocaleString()} học
          </span>
        </div>

        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          {onEdit && (
            <Tooltip title="Chỉnh sửa thông tin bộ thẻ">
              <button
                type="button"
                onClick={() => onEdit(deck)}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                title="Chỉnh sửa bộ thẻ"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </Tooltip>
          )}

          <Popconfirm
            title="Xóa bộ thẻ này?"
            description="Hành động này không thể hoàn tác."
            okText="Xóa"
            cancelText="Hủy"
            okType="danger"
            placement="topRight"
            onConfirm={() => onDelete(deckId)}
          >
            <button
              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 transition-colors cursor-pointer"
              title="Xóa bộ thẻ công khai"
              type="button"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </Popconfirm>
        </div>
      </div>
    </div>
  )
}

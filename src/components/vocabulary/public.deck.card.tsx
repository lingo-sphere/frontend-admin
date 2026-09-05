/**
 * @file PublicDeckCard.tsx
 * @description Component giao diện PublicDeckCard phục vụ khu vực Quản trị Admin
 */

import { BookOpen, Layers3, Users, Trash2 } from 'lucide-react'
import type { FlashcardDeck } from '@/types/api.types'
import { Popconfirm } from '@/components/common/popconfirm'

interface PublicDeckCardProps {
  deck: FlashcardDeck
  onDelete: (id: string) => Promise<void> | void
}

export function PublicDeckCard({ deck, onDelete }: PublicDeckCardProps) {
  const deckId = deck._id || ''

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-indigo-500/50 transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
            <Layers3 className="w-5 h-5" />
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            Công khai
          </span>
        </div>

        <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{deck.title}</h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1.5">
          {deck.description || 'Bộ từ vựng công khai dành cho cộng đồng học viên TOEIC.'}
        </p>
      </div>

      <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
            {deck.total_cards || 0} thẻ
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-teal-500" />
            {(deck.enrolled_count || 0).toLocaleString()} học
          </span>
        </div>

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
            <Trash2 className="w-4 h-4" />
          </button>
        </Popconfirm>
      </div>
    </div>
  )
}

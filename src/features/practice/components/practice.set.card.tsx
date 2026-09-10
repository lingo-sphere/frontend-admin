/**
 * @file practice.set.card.tsx
 * @description Component giao diện PracticeSetCard phục vụ khu vực Quản trị Admin
 */

import { Award, Trash2 } from 'lucide-react'
import type { PracticeSet } from '@/types/api.types'
import { Popconfirm } from '@/components/popconfirm'

interface PracticeSetCardProps {
  set: PracticeSet
  onToggleStatus: (id: string, current: boolean) => void
  onDelete: (id: string) => Promise<void> | void
}

export function PracticeSetCard({
  set,
  onToggleStatus,
  onDelete,
}: PracticeSetCardProps) {
  const setId = set._id || ''

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-indigo-500/50 transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
            <Award className="w-5 h-5" />
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            {set.category}
          </span>
        </div>

        <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{set.title}</h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1.5">
          {set.description || 'Bộ bài tập ôn luyện ngữ pháp, cấu trúc câu và từ loại TOEIC.'}
        </p>
      </div>

      <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
        <span className="text-slate-500">{set.total_questions || 0} câu hỏi</span>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleStatus(setId, Boolean(set.is_active))}
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
              set.is_active
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
            }`}
          >
            {set.is_active ? 'Hoạt động' : 'Tạm dừng'}
          </button>
          <Popconfirm
            title="Xóa bộ bài tập này?"
            description="Hành động này không thể hoàn tác."
            okText="Xóa"
            cancelText="Hủy"
            okType="danger"
            placement="topRight"
            onConfirm={() => onDelete(setId)}
          >
            <button
              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 transition-colors cursor-pointer"
              title="Xóa bộ bài tập"
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

import { Volume2, Edit2, Trash2 } from 'lucide-react'
import type { LexicalItem } from '@/data/vocabulary-data'
import { wordTypeLabels } from '@/data/vocabulary-data'
import type { DataTableColumn } from '@/components/common/DataTable'
import { Popconfirm } from '@/components/common/Popconfirm'
import { playAudio } from '@/helpers/vocabulary.helper'

interface GetVocabularyColumnsOptions {
  onEditWord: (wordId: string) => void
  onDeleteWord: (wordId: string) => Promise<void> | void
}

export function getVocabularyColumns({
  onEditWord,
  onDeleteWord,
}: GetVocabularyColumnsOptions): DataTableColumn<LexicalItem>[] {
  return [
    {
      key: 'word',
      title: 'Từ vựng & Phát âm',
      render: (w) => (
        <div className="flex items-center gap-3">
          <button
            onClick={() => playAudio(w.audio_url_us)}
            className="w-8 h-8 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            title="Nghe phát âm US"
          >
            <Volume2 className="w-4 h-4" />
          </button>
          <div>
            <p className="font-bold text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer">
              {w.word}
            </p>
            <p className="font-mono text-xs text-slate-400">
              {w.pronunciation_us ? `/${w.pronunciation_us}/` : '—'}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      title: 'Từ loại',
      render: (w) => {
        const typeInfo = w.word_type ? wordTypeLabels[w.word_type] : undefined
        return (
          <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {typeInfo?.vi || w.word_type || '—'}
          </span>
        )
      },
    },
    {
      key: 'cefr',
      title: 'Trình độ CEFR',
      render: (w) => (
        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
          {w.cefr_level || 'A1'}
        </span>
      ),
    },
    {
      key: 'content',
      title: 'Nghĩa & Ví dụ',
      render: (w) => (
        <div className="text-xs text-slate-600 dark:text-slate-400">
          <span>{w.meanings_count || 1} định nghĩa</span>
          <span className="mx-1.5">•</span>
          <span>{w.examples_count || 0} ví dụ câu</span>
        </div>
      ),
    },
    {
      key: 'status',
      title: 'Trạng thái',
      render: (w) => (
        <span
          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
            w.is_verified
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
          }`}
        >
          {w.is_verified ? 'Đã kiểm duyệt' : 'Chờ duyệt'}
        </span>
      ),
    },
    {
      key: 'actions',
      title: 'Thao tác',
      align: 'right',
      render: (w) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => onEditWord(w.id)}
            className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 transition-colors cursor-pointer"
            title="Chỉnh sửa từ vựng"
            type="button"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <Popconfirm
            title="Xóa từ vựng này?"
            description="Hành động này không thể hoàn tác."
            okText="Xóa"
            cancelText="Hủy"
            okType="danger"
            placement="topRight"
            onConfirm={() => onDeleteWord(w.id)}
          >
            <button
              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 transition-colors cursor-pointer"
              title="Xóa từ vựng"
              type="button"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </Popconfirm>
        </div>
      ),
    },
  ]
}

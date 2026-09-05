/**
 * @file exam.editor.global.audio.tsx
 * @description Thanh hiển thị phát audio nghe chung cho toàn bộ đề thi kèm nút xóa audio
 */

import { Trash2, Volume2 } from 'lucide-react'

interface ExamEditorGlobalAudioProps {
  globalAudioUrl: string
  isVi: boolean
  onRemove: () => void
}

export function ExamEditorGlobalAudio({
  globalAudioUrl,
  isVi,
  onRemove,
}: ExamEditorGlobalAudioProps) {
  if (!globalAudioUrl) return null

  return (
    <div className="flex items-center justify-between gap-3 px-6 py-2 bg-indigo-50/50 dark:bg-indigo-950/20 border-b border-indigo-100 dark:border-indigo-900/40 text-xs">
      <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
        <Volume2 className="w-4 h-4 text-indigo-500" />
        <span className="font-semibold">
          {isVi ? 'Audio toàn bài thi:' : 'Global Exam Audio:'}
        </span>
        <audio controls src={globalAudioUrl} className="h-7 max-w-xs" />
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1 cursor-pointer"
        title="Xóa audio toàn bài"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

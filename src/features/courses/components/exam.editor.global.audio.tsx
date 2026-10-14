/**
 * @file exam.editor.global.audio.tsx
 * @description Thanh hiển thị phát audio nghe chung cho toàn bộ đề thi kèm nút xóa audio
 */

import { Trash2, Volume2 } from 'lucide-react'
import { resolveMediaUrl } from '@/lib/media.utils'

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

  const resolvedUrl = resolveMediaUrl(globalAudioUrl)

  return (
    <div className="flex items-center justify-between gap-3 px-6 py-2 bg-indigo-50/50 dark:bg-indigo-950/20 border-b border-indigo-100 dark:border-indigo-900/40 text-xs">
      <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
        <Volume2 className="w-4 h-4 text-indigo-500" />
        <span className="font-semibold">
          {isVi ? 'Audio toàn bài thi:' : 'Global Exam Audio:'}
        </span>
        <audio controls src={resolvedUrl} className="h-7 max-w-xs" />
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-rose-600 hover:bg-rose-100/70 dark:hover:bg-rose-950/50 dark:text-rose-400 font-medium transition cursor-pointer shrink-0 border border-rose-200 dark:border-rose-900/40"
        title="Xóa audio toàn bài"
      >
        <Trash2 className="w-3.5 h-3.5" />
        <span>{isVi ? 'Xóa audio toàn bài' : 'Delete audio'}</span>
      </button>
    </div>
  )
}

/**
 * @file chapter.assessment.audio.tsx
 * @description Thành phần quản lý file âm thanh (Audio) cho bài kiểm tra đánh giá chương
 */

import { Volume2, Sparkles, Loader2, Upload, Trash2 } from 'lucide-react'

interface ChapterAssessmentAudioProps {
  commonAudioUrl?: string
  isVi: boolean
  isUploadingAudio: boolean
  onUploadClick: () => void
  onRemoveAudio: () => void
}

export function ChapterAssessmentAudio({
  commonAudioUrl,
  isVi,
  isUploadingAudio,
  onUploadClick,
  onRemoveAudio,
}: ChapterAssessmentAudioProps) {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white/90 p-3 dark:border-slate-800 dark:bg-slate-900/90 flex flex-col justify-between space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
          <Volume2 className="w-4 h-4 text-indigo-600" />
          <span>{isVi ? 'File âm thanh đề thi (Audio)' : 'Listening Audio'}</span>
        </span>
        {commonAudioUrl ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300 text-[11px] font-extrabold border border-indigo-300/80 dark:border-indigo-700">
            <Sparkles className="w-3 h-3 text-indigo-600" />
            <span>{isVi ? 'Đã có file nghe' : 'Audio attached'}</span>
          </span>
        ) : (
          <span className="text-[11px] text-slate-400">
            {isVi ? '(Tùy chọn cho phần Nghe)' : '(Optional for Listening)'}
          </span>
        )}
      </div>

      {commonAudioUrl ? (
        <div className="space-y-2">
          <audio controls src={commonAudioUrl} className="h-7 w-full" />
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onUploadClick}
              disabled={isUploadingAudio}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-300 transition-colors cursor-pointer disabled:opacity-50"
            >
              {isUploadingAudio ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Upload className="w-3 h-3" />
              )}
              <span>{isVi ? 'Đổi file audio' : 'Replace audio'}</span>
            </button>
            <button
              type="button"
              onClick={onRemoveAudio}
              className="p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
              title={isVi ? 'Gỡ file nghe' : 'Remove audio'}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col justify-end space-y-2">
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {isVi
              ? 'Gắn file âm thanh nếu bài test chương có câu hỏi nghe hiểu (Listening).'
              : 'Attach audio if this chapter test includes listening questions.'}
          </p>
          <button
            type="button"
            onClick={onUploadClick}
            disabled={isUploadingAudio}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-dashed border-indigo-300 bg-indigo-50/50 hover:bg-indigo-100/70 dark:border-indigo-800 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
          >
            {isUploadingAudio ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Upload className="w-3.5 h-3.5" />
            )}
            <span>{isVi ? '+ Tải Lên File Audio (.mp3, .wav)' : '+ Upload Audio File'}</span>
          </button>
        </div>
      )}
    </div>
  )
}

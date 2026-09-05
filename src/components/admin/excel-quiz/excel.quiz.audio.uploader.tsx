/**
 * @file excel.quiz.audio.uploader.tsx
 * @description Component đính kèm và phát thử file nghe audio (.mp3, .wav) cho bài test nhập từ Excel
 */

import { RefObject } from 'react'
import { Music, Volume2, Loader2, Trash2 } from 'lucide-react'

interface ExcelQuizAudioUploaderProps {
  audioUrl: string | null
  audioFileName: string | null
  isUploadingAudio: boolean
  audioInputRef: RefObject<HTMLInputElement | null>
  onAudioUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  onRemoveAudio: () => void
  onTriggerFileInput: () => void
}

export function ExcelQuizAudioUploader({
  audioUrl,
  audioFileName,
  isUploadingAudio,
  audioInputRef,
  onAudioUpload,
  onRemoveAudio,
  onTriggerFileInput,
}: ExcelQuizAudioUploaderProps) {
  return (
    <div className="rounded-2xl border border-indigo-200 bg-indigo-50/40 p-4 dark:border-indigo-900/50 dark:bg-indigo-950/20 space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
            <Music className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
              File Nghe Audio (.mp3, .wav) cho Bộ Đề Này
            </h4>
            <p className="text-[11px] text-indigo-700/80 dark:text-indigo-300/80">
              File âm thanh bài nghe được gắn trực tiếp vào toàn bộ đề này (phát chung cho bài test).
            </p>
          </div>
        </div>

        <input
          ref={audioInputRef}
          type="file"
          accept="audio/*,.mp3,.wav,.ogg,.m4a"
          onChange={onAudioUpload}
          onClick={(e) => {
            ;(e.target as HTMLInputElement).value = ''
          }}
          className="hidden"
        />

        <button
          type="button"
          disabled={isUploadingAudio}
          onClick={onTriggerFileInput}
          className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-1.5 text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
        >
          {isUploadingAudio ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Đang upload...</span>
            </>
          ) : (
            <>
              <Volume2 className="h-3.5 w-3.5" />
              <span>
                {audioFileName || audioUrl
                  ? audioFileName
                    ? `Đổi audio (${audioFileName})`
                    : 'Đổi file audio'
                  : 'Upload File Nghe'}
              </span>
            </>
          )}
        </button>
      </div>

      {audioUrl && (
        <div className="pt-2 border-t border-indigo-200/60 dark:border-indigo-900/60 space-y-1.5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <audio controls src={audioUrl} className="w-full h-8" />
            </div>
            <button
              type="button"
              onClick={onRemoveAudio}
              className="p-1.5 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
              title="Xóa file audio khỏi bộ đề"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <p className="text-[11px] text-indigo-700 dark:text-indigo-300 font-medium">
            ✓ File nghe được gắn vào toàn bộ đề này (không gắn lặp lại từng câu hỏi).
          </p>
        </div>
      )}
    </div>
  )
}

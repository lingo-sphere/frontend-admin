/**
 * @file course.final.test.audio.tsx
 * @description Audio upload and playback component for the course final test
 */

import React, { useRef, useState } from 'react'
import { Volume2, Upload, Trash2, Loader2, Sparkles } from 'lucide-react'
import { mediaAdminService } from '@/services/media.service'
import { toast } from '@/store/toast.store'
import type { CourseFormData } from './course.basic.info.tab'

interface CourseFinalTestAudioProps {
  formData: CourseFormData
  onChange: (updated: Partial<CourseFormData>) => void
  isVi: boolean
}

export function CourseFinalTestAudio({
  formData,
  onChange,
  isVi,
}: CourseFinalTestAudioProps) {
  const [isUploadingFinalAudio, setIsUploadingFinalAudio] = useState(false)
  const finalAudioInputRef = useRef<HTMLInputElement>(null)

  const handleFinalAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!/\.(mp3|wav|m4a|ogg)$/i.test(file.name)) {
      toast.error('Chỉ chấp nhận file âm thanh (.mp3, .wav, .m4a, .ogg)')
      return
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error('Dung lượng file âm thanh không được vượt quá 50MB')
      return
    }

    setIsUploadingFinalAudio(true)
    try {
      const res = await mediaAdminService.uploadFile(file, 'quiz-audio')
      const uploadedUrl = res.file_url || res.url || res.public_url
      if (uploadedUrl) {
        if (formData.final_test_audio_url && formData.final_test_audio_url !== uploadedUrl) {
          mediaAdminService.cleanupTempMedia([formData.final_test_audio_url]).catch(() => {})
        }
        onChange({
          ...formData,
          final_test_audio_url: uploadedUrl,
        })
        toast.success(
          isVi
            ? `Đã cập nhật file nghe cho bài thi Final Test: ${file.name}`
            : `Updated final test audio: ${file.name}`
        )
      } else {
        toast.error('Không nhận được đường dẫn file âm thanh từ máy chủ.')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi tải file audio lên máy chủ lưu trữ.'
      toast.error(msg)
    } finally {
      setIsUploadingFinalAudio(false)
      if (finalAudioInputRef.current) finalAudioInputRef.current.value = ''
    }
  }

  const handleRemoveFinalAudio = () => {
    if (formData.final_test_audio_url) {
      mediaAdminService.cleanupTempMedia([formData.final_test_audio_url]).catch(() => {})
    }
    onChange({
      ...formData,
      final_test_audio_url: '',
    })
    toast.success(isVi ? 'Đã gỡ file nghe khỏi bài thi Final Test' : 'Removed audio from final test')
  }

  return (
    <div className="rounded-xl border border-slate-200/80 bg-white/90 p-4 dark:border-slate-800 dark:bg-slate-900/90 flex flex-col justify-between space-y-3">
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Volume2 className="w-4 h-4 text-indigo-600" />
            <span>{isVi ? 'File âm thanh đề thi (Audio)' : 'Listening Audio'}</span>
          </span>
          {formData.final_test_audio_url ? (
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

        {formData.final_test_audio_url ? (
          <div className="space-y-2">
            <audio controls src={formData.final_test_audio_url} className="h-7 w-full" />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => finalAudioInputRef.current?.click()}
                disabled={isUploadingFinalAudio}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-300 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isUploadingFinalAudio ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                <span>{isVi ? 'Đổi file audio' : 'Replace audio'}</span>
              </button>
              <button
                type="button"
                onClick={handleRemoveFinalAudio}
                className="p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                title={isVi ? 'Gỡ file nghe' : 'Remove audio'}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {isVi
                ? 'Gắn file âm thanh nếu đề thi tốt nghiệp có phần Nghe hiểu (Listening).'
                : 'Attach audio if this final exam includes listening questions.'}
            </p>
            <button
              type="button"
              onClick={() => finalAudioInputRef.current?.click()}
              disabled={isUploadingFinalAudio}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-dashed border-indigo-300 bg-indigo-50/50 hover:bg-indigo-100/70 dark:border-indigo-800 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
            >
              {isUploadingFinalAudio ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
              <span>{isVi ? '+ Tải Lên File Audio (.mp3, .wav)' : '+ Upload Audio File'}</span>
            </button>
          </div>
        )}
      </div>

      <input
        ref={finalAudioInputRef}
        type="file"
        accept="audio/*,.mp3,.wav,.ogg,.m4a"
        onChange={handleFinalAudioUpload}
        onClick={(e) => {
          ;(e.target as HTMLInputElement).value = ''
        }}
        className="hidden"
      />
    </div>
  )
}

/**
 * @file ChapterAssessmentCard.tsx
 * @description Component quản lý bài kiểm tra đánh giá của từng chương học
 */

import { useState, useRef } from 'react'
import { Award, FileSpreadsheet, Eye, Volume2, Upload, Trash2, Loader2 } from 'lucide-react'
import { mediaAdminService } from '@/services/media.service'
import { toast } from '@/store/toast-store'
import type { CourseModule } from './CourseBasicInfoTab'

interface ChapterAssessmentCardProps {
  module: CourseModule
  isVi: boolean
  onUpdateModule: (updated: Partial<CourseModule>) => void
  onOpenExcelModal: () => void
  onOpenViewerModal: () => void
}

export function ChapterAssessmentCard({
  module,
  isVi,
  onUpdateModule,
  onOpenExcelModal,
  onOpenViewerModal,
}: ChapterAssessmentCardProps) {
  const audioInputRef = useRef<HTMLInputElement>(null)
  const [isUploadingAudio, setIsUploadingAudio] = useState(false)

  const questionsList =
    module.test_questions ||
    module.post_mini_questions ||
    module.challenge_questions ||
    []
  const questionCount = questionsList.length
  const passingScore =
    module.passing_score ??
    module.post_mini_passing_score ??
    module.challenge_passing_score ??
    70

  const commonAudioUrl = questionsList.find((q) => q.media_url)?.media_url

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    setIsUploadingAudio(true)
    try {
      const res = await mediaAdminService.uploadFile(file, 'quiz-audio')
      const uploadedUrl = res.file_url || res.url || res.public_url
      if (uploadedUrl) {
        const updated = questionsList.map((q) => ({
          ...q,
          media_url: uploadedUrl,
        }))
        onUpdateModule({
          test_questions: updated,
          challenge_questions: updated,
          post_mini_questions: updated,
        })
        toast.success(
          isVi
            ? `Đã cập nhật file nghe cho chương: ${file.name}`
            : `Updated test audio: ${file.name}`
        )
      } else {
        toast.error('Không nhận được đường dẫn file âm thanh từ máy chủ.')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi tải file audio lên máy chủ lưu trữ.'
      toast.error(msg)
    } finally {
      setIsUploadingAudio(false)
      if (audioInputRef.current) audioInputRef.current.value = ''
    }
  }

  const handleRemoveAudio = () => {
    const updated = questionsList.map((q) => ({
      ...q,
      media_url: undefined,
    }))
    onUpdateModule({
      test_questions: updated,
      challenge_questions: updated,
      post_mini_questions: updated,
    })
    toast.success(
      isVi ? 'Đã gỡ file nghe khỏi bài test chương' : 'Removed audio from chapter test'
    )
  }

  return (
    <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-4 sm:p-5 space-y-3.5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600/15 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 ring-1 ring-indigo-500/30">
            <Award className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide flex items-center gap-2">
              {isVi ? 'Bài Kiểm Tra Đánh Giá Chương' : 'Chapter Assessment Test'}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {isVi
                ? 'Học viên làm đạt ngưỡng điểm để hoàn thành và mở khóa chương tiếp theo'
                : 'Students pass this test to complete and unlock the next chapter'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
            {isVi ? 'Ngưỡng đạt:' : 'Passing Score:'}
          </span>
          <input
            type="number"
            min={10}
            max={100}
            value={passingScore}
            onChange={(e) => {
              const val = Math.max(10, Math.min(100, Number(e.target.value) || 70))
              onUpdateModule({
                passing_score: val,
                challenge_passing_score: val,
                post_mini_passing_score: val,
              })
            }}
            className="w-12 h-7 text-center rounded-lg border border-slate-200 bg-slate-50 text-xs font-bold text-indigo-600 dark:bg-slate-950 dark:border-slate-700 dark:text-indigo-400 focus:outline-none focus:border-indigo-500"
          />
          <span className="text-[11px] font-bold text-slate-500">%</span>
        </div>
      </div>

      {commonAudioUrl ? (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/70 dark:border-indigo-800/70">
          <div className="flex items-center gap-2.5 flex-1 min-w-[240px]">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600/15 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 shrink-0">
              <Volume2 className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold text-indigo-950 dark:text-indigo-200 truncate">
                {isVi ? 'File nghe của bài test chương' : 'Chapter Test Audio'}
              </p>
              <audio controls src={commonAudioUrl} className="h-7 w-full max-w-md mt-1" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => audioInputRef.current?.click()}
              disabled={isUploadingAudio}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-700 border border-indigo-200 dark:border-indigo-800 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
              title={isVi ? 'Đổi file nghe mới cho bài test này' : 'Change audio file'}
            >
              {isUploadingAudio ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Upload className="h-3.5 w-3.5" />
              )}
              <span>{isVi ? 'Đổi file nghe' : 'Change audio'}</span>
            </button>

            <button
              type="button"
              onClick={handleRemoveAudio}
              className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
              title={isVi ? 'Gỡ file nghe khỏi bài test' : 'Remove audio'}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : questionCount > 0 ? (
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Volume2 className="h-3.5 w-3.5" />
            <span>{isVi ? 'Bài test chưa có file nghe âm thanh' : 'No audio attached to this test'}</span>
          </span>
          <button
            type="button"
            onClick={() => audioInputRef.current?.click()}
            disabled={isUploadingAudio}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300 dark:hover:bg-indigo-900/50 transition-colors cursor-pointer disabled:opacity-50"
          >
            {isUploadingAudio ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Upload className="h-3 w-3" />
            )}
            <span>{isVi ? '+ Thêm file nghe' : '+ Add audio'}</span>
          </button>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-indigo-500/15 bg-white/70 dark:bg-slate-900/70 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            {questionCount > 0
              ? `✅ Đã có ${questionCount} câu hỏi trắc nghiệm`
              : '⚠️ Chưa có câu hỏi nào trong bài test này'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenExcelModal}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-500 transition-all cursor-pointer"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            <span>Upload File Excel (.xlsx)</span>
          </button>

          {questionCount > 0 && (
            <button
              type="button"
              onClick={onOpenViewerModal}
              className="flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50/70 px-3.5 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300 dark:hover:bg-indigo-900/40 transition-all cursor-pointer shadow-xs"
            >
              <Eye className="h-3.5 w-3.5 text-indigo-500" />
              <span>Xem/Sửa câu hỏi</span>
            </button>
          )}
        </div>
      </div>

      <input
        ref={audioInputRef}
        type="file"
        accept="audio/*,.mp3,.wav,.ogg,.m4a"
        onChange={handleAudioUpload}
        onClick={(e) => {
          ;(e.target as HTMLInputElement).value = ''
        }}
        className="hidden"
      />
    </div>
  )
}

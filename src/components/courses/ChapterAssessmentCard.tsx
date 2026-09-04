/**
 * @file ChapterAssessmentCard.tsx
 * @description Component quản lý bài kiểm tra đánh giá cột mốc kết thúc từng chương học
 */

import { useState, useRef } from 'react'
import {
  Award,
  FileSpreadsheet,
  Eye,
  Volume2,
  Upload,
  Trash2,
  Loader2,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  Mic,
  PenTool,
  FileDown,
} from 'lucide-react'
import { mediaAdminService } from '@/services/media.service'
import { toast } from '@/store/toast-store'
import type { CourseModule } from './CourseBasicInfoTab'

interface ChapterAssessmentCardProps {
  module: CourseModule
  chapterIndex?: number
  isVi: boolean
  is4Skills?: boolean
  onUpdateModule: (updated: Partial<CourseModule>) => void
  onOpenExcelModal: () => void
  onOpenViewerModal: () => void
}

export function ChapterAssessmentCard({
  module,
  chapterIndex = 0,
  isVi,
  is4Skills = false,
  onUpdateModule,
  onOpenExcelModal,
  onOpenViewerModal,
}: ChapterAssessmentCardProps) {
  const audioInputRef = useRef<HTMLInputElement>(null)
  const speakingFileInputRef = useRef<HTMLInputElement>(null)
  const writingFileInputRef = useRef<HTMLInputElement>(null)

  const [isUploadingAudio, setIsUploadingAudio] = useState(false)
  const [isUploadingSpeakingFile, setIsUploadingSpeakingFile] = useState(false)
  const [isUploadingWritingFile, setIsUploadingWritingFile] = useState(false)

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

  const commonAudioUrl =
    module.test_audio_url ||
    module.challenge_audio_url ||
    module.audio_url ||
    questionsList.find((q) => q.media_url)?.media_url

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
        const cleanedQuestions = questionsList.map((q) => ({
          ...q,
          media_url: undefined,
        }))
        onUpdateModule({
          test_audio_url: uploadedUrl,
          challenge_audio_url: uploadedUrl,
          audio_url: uploadedUrl,
          test_questions: cleanedQuestions,
          challenge_questions: cleanedQuestions,
          post_mini_questions: cleanedQuestions,
        })
        toast.success(
          isVi
            ? `Đã cập nhật file nghe cho bộ đề chương: ${file.name}`
            : `Updated chapter test audio: ${file.name}`
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
      test_audio_url: '',
      challenge_audio_url: '',
      audio_url: '',
      test_questions: updated,
      challenge_questions: updated,
      post_mini_questions: updated,
    })
    toast.success(
      isVi ? 'Đã gỡ file nghe khỏi bộ đề thi chương' : 'Removed audio from chapter test'
    )
  }

  const handleSpeakingFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 50 * 1024 * 1024) {
      toast.error('Dung lượng file không được vượt quá 50MB')
      return
    }

    setIsUploadingSpeakingFile(true)
    try {
      const res = await mediaAdminService.uploadFile(file, 'chapter-speaking')
      const uploadedUrl = res.file_url || res.url || res.public_url
      if (uploadedUrl) {
        onUpdateModule({ speaking_file_url: uploadedUrl })
        toast.success(
          isVi ? `Đã tải lên file đề Speaking: ${file.name}` : `Uploaded speaking file: ${file.name}`
        )
      } else {
        toast.error('Không nhận được đường dẫn file tải lên.')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi tải file lên máy chủ.'
      toast.error(msg)
    } finally {
      setIsUploadingSpeakingFile(false)
      if (speakingFileInputRef.current) speakingFileInputRef.current.value = ''
    }
  }

  const handleWritingFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 50 * 1024 * 1024) {
      toast.error('Dung lượng file không được vượt quá 50MB')
      return
    }

    setIsUploadingWritingFile(true)
    try {
      const res = await mediaAdminService.uploadFile(file, 'chapter-writing')
      const uploadedUrl = res.file_url || res.url || res.public_url
      if (uploadedUrl) {
        onUpdateModule({ writing_file_url: uploadedUrl })
        toast.success(
          isVi ? `Đã tải lên file tài liệu Writing: ${file.name}` : `Uploaded writing file: ${file.name}`
        )
      } else {
        toast.error('Không nhận được đường dẫn file tải lên.')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi tải file lên máy chủ.'
      toast.error(msg)
    } finally {
      setIsUploadingWritingFile(false)
      if (writingFileInputRef.current) writingFileInputRef.current.value = ''
    }
  }

  return (
    <div className="rounded-2xl border-2 border-indigo-500/30 bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/40 p-4 sm:p-5 dark:border-indigo-500/30 dark:from-indigo-950/40 dark:via-slate-900 dark:to-purple-950/20 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-indigo-200/60 dark:border-indigo-900/60">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-sm ring-4 ring-indigo-500/20 shrink-0">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-white text-[10px] font-black tracking-wider uppercase">
                {isVi ? `Bài Test Chương ${chapterIndex + 1}` : `Chapter ${chapterIndex + 1} Test`}
              </span>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                {isVi ? 'Đánh Giá Tiến Độ & Mở Khóa' : 'Assessment & Unlock Exam'}
              </h3>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {isVi
                ? 'Học viên cần đạt ngưỡng điểm để hoàn thành chương này và được mở khóa chương tiếp theo'
                : 'Students must meet passing score to complete this chapter and unlock the next'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
            {isVi ? 'Điểm đạt tối thiểu:' : 'Passing score:'}
          </span>
          <div className="flex items-center gap-1">
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
              className="w-12 h-7 text-center rounded-lg border border-indigo-200 bg-indigo-50/50 text-xs font-black text-indigo-700 dark:bg-indigo-950 dark:border-indigo-700 dark:text-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="rounded-xl border border-slate-200/80 bg-white/90 p-3 dark:border-slate-800 dark:bg-slate-900/90 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>{isVi ? 'Ngân hàng câu hỏi trắc nghiệm' : 'Question Bank'}</span>
            </span>
            {questionCount > 0 ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 text-[11px] font-extrabold border border-emerald-300/80 dark:border-emerald-700">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>{questionCount} {isVi ? 'câu hỏi' : 'questions'}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 text-[11px] font-semibold border border-amber-300/80 dark:border-amber-700">
                <HelpCircle className="w-3 h-3 text-amber-600" />
                <span>{isVi ? 'Chưa có câu hỏi' : 'Empty'}</span>
              </span>
            )}
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {isVi
              ? 'Tải file Excel mẫu câu hỏi trắc nghiệm để nhập tự động hàng loạt câu hỏi cho chương.'
              : 'Upload Excel file to bulk import multiple choice questions for this chapter.'}
          </p>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={onOpenExcelModal}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>{isVi ? 'Upload File Excel' : 'Import Excel'}</span>
            </button>

            {questionCount > 0 && (
              <button
                type="button"
                onClick={onOpenViewerModal}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-indigo-500" />
                <span>{isVi ? 'Xem & Sửa' : 'View/Edit'}</span>
              </button>
            )}
          </div>
        </div>

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
                  onClick={() => audioInputRef.current?.click()}
                  disabled={isUploadingAudio}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-300 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isUploadingAudio ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                  <span>{isVi ? 'Đổi file audio' : 'Replace audio'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleRemoveAudio}
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
                onClick={() => audioInputRef.current?.click()}
                disabled={isUploadingAudio}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-dashed border-indigo-300 bg-indigo-50/50 hover:bg-indigo-100/70 dark:border-indigo-800 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
              >
                {isUploadingAudio ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                <span>{isVi ? '+ Tải Lên File Audio (.mp3, .wav)' : '+ Upload Audio File'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Khung đề thi Nói & Viết cho chương (khi là khóa học 4 kỹ năng) */}
      {is4Skills && (
        <div className="rounded-xl border border-indigo-200/80 bg-indigo-50/40 p-3.5 dark:border-indigo-900/50 dark:bg-indigo-950/20 space-y-3">
          <div className="flex items-center justify-between gap-2 border-b border-indigo-100 dark:border-indigo-900/50 pb-2">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-md bg-indigo-600 text-white shadow-xs">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {isVi ? `Đề Thi & Tài Liệu Kỹ Năng Nói & Viết - Chương ${chapterIndex + 1}` : `Speaking & Writing Assessment - Chapter ${chapterIndex + 1}`}
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  {isVi ? 'Nhập đề bài luyện nói / viết hoặc tải lên tài liệu đính kèm cho bài kiểm tra chương này.' : 'Enter speaking/writing prompt or upload attachment document for this chapter.'}
                </p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              4 Kỹ Năng
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Kỹ năng Nói */}
            <div className="rounded-xl border border-slate-200/90 bg-white dark:border-slate-800 dark:bg-slate-900 p-3 space-y-2.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                  <Mic className="w-3.5 h-3.5 text-amber-600" />
                  <span>1. Đề thi Luyện Nói (Speaking):</span>
                </label>
                {module.speaking_file_url && (
                  <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                    ✓ Đã có file đề
                  </span>
                )}
              </div>

              <textarea
                rows={2}
                value={module.speaking_prompt || ''}
                onChange={(e) => onUpdateModule({ speaking_prompt: e.target.value })}
                placeholder={isVi ? 'Nhập chủ đề luyện nói cho chương này...' : 'Enter speaking prompt for this chapter...'}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950 p-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 leading-relaxed resize-none"
              />

              <div className="space-y-1">
                <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 block">
                  {isVi ? 'File đề bài / Audio mẫu:' : 'Speaking Prompt / Audio File:'}
                </span>
                {module.speaking_file_url ? (
                  <div className="flex items-center justify-between p-1.5 rounded-lg bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-xs">
                    <div className="flex items-center gap-1.5 truncate">
                      <FileDown className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <a
                        href={module.speaking_file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-600 dark:text-indigo-400 font-semibold truncate hover:underline text-[11px]"
                      >
                        {isVi ? 'Xem file đề Nói đính kèm' : 'View attached file'}
                      </a>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => speakingFileInputRef.current?.click()}
                        disabled={isUploadingSpeakingFile}
                        className="px-1.5 py-0.5 text-[10px] font-bold text-slate-600 hover:text-indigo-600 dark:text-slate-300 cursor-pointer"
                      >
                        {isVi ? 'Đổi' : 'Edit'}
                      </button>
                      <button
                        type="button"
                        onClick={() => onUpdateModule({ speaking_file_url: '' })}
                        className="p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded cursor-pointer"
                        title={isVi ? 'Gỡ file' : 'Remove'}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => speakingFileInputRef.current?.click()}
                    disabled={isUploadingSpeakingFile}
                    className="w-full flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg border border-dashed border-amber-300 bg-amber-50/40 hover:bg-amber-100/60 dark:border-amber-800 dark:bg-amber-950/20 text-amber-800 dark:text-amber-200 text-[11px] font-bold transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isUploadingSpeakingFile ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                    <span>{isVi ? '+ Tải lên file đề Nói (.pdf, .docx, audio)' : '+ Upload file'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Kỹ năng Viết */}
            <div className="rounded-xl border border-slate-200/90 bg-white dark:border-slate-800 dark:bg-slate-900 p-3 space-y-2.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                  <PenTool className="w-3.5 h-3.5 text-emerald-600" />
                  <span>2. Đề thi Viết Luận (Writing):</span>
                </label>
                {module.writing_file_url && (
                  <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                    ✓ Đã có file đề
                  </span>
                )}
              </div>

              <textarea
                rows={2}
                value={module.writing_prompt || ''}
                onChange={(e) => onUpdateModule({ writing_prompt: e.target.value })}
                placeholder={isVi ? 'Nhập câu hỏi hoặc đề bài viết luận cho chương này...' : 'Enter writing prompt for this chapter...'}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950 p-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 leading-relaxed resize-none"
              />

              <div className="space-y-1">
                <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 block">
                  {isVi ? 'File tài liệu / Đề bài Viết:' : 'Writing Prompt Document:'}
                </span>
                {module.writing_file_url ? (
                  <div className="flex items-center justify-between p-1.5 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 text-xs">
                    <div className="flex items-center gap-1.5 truncate">
                      <FileDown className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <a
                        href={module.writing_file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-600 dark:text-indigo-400 font-semibold truncate hover:underline text-[11px]"
                      >
                        {isVi ? 'Xem file đề Viết đính kèm' : 'View attached file'}
                      </a>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => writingFileInputRef.current?.click()}
                        disabled={isUploadingWritingFile}
                        className="px-1.5 py-0.5 text-[10px] font-bold text-slate-600 hover:text-indigo-600 dark:text-slate-300 cursor-pointer"
                      >
                        {isVi ? 'Đổi' : 'Edit'}
                      </button>
                      <button
                        type="button"
                        onClick={() => onUpdateModule({ writing_file_url: '' })}
                        className="p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded cursor-pointer"
                        title={isVi ? 'Gỡ file' : 'Remove'}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => writingFileInputRef.current?.click()}
                    disabled={isUploadingWritingFile}
                    className="w-full flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg border border-dashed border-emerald-300 bg-emerald-50/40 hover:bg-emerald-100/60 dark:border-emerald-800 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-200 text-[11px] font-bold transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isUploadingWritingFile ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                    <span>{isVi ? '+ Tải lên file đề Viết (.pdf, .docx, hình ảnh)' : '+ Upload file'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

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

      <input
        ref={speakingFileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt,audio/*,image/*,.mp3,.wav,.png,.jpg,.jpeg"
        onChange={handleSpeakingFileUpload}
        onClick={(e) => {
          ;(e.target as HTMLInputElement).value = ''
        }}
        className="hidden"
      />

      <input
        ref={writingFileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt,image/*,.png,.jpg,.jpeg"
        onChange={handleWritingFileUpload}
        onClick={(e) => {
          ;(e.target as HTMLInputElement).value = ''
        }}
        className="hidden"
      />
    </div>
  )
}

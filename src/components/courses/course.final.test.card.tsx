/**
 * @file course.final.test.card.tsx
 * @description Card quản trị bài kiểm tra tốt nghiệp (Final Test) của khóa học gồm import Excel, quản lý câu hỏi, audio và Speaking/Writing
 */

import React, { useState, useRef } from 'react'
import {
  FileSpreadsheet,
  Eye,
  Award,
  Volume2,
  Upload,
  Trash2,
  Loader2,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  Mic,
  PenTool,
  FileDown,
} from 'lucide-react'
import { mediaAdminService } from '@/services/media.service'
import { toast } from '@/store/toast-store'
import { ExcelQuizImporterModal } from '@/components/admin/excel.quiz.importer.modal'
import { ModuleQuestionViewerModal } from '@/components/admin/module.question.viewer.modal'
import type { CourseFormData } from './course.basic.info.tab'

interface CourseFinalTestCardProps {
  formData: CourseFormData
  onChange: (updated: Partial<CourseFormData>) => void
  isVi: boolean
}

export function CourseFinalTestCard({ formData, onChange, isVi }: CourseFinalTestCardProps) {
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false)
  const [isViewerModalOpen, setIsViewerModalOpen] = useState(false)
  const [isUploadingFinalAudio, setIsUploadingFinalAudio] = useState(false)
  const [isUploadingSpeakingFile, setIsUploadingSpeakingFile] = useState(false)
  const [isUploadingWritingFile, setIsUploadingWritingFile] = useState(false)

  const finalAudioInputRef = useRef<HTMLInputElement>(null)
  const speakingFileInputRef = useRef<HTMLInputElement>(null)
  const writingFileInputRef = useRef<HTMLInputElement>(null)

  const finalQuestionsCount = formData.final_test_questions?.length || 0

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
    onChange({
      ...formData,
      final_test_audio_url: '',
    })
    toast.success(isVi ? 'Đã gỡ file nghe khỏi bài thi Final Test' : 'Removed audio from final test')
  }

  const handleSpeakingFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 50 * 1024 * 1024) {
      toast.error('Dung lượng file đề nói không được vượt quá 50MB')
      return
    }

    setIsUploadingSpeakingFile(true)
    try {
      const res = await mediaAdminService.uploadFile(file, 'quiz-audio')
      const uploadedUrl = res.file_url || res.url || res.public_url
      if (uploadedUrl) {
        onChange({
          ...formData,
          final_test_speaking_file_url: uploadedUrl,
        })
        toast.success(`Đã tải lên file đề thi Nói: ${file.name}`)
      } else {
        toast.error('Không nhận được đường dẫn file từ máy chủ.')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi tải file đề nói.'
      toast.error(msg)
    } finally {
      setIsUploadingSpeakingFile(false)
      if (speakingFileInputRef.current) speakingFileInputRef.current.value = ''
    }
  }

  const handleWritingFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 30 * 1024 * 1024) {
      toast.error('Dung lượng file đề viết không được vượt quá 30MB')
      return
    }

    setIsUploadingWritingFile(true)
    try {
      const res = await mediaAdminService.uploadFile(file, 'documents')
      const uploadedUrl = res.file_url || res.url || res.public_url
      if (uploadedUrl) {
        onChange({
          ...formData,
          final_test_writing_file_url: uploadedUrl,
        })
        toast.success(`Đã tải lên file đề thi Viết: ${file.name}`)
      } else {
        toast.error('Không nhận được đường dẫn file từ máy chủ.')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi tải file đề viết.'
      toast.error(msg)
    } finally {
      setIsUploadingWritingFile(false)
      if (writingFileInputRef.current) writingFileInputRef.current.value = ''
    }
  }

  return (
    <div className="rounded-2xl border border-indigo-500/20 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600/15 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 ring-1 ring-indigo-500/30">
            <Award className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {isVi ? '2. Bài kiểm tra Tốt nghiệp Khóa học (Final Test)' : '2. Course Final Test (Graduation Test)'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isVi
                ? 'Upload đề thi tốt nghiệp cuối khóa từ file Excel (.xlsx).'
                : 'Upload graduation final exam from Excel file (.xlsx).'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-200/80 bg-white/90 p-4 dark:border-slate-800 dark:bg-slate-900/90 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>{isVi ? 'Ngân hàng câu hỏi Final Test' : 'Question Bank'}</span>
              </span>
              {finalQuestionsCount > 0 ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 text-[11px] font-extrabold border border-emerald-300/80 dark:border-emerald-700">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>{finalQuestionsCount} {isVi ? 'câu hỏi' : 'questions'}</span>
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
                ? 'Tải file Excel để nạp tự động hàng loạt câu hỏi cho đề thi tốt nghiệp cuối khóa.'
                : 'Upload Excel file to bulk import graduation test questions.'}
            </p>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsExcelModalOpen(true)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Upload File Excel (.xlsx)</span>
            </button>

            {finalQuestionsCount > 0 && (
              <button
                type="button"
                onClick={() => setIsViewerModalOpen(true)}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-indigo-500" />
                <span>{isVi ? 'Xem & Sửa' : 'View/Edit'}</span>
              </button>
            )}
          </div>
        </div>

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
        </div>
      </div>

      {formData.category === 'TOEIC_4_SKILLS' && (
        <div className="rounded-2xl border border-indigo-200/80 bg-indigo-50/30 p-4 dark:border-indigo-900/50 dark:bg-indigo-950/20 space-y-4">
          <div className="flex items-center justify-between gap-2 border-b border-indigo-100 dark:border-indigo-900/50 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-600 text-white shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Đề Thi & Tài Liệu Cho 2 Kỹ Năng Nói & Viết (Speaking & Writing)
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Giáo viên có thể nhập đề bài hoặc tải lên file đề đính kèm (.pdf, .docx, audio, hình ảnh) để học viên đọc và làm bài.
                </p>
              </div>
            </div>

            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              TOEIC 4 Kỹ Năng
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-200/90 bg-white dark:border-slate-800 dark:bg-slate-900 p-4 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                  <Mic className="w-4 h-4 text-amber-600" />
                  <span>1. Đề thi Luyện Nói (Speaking Test):</span>
                </label>
                {formData.final_test_speaking_file_url && (
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                    ✓ Đã có file đề
                  </span>
                )}
              </div>

              <textarea
                rows={3}
                value={formData.final_test_speaking_prompt || ''}
                onChange={(e) => onChange({ ...formData, final_test_speaking_prompt: e.target.value })}
                placeholder="Nhập câu hỏi hoặc chủ đề luyện nói cho học viên (ví dụ: Please introduce yourself and talk about your favorite vacation in 1-2 minutes)..."
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950 p-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500 leading-relaxed"
              />

              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block">
                  File đề bài / Audio mẫu kỹ năng Nói:
                </span>
                {formData.final_test_speaking_file_url ? (
                  <div className="flex items-center justify-between p-2 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <FileDown className="w-4 h-4 text-amber-600 shrink-0" />
                      <a
                        href={formData.final_test_speaking_file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-600 dark:text-indigo-400 font-semibold truncate hover:underline"
                      >
                        Xem file đề Nói đính kèm
                      </a>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => speakingFileInputRef.current?.click()}
                        disabled={isUploadingSpeakingFile}
                        className="px-2 py-1 text-[11px] font-bold text-slate-600 hover:text-indigo-600 dark:text-slate-300 cursor-pointer"
                      >
                        Đổi file
                      </button>
                      <button
                        type="button"
                        onClick={() => onChange({ ...formData, final_test_speaking_file_url: '' })}
                        className="p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg cursor-pointer"
                        title="Gỡ file"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => speakingFileInputRef.current?.click()}
                    disabled={isUploadingSpeakingFile}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-dashed border-amber-300 bg-amber-50/40 hover:bg-amber-100/60 dark:border-amber-800 dark:bg-amber-950/20 text-amber-800 dark:text-amber-200 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isUploadingSpeakingFile ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    <span>+ Tải lên file đề Nói (.pdf, .docx, .mp3, .wav)</span>
                  </button>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200/90 bg-white dark:border-slate-800 dark:bg-slate-900 p-4 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                  <PenTool className="w-4 h-4 text-emerald-600" />
                  <span>2. Đề thi Viết Luận (Writing Test):</span>
                </label>
                {formData.final_test_writing_file_url && (
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                    ✓ Đã có file đề
                  </span>
                )}
              </div>

              <textarea
                rows={3}
                value={formData.final_test_writing_prompt || ''}
                onChange={(e) => onChange({ ...formData, final_test_writing_prompt: e.target.value })}
                placeholder="Nhập đề bài viết luận cho học viên (ví dụ: Write a paragraph of 100-150 words describing advantages and disadvantages of remote work)..."
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950 p-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 leading-relaxed"
              />

              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block">
                  File đề bài / Tài liệu hướng dẫn Viết:
                </span>
                {formData.final_test_writing_file_url ? (
                  <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <FileDown className="w-4 h-4 text-emerald-600 shrink-0" />
                      <a
                        href={formData.final_test_writing_file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-600 dark:text-indigo-400 font-semibold truncate hover:underline"
                      >
                        Xem file đề Viết đính kèm
                      </a>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => writingFileInputRef.current?.click()}
                        disabled={isUploadingWritingFile}
                        className="px-2 py-1 text-[11px] font-bold text-slate-600 hover:text-indigo-600 dark:text-slate-300 cursor-pointer"
                      >
                        Đổi file
                      </button>
                      <button
                        type="button"
                        onClick={() => onChange({ ...formData, final_test_writing_file_url: '' })}
                        className="p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg cursor-pointer"
                        title="Gỡ file"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => writingFileInputRef.current?.click()}
                    disabled={isUploadingWritingFile}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-dashed border-emerald-300 bg-emerald-50/40 hover:bg-emerald-100/60 dark:border-emerald-800 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-200 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isUploadingWritingFile ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    <span>+ Tải lên file đề Viết (.pdf, .docx, .png, .jpg)</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <input
        ref={speakingFileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.mp3,.wav,.m4a"
        onChange={handleSpeakingFileUpload}
        onClick={(e) => {
          ;(e.target as HTMLInputElement).value = ''
        }}
        className="hidden"
      />

      <input
        ref={writingFileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.txt"
        onChange={handleWritingFileUpload}
        onClick={(e) => {
          ;(e.target as HTMLInputElement).value = ''
        }}
        className="hidden"
      />

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

      <ExcelQuizImporterModal
        key="final-test-excel-modal"
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
        onApplyQuestions={(q, mode = 'append', audioUrl?: string) => {
          const existing = formData.final_test_questions || []
          const combined = mode === 'append' ? [...existing, ...q] : q
          onChange({
            final_test_questions: combined,
            ...(audioUrl !== undefined ? { final_test_audio_url: audioUrl } : {}),
          })
        }}
        initialAudioUrl={formData.final_test_audio_url}
        moduleTitle={`Final Test Khóa Học: ${formData.title || 'Khóa học'}`}
        existingQuestionsCount={formData.final_test_questions?.length || 0}
      />

      <ModuleQuestionViewerModal
        key="final-test-viewer-modal"
        isOpen={isViewerModalOpen}
        onClose={() => setIsViewerModalOpen(false)}
        questions={formData.final_test_questions || []}
        onSaveQuestions={(q) => onChange({ final_test_questions: q })}
        moduleTitle={formData.title || 'Khóa học'}
        testTitle={`Bài Kiểm Tra Tốt Nghiệp Final Test`}
      />
    </div>
  )
}

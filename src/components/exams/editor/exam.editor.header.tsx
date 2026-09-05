/**
 * @file exam.editor.header.tsx
 * @description Header và thanh công cụ tìm kiếm, lọc part thi và các nút chức năng trong modal soạn ngân hàng câu hỏi đề thi
 */

import {
  Archive,
  BookOpen,
  Download,
  Loader2,
  Mic,
  PenTool,
  Plus,
  Search,
  Volume2,
  X,
} from 'lucide-react'
import type { ToeicExamItem } from '@/services/exam.service'

interface ExamEditorHeaderProps {
  exam: ToeicExamItem
  isVi: boolean
  is4Skills: boolean
  isSystemPlacement: boolean
  questionsCount: number
  searchQuery: string
  partFilter: string
  isProcessingZip: boolean
  uploadingGlobalAudio: boolean
  globalAudioUrl: string
  onClose: () => void
  onSearchChange: (val: string) => void
  onPartFilterChange: (val: string) => void
  onDownloadSampleZip: () => void
  onOpenZipPicker: () => void
  onOpenGlobalAudioPicker: () => void
  onAddQuestion: (partNum?: number | string) => void
}

export function ExamEditorHeader({
  exam,
  isVi,
  is4Skills,
  isSystemPlacement,
  questionsCount,
  searchQuery,
  partFilter,
  isProcessingZip,
  uploadingGlobalAudio,
  globalAudioUrl,
  onClose,
  onSearchChange,
  onPartFilterChange,
  onDownloadSampleZip,
  onOpenZipPicker,
  onOpenGlobalAudioPicker,
  onAddQuestion,
}: ExamEditorHeaderProps) {
  return (
    <>
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-indigo-600/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-200/50 dark:border-indigo-800/50">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                {isVi ? 'Soạn Ngân Hàng Câu Hỏi Đề Thi' : 'Exam Question Bank Editor'}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                {questionsCount} câu hỏi
              </span>
              {isSystemPlacement ? (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  {isVi ? 'Đầu vào hệ thống (ZIP)' : 'System Placement (ZIP)'}
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  {isVi ? 'Bài thi khóa học' : 'Course Exam'}
                </span>
              )}
              {is4Skills ? (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                  4 Kỹ năng (LRSW)
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
                  2 Kỹ năng (LR)
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5 line-clamp-1">
              {exam.title} {exam.course_title ? `• ${exam.course_title}` : ''}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-6 py-3 border-b border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={isVi ? 'Tìm kiếm theo nội dung, câu số...' : 'Search questions...'}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <select
            value={partFilter}
            onChange={(e) => onPartFilterChange(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
          >
            <option value="ALL">{isVi ? 'Tất cả phần' : 'All Parts'}</option>
            <option value="1">Part 1 (Ảnh)</option>
            <option value="2">Part 2 (Hỏi đáp)</option>
            <option value="3">Part 3 (Hội thoại)</option>
            <option value="4">Part 4 (Bài nói)</option>
            <option value="5">Part 5 (Điền câu)</option>
            <option value="6">Part 6 (Điền đoạn)</option>
            <option value="7">Part 7 (Đọc hiểu)</option>
            {is4Skills && (
              <>
                <option value="speaking">Speaking (Nói)</option>
                <option value="writing">Writing (Viết)</option>
              </>
            )}
          </select>
        </div>

        <div className="flex items-center gap-2 justify-end flex-wrap">
          {isSystemPlacement ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onDownloadSampleZip}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                title={isVi ? 'Tải xuống gói ZIP đề thi mẫu chuẩn' : 'Download sample ZIP'}
              >
                <Download className="w-3.5 h-3.5 text-indigo-500" />
                <span>{isVi ? 'Tải ZIP mẫu' : 'Sample ZIP'}</span>
              </button>

              <button
                type="button"
                disabled={isProcessingZip}
                onClick={onOpenZipPicker}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold shadow-xs hover:shadow-purple-500/20 transition-all cursor-pointer"
                title={isVi ? 'Mở cửa sổ chọn file ZIP đề thi' : 'Choose ZIP file'}
              >
                {isProcessingZip ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{isVi ? 'Đang nạp ZIP...' : 'Importing...'}</span>
                  </>
                ) : (
                  <>
                    <Archive className="w-4 h-4" />
                    <span>
                      {isVi ? 'Import Gói ZIP (Excel + Media)' : 'Import ZIP Package'}
                    </span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={onOpenGlobalAudioPicker}
                disabled={uploadingGlobalAudio}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                title={
                  isVi
                    ? 'Upload file nghe chung cho toàn đề thi'
                    : 'Upload global audio file'
                }
              >
                <Volume2 className="w-3.5 h-3.5 text-indigo-500" />
                <span>
                  {uploadingGlobalAudio
                    ? isVi
                      ? 'Đang tải...'
                      : 'Uploading...'
                    : globalAudioUrl
                      ? isVi
                        ? 'Đổi Audio Đề'
                        : 'Change Audio'
                      : isVi
                        ? 'Gắn Audio Đề'
                        : 'Set Audio'}
                </span>
              </button>

              {is4Skills && (
                <>
                  <button
                    type="button"
                    onClick={() => onAddQuestion('speaking')}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-teal-950/40 hover:bg-teal-100 text-teal-700 dark:text-teal-300 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Mic className="w-3.5 h-3.5 text-teal-600" />
                    <span>+ {isVi ? 'Nói' : 'Speaking'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onAddQuestion('writing')}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 text-blue-700 dark:text-blue-300 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <PenTool className="w-3.5 h-3.5 text-blue-600" />
                    <span>+ {isVi ? 'Viết' : 'Writing'}</span>
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={() =>
                  onAddQuestion(
                    partFilter !== 'ALL' && !isNaN(Number(partFilter))
                      ? Number(partFilter)
                      : 5
                  )
                }
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs hover:shadow-indigo-500/20 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isVi ? 'Thêm câu hỏi' : 'Add Question'}</span>
              </button>
            </>
          )}
        </div>
      </div>
    </>
  )
}

/**
 * @file chapter.speaking.writing.card.tsx
 * @description Component quản lý đề thi và tài liệu đính kèm cho kỹ năng Nói & Viết trong bài test chương
 */

import { RefObject } from 'react'
import {
  Sparkles,
  Mic,
  PenTool,
  FileDown,
  Loader2,
  Upload,
  Trash2,
} from 'lucide-react'
import type { CourseModule } from './course.basic.info.tab'

interface ChapterSpeakingWritingCardProps {
  module: CourseModule
  chapterIndex: number
  isVi: boolean
  isUploadingSpeakingFile: boolean
  isUploadingWritingFile: boolean
  speakingFileInputRef: RefObject<HTMLInputElement | null>
  writingFileInputRef: RefObject<HTMLInputElement | null>
  onUpdateModule: (updated: Partial<CourseModule>) => void
}

export function ChapterSpeakingWritingCard({
  module,
  chapterIndex,
  isVi,
  isUploadingSpeakingFile,
  isUploadingWritingFile,
  speakingFileInputRef,
  writingFileInputRef,
  onUpdateModule,
}: ChapterSpeakingWritingCardProps) {
  return (
    <div className="rounded-xl border border-indigo-200/80 bg-indigo-50/40 p-3.5 dark:border-indigo-900/50 dark:bg-indigo-950/20 space-y-3">
      <div className="flex items-center justify-between gap-2 border-b border-indigo-100 dark:border-indigo-900/50 pb-2">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-indigo-600 text-white shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
              {isVi
                ? `Đề Thi & Tài Liệu Kỹ Năng Nói & Viết - Chương ${chapterIndex + 1}`
                : `Speaking & Writing Assessment - Chapter ${chapterIndex + 1}`}
            </h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              {isVi
                ? 'Nhập đề bài luyện nói / viết hoặc tải lên tài liệu đính kèm cho bài kiểm tra chương này.'
                : 'Enter speaking/writing prompt or upload attachment document for this chapter.'}
            </p>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
          4 Kỹ Năng
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
  )
}

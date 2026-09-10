// Khu vuc keo tha va nap file ZIP hoac RAR de thi.

import React from 'react'
import { FolderArchive, Archive, Download, Loader2 } from 'lucide-react'

interface ExamZipDropzoneProps {
  isVi: boolean
  is4Skills?: boolean
  isProcessingZip: boolean
  zipProcessStatus: string
  zipProgress: { current: number; total: number } | null
  isDragOverZip: boolean
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void
  onDragLeave: () => void
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void
  onOpenZipPicker: () => void
  onDownloadSampleZip: () => void
}

export function ExamZipDropzone({
  isVi,
  is4Skills = false,
  isProcessingZip,
  zipProcessStatus,
  zipProgress,
  isDragOverZip,
  onDragOver,
  onDragLeave,
  onDrop,
  onOpenZipPicker,
  onDownloadSampleZip,
}: ExamZipDropzoneProps) {
  if (isProcessingZip) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-3xl border-2 border-dashed border-purple-300 dark:border-purple-800 bg-purple-50/30 dark:bg-purple-950/20 space-y-4 animate-pulse">
        <div className="w-16 h-16 rounded-3xl bg-purple-600/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
        <div className="max-w-md space-y-1">
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            {zipProcessStatus || (isVi ? 'Đang giải nén và nạp câu hỏi từ file nén...' : 'Processing archive package...')}
          </h4>
          {zipProgress && (
            <p className="text-xs font-bold text-purple-600 dark:text-purple-400">
              {zipProgress.current} / {zipProgress.total} file
            </p>
          )}
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isVi
              ? 'Hệ thống đang tự động trích xuất bảng Excel và tải lên file âm thanh, hình ảnh. Vui lòng chờ...'
              : 'Unpacking spreadsheet and uploading media assets...'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`flex flex-col items-center justify-center py-14 px-6 text-center rounded-3xl border-2 border-dashed transition-all bg-white dark:bg-slate-900 space-y-4 ${
        isDragOverZip
          ? 'border-purple-500 bg-purple-50/40 dark:bg-purple-950/30 scale-[1.01]'
          : 'border-slate-200 dark:border-slate-800'
      }`}
    >
      <div className="w-16 h-16 rounded-3xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shadow-xs">
        <FolderArchive className="w-8 h-8" />
      </div>

      <div className="max-w-md space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
          <span>
            {is4Skills
              ? isVi ? 'Cấu hình: TOEIC 4 Kỹ năng (Nghe, Đọc, Nói, Viết)' : 'Scope: TOEIC 4 Skills (LRSW)'
              : isVi ? 'Cấu hình: TOEIC 2 Kỹ năng (Chỉ bao gồm Nghe & Đọc)' : 'Scope: TOEIC 2 Skills (Listening & Reading only)'}
          </span>
        </div>

        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
          {isVi ? 'Kéo thả hoặc chọn file ZIP / RAR / Excel đề thi' : 'Drag & drop or select Exam ZIP / RAR / Excel file'}
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          {isVi
            ? is4Skills
              ? 'Gói nén ZIP / RAR gồm questions.xlsx (chứa các câu hỏi Nghe, Đọc, Nói, Viết) và thư mục media chứa audio/ảnh minh họa.'
              : 'Gói nén ZIP / RAR gồm questions.xlsx (chỉ chấp nhận kỹ năng Nghe và Đọc) và thư mục media chứa audio/ảnh minh họa.'
            : is4Skills
              ? 'ZIP or RAR archive containing questions.xlsx (Listening, Reading, Speaking, Writing) and media files.'
              : 'ZIP or RAR archive containing questions.xlsx (Listening & Reading only) and media files.'}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <button
          type="button"
          disabled={isProcessingZip}
          onClick={onOpenZipPicker}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold transition-all cursor-pointer shadow-xs hover:shadow-purple-500/20"
        >
          <Archive className="w-4 h-4" />
          <span>{isVi ? 'Chọn file từ máy tính' : 'Choose File'}</span>
        </button>

        <button
          type="button"
          onClick={onDownloadSampleZip}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer"
        >
          <Download className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <span>
            {isVi
              ? is4Skills ? 'Tải Gói ZIP Mẫu 4 Kỹ Năng' : 'Tải Gói ZIP Mẫu 2 Kỹ Năng'
              : is4Skills ? 'Download 4-Skills Sample ZIP' : 'Download 2-Skills Sample ZIP'}
          </span>
        </button>
      </div>
    </div>
  )
}

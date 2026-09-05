/**
 * @file exam.zip.dropzone.tsx
 * @description Khu vực kéo thả và nạp file ZIP đề thi kèm tài nguyên âm thanh/hình ảnh
 */

import React from 'react'
import { FolderArchive, Archive, Download, Loader2 } from 'lucide-react'

interface ExamZipDropzoneProps {
  isVi: boolean
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
            {zipProcessStatus || (isVi ? 'Đang giải nén và nạp câu hỏi từ file ZIP...' : 'Processing ZIP package...')}
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

      <div className="max-w-md space-y-1.5">
        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
          {isVi ? 'Kéo thả hoặc chọn file ZIP đề thi' : 'Drag & drop or select Exam ZIP file'}
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          {isVi
            ? 'Gói ZIP gồm file questions.xlsx cùng các file âm thanh (.mp3) và ảnh (.jpg/.png). Nhấn nút bên dưới để chọn file và nạp ngay vào đề thi.'
            : 'ZIP archive contains questions.xlsx spreadsheet and audio/image media files.'}
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
          <span>{isVi ? 'Chọn file ZIP từ máy tính' : 'Choose ZIP File'}</span>
        </button>

        <button
          type="button"
          onClick={onDownloadSampleZip}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer"
        >
          <Download className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <span>{isVi ? 'Tải Gói ZIP Mẫu Chuẩn' : 'Download Sample ZIP'}</span>
        </button>
      </div>
    </div>
  )
}

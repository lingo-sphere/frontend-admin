/**
 * @file r2.media.uploader.tsx
 * @description Component upload file media (hình ảnh, video bài giảng) trực tiếp lên Cloudflare R2 kèm hiển thị tiến trình
 */

import {
  UploadCloud,
  AlertCircle,
  Loader2,
  Film,
  Image as ImageIcon,
  FileText,
  X,
} from 'lucide-react'
import { VideoPreviewModal } from '@/components/video.preview.modal'
import { useR2Uploader, resolveStreamUrl } from '@/features/media/hooks/use.r2.uploader'
import { R2MediaPreviewCard } from '@/features/media/components/r2.media.preview.card'

interface R2MediaUploaderProps {
  type: 'image' | 'video' | 'document'
  value: string
  onChange: (url: string) => void
  fileName?: string
  onFileNameChange?: (fileName: string) => void
  onDurationChange?: (durationMinutes: number, durationSeconds: number) => void
  folder?: string
  label?: string
  isVi?: boolean
  className?: string
}

export function R2MediaUploader({
  type,
  value,
  onChange,
  fileName,
  onFileNameChange,
  onDurationChange,
  folder = 'courses',
  label,
  isVi = true,
  className = '',
}: R2MediaUploaderProps) {
  const {
    isUploading,
    uploadProgress,
    uploadBytes,
    error,
    isDragging,
    setIsDragging,
    fileInputRef,
    showPreviewModal,
    setShowPreviewModal,
    isVideo,
    isDocument,
    acceptTypes,
    handleFileSelect,
    handleDrop,
    handleRemove,
  } = useR2Uploader({
    type,
    value,
    onChange,
    fileName,
    onFileNameChange,
    onDurationChange,
    folder,
    isVi,
  })

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        {label && (
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            {isVideo ? (
              <Film className="w-3.5 h-3.5 text-indigo-500" />
            ) : isDocument ? (
              <FileText className="w-3.5 h-3.5 text-indigo-500" />
            ) : (
              <ImageIcon className="w-3.5 h-3.5 text-indigo-500" />
            )}
            <span>{label}</span>
          </label>
        )}
      </div>

      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptTypes}
          className="hidden"
          onClick={(e) => {
            ;(e.target as HTMLInputElement).value = ''
          }}
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileSelect(e.target.files[0])
            }
          }}
        />

        {value ? (
          <R2MediaPreviewCard
            value={value}
            isVideo={isVideo}
            isDocument={isDocument}
            fileName={fileName}
            isVi={isVi}
            onPreview={() => {
              if (isDocument) {
                window.open(resolveStreamUrl(value) || value, '_blank')
              } else {
                setShowPreviewModal(true)
              }
            }}
            onChangeFile={() => {
              if (fileInputRef.current) fileInputRef.current.value = ''
              fileInputRef.current?.click()
            }}
            onRemove={handleRemove}
          />
        ) : isUploading ? (
          <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/50 dark:border-indigo-900/40 dark:bg-indigo-950/20 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-indigo-700 dark:text-indigo-300">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                <span>
                  {uploadProgress >= 99
                    ? isVideo
                      ? isVi
                        ? 'Đang hoàn tất tải lên & khởi tạo luồng HLS...'
                        : 'Finalizing upload & initiating HLS stream...'
                      : isVi
                      ? 'Đang xử lý & lưu trữ file...'
                      : 'Processing & finalizing...'
                    : isVi
                    ? `Đang tải ${isVideo ? 'video' : isDocument ? 'tài liệu' : 'ảnh'} lên máy chủ...`
                    : `Uploading ${isVideo ? 'video' : isDocument ? 'document' : 'image'}...`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {uploadBytes && uploadBytes.total > 0 && (
                  <span className="text-[11px] text-indigo-600/70 dark:text-indigo-400/70 font-medium">
                    {(uploadBytes.loaded / (1024 * 1024)).toFixed(1)} /{' '}
                    {(uploadBytes.total / (1024 * 1024)).toFixed(1)} MB
                  </span>
                )}
                <span className="font-bold">{uploadProgress}%</span>
              </div>
            </div>
            <div className="h-1.5 w-full rounded-full bg-indigo-100 dark:bg-indigo-900/40 overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all duration-150"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragging(true)
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center p-5 rounded-xl border-2 border-dashed transition-all cursor-pointer text-center ${
              isDragging
                ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30'
                : 'border-slate-200 bg-slate-50/70 hover:border-indigo-400 hover:bg-indigo-50/20 dark:border-slate-800 dark:bg-slate-950/40'
            }`}
          >
            <div className="h-9 w-9 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-2 shadow-xs">
              {isDocument ? <FileText className="w-5 h-5" /> : <UploadCloud className="w-5 h-5" />}
            </div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {isVi
                ? `Kéo thả hoặc bấm để tải lên ${isVideo ? 'Video bài giảng' : isDocument ? 'File tài liệu lý thuyết' : 'Ảnh Thumbnail'}`
                : `Drop or click to upload ${isVideo ? 'Video' : isDocument ? 'Theory Document' : 'Thumbnail'}`}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {isVideo
                ? isVi
                  ? 'Hỗ trợ MP4, WebM, QuickTime (Tối đa 200MB) • Tối ưu hóa bài giảng'
                  : 'Supports MP4, WebM, MOV (Max 200MB) • Lesson optimized'
                : isDocument
                ? isVi
                  ? 'Hỗ trợ PDF, Word (.doc, .docx), PowerPoint (.ppt, .pptx), ZIP (Tối đa 100MB)'
                  : 'Supports PDF, Word, PowerPoint, ZIP (Max 100MB)'
                : isVi
                ? 'Hỗ trợ PNG, JPG, WebP (Tối đa 10MB) • Tối ưu chuẩn tỉ lệ 16:9'
                : 'Supports PNG, JPG, WebP (Max 10MB) • 16:9 ratio'}
            </p>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-1.5 text-xs text-rose-500 font-medium mt-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {showPreviewModal && value && isVideo && (
        <VideoPreviewModal
          isOpen={showPreviewModal}
          onClose={() => setShowPreviewModal(false)}
          videoUrl={value}
          title={label || (isVi ? 'Xem trước video bài giảng' : 'Lesson Video Preview')}
          isVi={isVi}
        />
      )}

      {showPreviewModal && value && !isVideo && !isDocument && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200"
          onClick={() => setShowPreviewModal(false)}
        >
          <div
            className="relative w-full max-w-3xl overflow-hidden rounded-2xl bg-slate-950/95 border border-slate-700/60 shadow-2xl shadow-black/80"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-3.5 border-b border-slate-800 bg-slate-950">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-slate-200 truncate max-w-md">
                  {label || (isVi ? 'Xem trước ảnh' : 'Image Preview')}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 bg-black/60 flex items-center justify-center min-h-[300px]">
              <img
                src={resolveStreamUrl(value)}
                alt="Preview"
                className="max-h-[70vh] max-w-full object-contain rounded-xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

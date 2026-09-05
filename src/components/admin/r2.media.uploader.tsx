/**
 * @file R2MediaUploader.tsx
 * @description Component giao diện R2MediaUploader phục vụ khu vực Quản trị Admin
 */

import { useState, useRef, useEffect } from 'react'
import {
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  Play,
  Film,
  Image as ImageIcon,
  ExternalLink,
  RefreshCw,
  HardDrive,
  X,
  Eye,
} from 'lucide-react'
import { mediaService } from '@/services/media.service'
import { API_CONFIG } from '@/config/api.config'
import { VideoPreviewModal, videoDimensionsCache } from '@/components/common/video.preview.modal'

const resolveStreamUrl = (url: string) => {
  if (!url) return ''
  if (url.includes('pub-') || url.includes('r2.cloudflarestorage.com') || url.includes('.r2.dev')) {
    try {
      const parsed = new URL(url)
      return `${API_CONFIG.BASE_URL}/media/stream${parsed.pathname}`
    } catch {
      return url
    }
  }
  return url
}

interface R2MediaUploaderProps {
  type: 'image' | 'video'
  value: string
  onChange: (url: string) => void
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
  onDurationChange,
  folder = 'courses',
  label,
  isVi = true,
  className = '',
}: R2MediaUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadBytes, setUploadBytes] = useState<{ loaded: number; total: number } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const isVideo = type === 'video'
  const acceptTypes = isVideo ? 'video/mp4,video/webm,video/quicktime,video/x-matroska' : 'image/png,image/jpeg,image/webp,image/gif'

  const readVideoDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      try {
        const video = document.createElement('video')
        video.preload = 'metadata'
        video.muted = true
        video.playsInline = true
        const objUrl = URL.createObjectURL(file)

        let done = false
        const finish = (dur: number) => {
          if (!done) {
            done = true
            try {
              URL.revokeObjectURL(objUrl)
            } catch {}
            resolve(dur && !isNaN(dur) && isFinite(dur) ? dur : 0)
          }
        }

        video.onloadedmetadata = () => finish(video.duration)
        video.ondurationchange = () => finish(video.duration)
        video.onloadeddata = () => finish(video.duration)
        video.onerror = () => finish(0)
        setTimeout(() => finish(video.duration || 0), 3000)

        video.src = objUrl
        video.load()
      } catch {
        resolve(0)
      }
    })
  }

  useEffect(() => {
    if (isVideo && value && onDurationChange) {
      const streamUrl = resolveStreamUrl(value)
      const video = document.createElement('video')
      video.preload = 'metadata'
      video.muted = true
      let done = false
      const onDone = () => {
        if (video.videoWidth && video.videoHeight) {
          const dims = { width: video.videoWidth, height: video.videoHeight }
          videoDimensionsCache.set(value, dims)
          videoDimensionsCache.set(streamUrl, dims)
        }
        if (!done && video.duration && !isNaN(video.duration) && isFinite(video.duration) && video.duration > 0) {
          done = true
          const durSec = Math.round(video.duration)
          const mins = durSec >= 60 ? Math.round(durSec / 60) : Number((durSec / 60).toFixed(2))
          onDurationChange(mins, durSec)
        }
      }
      video.onloadedmetadata = onDone
      video.ondurationchange = onDone
      video.onloadeddata = onDone
      video.onerror = () => {}
      setTimeout(onDone, 3000)
      video.src = streamUrl
      video.load()
    }
  }, [value, isVideo])

  const handleFileSelect = async (file: File) => {
    if (!file) return

    const maxSize = isVideo ? 200 * 1024 * 1024 : 10 * 1024 * 1024
    if (file.size > maxSize) {
      setError(
        isVi
          ? `File vượt quá dung lượng cho phép (${isVideo ? '200MB' : '10MB'})`
          : `File exceeds maximum size (${isVideo ? '200MB' : '10MB'})`
      )
      return
    }

    if (isVideo && onDurationChange) {
      readVideoDuration(file).then((durSec) => {
        if (durSec > 0) {
          const roundedSec = Math.round(durSec)
          const mins = roundedSec >= 60 ? Math.round(roundedSec / 60) : Number((roundedSec / 60).toFixed(2))
          onDurationChange(mins, roundedSec)
        }
      })
    }

    setIsUploading(true)
    setError(null)
    setUploadProgress(0)
    setUploadBytes({ loaded: 0, total: file.size })

    try {
      const response = await mediaService.uploadFile(
        file,
        folder,
        (percent, loaded, total) => {
          setUploadProgress(percent)
          setUploadBytes({ loaded, total })
        }
      )
      setUploadProgress(100)
      setUploadBytes({ loaded: file.size, total: file.size })

      const uploadedUrl =
        response?.file_url ||
        response?.url ||
        response?.public_url

      if (uploadedUrl) {
        onChange(uploadedUrl)
        setError(null)
      } else {
        throw new Error('Máy chủ không trả về đường dẫn file')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : (isVi ? 'Lỗi tải file lên hệ thống lưu trữ' : 'Upload error')
      setError(msg)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange('')
    setError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {}
      <div className="flex items-center justify-between">
        {label && (
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            {isVideo ? <Film className="w-3.5 h-3.5 text-indigo-500" /> : <ImageIcon className="w-3.5 h-3.5 text-indigo-500" />}
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

            <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/40 dark:bg-emerald-950/20">
              <div
                onClick={() => setShowPreviewModal(true)}
                className="flex items-center gap-3 overflow-hidden cursor-pointer group flex-1"
                title={isVi ? (isVideo ? 'Bấm để xem trước video đã tải lên' : 'Bấm để xem ảnh phóng to') : (isVideo ? 'Click to preview video' : 'Click to preview image')}
              >
                {!isVideo && (
                  <div className="h-12 w-20 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-black/5 dark:border-slate-800 relative">
                    <img src={resolveStreamUrl(value)} alt="Preview" className="h-full w-full object-cover group-hover:opacity-90 transition-opacity" />
                  </div>
                )}
                {isVideo && (
                  <div className="h-12 w-20 shrink-0 overflow-hidden rounded-lg border border-indigo-200 bg-indigo-950 flex items-center justify-center text-white relative group-hover:bg-indigo-900 transition-colors">
                    <Play className="w-5 h-5 fill-white group-hover:scale-110 transition-transform" />
                  </div>
                )}

                <div className="space-y-0.5 overflow-hidden">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span className="truncate">{value.split('/').pop() || 'media-file'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    <span className="inline-flex items-center gap-1 rounded bg-emerald-100 dark:bg-emerald-900/40 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-300">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      {isVi ? 'Đã lưu trữ an toàn' : 'Stored securely'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(true)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950 dark:hover:bg-indigo-900 text-[11px] font-bold text-indigo-700 dark:text-indigo-300 transition-colors cursor-pointer"
                  title={isVideo ? (isVi ? 'Phát video xem trước' : 'Play video preview') : (isVi ? 'Xem ảnh phóng to' : 'View image preview')}
                >
                  {isVideo ? (
                    <>
                      <Play className="w-3 h-3 fill-indigo-700 dark:fill-indigo-300" />
                      <span>{isVi ? 'Phát video' : 'Play'}</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5 text-indigo-700 dark:text-indigo-300" />
                      <span>{isVi ? 'Xem' : 'View'}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (fileInputRef.current) fileInputRef.current.value = ''
                    fileInputRef.current?.click()
                  }}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                  title="Thay thế file khác"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>{isVi ? 'Đổi' : 'Change'}</span>
                </button>

                <a
                  href={value}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
                  title="Mở trong tab mới"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  type="button"
                  onClick={handleRemove}
                  className="p-1.5 rounded-lg border border-rose-200 text-rose-500 hover:bg-rose-50 dark:border-rose-900/40 dark:hover:bg-rose-900/20 transition-colors cursor-pointer"
                  title="Xóa file"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
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
                      ? `Đang tải ${isVideo ? 'video' : 'ảnh'} lên máy chủ...`
                      : `Uploading ${isVideo ? 'video' : 'image'}...`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {uploadBytes && uploadBytes.total > 0 && (
                    <span className="text-[11px] text-indigo-600/70 dark:text-indigo-400/70 font-medium">
                      {(uploadBytes.loaded / (1024 * 1024)).toFixed(1)} / {(uploadBytes.total / (1024 * 1024)).toFixed(1)} MB
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
                <UploadCloud className="w-5 h-5" />
              </div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {isVi
                  ? `Kéo thả hoặc bấm để tải lên ${isVideo ? 'Video bài giảng' : 'Ảnh Thumbnail'}`
                  : `Drop or click to upload ${isVideo ? 'Video' : 'Thumbnail'}`}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {isVideo
                  ? isVi
                    ? 'Hỗ trợ MP4, WebM, QuickTime (Tối đa 200MB) • Tối ưu hóa bài giảng'
                    : 'Supports MP4, WebM, MOV (Max 200MB) • Lesson optimized'
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

      {showPreviewModal && value && !isVideo && (
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

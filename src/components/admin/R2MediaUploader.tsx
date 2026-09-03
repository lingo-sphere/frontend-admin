/**
 * @file R2MediaUploader.tsx
 * @description Component giao diện R2MediaUploader phục vụ khu vực Quản trị Admin
 */

import { useState, useRef, useEffect } from 'react'
import Hls from 'hls.js'
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
} from 'lucide-react'
import { mediaService } from '@/services/media.service'

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
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [manualInputMode, setManualInputMode] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const previewVideoRef = useRef<HTMLVideoElement | null>(null)
  const hlsInstanceRef = useRef<Hls | null>(null)

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
    if (isVideo && value && onDurationChange && !value.includes('youtube.com') && !value.includes('youtu.be')) {
      const video = document.createElement('video')
      video.preload = 'metadata'
      video.muted = true
      let done = false
      const onDone = () => {
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
      video.src = value
      video.load()
    }
  }, [value, isVideo])

  useEffect(() => {
    const video = previewVideoRef.current
    if (!video || !showPreviewModal || !isVideo || !value) return

    if (value.includes('.m3u8')) {
      if (Hls.isSupported()) {
        if (hlsInstanceRef.current) {
          hlsInstanceRef.current.destroy()
        }
        const hls = new Hls({
          capLevelToPlayerSize: false,
          autoStartLoad: true,
        })
        hlsInstanceRef.current = hls
        hls.loadSource(value)
        hls.attachMedia(video)
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          hls.currentLevel = -1
          video.play().catch(() => {})
        })
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = value
        video.play().catch(() => {})
      }
    } else {
      video.src = value
      video.play().catch(() => {})
    }

    return () => {
      if (hlsInstanceRef.current) {
        hlsInstanceRef.current.destroy()
        hlsInstanceRef.current = null
      }
    }
  }, [showPreviewModal, isVideo, value])

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
    setUploadProgress(10)

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => (prev >= 85 ? prev : prev + 15))
      }, 300)

      const response = await mediaService.uploadFile(file, folder)
      clearInterval(progressInterval)
      setUploadProgress(100)

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
      const msg = err instanceof Error ? err.message : 'Lỗi tải file lên máy chủ Cloudflare R2'
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

        <button
          type="button"
          onClick={() => setManualInputMode(!manualInputMode)}
          className="text-[11px] font-semibold text-indigo-600 hover:underline dark:text-indigo-400 cursor-pointer ml-auto"
        >
          {manualInputMode
            ? isVi
              ? 'Tải file lên Cloudflare R2'
              : 'Upload to R2'
            : isVi
              ? 'Nhập link URL thủ công / YouTube'
              : 'Enter Direct URL / YouTube'}
        </button>
      </div>

      {manualInputMode ? (

        <div className="flex gap-2">
          <input
            type="text"
            value={value}
            onChange={(e) => {
              const newUrl = e.target.value
              onChange(newUrl)
              if (isVideo && onDurationChange && newUrl && !newUrl.includes('youtube.com') && !newUrl.includes('youtu.be')) {
                const video = document.createElement('video')
                video.preload = 'metadata'
                video.onloadedmetadata = () => {
                  if (video.duration > 0) {
                    const mins = Math.max(1, Math.round(video.duration / 60))
                    onDurationChange(mins, Math.round(video.duration))
                  }
                }
                video.src = newUrl
              }
            }}
            placeholder={
              isVideo
                ? 'https://www.youtube.com/watch?v=... hoặc https://r2.lingosphere.../video.mp4'
                : 'https://r2.lingosphere.edu.vn/.../thumbnail.jpg'
            }
            className="w-full h-9 rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-xs font-mono text-slate-900 outline-none transition-all focus:border-indigo-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:focus:bg-slate-900 dark:text-slate-100"
          />
          {value && (
            <>
              <button
                type="button"
                onClick={() => setShowPreviewModal(true)}
                className="px-3 h-9 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:border-indigo-800 text-xs font-semibold transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
                title="Xem trước video/ảnh"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Xem</span>
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="px-3 h-9 rounded-xl border border-rose-200 text-rose-500 hover:bg-rose-50 dark:border-rose-900/40 dark:hover:bg-rose-900/20 text-xs font-semibold transition-colors shrink-0 cursor-pointer"
                title="Xóa URL"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      ) : (

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
                title="Bấm để xem trước video/ảnh đã tải lên"
              >
                {}
                {!isVideo && (
                  <div className="h-12 w-20 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-black/5 dark:border-slate-800 relative">
                    <img src={value} alt="Preview" className="h-full w-full object-cover group-hover:opacity-90 transition-opacity" />
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
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">
                    <span className="inline-flex items-center gap-1 rounded bg-indigo-100 dark:bg-indigo-900/40 px-1.5 py-0.2 text-[10px] font-bold text-indigo-700 dark:text-indigo-300">
                      <HardDrive className="w-2.5 h-2.5" />
                      Cloudflare R2
                    </span>
                    <span className="truncate max-w-[220px]">{value}</span>
                  </div>
                </div>
              </div>

              {}
              <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(true)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950 dark:hover:bg-indigo-900 text-[11px] font-bold text-indigo-700 dark:text-indigo-300 transition-colors cursor-pointer"
                  title="Xem trước video/ảnh"
                >
                  <Play className="w-3 h-3 fill-indigo-700 dark:fill-indigo-300" />
                  <span>{isVi ? 'Phát video' : 'Play'}</span>
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
                    {isVi
                      ? `Đang tải ${isVideo ? 'video' : 'ảnh'} lên Cloudflare R2...`
                      : `Uploading to Cloudflare R2...`}
                  </span>
                </div>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-indigo-100 dark:bg-indigo-900/40 overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full transition-all duration-300"
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
                    ? 'Hỗ trợ MP4, WebM, QuickTime (Tối đa 200MB) • Lưu trực tiếp trên Cloudflare R2'
                    : 'Supports MP4, WebM, MOV (Max 200MB) • Stored on Cloudflare R2'
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
      )}

      {}
      {showPreviewModal && value && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setShowPreviewModal(false)}
        >
          <div
            className="relative w-full max-w-3xl overflow-hidden rounded-2xl bg-slate-900 shadow-2xl border border-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-3.5 border-b border-slate-800 bg-slate-950">
              <div className="flex items-center gap-2">
                {isVideo ? <Film className="w-4 h-4 text-indigo-400" /> : <ImageIcon className="w-4 h-4 text-indigo-400" />}
                <span className="text-xs font-bold text-slate-200 truncate max-w-md">
                  {value.split('/').pop() || (isVideo ? 'Xem trước Video' : 'Xem trước Ảnh')}
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

            <div className="p-3 bg-black flex items-center justify-center min-h-[300px]">
              {isVideo ? (
                value.includes('youtube.com') || value.includes('youtu.be') ? (
                  <iframe
                    src={value.includes('embed') ? value : `https://www.youtube.com/embed/${value.match(/(?:youtu\.be\/|v\/|watch\?v=)([\w-]{11})/)?.[1] || ''}?autoplay=1`}
                    className="w-full h-[400px] rounded-lg border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    ref={previewVideoRef}
                    src={value.includes('.m3u8') ? undefined : value}
                    controls
                    autoPlay
                    playsInline
                    className="w-full max-h-[500px] rounded-lg object-contain bg-black"
                  />
                )
              ) : (
                <img
                  src={value}
                  alt="Preview"
                  className="w-full max-h-[500px] object-contain rounded-lg"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

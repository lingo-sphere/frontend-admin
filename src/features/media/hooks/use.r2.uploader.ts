/**
 * @file use.r2.uploader.ts
 * @description Custom hook quản lý trạng thái tải lên media lên Cloudflare R2, đọc thời lượng video và theo dõi tiến trình
 */

import { useState, useRef, useEffect } from 'react'
import { mediaService } from '@/features/media/services/media.service'
import { API_CONFIG } from '@/config/api.config'
import { videoDimensionsCache } from '@/components/video.preview.modal'

export const resolveStreamUrl = (url: string) => {
  if (!url) return ''
  if (
    url.includes('pub-') ||
    url.includes('r2.cloudflarestorage.com') ||
    url.includes('.r2.dev')
  ) {
    try {
      const parsed = new URL(url)
      return `${API_CONFIG.BASE_URL}/media/stream${parsed.pathname}`
    } catch {
      return url
    }
  }
  return url
}

interface UseR2UploaderOptions {
  type: 'image' | 'video'
  value: string
  onChange: (url: string) => void
  onDurationChange?: (durationMinutes: number, durationSeconds: number) => void
  folder?: string
  isVi?: boolean
}

export function useR2Uploader({
  type,
  value,
  onChange,
  onDurationChange,
  folder = 'courses',
  isVi = true,
}: UseR2UploaderOptions) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadBytes, setUploadBytes] = useState<{ loaded: number; total: number } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [showPreviewModal, setShowPreviewModal] = useState(false)

  const isVideo = type === 'video'
  const acceptTypes = isVideo
    ? 'video/mp4,video/webm,video/quicktime,video/x-matroska'
    : 'image/png,image/jpeg,image/webp,image/gif'

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
        if (
          !done &&
          video.duration &&
          !isNaN(video.duration) &&
          isFinite(video.duration) &&
          video.duration > 0
        ) {
          done = true
          const durSec = Math.round(video.duration)
          const mins =
            durSec >= 60 ? Math.round(durSec / 60) : Number((durSec / 60).toFixed(2))
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
  }, [value, isVideo, onDurationChange])

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
          const mins =
            roundedSec >= 60
              ? Math.round(roundedSec / 60)
              : Number((roundedSec / 60).toFixed(2))
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
        response?.file_url || response?.url || response?.public_url

      if (uploadedUrl) {
        onChange(uploadedUrl)
        setError(null)
      } else {
        throw new Error('Máy chủ không trả về đường dẫn file')
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : isVi
          ? 'Lỗi tải file lên hệ thống lưu trữ'
          : 'Upload error'
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

  return {
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
    acceptTypes,
    handleFileSelect,
    handleDrop,
    handleRemove,
  }
}

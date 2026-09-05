/**
 * @file video.preview.modal.tsx
 * @description Modal xem trước video bài học chuẩn phong cách YouTube hỗ trợ HLS stream, phím tắt và phóng to toàn màn hình
 */

import React, { useState, useRef, useEffect, useCallback } from 'react'
import Hls from 'hls.js'
import {
  X,
  Check,
  RotateCcw,
  RotateCw,
  Copy,
} from 'lucide-react'
import { toast } from '@/store/toast.store'
import { API_CONFIG } from '@/config/api.config'
import { VideoControlsBar, type QualityOption } from '@/components/common/video.controls.bar'

export interface VideoPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  videoUrl: string
  title?: string
  isVi?: boolean
}

export const videoDimensionsCache = new Map<string, { width: number; height: number }>()

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

export function VideoPreviewModal({
  isOpen,
  onClose,
  videoUrl,
  title,
  isVi = true,
}: VideoPreviewModalProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const hlsRef = useRef<Hls | null>(null)
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const progressBarRef = useRef<HTMLDivElement | null>(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [bufferedPercent, setBufferedPercent] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [isBuffering, setIsBuffering] = useState(false)
  const [copied, setCopied] = useState(false)

  const [qualities, setQualities] = useState<QualityOption[]>([])
  const [selectedQuality, setSelectedQuality] = useState<string>('auto')
  const [effectiveQualityLabel, setEffectiveQualityLabel] = useState<string>('Auto')

  const [hoverPosition, setHoverPosition] = useState<number | null>(null)
  const [hoverTime, setHoverTime] = useState<number | null>(null)
  const [seekFeedback, setSeekFeedback] = useState<{ type: 'rewind' | 'forward'; text: string } | null>(null)

  const resolvedUrl = resolveStreamUrl(videoUrl)
  const isHls = resolvedUrl.includes('.m3u8')
  const isEmbed = resolvedUrl.includes('youtube.com') || resolvedUrl.includes('youtu.be')

  const initialDims = resolvedUrl
    ? videoDimensionsCache.get(resolvedUrl) || videoDimensionsCache.get(videoUrl) || null
    : null

  const [videoDims, setVideoDims] = useState<{ width: number; height: number } | null>(initialDims)
  const [isMetadataLoaded, setIsMetadataLoaded] = useState(!!initialDims)

  const isPortrait = videoDims ? videoDims.height > videoDims.width : false

  useEffect(() => {
    const cached = resolvedUrl ? videoDimensionsCache.get(resolvedUrl) || videoDimensionsCache.get(videoUrl) || null : null
    if (cached) {
      setVideoDims(cached)
      setIsMetadataLoaded(true)
    } else {
      setIsMetadataLoaded(false)
    }
  }, [resolvedUrl, videoUrl])

  const resetControlsTimer = useCallback(() => {
    setShowControls(true)
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false)
      }, 2500)
    }
  }, [isPlaying])

  const togglePlay = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      video.play().catch(() => {})
      setIsPlaying(true)
    } else {
      video.pause()
      setIsPlaying(false)
    }
    resetControlsTimer()
  }, [resetControlsTimer])

  const toggleMute = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    if (isMuted || volume === 0) {
      video.muted = false
      setIsMuted(false)
      if (volume === 0) {
        video.volume = 0.5
        setVolume(0.5)
      }
    } else {
      video.muted = true
      setIsMuted(true)
    }
  }, [isMuted, volume])

  const handleVolumeChange = (newVol: number) => {
    const video = videoRef.current
    if (!video) return
    const vol = Math.max(0, Math.min(1, newVol))
    video.volume = vol
    setVolume(vol)
    if (vol === 0) {
      video.muted = true
      setIsMuted(true)
    } else {
      video.muted = false
      setIsMuted(false)
    }
  }

  const seekTo = (seconds: number) => {
    const video = videoRef.current
    if (!video) return
    const clamped = Math.max(0, Math.min(seconds, duration || 0))
    video.currentTime = clamped
    setCurrentTime(clamped)
  }

  const seekRelative = (seconds: number) => {
    const video = videoRef.current
    if (!video) return
    seekTo(video.currentTime + seconds)
    setSeekFeedback({
      type: seconds > 0 ? 'forward' : 'rewind',
      text: seconds > 0 ? `+${seconds}s` : `${seconds}s`,
    })
    setTimeout(() => setSeekFeedback(null), 600)
    resetControlsTimer()
  }

  const handleSpeedChange = (speed: number) => {
    const video = videoRef.current
    if (!video) return
    video.playbackRate = speed
    setPlaybackSpeed(speed)
  }

  const handleQualityChange = (qualityId: string) => {
    setSelectedQuality(qualityId)
    if (hlsRef.current) {
      const hls = hlsRef.current
      if (qualityId === 'auto') {
        hls.currentLevel = -1
      } else {
        const target = qualities.find((q) => q.id === qualityId)
        if (target && target.index >= 0) {
          hls.currentLevel = target.index
        }
      }
    }
  }

  const toggleFullscreen = () => {
    const el = containerRef.current
    if (!el) return
    if (!document.fullscreenElement) {
      el.requestFullscreen().catch(() => {})
      setIsFullscreen(true)
    } else {
      document.exitFullscreen().catch(() => {})
      setIsFullscreen(false)
    }
  }

  const togglePip = async () => {
    const video = videoRef.current
    if (!video) return
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture()
      } else if (document.pictureInPictureEnabled) {
        await video.requestPictureInPicture()
      }
    } catch {
      toast.info(isVi ? 'Trình duyệt không hỗ trợ Hình trong hình (PiP)' : 'PiP not supported')
    }
  }

  const handleCopyLink = () => {
    if (!resolvedUrl) return
    navigator.clipboard.writeText(resolvedUrl)
    setCopied(true)
    toast.success(isVi ? 'Đã sao chép link video!' : 'Video URL copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !duration) return
    const rect = progressBarRef.current.getBoundingClientRect()
    const clickX = Math.max(0, Math.min(e.clientX - rect.left, rect.width))
    const ratio = clickX / rect.width
    seekTo(ratio * duration)
  }

  const handleTimelineMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !duration) return
    const rect = progressBarRef.current.getBoundingClientRect()
    const mouseX = Math.max(0, Math.min(e.clientX - rect.left, rect.width))
    const ratio = mouseX / rect.width
    setHoverPosition(ratio * 100)
    setHoverTime(ratio * duration)
  }

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onFsChange)
    return () => document.removeEventListener('fullscreenchange', onFsChange)
  }, [])

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return
      }

      switch (e.key) {
        case ' ':
        case 'k':
        case 'K':
          e.preventDefault()
          togglePlay()
          break
        case 'f':
        case 'F':
          e.preventDefault()
          toggleFullscreen()
          break
        case 'm':
        case 'M':
          e.preventDefault()
          toggleMute()
          break
        case 'ArrowLeft':
        case 'j':
        case 'J':
          e.preventDefault()
          seekRelative(-5)
          break
        case 'ArrowRight':
        case 'l':
        case 'L':
          e.preventDefault()
          seekRelative(5)
          break
        case 'ArrowUp':
          e.preventDefault()
          handleVolumeChange(Math.min(1, volume + 0.1))
          break
        case 'ArrowDown':
          e.preventDefault()
          handleVolumeChange(Math.max(0, volume - 0.1))
          break
        case 'Escape':
          if (!document.fullscreenElement) {
            onClose()
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, togglePlay, toggleMute, volume, duration, onClose])

  useEffect(() => {
    if (!isOpen || !resolvedUrl || isEmbed) return

    const video = videoRef.current
    if (!video) return

    if (hlsRef.current) {
      hlsRef.current.destroy()
      hlsRef.current = null
    }

    setIsBuffering(true)

    if (isHls) {
      if (Hls.isSupported()) {
        const hls = new Hls({
          capLevelToPlayerSize: false,
          autoStartLoad: true,
        })
        hlsRef.current = hls
        hls.loadSource(resolvedUrl)
        hls.attachMedia(video)

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setIsBuffering(false)
          hls.currentLevel = -1
          video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false))

          const lvlOpts: QualityOption[] = [
            { id: 'auto', label: isVi ? 'Tự động (Auto)' : 'Auto', index: -1 },
          ]
          hls.levels.forEach((lvl, idx) => {
            const h = lvl.height
            const label = `${h}p ${h >= 720 ? 'HD' : ''}`.trim()
            lvlOpts.push({ id: `${h}p`, label, height: h, index: idx })
          })
          setQualities(lvlOpts)
        })

        hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
          const currentLvl = hls.levels[data.level]
          if (currentLvl) {
            setEffectiveQualityLabel(`${currentLvl.height}p`)
          }
        })

        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                hls.startLoad()
                break
              case Hls.ErrorTypes.MEDIA_ERROR:
                hls.recoverMediaError()
                break
              default:
                hls.destroy()
                break
            }
          }
        })
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = resolvedUrl
        video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false))
      }
    } else {
      video.src = resolvedUrl
      video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false))
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy()
        hlsRef.current = null
      }
    }
  }, [isOpen, resolvedUrl, isHls, isEmbed, isVi])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-0 sm:p-4 md:p-6 animate-in fade-in duration-150"
      onClick={onClose}
    >
      {!isMetadataLoaded && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <div className="h-12 w-12 animate-spin rounded-full border-[3px] border-white/20 border-t-[#ff0000]" />
        </div>
      )}

      <div
        ref={containerRef}
        className={`relative ${
          isPortrait ? 'max-w-[440px] aspect-[9/16]' : 'max-w-4xl aspect-video'
        } w-full max-h-[92vh] bg-black sm:rounded-xl overflow-hidden shadow-2xl group select-none flex flex-col justify-between transition-opacity duration-200 ${
          isMetadataLoaded ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={(e) => e.stopPropagation()}
        onMouseMove={resetControlsTimer}
      >
        <div
          className={`absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/80 via-black/40 to-transparent transition-opacity duration-200 ${
            showControls || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <div className="flex items-center gap-2 truncate max-w-md">
            <span className="text-sm font-medium text-white/95 truncate drop-shadow-md">
              {title || (isVi ? 'Xem trước video bài giảng' : 'Lesson Video Preview')}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleCopyLink}
              className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
              title={isVi ? 'Sao chép link video' : 'Copy video URL'}
            >
              {copied ? <Check size={17} className="text-[#ff0000]" /> : <Copy size={17} />}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
              title={isVi ? 'Đóng (Esc)' : 'Close (Esc)'}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden">
          {isEmbed ? (
            <iframe
              src={resolvedUrl.replace('watch?v=', 'embed/')}
              title="Video Preview"
              className="h-full w-full aspect-video"
              allowFullScreen
            />
          ) : (
            <>
              <video
                ref={videoRef}
                playsInline
                autoPlay
                className="w-full h-full object-contain bg-black cursor-pointer"
                onClick={togglePlay}
                onDoubleClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  const clickX = e.clientX - rect.left
                  const ratio = clickX / rect.width
                  if (ratio < 0.35) {
                    seekRelative(-5)
                  } else if (ratio > 0.65) {
                    seekRelative(5)
                  } else {
                    toggleFullscreen()
                  }
                }}
                onTimeUpdate={() => {
                  if (videoRef.current) {
                    setCurrentTime(videoRef.current.currentTime)
                  }
                }}
                onDurationChange={() => {
                  if (videoRef.current && videoRef.current.duration) {
                    setDuration(videoRef.current.duration)
                  }
                }}
                onLoadedMetadata={() => {
                  if (videoRef.current) {
                    setDuration(videoRef.current.duration || 0)
                    const w = videoRef.current.videoWidth
                    const h = videoRef.current.videoHeight
                    if (w && h) {
                      const dims = { width: w, height: h }
                      videoDimensionsCache.set(resolvedUrl, dims)
                      videoDimensionsCache.set(videoUrl, dims)
                      setVideoDims(dims)
                    }
                    setIsMetadataLoaded(true)
                  }
                  setIsBuffering(false)
                }}
                onProgress={() => {
                  const video = videoRef.current
                  if (video && video.buffered.length > 0 && duration > 0) {
                    const bufferedEnd = video.buffered.end(video.buffered.length - 1)
                    setBufferedPercent(Math.min(100, (bufferedEnd / duration) * 100))
                  }
                }}
                onWaiting={() => setIsBuffering(true)}
                onCanPlay={() => setIsBuffering(false)}
                onPlaying={() => {
                  setIsBuffering(false)
                  setIsPlaying(true)
                }}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
              />

              {isBuffering && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/20">
                  <div className="h-12 w-12 animate-spin rounded-full border-[3px] border-white/20 border-t-[#ff0000]" />
                </div>
              )}

              {seekFeedback && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="flex items-center gap-1.5 rounded-full bg-black/70 px-4 py-2 text-sm font-bold text-white shadow-2xl animate-in zoom-in-75 duration-100">
                    {seekFeedback.type === 'rewind' ? <RotateCcw size={16} /> : <RotateCw size={16} />}
                    <span>{seekFeedback.text}</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {!isEmbed && (
          <VideoControlsBar
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            bufferedPercent={bufferedPercent}
            volume={volume}
            isMuted={isMuted}
            playbackSpeed={playbackSpeed}
            isFullscreen={isFullscreen}
            showControls={showControls}
            isHls={isHls}
            qualities={qualities}
            selectedQuality={selectedQuality}
            effectiveQualityLabel={effectiveQualityLabel}
            isVi={isVi}
            progressBarRef={progressBarRef}
            onTogglePlay={togglePlay}
            onSeekRelative={seekRelative}
            onToggleMute={toggleMute}
            onVolumeChange={handleVolumeChange}
            onTimelineClick={handleTimelineClick}
            onTimelineMouseMove={handleTimelineMouseMove}
            onTimelineMouseLeave={() => {
              setHoverPosition(null)
              setHoverTime(null)
            }}
            hoverPosition={hoverPosition}
            hoverTime={hoverTime}
            onSpeedChange={handleSpeedChange}
            onQualityChange={handleQualityChange}
            onTogglePip={togglePip}
            onToggleFullscreen={toggleFullscreen}
          />
        )}
      </div>
    </div>
  )
}

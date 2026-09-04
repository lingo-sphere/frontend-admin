/**
 * @file VideoPreviewModal.tsx
 * @description Modal xem trước video chuyên nghiệp chuẩn Cinema/YouTube cho LingoSphere Admin
 */

import React, { useState, useRef, useEffect, useCallback } from 'react'
import Hls from 'hls.js'
import {
  Play,
  Pause,
  Volume2,
  Volume1,
  VolumeX,
  Maximize,
  Minimize,
  PictureInPicture2,
  RotateCcw,
  RotateCw,
  Film,
  X,
  Check,
  Copy,
  ExternalLink,
  Settings,
  Sparkles,
  Layers,
  Radio,
  Clock,
  CheckCircle2,
  Loader2,
} from 'lucide-react'
import { toast } from '@/store/toast-store'
import { API_CONFIG } from '@/config/api.config'

export interface VideoPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  videoUrl: string
  title?: string
  isVi?: boolean
}

interface QualityOption {
  id: string
  label: string
  height?: number
  index: number
}

const PLAYBACK_RATES = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0]

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

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00'
  const total = Math.floor(seconds)
  const m = Math.floor(total / 60)
  const s = total % 60
  const pad = (n: number) => n.toString().padStart(2, '0')
  if (m >= 60) {
    const h = Math.floor(m / 60)
    const remM = m % 60
    return `${pad(h)}:${pad(remM)}:${pad(s)}`
  }
  return `${pad(m)}:${pad(s)}`
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
  const [playbackRate, setPlaybackRate] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [isBuffering, setIsBuffering] = useState(false)
  const [copied, setCopied] = useState(false)

  // Settings & Menus
  const [showSpeedMenu, setShowSpeedMenu] = useState(false)
  const [showQualityMenu, setShowQualityMenu] = useState(false)
  const [qualities, setQualities] = useState<QualityOption[]>([])
  const [selectedQuality, setSelectedQuality] = useState<string>('auto')

  // Scrubber Hover
  const [hoverPosition, setHoverPosition] = useState<number | null>(null)
  const [hoverTime, setHoverTime] = useState<number | null>(null)

  // Video Dimension & Aspect Ratio
  const [videoDims, setVideoDims] = useState<{ width: number; height: number } | null>(null)

  const resolvedUrl = resolveStreamUrl(videoUrl)
  const isHls = resolvedUrl.includes('.m3u8')
  const isEmbed = resolvedUrl.includes('youtube.com') || resolvedUrl.includes('youtu.be')

  // Format file name
  const fileName = resolvedUrl ? resolvedUrl.split('/').pop()?.split('?')[0] || 'video-file' : ''

  // Aspect ratio text
  const isPortrait = videoDims ? videoDims.height > videoDims.width : false
  const aspectRatioText = videoDims
    ? isPortrait
      ? `9:16 (${isVi ? 'Dọc' : 'Portrait'})`
      : `16:9 (${isVi ? 'Ngang' : 'Landscape'})`
    : isVi
    ? 'Tự động'
    : 'Auto'

  // Reset controls hide timer
  const resetControlsTimer = useCallback(() => {
    setShowControls(true)
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false)
        setShowSpeedMenu(false)
        setShowQualityMenu(false)
      }, 2500)
    }
  }, [isPlaying])

  // Play / Pause toggle
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

  // Volume toggle
  const toggleMute = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    const nextMuted = !isMuted
    video.muted = nextMuted
    setIsMuted(nextMuted)
  }, [isMuted])

  const handleVolumeChange = (newVol: number) => {
    const video = videoRef.current
    if (!video) return
    video.volume = newVol
    setVolume(newVol)
    if (newVol > 0 && isMuted) {
      video.muted = false
      setIsMuted(false)
    }
  }

  // Seek
  const seekTo = (seconds: number) => {
    const video = videoRef.current
    if (!video) return
    const clamped = Math.max(0, Math.min(seconds, duration || 0))
    video.currentTime = clamped
    setCurrentTime(clamped)
  }

  const skipTime = (delta: number) => {
    const video = videoRef.current
    if (!video) return
    seekTo(video.currentTime + delta)
    resetControlsTimer()
  }

  // Speed change
  const handleRateChange = (rate: number) => {
    const video = videoRef.current
    if (!video) return
    video.playbackRate = rate
    setPlaybackRate(rate)
    setShowSpeedMenu(false)
  }

  // Quality change
  const handleQualityChange = (qualityId: string) => {
    setSelectedQuality(qualityId)
    setShowQualityMenu(false)
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

  // Fullscreen toggle
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

  // Picture in Picture
  const togglePiP = async () => {
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

  // Copy Stream Link
  const handleCopyLink = () => {
    if (!resolvedUrl) return
    navigator.clipboard.writeText(resolvedUrl)
    setCopied(true)
    toast.success(isVi ? 'Đã sao chép link stream video!' : 'Stream URL copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  // Scrubber click & hover
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !duration) return
    const rect = progressBarRef.current.getBoundingClientRect()
    const clickX = Math.max(0, Math.min(e.clientX - rect.left, rect.width))
    const ratio = clickX / rect.width
    seekTo(ratio * duration)
  }

  const handleProgressMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !duration) return
    const rect = progressBarRef.current.getBoundingClientRect()
    const mouseX = Math.max(0, Math.min(e.clientX - rect.left, rect.width))
    const ratio = mouseX / rect.width
    setHoverPosition(ratio * 100)
    setHoverTime(ratio * duration)
  }

  const handleProgressMouseLeave = () => {
    setHoverPosition(null)
    setHoverTime(null)
  }

  // Listen to fullscreen changes
  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', onFsChange)
    return () => document.removeEventListener('fullscreenchange', onFsChange)
  }, [])

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input
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
          e.preventDefault()
          skipTime(-5)
          break
        case 'ArrowRight':
          e.preventDefault()
          skipTime(5)
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
  }, [isOpen, togglePlay, toggleFullscreen, toggleMute, volume, duration, onClose])

  // HLS & Video Initialization
  useEffect(() => {
    if (!isOpen || !resolvedUrl || isEmbed) return

    const video = videoRef.current
    if (!video) return

    // Clean up previous instance
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

          // Extract available qualities
          const lvlOpts: QualityOption[] = [
            { id: 'auto', label: isVi ? 'Tự động (Auto)' : 'Auto', index: -1 },
          ]
          hls.levels.forEach((lvl, idx) => {
            const h = lvl.height
            const label = `${h}p ${h >= 1080 ? 'Full HD' : h >= 720 ? 'HD' : ''}`.trim()
            lvlOpts.push({ id: `${h}p`, label, height: h, index: idx })
          })
          setQualities(lvlOpts)
        })

        hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
          const currentLvl = hls.levels[data.level]
          if (currentLvl) {
            setSelectedQuality(hls.autoLevelEnabled ? 'auto' : `${currentLvl.height}p`)
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

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 md:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        ref={containerRef}
        className={`relative flex flex-col w-full ${
          isPortrait ? 'max-w-2xl' : 'max-w-4xl'
        } max-h-[95vh] rounded-2xl bg-slate-950/95 border border-slate-700/60 shadow-2xl shadow-black/90 overflow-hidden transition-all duration-300`}
        onClick={(e) => e.stopPropagation()}
        onMouseMove={resetControlsTimer}
      >
        {/* Ambient Cinema Backdrop Glow */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none opacity-30 blur-3xl">
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600" />
        </div>

        {/* Professional Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-950/90 border-b border-slate-800/80 shrink-0 select-none">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 shrink-0">
              <Film className="w-4 h-4" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-100 truncate">
                  {title || (isVi ? 'Xem trước video bài giảng' : 'Lesson Video Preview')}
                </h3>
              </div>

              {/* Status & Format Badges */}
              <div className="flex items-center gap-2 mt-0.5 text-[11px]">
                <span className="inline-flex items-center gap-1 font-medium text-emerald-400 bg-emerald-950/70 border border-emerald-800/50 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {isVi ? 'Sẵn sàng phát' : 'Ready'}
                </span>

                <span className="inline-flex items-center gap-1 font-medium text-indigo-300 bg-indigo-950/70 border border-indigo-800/50 px-2 py-0.5 rounded-full">
                  <Radio className="w-2.5 h-2.5" />
                  {isHls ? 'HLS Stream (Multi-rate)' : 'Direct Video'}
                </span>

                <span className="hidden sm:inline-flex items-center gap-1 font-medium text-slate-400 bg-slate-800/70 border border-slate-700/50 px-2 py-0.5 rounded-full">
                  <Layers className="w-2.5 h-2.5" />
                  {aspectRatioText}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-medium transition-colors cursor-pointer"
              title={isVi ? 'Sao chép link stream video' : 'Copy stream URL'}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">{isVi ? 'Đã chép' : 'Copied'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{isVi ? 'Sao chép link' : 'Copy link'}</span>
                </>
              )}
            </button>

            <a
              href={resolvedUrl}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-lg border border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title={isVi ? 'Mở trong tab mới' : 'Open in new tab'}
            >
              <ExternalLink className="w-4 h-4" />
            </a>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg border border-slate-800 bg-slate-900/80 hover:bg-rose-950/50 hover:border-rose-800/50 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
              title={isVi ? 'Đóng (Esc)' : 'Close (Esc)'}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Video Canvas Stage */}
        <div
          className={`relative flex-1 bg-black flex items-center justify-center overflow-hidden min-h-[320px] ${
            isPortrait ? 'max-h-[65vh]' : 'max-h-[550px]'
          } group select-none`}
        >
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
                className={`w-full h-full object-contain ${
                  isPortrait ? 'max-h-[60vh] rounded-lg shadow-2xl' : ''
                }`}
                onClick={togglePlay}
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
                    setVideoDims({
                      width: videoRef.current.videoWidth,
                      height: videoRef.current.videoHeight,
                    })
                  }
                  setIsBuffering(false)
                }}
                onProgress={() => {
                  const video = videoRef.current
                  if (video && video.buffered.length > 0 && duration > 0) {
                    const bufferedEnd = video.buffered.end(video.buffered.length - 1)
                    setBufferedPercent((bufferedEnd / duration) * 100)
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

              {/* Big Center Play / Buffering Overlay */}
              {isBuffering && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/30 backdrop-blur-[1px]">
                  <div className="p-3.5 rounded-2xl bg-black/70 border border-white/10 text-indigo-400 shadow-2xl animate-spin">
                    <Loader2 className="w-8 h-8" />
                  </div>
                </div>
              )}

              {!isPlaying && !isBuffering && (
                <button
                  type="button"
                  onClick={togglePlay}
                  className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-600/90 to-purple-600/90 text-white flex items-center justify-center shadow-2xl shadow-indigo-500/40 border border-white/20 transform hover:scale-110 active:scale-95 transition-all cursor-pointer group-hover:opacity-100"
                >
                  <Play className="w-7 h-7 fill-white translate-x-0.5" />
                </button>
              )}

              {/* Custom Cinema Player Controls */}
              <div
                className={`absolute inset-x-0 bottom-0 pt-16 pb-3 px-4 bg-gradient-to-t from-black/95 via-black/60 to-transparent flex flex-col gap-2 transition-opacity duration-300 ${
                  showControls || !isPlaying ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}
              >
                {/* Scrubber Timeline Bar */}
                <div
                  ref={progressBarRef}
                  onClick={handleProgressClick}
                  onMouseMove={handleProgressMouseMove}
                  onMouseLeave={handleProgressMouseLeave}
                  className="relative w-full h-1.5 hover:h-2.5 bg-white/20 rounded-full cursor-pointer transition-all group/scrub"
                >
                  {/* Buffered Progress */}
                  <div
                    className="absolute inset-y-0 left-0 bg-white/30 rounded-full transition-all duration-150"
                    style={{ width: `${Math.min(100, bufferedPercent)}%` }}
                  />

                  {/* Played Progress */}
                  <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full"
                    style={{ width: `${Math.min(100, progressPercent)}%` }}
                  />

                  {/* Scrubber Thumb Knob */}
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-lg shadow-black/50 border border-indigo-400 transform -translate-x-1/2 scale-0 group-hover/scrub:scale-100 transition-transform pointer-events-none"
                    style={{ left: `${Math.min(100, progressPercent)}%` }}
                  />

                  {/* Hover Timestamp Tooltip */}
                  {hoverPosition !== null && hoverTime !== null && (
                    <div
                      className="absolute -top-8 -translate-x-1/2 px-2 py-0.5 rounded bg-slate-900/90 border border-slate-700/80 text-white font-mono text-[11px] pointer-events-none shadow-lg shadow-black"
                      style={{ left: `${hoverPosition}%` }}
                    >
                      {formatTime(hoverTime)}
                    </div>
                  )}
                </div>

                {/* Control Buttons Row */}
                <div className="flex items-center justify-between gap-3 text-white text-xs select-none">
                  {/* Left Controls: Play, Skip, Volume, Time */}
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={togglePlay}
                      className="p-1 rounded-lg hover:bg-white/15 transition-colors cursor-pointer"
                      title={isPlaying ? 'Tạm dừng (Space)' : 'Phát (Space)'}
                    >
                      {isPlaying ? (
                        <Pause className="w-5 h-5 fill-white" />
                      ) : (
                        <Play className="w-5 h-5 fill-white" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => skipTime(-10)}
                      className="p-1 rounded-lg hover:bg-white/15 text-slate-300 hover:text-white transition-colors cursor-pointer"
                      title={isVi ? 'Lùi 10s (←)' : 'Rewind 10s (←)'}
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => skipTime(10)}
                      className="p-1 rounded-lg hover:bg-white/15 text-slate-300 hover:text-white transition-colors cursor-pointer"
                      title={isVi ? 'Tới 10s (→)' : 'Forward 10s (→)'}
                    >
                      <RotateCw className="w-4 h-4" />
                    </button>

                    {/* Volume Controls */}
                    <div className="flex items-center gap-2 group/vol">
                      <button
                        type="button"
                        onClick={toggleMute}
                        className="p-1 rounded-lg hover:bg-white/15 text-slate-300 hover:text-white transition-colors cursor-pointer"
                        title={isMuted ? 'Bật âm (M)' : 'Tắt âm (M)'}
                      >
                        {isMuted || volume === 0 ? (
                          <VolumeX className="w-4 h-4 text-rose-400" />
                        ) : volume < 0.5 ? (
                          <Volume1 className="w-4 h-4" />
                        ) : (
                          <Volume2 className="w-4 h-4" />
                        )}
                      </button>

                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.05}
                        value={isMuted ? 0 : volume}
                        onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                        className="w-16 h-1 accent-indigo-500 bg-white/30 rounded-lg cursor-pointer transition-all"
                      />
                    </div>

                    {/* Time Counter */}
                    <div className="font-mono text-xs font-semibold text-slate-300 flex items-center gap-1">
                      <span>{formatTime(currentTime)}</span>
                      <span className="text-slate-500">/</span>
                      <span className="text-slate-400">{formatTime(duration)}</span>
                    </div>
                  </div>

                  {/* Right Controls: Speed, Quality, PiP, Fullscreen */}
                  <div className="flex items-center gap-2">
                    {/* Speed Selector Popover */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => {
                          setShowSpeedMenu(!showSpeedMenu)
                          setShowQualityMenu(false)
                        }}
                        className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 text-[11px] font-bold tracking-tight transition-colors cursor-pointer"
                        title={isVi ? 'Tốc độ phát' : 'Playback Speed'}
                      >
                        {playbackRate}x
                      </button>

                      {showSpeedMenu && (
                        <div className="absolute bottom-full right-0 mb-2 w-28 rounded-xl bg-slate-900/95 border border-slate-700/80 shadow-2xl p-1 z-20 backdrop-blur-md">
                          <div className="px-2 py-1 text-[10px] font-bold text-slate-400 border-b border-slate-800">
                            {isVi ? 'Tốc độ' : 'Speed'}
                          </div>
                          {PLAYBACK_RATES.map((rate) => (
                            <button
                              key={rate}
                              type="button"
                              onClick={() => handleRateChange(rate)}
                              className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                                playbackRate === rate
                                  ? 'bg-indigo-600 text-white font-bold'
                                  : 'text-slate-300 hover:bg-slate-800'
                              }`}
                            >
                              <span>{rate === 1.0 ? `${rate}x (Chuẩn)` : `${rate}x`}</span>
                              {playbackRate === rate && <Check className="w-3 h-3" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Quality Selector (for HLS) */}
                    {isHls && qualities.length > 0 && (
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => {
                            setShowQualityMenu(!showQualityMenu)
                            setShowSpeedMenu(false)
                          }}
                          className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 text-[11px] font-bold tracking-tight transition-colors cursor-pointer flex items-center gap-1"
                          title={isVi ? 'Chất lượng video' : 'Quality'}
                        >
                          <Settings className="w-3 h-3 text-indigo-400" />
                          <span>{selectedQuality}</span>
                        </button>

                        {showQualityMenu && (
                          <div className="absolute bottom-full right-0 mb-2 w-36 rounded-xl bg-slate-900/95 border border-slate-700/80 shadow-2xl p-1 z-20 backdrop-blur-md">
                            <div className="px-2 py-1 text-[10px] font-bold text-slate-400 border-b border-slate-800">
                              {isVi ? 'Chất lượng' : 'Quality'}
                            </div>
                            {qualities.map((q) => (
                              <button
                                key={q.id}
                                type="button"
                                onClick={() => handleQualityChange(q.id)}
                                className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                                  selectedQuality === q.id
                                    ? 'bg-indigo-600 text-white font-bold'
                                    : 'text-slate-300 hover:bg-slate-800'
                                }`}
                              >
                                <span>{q.label}</span>
                                {selectedQuality === q.id && <Check className="w-3 h-3" />}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Picture in Picture */}
                    <button
                      type="button"
                      onClick={togglePiP}
                      className="p-1 rounded-lg hover:bg-white/15 text-slate-300 hover:text-white transition-colors cursor-pointer"
                      title={isVi ? 'Hình trong hình (PiP)' : 'Picture in Picture'}
                    >
                      <PictureInPicture2 className="w-4 h-4" />
                    </button>

                    {/* Fullscreen */}
                    <button
                      type="button"
                      onClick={toggleFullscreen}
                      className="p-1 rounded-lg hover:bg-white/15 text-slate-300 hover:text-white transition-colors cursor-pointer"
                      title={isFullscreen ? 'Thoát toàn màn hình (F)' : 'Toàn màn hình (F)'}
                    >
                      {isFullscreen ? (
                        <Minimize className="w-4 h-4" />
                      ) : (
                        <Maximize className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Professional Footer Info */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-2.5 bg-slate-950 border-t border-slate-800/80 text-[11px] text-slate-400 select-none">
          <div className="flex items-center gap-3 truncate">
            <span className="font-mono text-slate-300 truncate max-w-xs" title={fileName}>
              {fileName}
            </span>
            {videoDims && (
              <span className="text-slate-500">
                • {videoDims.width}x{videoDims.height}
              </span>
            )}
            {duration > 0 && (
              <span className="text-slate-500">
                • {formatTime(duration)} ({Math.round(duration)}s)
              </span>
            )}
          </div>

          <div className="hidden md:flex items-center gap-3 text-slate-500 text-[10px]">
            <span>
              <kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">Space</kbd>{' '}
              {isVi ? 'Phát/Dừng' : 'Play/Pause'}
            </span>
            <span>
              <kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">F</kbd>{' '}
              {isVi ? 'Toàn màn hình' : 'Fullscreen'}
            </span>
            <span>
              <kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">M</kbd>{' '}
              {isVi ? 'Tắt tiếng' : 'Mute'}
            </span>
            <span>
              <kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">← / →</kbd>{' '}
              {isVi ? 'Tua 5s' : 'Seek 5s'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

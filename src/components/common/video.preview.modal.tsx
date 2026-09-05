/**
 * @file VideoPreviewModal.tsx
 * @description Trình phát video xem trước chuẩn phong cách YouTube cho LingoSphere Admin
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
  Settings,
  X,
  Check,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  RotateCw,
  Copy,
  SlidersHorizontal,
  FastForward,
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

const PLAYBACK_SPEEDS = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0]

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

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00'
  const totalSec = Math.floor(seconds)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  const pad = (n: number) => n.toString().padStart(2, '0')
  if (h > 0) {
    return `${h}:${pad(m)}:${pad(s)}`
  }
  return `${m}:${pad(s)}`
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

  // YouTube Settings Popover
  const [showSettingsMenu, setShowSettingsMenu] = useState(false)
  const [settingsSubmenu, setSettingsSubmenu] = useState<'main' | 'quality' | 'speed'>('main')
  const [qualities, setQualities] = useState<QualityOption[]>([])
  const [selectedQuality, setSelectedQuality] = useState<string>('auto')
  const [effectiveQualityLabel, setEffectiveQualityLabel] = useState<string>('Auto')

  // Scrubber Hover
  const [hoverPosition, setHoverPosition] = useState<number | null>(null)
  const [hoverTime, setHoverTime] = useState<number | null>(null)

  // Feedback animation (Double click seek)
  const [seekFeedback, setSeekFeedback] = useState<{ type: 'rewind' | 'forward'; text: string } | null>(null)

  const resolvedUrl = resolveStreamUrl(videoUrl)
  const isHls = resolvedUrl.includes('.m3u8')
  const isEmbed = resolvedUrl.includes('youtube.com') || resolvedUrl.includes('youtu.be')

  const initialDims = resolvedUrl
    ? videoDimensionsCache.get(resolvedUrl) || videoDimensionsCache.get(videoUrl) || null
    : null

  // Dimensions & Metadata Loaded State
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

  // Reset controls timer
  const resetControlsTimer = useCallback(() => {
    setShowControls(true)
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false)
        setShowSettingsMenu(false)
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

  // Mute / Unmute
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

  // Seek
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

  // Speed
  const handleSpeedChange = (speed: number) => {
    const video = videoRef.current
    if (!video) return
    video.playbackRate = speed
    setPlaybackSpeed(speed)
    setShowSettingsMenu(false)
    setSettingsSubmenu('main')
  }

  // Quality
  const handleQualityChange = (qualityId: string) => {
    setSelectedQuality(qualityId)
    setShowSettingsMenu(false)
    setSettingsSubmenu('main')

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

  // Fullscreen
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

  // PiP
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

  // Copy Link
  const handleCopyLink = () => {
    if (!resolvedUrl) return
    navigator.clipboard.writeText(resolvedUrl)
    setCopied(true)
    toast.success(isVi ? 'Đã sao chép link video!' : 'Video URL copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  // Scrubber drag / click
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

  // Fullscreen changes
  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onFsChange)
    return () => document.removeEventListener('fullscreenchange', onFsChange)
  }, [])

  // Keyboard Shortcuts (Standard YouTube)
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

  // HLS Loader
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

  const playedPercent = duration > 0 ? (currentTime / duration) * 100 : 0
  const isHd = effectiveQualityLabel.includes('720') || effectiveQualityLabel.includes('1080')

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-0 sm:p-4 md:p-6 animate-in fade-in duration-150"
      onClick={onClose}
    >
      {/* 🎬 YouTube Loading Spinner while detecting aspect ratio */}
      {!isMetadataLoaded && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <div className="h-12 w-12 animate-spin rounded-full border-[3px] border-white/20 border-t-[#ff0000]" />
        </div>
      )}

      {/* 🎬 YouTube Style Video Container */}
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
        {/* 🎛️ 1. YouTube Top Bar (Title & Close Button) */}
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
            {/* Copy Video Link Button */}
            <button
              type="button"
              onClick={handleCopyLink}
              className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
              title={isVi ? 'Sao chép link video' : 'Copy video URL'}
            >
              {copied ? <Check size={17} className="text-[#ff0000]" /> : <Copy size={17} />}
            </button>

            {/* YouTube Clean Close X Button */}
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

        {/* 🎬 2. Video Screen Layer */}
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

              {/* YouTube Style Buffering Spinner */}
              {isBuffering && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/20">
                  <div className="h-12 w-12 animate-spin rounded-full border-[3px] border-white/20 border-t-[#ff0000]" />
                </div>
              )}

              {/* Seek Feedback Indicator (+5s / -5s) */}
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

        {/* 🎛️ 3. YouTube Bottom Controls Bar */}
        {!isEmbed && (
          <div
            className={`absolute bottom-0 left-0 right-0 z-30 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-8 pb-2 px-3 sm:px-4 transition-opacity duration-200 ${
              showControls || !isPlaying ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}
          >
            {/* 3.1 YouTube Red Scrubber Progress Bar */}
            <div
              ref={progressBarRef}
              onClick={handleTimelineClick}
              onMouseMove={handleTimelineMouseMove}
              onMouseLeave={() => {
                setHoverPosition(null)
                setHoverTime(null)
              }}
              className="group/timeline relative w-full h-4 cursor-pointer flex items-center mb-1"
            >
              {/* Scrubber Track */}
              <div className="relative w-full h-[3px] group-hover/timeline:h-[5px] rounded-full bg-white/25 transition-all overflow-visible">
                {/* Buffered Progress */}
                <div
                  className="absolute top-0 bottom-0 left-0 bg-white/40 rounded-full transition-all"
                  style={{ width: `${bufferedPercent}%` }}
                />

                {/* Played Progress (YouTube Red #ff0000) */}
                <div
                  className="absolute top-0 bottom-0 left-0 bg-[#ff0000] rounded-full"
                  style={{ width: `${playedPercent}%` }}
                />

                {/* Red Thumb Knob */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-3.5 w-3.5 rounded-full bg-[#ff0000] shadow-md scale-0 group-hover/timeline:scale-100 transition-transform duration-100 pointer-events-none"
                  style={{ left: `${playedPercent}%` }}
                />
              </div>

              {/* Hover Timestamp Tooltip */}
              {hoverTime !== null && hoverPosition !== null && (
                <div
                  className="pointer-events-none absolute -top-8 -translate-x-1/2 rounded bg-[#0f0f0f]/90 text-white font-mono text-[11px] font-semibold px-1.5 py-0.5 shadow-xl border border-white/10"
                  style={{ left: `${hoverPosition}%` }}
                >
                  {formatTime(hoverTime)}
                </div>
              )}
            </div>

            {/* 3.2 YouTube Action Buttons Row */}
            <div className="flex items-center justify-between gap-3 text-white">
              {/* Left Controls: Play/Pause, Skip, Volume, Time */}
              <div className="flex items-center gap-1 sm:gap-2">
                {/* Play / Pause */}
                <button
                  type="button"
                  onClick={togglePlay}
                  className="p-1.5 text-white hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
                  title={isPlaying ? 'Tạm dừng (k)' : 'Phát (k)'}
                >
                  {isPlaying ? (
                    <Pause size={22} className="fill-white" />
                  ) : (
                    <Play size={22} className="fill-white ml-0.5" />
                  )}
                </button>

                {/* Skip 10s Backward */}
                <button
                  type="button"
                  onClick={() => seekRelative(-10)}
                  className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
                  title="Lùi 10s (j)"
                >
                  <RotateCcw size={18} />
                </button>

                {/* Skip 10s Forward */}
                <button
                  type="button"
                  onClick={() => seekRelative(10)}
                  className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
                  title="Tới 10s (l)"
                >
                  <RotateCw size={18} />
                </button>

                {/* YouTube Expanding Volume Bar */}
                <div className="group/vol flex items-center">
                  <button
                    type="button"
                    onClick={toggleMute}
                    className="p-1.5 text-white/90 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
                    title={isMuted ? 'Bật âm thanh (m)' : 'Tắt tiếng (m)'}
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX size={20} className="text-[#ff0000]" />
                    ) : volume < 0.5 ? (
                      <Volume1 size={20} />
                    ) : (
                      <Volume2 size={20} />
                    )}
                  </button>

                  <div className="w-0 group-hover/vol:w-16 transition-all duration-200 overflow-hidden flex items-center">
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={isMuted ? 0 : volume}
                      onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                      className="w-16 h-1 accent-[#ff0000] bg-white/30 rounded cursor-pointer"
                    />
                  </div>
                </div>

                {/* YouTube Style Time: 0:15 / 0:15 */}
                <div className="text-xs text-white/90 font-medium tracking-wide ml-1 select-none">
                  <span>{formatTime(currentTime)}</span>
                  <span className="text-white/50 mx-1">/</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Right Controls: Settings, PiP, Fullscreen */}
              <div className="flex items-center gap-1">
                {/* YouTube Settings Gear & Popover */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setShowSettingsMenu(!showSettingsMenu)
                      setSettingsSubmenu('main')
                    }}
                    className={`p-1.5 rounded-full text-white/90 hover:text-white hover:bg-white/10 transition-colors cursor-pointer relative ${
                      showSettingsMenu ? 'rotate-45' : ''
                    }`}
                    title={isVi ? 'Cài đặt' : 'Settings'}
                  >
                    <Settings size={18} />
                    {isHd && (
                      <span className="absolute -top-0.5 -right-0.5 bg-[#ff0000] text-white text-[8px] font-black px-1 rounded-sm leading-tight tracking-tighter shadow-sm pointer-events-none">
                        HD
                      </span>
                    )}
                  </button>

                  {/* YouTube Popover Menu */}
                  {showSettingsMenu && (
                    <div className="absolute bottom-full right-0 mb-3 min-w-[240px] w-max max-w-xs rounded-2xl bg-[#0f0f0f]/95 backdrop-blur-xl border border-white/10 p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 text-white">
                      {settingsSubmenu === 'main' && (
                        <div className="space-y-1">
                          {/* Quality item */}
                          {isHls && (
                            <button
                              type="button"
                              onClick={() => setSettingsSubmenu('quality')}
                              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium hover:bg-white/10 transition-colors cursor-pointer gap-4"
                            >
                              <span className="flex items-center gap-2.5 text-white/90 shrink-0 whitespace-nowrap">
                                <SlidersHorizontal size={15} className="text-[#ff0000]" />
                                <span className="font-semibold whitespace-nowrap">{isVi ? 'Chất lượng' : 'Quality'}</span>
                              </span>
                              <span className="flex items-center gap-1 text-[11px] text-white/60 shrink-0 whitespace-nowrap">
                                <span className="whitespace-nowrap">
                                  {selectedQuality === 'auto'
                                    ? `Tự động (${effectiveQualityLabel})`
                                    : selectedQuality}
                                </span>
                                <ChevronRight size={13} />
                              </span>
                            </button>
                          )}

                          {/* Speed item */}
                          <button
                            type="button"
                            onClick={() => setSettingsSubmenu('speed')}
                            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium hover:bg-white/10 transition-colors cursor-pointer gap-4"
                          >
                            <span className="flex items-center gap-2.5 text-white/90 shrink-0 whitespace-nowrap">
                              <FastForward size={15} className="text-[#ff0000]" />
                              <span className="font-semibold whitespace-nowrap">{isVi ? 'Tốc độ phát' : 'Playback speed'}</span>
                            </span>
                            <span className="flex items-center gap-1 text-[11px] text-white/60 shrink-0 whitespace-nowrap">
                              <span className="whitespace-nowrap">{playbackSpeed === 1.0 ? 'Chuẩn' : `${playbackSpeed}x`}</span>
                              <ChevronRight size={13} />
                            </span>
                          </button>
                        </div>
                      )}

                      {/* Quality Submenu */}
                      {settingsSubmenu === 'quality' && (
                        <div className="space-y-0.5">
                          <button
                            type="button"
                            onClick={() => setSettingsSubmenu('main')}
                            className="w-full flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white/70 hover:text-white border-b border-white/10 cursor-pointer mb-1 whitespace-nowrap"
                          >
                            <ChevronLeft size={14} />
                            <span className="whitespace-nowrap">{isVi ? 'Chất lượng video' : 'Video quality'}</span>
                          </button>
                          {qualities.map((q) => {
                            const isSelected = selectedQuality === q.id
                            return (
                              <button
                                key={q.id}
                                type="button"
                                onClick={() => handleQualityChange(q.id)}
                                className={`w-full flex items-center justify-between px-3.5 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                                  isSelected ? 'bg-white/15 text-white font-bold' : 'text-white/80 hover:bg-white/10'
                                }`}
                              >
                                <span className="flex items-center gap-2 whitespace-nowrap">
                                  <span className="whitespace-nowrap">
                                    {q.id === 'auto' ? `Tự động (${effectiveQualityLabel})` : q.label}
                                  </span>
                                  {q.height && q.height >= 720 && (
                                    <span className="rounded bg-[#ff0000]/20 text-[#ff0000] px-1.5 py-0.5 text-[9px] font-bold whitespace-nowrap">
                                      HD
                                    </span>
                                  )}
                                </span>
                                {isSelected && <Check size={13} className="text-[#ff0000] ml-3 shrink-0" />}
                              </button>
                            )
                          })}
                        </div>
                      )}

                      {/* Speed Submenu */}
                      {settingsSubmenu === 'speed' && (
                        <div className="space-y-0.5">
                          <button
                            type="button"
                            onClick={() => setSettingsSubmenu('main')}
                            className="w-full flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white/70 hover:text-white border-b border-white/10 cursor-pointer mb-1 whitespace-nowrap"
                          >
                            <ChevronLeft size={14} />
                            <span className="whitespace-nowrap">{isVi ? 'Tốc độ phát lại' : 'Playback speed'}</span>
                          </button>
                          {PLAYBACK_SPEEDS.map((speed) => (
                            <button
                              key={speed}
                              type="button"
                              onClick={() => handleSpeedChange(speed)}
                              className={`w-full flex items-center justify-between px-3.5 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                                playbackSpeed === speed
                                  ? 'bg-white/15 text-white font-bold'
                                  : 'text-white/80 hover:bg-white/10'
                              }`}
                            >
                              <span className="whitespace-nowrap">{speed === 1.0 ? '1.0x (Chuẩn)' : `${speed}x`}</span>
                              {playbackSpeed === speed && <Check size={13} className="text-[#ff0000] ml-3 shrink-0" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Picture in Picture */}
                <button
                  type="button"
                  onClick={togglePip}
                  className="p-1.5 rounded-full text-white/90 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  title="Hình trong hình (p)"
                >
                  <PictureInPicture2 size={18} />
                </button>

                {/* Fullscreen */}
                <button
                  type="button"
                  onClick={toggleFullscreen}
                  className="p-1.5 rounded-full text-white/90 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  title={isFullscreen ? 'Thoát toàn màn hình (f)' : 'Toàn màn hình (f)'}
                >
                  {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

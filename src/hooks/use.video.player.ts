// Custom hook quản lý phát video bài giảng, controls và phím tắt cho quản trị viên.

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { toast } from '@/store/toast.store'

export interface UseVideoPlayerProps {
  isOpen: boolean
  onClose: () => void
  resolvedUrl: string
  videoUrl: string
  isVi?: boolean
}

export const videoDimensionsCache = new Map<string, { width: number; height: number }>()

export function useVideoPlayer({
  isOpen,
  onClose,
  resolvedUrl,
  videoUrl,
  isVi = true,
}: UseVideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
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



  const [hoverPosition, setHoverPosition] = useState<number | null>(null)
  const [hoverTime, setHoverTime] = useState<number | null>(null)
  const [seekFeedback, setSeekFeedback] = useState<{ type: 'rewind' | 'forward'; text: string } | null>(null)

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
  }, [isOpen, togglePlay, toggleFullscreen, toggleMute, seekRelative, volume, onClose])

  return {
    containerRef,
    videoRef,
    progressBarRef,
    isPlaying,
    setIsPlaying,
    currentTime,
    setCurrentTime,
    duration,
    setDuration,
    bufferedPercent,
    setBufferedPercent,
    volume,
    isMuted,
    playbackSpeed,
    isFullscreen,
    showControls,
    setShowControls,
    isBuffering,
    setIsBuffering,
    copied,

    hoverPosition,
    hoverTime,
    seekFeedback,
    videoDims,
    setVideoDims,
    isMetadataLoaded,
    setIsMetadataLoaded,
    isPortrait,
    resetControlsTimer,
    togglePlay,
    toggleMute,
    handleVolumeChange,
    seekTo,
    seekRelative,
    handleSpeedChange,
    toggleFullscreen,
    togglePip,
    handleCopyLink,
    handleTimelineClick,
    handleTimelineMouseMove,
    setHoverPosition,
    setHoverTime,
  }
}

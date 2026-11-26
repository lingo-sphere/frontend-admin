// Trình phát âm thanh hiện đại cho giao diện quản trị với bộ điều khiển tùy chỉnh.

import { useState, useRef, useEffect, useCallback } from 'react'
import {
  Play,
  Pause,
  Volume2,
  Volume1,
  VolumeX,
  RotateCcw,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { resolveMediaUrl } from '@/lib/media.utils'

export interface CustomAudioPlayerProps {
  src?: string | null
  title?: string
  variant?: 'default' | 'compact' | 'minimal'
  className?: string
  preload?: 'none' | 'metadata' | 'auto'
  autoPlay?: boolean
  loop?: boolean
  showSpeed?: boolean
  showVolume?: boolean
  showSkip?: boolean
  startTime?: number
  endTime?: number
  onPlay?: () => void
  onPause?: () => void
  onEnded?: () => void
  onError?: () => void
}

const SPEED_OPTIONS = [1, 1.25, 1.5, 0.75]

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function CustomAudioPlayer({
  src,
  title,
  variant = 'default',
  className = '',
  preload = 'metadata',
  autoPlay = false,
  loop = false,
  showSpeed = true,
  showVolume = true,
  showSkip = true,
  startTime,
  endTime,
  onPlay,
  onPause,
  onEnded,
  onError,
}: CustomAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [speedIndex, setSpeedIndex] = useState(0)
  const [showVolumeSlider, setShowVolumeSlider] = useState(false)

  const resolvedSrc = src ? resolveMediaUrl(src) : ''

  const syncDuration = useCallback(() => {
    if (audioRef.current && Number.isFinite(audioRef.current.duration)) {
      const boundDuration = endTime && endTime > 0 ? endTime : audioRef.current.duration
      setDuration(boundDuration)
      setIsLoading(false)
    }
  }, [endTime])

  useEffect(() => {
    setIsPlaying(false)
    setCurrentTime(0)
    setDuration(0)
    setIsError(false)
    setIsLoading(Boolean(resolvedSrc))
  }, [resolvedSrc])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleLoadedMetadata = () => {
      syncDuration()
      if (startTime && startTime > 0) {
        audio.currentTime = startTime
        setCurrentTime(startTime)
      }
    }

    const handleTimeUpdate = () => {
      const current = audio.currentTime
      if (endTime && endTime > 0 && current >= endTime) {
        audio.pause()
        setIsPlaying(false)
        onEnded?.()
        return
      }
      setCurrentTime(current)
    }

    const handleWaiting = () => setIsLoading(true)
    const handleCanPlay = () => setIsLoading(false)

    const handleEnded = () => {
      setIsPlaying(false)
      if (startTime && startTime > 0) {
        audio.currentTime = startTime
        setCurrentTime(startTime)
      }
      onEnded?.()
    }

    const handleError = () => {
      setIsLoading(false)
      setIsPlaying(false)
      setIsError(true)
      onError?.()
    }

    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('waiting', handleWaiting)
    audio.addEventListener('canplay', handleCanPlay)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('error', handleError)

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('waiting', handleWaiting)
      audio.removeEventListener('canplay', handleCanPlay)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('error', handleError)
    }
  }, [endTime, startTime, syncDuration, onEnded, onError])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio || !resolvedSrc) return

    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
      onPause?.()
    } else {
      if (endTime && endTime > 0 && audio.currentTime >= endTime) {
        audio.currentTime = startTime || 0
      }
      audio
        .play()
        .then(() => {
          setIsPlaying(true)
          onPlay?.()
        })
        .catch(() => {
          setIsPlaying(false)
        })
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current
    if (!audio) return
    const targetTime = Number(e.target.value)
    audio.currentTime = targetTime
    setCurrentTime(targetTime)
  }

  const handleReplay = () => {
    const audio = audioRef.current
    if (!audio) return
    const restartPoint = startTime || 0
    audio.currentTime = restartPoint
    setCurrentTime(restartPoint)
    if (!isPlaying) {
      audio
        .play()
        .then(() => {
          setIsPlaying(true)
          onPlay?.()
        })
        .catch(() => {})
    }
  }

  const cycleSpeed = () => {
    const audio = audioRef.current
    if (!audio) return
    const nextIndex = (speedIndex + 1) % SPEED_OPTIONS.length
    const nextSpeed = SPEED_OPTIONS[nextIndex]
    setSpeedIndex(nextIndex)
    audio.playbackRate = nextSpeed
  }

  const toggleMute = () => {
    const audio = audioRef.current
    if (!audio) return
    const nextMuted = !isMuted
    setIsMuted(nextMuted)
    audio.muted = nextMuted
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current
    if (!audio) return
    const nextVol = Number(e.target.value)
    setVolume(nextVol)
    audio.volume = nextVol
    if (nextVol === 0) {
      setIsMuted(true)
      audio.muted = true
    } else if (isMuted) {
      setIsMuted(false)
      audio.muted = false
    }
  }

  const currentSpeed = SPEED_OPTIONS[speedIndex]
  const progressPercent = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0

  if (!resolvedSrc) {
    return (
      <div className={`flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 text-xs text-slate-400 ${className}`}>
        <VolumeX size={15} className="shrink-0" />
        <span>Chưa có tệp âm thanh.</span>
      </div>
    )
  }

  if (isError) {
    return (
      <div className={`flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 ${className}`}>
        <div className="flex items-center gap-2 min-w-0">
          <AlertCircle size={15} className="text-rose-500 shrink-0" />
          <span className="truncate">Không thể tải tệp âm thanh.</span>
        </div>
        <button
          type="button"
          onClick={() => {
            setIsError(false)
            setIsLoading(true)
            if (audioRef.current) {
              audioRef.current.load()
            }
          }}
          className="shrink-0 font-bold hover:underline cursor-pointer"
        >
          Thử lại
        </button>
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 shadow-xs hover:border-slate-300 transition-all ${className}`}>
        <audio
          ref={audioRef}
          src={resolvedSrc}
          preload={preload}
          autoPlay={autoPlay}
          loop={loop}
        />

        <button
          type="button"
          onClick={togglePlay}
          disabled={isLoading}
          aria-label={isPlaying ? 'Tạm dừng' : 'Phát audio'}
          className="flex h-6 w-6 items-center justify-center rounded bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 transition-all shadow-xs cursor-pointer shrink-0 disabled:opacity-60"
        >
          {isLoading ? (
            <Loader2 size={12} className="animate-spin" />
          ) : isPlaying ? (
            <Pause size={12} className="fill-current" />
          ) : (
            <Play size={12} className="fill-current ml-0.5" />
          )}
        </button>

        <div className="flex-1 min-w-0 flex items-center gap-1.5">
          <span className="text-[10px] font-mono font-medium text-slate-500 select-none shrink-0 w-7 text-right">
            {formatTime(currentTime)}
          </span>

          <div className="relative flex-1 flex items-center h-3 group">
            <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 rounded-full transition-all duration-75"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <input
              type="range"
              min={startTime || 0}
              max={duration || 1}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
              aria-label="Thanh tiến trình audio"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>

          <span className="text-[10px] font-mono font-medium text-slate-500 select-none shrink-0 w-7">
            {formatTime(duration)}
          </span>
        </div>

        {showVolume && (
          <button
            type="button"
            onClick={toggleMute}
            aria-label={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
            className="flex h-6 w-6 items-center justify-center rounded text-slate-500 hover:text-slate-800 transition-colors cursor-pointer shrink-0"
          >
            {isMuted || volume === 0 ? (
              <VolumeX size={13} />
            ) : volume < 0.5 ? (
              <Volume1 size={13} />
            ) : (
              <Volume2 size={13} />
            )}
          </button>
        )}
      </div>
    )
  }

  return (
    <div className={`p-3 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-all space-y-2 ${className}`}>
      <audio
        ref={audioRef}
        src={resolvedSrc}
        preload={preload}
        autoPlay={autoPlay}
        loop={loop}
      />

      {title && (
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="flex h-5 w-5 items-center justify-center rounded bg-emerald-50 text-emerald-600 shrink-0">
              <Volume2 size={12} />
            </div>
            <span className="text-xs font-semibold text-slate-800 truncate">
              {title}
            </span>
          </div>

          {isPlaying && (
            <div className="flex items-end gap-0.5 h-3 shrink-0 px-1.5 py-0.5 rounded-full bg-emerald-50">
              <span className="w-0.5 bg-emerald-600 rounded-full animate-pulse h-full" />
              <span className="w-0.5 bg-emerald-600 rounded-full animate-pulse delay-75 h-2" />
              <span className="w-0.5 bg-emerald-600 rounded-full animate-pulse delay-150 h-2.5" />
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={togglePlay}
          disabled={isLoading}
          aria-label={isPlaying ? 'Tạm dừng' : 'Phát audio'}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 transition-all shadow-xs cursor-pointer shrink-0 disabled:opacity-60"
        >
          {isLoading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : isPlaying ? (
            <Pause size={14} className="fill-current" />
          ) : (
            <Play size={14} className="fill-current ml-0.5" />
          )}
        </button>

        {showSkip && (
          <button
            type="button"
            onClick={handleReplay}
            aria-label="Phát lại từ đầu"
            title="Phát lại từ đầu"
            className="flex h-7 w-7 items-center justify-center rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer shrink-0"
          >
            <RotateCcw size={13} />
          </button>
        )}

        <div className="flex-1 min-w-0 space-y-0.5">
          <div className="relative flex items-center h-4 group">
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden transition-all group-hover:h-2">
              <div
                className="h-full bg-emerald-600 rounded-full transition-all duration-75"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <input
              type="range"
              min={startTime || 0}
              max={duration || 1}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
              aria-label="Thanh tiến trình audio"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono font-medium text-slate-400 select-none px-0.5">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {showSpeed && (
            <button
              type="button"
              onClick={cycleSpeed}
              title="Đổi tốc độ phát"
              className="px-1.5 py-0.5 rounded text-[10px] font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer"
            >
              {currentSpeed}x
            </button>
          )}

          {showVolume && (
            <div
              className="relative flex items-center"
              onMouseEnter={() => setShowVolumeSlider(true)}
              onMouseLeave={() => setShowVolumeSlider(false)}
            >
              <button
                type="button"
                onClick={toggleMute}
                aria-label={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
                className="flex h-7 w-7 items-center justify-center rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX size={14} />
                ) : volume < 0.5 ? (
                  <Volume1 size={14} />
                ) : (
                  <Volume2 size={14} />
                )}
              </button>

              {showVolumeSlider && (
                <div className="absolute right-0 bottom-full mb-1 p-2 rounded-lg bg-white border border-slate-200 shadow-md flex items-center z-20">
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    aria-label="Thanh âm lượng"
                    className="w-16 h-1 accent-emerald-600 cursor-pointer"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Thanh điều khiển phát video chuẩn cho quản trị viên.

import React, { useState } from 'react'
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
  Check,
  RotateCcw,
  RotateCw,
  FastForward,
} from 'lucide-react'

const PLAYBACK_SPEEDS = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0]

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

interface VideoControlsBarProps {
  isPlaying: boolean
  currentTime: number
  duration: number
  bufferedPercent: number
  volume: number
  isMuted: boolean
  playbackSpeed: number
  isFullscreen: boolean
  showControls: boolean
  isVi: boolean
  progressBarRef: React.RefObject<HTMLDivElement | null>
  onTogglePlay: () => void
  onSeekRelative: (seconds: number) => void
  onToggleMute: () => void
  onVolumeChange: (vol: number) => void
  onTimelineClick: (e: React.MouseEvent<HTMLDivElement>) => void
  onTimelineMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void
  onTimelineMouseLeave: () => void
  hoverPosition: number | null
  hoverTime: number | null
  onSpeedChange: (speed: number) => void
  onTogglePip: () => void
  onToggleFullscreen: () => void
}

export function VideoControlsBar({
  isPlaying,
  currentTime,
  duration,
  bufferedPercent,
  volume,
  isMuted,
  playbackSpeed,
  isFullscreen,
  showControls,
  isVi,
  progressBarRef,
  onTogglePlay,
  onSeekRelative,
  onToggleMute,
  onVolumeChange,
  onTimelineClick,
  onTimelineMouseMove,
  onTimelineMouseLeave,
  hoverPosition,
  hoverTime,
  onSpeedChange,
  onTogglePip,
  onToggleFullscreen,
}: VideoControlsBarProps) {
  const [showSettingsMenu, setShowSettingsMenu] = useState(false)

  const playedPercent = duration > 0 ? (currentTime / duration) * 100 : 0

  const handleSelectSpeed = (speed: number) => {
    onSpeedChange(speed)
    setShowSettingsMenu(false)
  }

  return (
    <div
      className={`absolute bottom-0 left-0 right-0 z-30 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-8 pb-2 px-3 sm:px-4 transition-opacity duration-200 ${
        showControls || !isPlaying ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div
        ref={progressBarRef}
        onClick={onTimelineClick}
        onMouseMove={onTimelineMouseMove}
        onMouseLeave={onTimelineMouseLeave}
        className="group/timeline relative w-full h-4 cursor-pointer flex items-center mb-1"
      >
        <div className="relative w-full h-[3px] group-hover/timeline:h-[5px] rounded-full bg-white/25 transition-all overflow-visible">
          <div
            className="absolute top-0 bottom-0 left-0 bg-white/40 rounded-full transition-all"
            style={{ width: `${bufferedPercent}%` }}
          />

          <div
            className="absolute top-0 bottom-0 left-0 bg-[#ff0000] rounded-full"
            style={{ width: `${playedPercent}%` }}
          />

          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-3.5 w-3.5 rounded-full bg-[#ff0000] shadow-md scale-0 group-hover/timeline:scale-100 transition-transform duration-100 pointer-events-none"
            style={{ left: `${playedPercent}%` }}
          />
        </div>

        {hoverTime !== null && hoverPosition !== null && (
          <div
            className="pointer-events-none absolute -top-8 -translate-x-1/2 rounded bg-[#0f0f0f]/90 text-white font-mono text-[11px] font-semibold px-1.5 py-0.5 shadow-xl border border-white/10"
            style={{ left: `${hoverPosition}%` }}
          >
            {formatTime(hoverTime)}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 text-white">
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={onTogglePlay}
            className="p-1.5 text-white hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            title={isPlaying ? 'Tạm dừng (k)' : 'Phát (k)'}
          >
            {isPlaying ? (
              <Pause size={22} className="fill-white" />
            ) : (
              <Play size={22} className="fill-white ml-0.5" />
            )}
          </button>

          <button
            type="button"
            onClick={() => onSeekRelative(-10)}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            title="Lùi 10s (j)"
          >
            <RotateCcw size={18} />
          </button>

          <button
            type="button"
            onClick={() => onSeekRelative(10)}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            title="Tới 10s (l)"
          >
            <RotateCw size={18} />
          </button>

          <div className="group/vol flex items-center">
            <button
              type="button"
              onClick={onToggleMute}
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
                onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                className="w-16 h-1 accent-[#ff0000] bg-white/30 rounded cursor-pointer"
              />
            </div>
          </div>

          <div className="text-xs text-white/90 font-medium tracking-wide ml-1 select-none">
            <span>{formatTime(currentTime)}</span>
            <span className="text-white/50 mx-1">/</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowSettingsMenu(!showSettingsMenu)}
              className={`p-1.5 rounded-full text-white/90 hover:text-white hover:bg-white/10 transition-colors cursor-pointer relative ${
                showSettingsMenu ? 'rotate-45' : ''
              }`}
              title={isVi ? 'Cài đặt tốc độ' : 'Speed settings'}
            >
              <Settings size={18} />
            </button>

            {showSettingsMenu && (
              <div className="absolute bottom-full right-0 mb-3 min-w-[200px] w-max max-w-xs rounded-2xl bg-[#0f0f0f]/95 backdrop-blur-xl border border-white/10 p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 text-white">
                <div className="px-3 py-2 text-xs font-bold text-white/70 border-b border-white/10 mb-1 flex items-center gap-2">
                  <FastForward size={14} className="text-[#ff0000]" />
                  <span className="whitespace-nowrap">{isVi ? 'Tốc độ phát lại' : 'Playback speed'}</span>
                </div>
                <div className="space-y-0.5">
                  {PLAYBACK_SPEEDS.map((speed) => {
                    const isSelected = playbackSpeed === speed
                    return (
                      <button
                        key={speed}
                        type="button"
                        onClick={() => handleSelectSpeed(speed)}
                        className={`w-full flex items-center justify-between px-3.5 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                          isSelected ? 'bg-white/15 text-white font-bold' : 'text-white/80 hover:bg-white/10'
                        }`}
                      >
                        <span className="whitespace-nowrap">
                          {speed === 1.0 ? (isVi ? '1.0x (Chuẩn)' : '1.0x (Normal)') : `${speed}x`}
                        </span>
                        {isSelected && <Check size={13} className="text-[#ff0000] ml-3 shrink-0" />}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onTogglePip}
            className="p-1.5 rounded-full text-white/90 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Hình trong hình (p)"
          >
            <PictureInPicture2 size={18} />
          </button>

          <button
            type="button"
            onClick={onToggleFullscreen}
            className="p-1.5 rounded-full text-white/90 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title={isFullscreen ? 'Thoát toàn màn hình (f)' : 'Toàn màn hình (f)'}
          >
            {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
          </button>
        </div>
      </div>
    </div>
  )
}

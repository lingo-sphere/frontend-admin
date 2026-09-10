/**
 * @file video.preview.modal.tsx
 * @description YouTube-styled video preview modal supporting HLS stream playback, keyboard shortcuts, and full-screen view
 */

import { useEffect } from 'react'
import Hls from 'hls.js'
import {
  X,
  Check,
  RotateCcw,
  RotateCw,
  Copy,
} from 'lucide-react'
import { API_CONFIG } from '@/config/api.config'
import { VideoControlsBar, type QualityOption } from '@/components/video.controls.bar'
import {
  useVideoPlayer,
  videoDimensionsCache,
} from '@/hooks/use.video.player'

export { videoDimensionsCache } from '@/hooks/use.video.player'

export interface VideoPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  videoUrl: string
  title?: string
  isVi?: boolean
}

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
  const resolvedUrl = resolveStreamUrl(videoUrl)
  const isHls = resolvedUrl.includes('.m3u8')
  const isEmbed = resolvedUrl.includes('youtube.com') || resolvedUrl.includes('youtu.be')

  const {
    containerRef,
    videoRef,
    hlsRef,
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
    isBuffering,
    setIsBuffering,
    copied,
    qualities,
    setQualities,
    selectedQuality,
    effectiveQualityLabel,
    setEffectiveQualityLabel,
    hoverPosition,
    hoverTime,
    seekFeedback,
    setVideoDims,
    isMetadataLoaded,
    setIsMetadataLoaded,
    isPortrait,
    resetControlsTimer,
    togglePlay,
    toggleMute,
    handleVolumeChange,
    seekRelative,
    handleSpeedChange,
    handleQualityChange,
    toggleFullscreen,
    togglePip,
    handleCopyLink,
    handleTimelineClick,
    handleTimelineMouseMove,
    setHoverPosition,
    setHoverTime,
  } = useVideoPlayer({
    isOpen,
    onClose,
    resolvedUrl,
    videoUrl,
    isVi,
  })

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
  }, [isOpen, resolvedUrl, isHls, isEmbed, isVi, videoRef, hlsRef, setIsBuffering, setIsPlaying, setQualities, setEffectiveQualityLabel])

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

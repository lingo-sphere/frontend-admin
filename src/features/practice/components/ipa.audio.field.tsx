// Thành phần hiển thị và chọn file âm thanh cho phần Luyện tập Admin.

import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { AlertCircle, Loader2, Pause, Play } from 'lucide-react'
import { Button, Input, Space, Tooltip, Upload } from 'antd'
import { mediaService } from '@/features/media/services/media.service'
import { resolveMediaUrl } from '@/lib/media.utils'
import { toast } from '@/store/toast.store'
import { api } from '@/services/api.client'
import { usePracticeText } from '@/features/practice/hooks/use.practice.text'
import { PracticeMediaLibrary } from '@/features/practice/components/practice.media.library'

function formatSeconds(sec: number): string {
  if (!sec || isNaN(sec) || sec <= 0) return '0:00'
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function IpaAudioPreview({
  value,
  duration: propDuration,
  onDurationDetected,
}: {
  value: string
  duration?: number
  onDurationDetected?: (duration: number) => void
}) {
  const p = usePracticeText()
  const isId = /^[a-f\d]{24}$/i.test(value)
  const metadata = useQuery({
    queryKey: ['ipa-media-preview', value],
    queryFn: () => api.get<{ storage_key: string }>(`/media/files/${value}`),
    enabled: isId,
  })

  const key = isId ? metadata.data?.storage_key : value
  const audioUrl = key ? resolveMediaUrl(key) : ''

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [totalDuration, setTotalDuration] = useState<number>(propDuration || 0)
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (propDuration && propDuration > 0) {
      setTotalDuration(propDuration)
    }
  }, [propDuration])

  useEffect(() => {
    setIsPlaying(false)
    setCurrentTime(0)
    setHasError(false)
  }, [audioUrl])

  useEffect(() => {
    const handleOtherPlay = (event: CustomEvent<{ audio: HTMLAudioElement }>) => {
      if (audioRef.current && event.detail.audio !== audioRef.current) {
        audioRef.current.pause()
        setIsPlaying(false)
      }
    }
    window.addEventListener('lingo-audio-play' as never, handleOtherPlay as never)
    return () => {
      window.removeEventListener('lingo-audio-play' as never, handleOtherPlay as never)
    }
  }, [])

  if (!value) return null

  if (isId && metadata.isLoading) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
        <Loader2 size={12} className="animate-spin" />
        {p('Đang tải audio…')}
      </span>
    )
  }

  if (isId && metadata.isError) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-rose-500">
        <AlertCircle size={12} />
        {p('Không tải được audio')}
      </span>
    )
  }

  if (!audioUrl) {
    return <span className="text-xs text-slate-400">{p('Chưa có audio')}</span>
  }

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) {
      audio.pause()
    } else {
      window.dispatchEvent(new CustomEvent('lingo-audio-play', { detail: { audio } }))
      setIsLoading(true)
      if (audio.preload === 'none') {
        audio.preload = 'auto'
      }
      audio.play().catch(() => {
        setHasError(true)
        setIsPlaying(false)
      }).finally(() => {
        setIsLoading(false)
      })
    }
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current
    if (!audio || !totalDuration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const newProgress = Math.max(0, Math.min(1, clickX / rect.width))
    const newTime = newProgress * totalDuration
    audio.currentTime = newTime
    setCurrentTime(newTime)
  }

  const progressPercent = totalDuration > 0 ? Math.min(100, (currentTime / totalDuration) * 100) : 0

  return (
    <div
      onMouseEnter={() => {
        const audio = audioRef.current
        if (audio && audio.preload === 'none') {
          audio.preload = 'metadata'
        }
      }}
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 max-w-[150px] w-full shadow-2xs hover:border-emerald-400/60 dark:hover:border-emerald-500/60 transition-colors"
    >
      <audio
        ref={audioRef}
        src={audioUrl}
        preload="none"
        onLoadedMetadata={e => {
          const dur = e.currentTarget.duration
          if (dur && !isNaN(dur) && isFinite(dur)) {
            setTotalDuration(dur)
            onDurationDetected?.(Math.round(dur))
          }
        }}
        onTimeUpdate={e => setCurrentTime(e.currentTarget.currentTime)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          setIsPlaying(false)
          setCurrentTime(0)
        }}
        onError={() => setHasError(true)}
      />

      <button
        type="button"
        onClick={togglePlay}
        disabled={hasError}
        className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 text-white shadow-2xs transition-transform active:scale-95 cursor-pointer"
        aria-label={isPlaying ? p('Dừng') : p('Phát')}
      >
        {isLoading ? (
          <Loader2 size={10} className="animate-spin" />
        ) : isPlaying ? (
          <Pause size={9} className="fill-current" />
        ) : (
          <Play size={9} className="fill-current ml-0.5" />
        )}
      </button>

      <div
        onClick={handleSeek}
        className="relative flex-1 h-1 bg-slate-200 dark:bg-slate-700 rounded-full cursor-pointer overflow-hidden group"
        title={p('Tua')}
      >
        <div
          className="h-full bg-emerald-500 rounded-full transition-all duration-75"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="text-[10px] font-mono tabular-nums text-slate-600 dark:text-slate-300 whitespace-nowrap shrink-0 text-right min-w-[50px]">
        {hasError ? (
          <Tooltip title={p('Lỗi phát file audio')}>
            <span className="text-rose-500 inline-flex items-center gap-0.5">
              <AlertCircle size={10} /> {p('Lỗi')}
            </span>
          </Tooltip>
        ) : totalDuration > 0 ? (
          isPlaying
            ? `${formatSeconds(currentTime)} / ${formatSeconds(totalDuration)}`
            : `0:00 / ${formatSeconds(totalDuration)}`
        ) : (
          '0:00'
        )}
      </div>
    </div>
  )
}

export function IpaAudioField({
  value = '',
  onChange,
  onBusy,
  disabled,
  onDurationDetected,
}: {
  value?: string
  onChange?: (key: string) => void
  onBusy: (delta: number) => void
  disabled?: boolean
  onDurationDetected?: (duration: number) => void
}) {
  const p = usePracticeText()
  const [uploading, setUploading] = useState(false)
  return (
    <div className="space-y-2">
      <Space.Compact style={{ width: '100%' }}>
        <Input
          aria-label="Storage key audio"
          placeholder={p('Key audio có sẵn hoặc tải file lên')}
          value={value}
          disabled={disabled || uploading}
          allowClear
          onChange={event => onChange?.(event.target.value)}
        />
        <Upload
          showUploadList={false}
          accept="audio/*,.mp3,.wav,.ogg,.m4a"
          disabled={disabled || uploading}
          beforeUpload={file => {
            if (!file.type.startsWith('audio/') && !/\.(mp3|wav|ogg|m4a)$/i.test(file.name)) {
              toast.error(p('Chỉ chấp nhận file audio'))
              return false
            }
            if (file.size > 20 * 1024 * 1024) {
              toast.error(p('Audio tối đa 20 MB'))
              return false
            }
            setUploading(true)
            onBusy(1)
            void mediaService
              .uploadFile(file, 'ipa/audio')
              .then(result => {
                onChange?.(result.storage_key || result.file_url)
              })
              .catch(error => toast.error(error instanceof Error ? error.message : p('Upload thất bại')))
              .finally(() => {
                setUploading(false)
                onBusy(-1)
              })
            return false
          }}
        >
          <Button loading={uploading} disabled={disabled}>
            {p('Tải audio')}
          </Button>
        </Upload>
      </Space.Compact>
      <PracticeMediaLibrary kind="AUDIO" disabled={disabled || uploading} onSelect={file => onChange?.(file.storage_key)} />
      {value && <IpaAudioPreview value={value} onDurationDetected={onDurationDetected} />}
    </div>
  )
}

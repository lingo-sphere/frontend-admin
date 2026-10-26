import { usePracticeText } from '../hooks/use.practice.text'
import { PracticeMediaLibrary } from './practice.media.library'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button, Input, Space, Upload } from 'antd'
import { mediaService } from '@/features/media/services/media.service'
import { resolveMediaUrl } from '@/lib/media.utils'
import { toast } from '@/store/toast.store'
import { api } from '@/services/api.client'

export function IpaAudioPreview({ value }: { value: string }) {
  const p = usePracticeText()
  const isId = /^[a-f\d]{24}$/i.test(value)
  const metadata = useQuery({ queryKey: ['ipa-media-preview', value], queryFn: () => api.get<{ storage_key: string }>(`/media/files/${value}`), enabled: isId })
  const key = isId ? metadata.data?.storage_key : value
  return key ? <audio key={key} controls preload="none" src={resolveMediaUrl(key)} style={{ height: 32, maxWidth: '100%', width: 180 }} /> : <span>{metadata.isError ? p("Không tải được audio") : p("Đang tải audio…")}</span>
}

export function IpaAudioField({ value = '', onChange, onBusy, disabled }: { value?: string; onChange?: (key: string) => void; onBusy: (delta: number) => void; disabled?: boolean }) {
  const p = usePracticeText()
  const [uploading, setUploading] = useState(false)
  return <div className="space-y-2">
    <Space.Compact style={{ width: '100%' }}>
      <Input aria-label="Storage key audio" placeholder={p("Key audio có sẵn hoặc tải file lên")} value={value} disabled={disabled || uploading} allowClear onChange={event => onChange?.(event.target.value)} />
      <Upload showUploadList={false} accept="audio/*,.mp3,.wav,.ogg,.m4a" disabled={disabled || uploading} beforeUpload={file => {
        if (!file.type.startsWith('audio/') && !/\.(mp3|wav|ogg|m4a)$/i.test(file.name)) { toast.error(p("Chỉ chấp nhận file audio")); return false }
        if (file.size > 20 * 1024 * 1024) { toast.error(p("Audio tối đa 20 MB")); return false }
        setUploading(true); onBusy(1)
        void mediaService.uploadFile(file, 'ipa/audio').then(result => { onChange?.(result.storage_key || result.file_url) }).catch(error => toast.error(error instanceof Error ? error.message : p("Upload thất bại"))).finally(() => { setUploading(false); onBusy(-1) })
        return false
      }}><Button loading={uploading} disabled={disabled}>{p("Tải audio")}</Button></Upload>
    </Space.Compact>
    <PracticeMediaLibrary kind="AUDIO" disabled={disabled || uploading} onSelect={file => onChange?.(file.storage_key)} />
    {value && <IpaAudioPreview value={value} />}
  </div>
}

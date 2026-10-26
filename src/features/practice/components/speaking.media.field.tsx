import { usePracticeText } from '../hooks/use.practice.text'
import { PracticeMediaLibrary } from './practice.media.library'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Alert, Button, Image, Space, Upload } from 'antd'
import { api } from '@/services/api.client'
import { mediaService } from '@/features/media/services/media.service'
import { resolveMediaUrl } from '@/lib/media.utils'
import { toast } from '@/store/toast.store'

export function SpeakingAudioPreview({ value }: { value: string }) {
  const p = usePracticeText()
  const [failed, setFailed] = useState('')
  const [retry, setRetry] = useState(0)
  const isId = /^[a-f\d]{24}$/i.test(value)
  const result = useQuery({ queryKey: ['speaking-media', value], queryFn: () => api.get<{ storage_key: string }>(`/media/files/${value}`), enabled: isId })
  const key = isId ? result.data?.storage_key : value
  return <div className="space-y-2">{key && <audio key={`${key}-${retry}`} controls preload="none" src={resolveMediaUrl(key)} onError={() => setFailed(value)} style={{ height: 34, width: 210, maxWidth: '100%' }} />}{(failed === value || result.isError) && <Alert type="error" title={p("Không phát được audio. Kiểm tra tệp hoặc tạo lại TTS.")} action={<Button size="small" onClick={() => { setFailed(''); setRetry(count => count + 1); if (isId) void result.refetch() }}>{p("Thử lại")}</Button>} />}</div>
}

export function SpeakingMediaPreview({ value, kind }: { value: string; kind: 'audio' | 'image' }) {
  const p = usePracticeText()
  const result = useQuery({ queryKey: ['speaking-media', value], queryFn: () => api.get<{ storage_key: string }>(`/media/files/${value}`), enabled: kind === 'image' && /^[a-f\d]{24}$/i.test(value) })
  if (kind === 'audio') return <SpeakingAudioPreview value={value} />
  const key = /^[a-f\d]{24}$/i.test(value) ? result.data?.storage_key : value
  return key ? <Image width={160} style={{ maxHeight: 160, objectFit: 'contain' }} src={resolveMediaUrl(key)} /> : <span>{result.isError ? p("Không tải được ảnh") : p("Đang tải ảnh…")}</span>
}
export function SpeakingMediaField({ value = '', onChange, onBusy, disabled, kind, folder }: { folder?: string; value?: string; onChange?: (id: string) => void; onBusy: (delta: number) => void; disabled: boolean; kind: 'audio' | 'image' }) {
  const p = usePracticeText()
  const [uploading, setUploading] = useState(false)
  return <div className="space-y-2"><Space wrap><Upload showUploadList={false} accept={kind === 'image' ? 'image/png,image/jpeg,image/webp' : 'audio/*,.mp3,.wav,.ogg,.m4a'} disabled={disabled || uploading} beforeUpload={file => {
    if (!(kind === 'image' ? /^image\/(png|jpeg|webp)$/.test(file.type) : file.type.startsWith('audio/') || /\.(mp3|wav|ogg|m4a)$/i.test(file.name))) { toast.error(p("Loại file không phù hợp")); return false }
    if (file.size > (kind === 'image' ? 10 : 20) * 1024 * 1024) { toast.error(p("File vượt dung lượng cho phép")); return false }
    setUploading(true); onBusy(1)
    void mediaService.uploadFile(file, folder || `practice/speaking/${kind}`).then(result => { if (!result.media_id || !/^[a-f\d]{24}$/i.test(result.media_id)) throw new Error(p("Upload chưa trả media ID hợp lệ; hãy kiểm tra media service")); onChange?.(result.media_id) }).catch(error => toast.error(error instanceof Error ? error.message : p("Tải file thất bại"))).finally(() => { setUploading(false); onBusy(-1) })
    return false
  }}><Button disabled={disabled} loading={uploading}>{p("Tải")} {kind === 'image' ? p("ảnh") : p("audio mẫu")}</Button></Upload><PracticeMediaLibrary kind={kind === "image" ? "IMAGE" : "AUDIO"} disabled={disabled || uploading} onSelect={file => onChange?.(file._id)} />{value && <Button danger disabled={disabled || uploading} onClick={() => onChange?.('')}>{p("Gỡ liên kết")}</Button>}</Space>{value && <SpeakingMediaPreview value={value} kind={kind} />}</div>
}

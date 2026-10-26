import { usePracticeText } from '../hooks/use.practice.text'
import { PracticeMediaLibrary } from './practice.media.library'
import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button, Select, Space, Upload } from 'antd'
import { api } from '@/services/api.client'
import { mediaService } from '@/features/media/services/media.service'
import { toast } from '@/store/toast.store'
import { SpeakingMediaPreview } from './speaking.media.field'
import { ReadingMediaPreview } from './reading.media.field'
export function GrammarMediaField({ value = '', onChange, disabled, onBusy }: { value?: string; onChange?: (id: string) => void; disabled: boolean; onBusy: (delta: number) => void }) {
  const p = usePracticeText()
  const [kind, setKind] = useState('IMAGE'); const [uploading, setUploading] = useState(false)
  const file = useQuery({ queryKey: ['grammar-media', value], queryFn: () => api.get<{ content_type: string }>(`/media/files/${value}`), enabled: Boolean(value) })
  useEffect(() => { if (file.data) setKind(file.data.content_type) }, [file.data])
  return <div className="space-y-2"><Space wrap><Select aria-label={p("Loại media Grammar")} disabled={disabled || uploading} value={kind} options={[{ value: 'IMAGE', label: p("Ảnh") }, { value: 'AUDIO', label: 'Audio' }, { value: 'VIDEO', label: 'Video' }]} onChange={type => { setKind(type); onChange?.('') }} /><Upload showUploadList={false} disabled={disabled || uploading} accept={kind === 'IMAGE' ? 'image/png,image/jpeg,image/webp' : kind === 'AUDIO' ? 'audio/*' : 'video/mp4,video/webm'} beforeUpload={asset => {
    if (!asset.type.startsWith(kind.toLowerCase() + '/') || asset.size > (kind === 'IMAGE' ? 10 : kind === 'AUDIO' ? 20 : 50) * 1024 * 1024) { toast.error(p("Loại file hoặc dung lượng không phù hợp")); return false }
    setUploading(true); onBusy(1); void mediaService.uploadFile(asset, `practice/grammar/${kind.toLowerCase()}`).then(result => { if (!result.media_id || !/^[a-f\d]{24}$/i.test(result.media_id)) throw new Error(p("Upload chưa trả media ID hợp lệ")); onChange?.(result.media_id) }).catch(error => toast.error(error instanceof Error ? error.message : p("Tải tệp thất bại"))).finally(() => { setUploading(false); onBusy(-1) }); return false
  }}><Button disabled={disabled} loading={uploading}>{p("Tải tệp")}</Button></Upload><PracticeMediaLibrary kind={kind as "IMAGE" | "AUDIO" | "VIDEO"} disabled={disabled || uploading} onSelect={file => onChange?.(file._id)} />{value && <Button danger disabled={disabled || uploading} onClick={() => onChange?.('')}>{p("Gỡ liên kết")}</Button>}</Space>{value && (file.error ? <span>{p("Không tải được metadata media")}</span> : kind === 'VIDEO' ? <ReadingMediaPreview value={value} kind="VIDEO" /> : <SpeakingMediaPreview value={value} kind={kind === 'AUDIO' ? 'audio' : 'image'} />)}</div>
}

// Component chọn và xem trước hình ảnh/video cho bài tập đọc Reading.
import { usePracticeText } from '@/features/practice/hooks/use.practice.text'
import { PracticeMediaLibrary } from '@/features/practice/components/practice.media.library'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Alert, Button, Space, Upload } from 'antd'
import { api } from '@/services/api.client'
import { mediaService } from '@/features/media/services/media.service'
import { resolveMediaUrl } from '@/lib/media.utils'
import { toast } from '@/store/toast.store'
import { SpeakingMediaPreview } from '@/features/practice/components/speaking.media.field'
export function ReadingMediaPreview({ value, kind }: { value: string; kind: 'IMAGE' | 'VIDEO' }) {
  const p = usePracticeText()
  const result = useQuery({ queryKey: ['reading-video', value], queryFn: () => api.get<{ storage_key: string }>(`/media/files/${value}`), enabled: kind === 'VIDEO' })
  const [failed, setFailed] = useState('')
  const [retry, setRetry] = useState(0)
  if (kind === 'IMAGE') return <SpeakingMediaPreview value={value} kind="image" />
  return <div className="space-y-2">{result.data && <video key={`${value}-${retry}`} controls preload="none" src={resolveMediaUrl(result.data.storage_key)} onError={() => setFailed(value)} style={{ width: 230, maxWidth: '100%', maxHeight: 180 }} />}{(result.error || failed === value) && <Alert type="error" title={p("Không tải/phát được video")} action={<Button disabled={false} onClick={() => { setFailed(''); setRetry(count => count + 1); void result.refetch() }}>{p("Thử lại")}</Button>} />}{!result.data && !result.error && <span>{p("Đang tải video…")}</span>}</div>
}
export function ReadingMediaField({ value = '', onChange, kind, disabled, onBusy }: { value?: string; onChange?: (value: string) => void; kind: 'IMAGE' | 'VIDEO'; disabled: boolean; onBusy: (delta: number) => void }) {
  const p = usePracticeText()
  const [uploading, setUploading] = useState(false)
  return <div className="space-y-2"><Space wrap><Upload showUploadList={false} disabled={disabled || uploading} accept={kind === 'IMAGE' ? 'image/png,image/jpeg,image/webp' : 'video/mp4,video/webm'} beforeUpload={file => {
    if (!(kind === 'IMAGE' ? /^image\/(png|jpeg|webp)$/ : /^video\/(mp4|webm)$/).test(file.type)) { toast.error(p("Loại file không phù hợp")); return false }
    if (file.size > (kind === 'IMAGE' ? 10 : 50) * 1024 * 1024) { toast.error(p("File vượt dung lượng cho phép")); return false }
    setUploading(true); onBusy(1)
    void mediaService.uploadFile(file, `practice/reading/${kind.toLowerCase()}`).then(result => { if (!result.media_id || !/^[a-f\d]{24}$/i.test(result.media_id)) throw new Error(p("Upload chưa trả media ID hợp lệ")); onChange?.(result.media_id) }).catch(error => toast.error(error instanceof Error ? error.message : p("Tải file thất bại"))).finally(() => { setUploading(false); onBusy(-1) })
    return false
  }}><Button loading={uploading} disabled={disabled}>{p("Tải")} {kind === 'IMAGE' ? p("ảnh") : 'video'}</Button></Upload><PracticeMediaLibrary kind={kind} disabled={disabled || uploading} onSelect={file => onChange?.(file._id)} />{value && <Button danger disabled={disabled || uploading} onClick={() => onChange?.('')}>{p("Gỡ liên kết")}</Button>}</Space>{value && <ReadingMediaPreview value={value} kind={kind} />}</div>
}

// Thành phần tải lên và chọn media (audio hoặc ảnh) cho phần Luyện tập Admin.

import { useState } from 'react'
import { Button, Image, Space, Upload } from 'antd'
import { mediaService } from '@/features/media/services/media.service'
import { resolveMediaUrl } from '@/lib/media.utils'
import { toast } from '@/store/toast.store'
import { usePracticeText } from '../hooks/use.practice.text'
import { PracticeMediaLibrary } from './practice.media.library'
import { IpaAudioPreview } from './ipa.audio.field'

export function PracticeMediaField({
  value = '',
  onChange,
  onBusy,
  disabled,
  kind,
  onDurationDetected,
}: {
  value?: string
  onChange?: (key: string) => void
  onBusy: (delta: number) => void
  disabled?: boolean
  kind: 'audio' | 'image'
  onDurationDetected?: (duration: number) => void
}) {
  const p = usePracticeText()
  const [uploading, setUploading] = useState(false)
  const label = kind === 'audio' ? 'audio' : p('ảnh')
  return (
    <div className="space-y-2">
      <Space wrap>
        <Upload
          showUploadList={false}
          accept={kind === 'audio' ? 'audio/*,.mp3,.wav,.ogg,.m4a' : 'image/png,image/jpeg,image/webp'}
          disabled={disabled || uploading}
          beforeUpload={file => {
            if (
              !(kind === 'audio'
                ? file.type.startsWith('audio/') || /\.(mp3|wav|ogg|m4a)$/i.test(file.name)
                : /^image\/(png|jpeg|webp)$/.test(file.type))
            ) {
              toast.error(p('Chọn đúng file {{p0}}', { p0: label }))
              return false
            }
            if (file.size > (kind === 'audio' ? 20 : 10) * 1024 * 1024) {
              toast.error(p('File tối đa {{p0}} MB', { p0: kind === 'audio' ? 20 : 10 }))
              return false
            }
            setUploading(true)
            onBusy(1)
            void mediaService
              .uploadFile(file, `practice/listening/${kind}`)
              .then(result => onChange?.(result.storage_key || result.file_url))
              .catch(error => toast.error(error instanceof Error ? error.message : p('Tải file thất bại')))
              .finally(() => {
                setUploading(false)
                onBusy(-1)
              })
            return false
          }}
        >
          <Button disabled={disabled} loading={uploading}>
            {p('Tải')} {label}
          </Button>
        </Upload>
        <PracticeMediaLibrary kind={kind === 'audio' ? 'AUDIO' : 'IMAGE'} disabled={disabled || uploading} onSelect={file => onChange?.(file.storage_key)} />
        {value && (
          <Button danger type="text" disabled={disabled || uploading} onClick={() => onChange?.('')}>
            {p('Gỡ')} {label}
          </Button>
        )}
      </Space>

      {value &&
        (kind === 'audio' ? (
          <IpaAudioPreview value={value} onDurationDetected={onDurationDetected} />
        ) : (
          <div>
            <Image src={resolveMediaUrl(value)} width={220} style={{ maxHeight: 180, objectFit: 'contain' }} />
          </div>
        ))}
    </div>
  )
}


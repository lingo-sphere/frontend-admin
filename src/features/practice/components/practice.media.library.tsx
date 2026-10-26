import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Alert, Button, Image, Input, Modal, Pagination, Space, Table } from 'antd'
import { useTranslation } from 'react-i18next'
import { useDebounce } from '@/hooks/use.debounce'
import { mediaAdminService, type LibraryMedia, type LibraryMediaKind } from '@/features/media/services/media.service'
import { resolveMediaUrl } from '@/lib/media.utils'


export function PracticeMediaLibrary({ kind, disabled, onSelect }: { kind: LibraryMediaKind; disabled?: boolean; onSelect: (file: LibraryMedia) => void }) {
  const { i18n } = useTranslation(), vi = i18n.language === 'vi'
  const [open, setOpen] = useState(false), [search, setSearch] = useState(''), [page, setPage] = useState(1)
  const debounced = useDebounce(search, 300)
  const result = useQuery({ queryKey: ['practice-media-library', kind, debounced, page], queryFn: () => mediaAdminService.library({ kind, search: debounced || undefined, page, limit: 12 }), enabled: open })
  return <><Button disabled={disabled} onClick={() => setOpen(true)}>{vi ? 'Chọn từ thư viện' : 'Choose from library'}</Button><Modal open={open} width={850} title={vi ? 'Thư viện media' : 'Media library'} onCancel={() => setOpen(false)} footer={null} destroyOnHidden>
    <Input.Search aria-label={vi ? 'Tìm media' : 'Search media'} placeholder={vi ? 'Tìm tên tệp hoặc mô tả…' : 'Search filename or description…'} value={search} allowClear onChange={event => { setSearch(event.target.value); setPage(1) }} style={{ marginBottom: 16 }} />
    {result.error ? <Alert type="error" title={vi ? 'Không tải được thư viện' : 'Could not load library'} description={result.error.message} action={<Button onClick={() => void result.refetch()}>{vi ? 'Thử lại' : 'Retry'}</Button>} /> : <>
      <Table<LibraryMedia> rowKey="_id" loading={result.isFetching} dataSource={result.data?.items || []} pagination={false} scroll={{ x: 600 }} size="small" columns={[
        { key: 'preview', title: vi ? 'Xem trước' : 'Preview', width: 210, render: (_, file) => file.content_type === 'IMAGE' ? <Image width={100} height={70} style={{ objectFit: 'contain' }} src={resolveMediaUrl(file.storage_key)} /> : file.content_type === 'VIDEO' ? <video controls preload="none" width={180} src={resolveMediaUrl(file.storage_key)} /> : <audio controls preload="none" style={{ width: 190 }} src={resolveMediaUrl(file.storage_key)} /> },
        { key: 'filename', dataIndex: 'filename', title: vi ? 'Tên tệp' : 'Filename', render: (name, file) => <Space orientation="vertical" size={0}><span>{name}</span><small>{Math.ceil(file.file_size_bytes / 1024)} KB{file.duration_seconds ? ` · ${file.duration_seconds}s` : ''}</small></Space> },
        { key: 'actions', width: 90, render: (_, file) => <Button type="primary" disabled={disabled} onClick={() => { onSelect(file); setOpen(false) }}>{vi ? 'Chọn' : 'Select'}</Button> },
      ]} />
      <Pagination current={page} pageSize={12} total={result.data?.pagination.total || 0} showSizeChanger={false} onChange={setPage} style={{ marginTop: 16 }} />
    </>}
  </Modal></>
}

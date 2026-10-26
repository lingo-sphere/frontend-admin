// Thư viện media phục vụ chọn nhanh tệp hình ảnh, âm thanh và video cho bài luyện tập.

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Alert, Button, Image, Modal, Space, Table } from 'antd'
import { Search, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useDebounce } from '@/hooks/use.debounce'
import { Pagination } from '@/components/pagination'
import { mediaAdminService, type LibraryMedia, type LibraryMediaKind } from '@/features/media/services/media.service'
import { resolveMediaUrl } from '@/lib/media.utils'

export function PracticeMediaLibrary({ kind, disabled, onSelect }: { kind: LibraryMediaKind; disabled?: boolean; onSelect: (file: LibraryMedia) => void }) {
  const { i18n } = useTranslation()
  const vi = i18n.language === 'vi'
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const debounced = useDebounce(search, 300)

  const result = useQuery({
    queryKey: ['practice-media-library', kind, debounced, page],
    queryFn: () => mediaAdminService.library({ kind, search: debounced || undefined, page, limit: 12 }),
    enabled: open,
  })

  return (
    <>
      <Button disabled={disabled} onClick={() => setOpen(true)}>
        {vi ? 'Chọn từ thư viện' : 'Choose from library'}
      </Button>
      <Modal
        open={open}
        width={850}
        title={vi ? 'Thư viện media' : 'Media library'}
        onCancel={() => setOpen(false)}
        footer={null}
        destroyOnHidden
      >
        <div className="relative mb-4">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={vi ? 'Tìm tên tệp hoặc mô tả…' : 'Search filename or description…'}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="w-full h-10 pl-9 pr-8 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch('')
                setPage(1)
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded-md transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {result.error ? (
          <Alert
            type="error"
            title={vi ? 'Không tải được thư viện' : 'Could not load library'}
            description={result.error.message}
            action={
              <Button onClick={() => void result.refetch()}>
                {vi ? 'Thử lại' : 'Retry'}
              </Button>
            }
          />
        ) : (
          <div className="space-y-4">
            <div className="rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs [&_.ant-table-thead_th]:!text-center [&_.ant-table-thead_th]:!font-bold [&_.ant-table-thead_th]:!text-[13px]">
              <Table<LibraryMedia>
                rowKey="_id"
                loading={result.isFetching}
                dataSource={result.data?.items || []}
                pagination={false}
                scroll={{ x: 600 }}
                size="small"
                columns={[
                  {
                    key: 'preview',
                    title: vi ? 'Xem trước' : 'Preview',
                    width: 210,
                    align: 'center',
                    render: (_, file) =>
                      file.content_type === 'IMAGE' ? (
                        <Image
                          width={100}
                          height={70}
                          style={{ objectFit: 'contain' }}
                          src={resolveMediaUrl(file.storage_key)}
                        />
                      ) : file.content_type === 'VIDEO' ? (
                        <video controls preload="none" width={180} src={resolveMediaUrl(file.storage_key)} />
                      ) : (
                        <audio controls preload="none" style={{ width: 190 }} src={resolveMediaUrl(file.storage_key)} />
                      ),
                  },
                  {
                    key: 'filename',
                    dataIndex: 'filename',
                    title: vi ? 'Tên tệp' : 'Filename',
                    render: (name, file) => (
                      <Space direction="vertical" size={0}>
                        <span className="font-semibold text-slate-800 dark:text-slate-100">{name}</span>
                        <small className="text-slate-500">
                          {Math.ceil(file.file_size_bytes / 1024)} KB
                          {file.duration_seconds ? ` · ${file.duration_seconds}s` : ''}
                        </small>
                      </Space>
                    ),
                  },
                  {
                    key: 'actions',
                    width: 90,
                    align: 'center',
                    render: (_, file) => (
                      <Button
                        type="primary"
                        disabled={disabled}
                        onClick={() => {
                          onSelect(file)
                          setOpen(false)
                        }}
                      >
                        {vi ? 'Chọn' : 'Select'}
                      </Button>
                    ),
                  },
                ]}
              />
            </div>
            <Pagination
              currentPage={page}
              totalPages={Math.ceil((result.data?.pagination.total || 0) / 12) || 1}
              pageSize={12}
              totalItems={result.data?.pagination.total || 0}
              showTotal={true}
              onPageChange={(nextPage: number) => setPage(nextPage)}
            />
          </div>
        )}
      </Modal>
    </>
  )
}


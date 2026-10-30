// Tab quản lý chiến thuật & mẹo làm bài thi TOEIC 4 kỹ năng dành cho quản trị viên.

import React, { useState } from 'react'
import {
  Space,
  Tag,
  Image,
} from 'antd'
import { TableStatusSwitch } from '@/components/table.status.switch'
import { BulbOutlined } from '@ant-design/icons'
import {
  Plus,
} from 'lucide-react'
import dayjs from 'dayjs'
import { TableRowActions } from '@/components/table.row.actions'
import { toast } from '@/store/toast.store'
import { API_CONFIG } from '@/config/api.config'
import { CustomSelect } from '@/components/custom.select'
import { DataTable, type DataTableColumn } from '@/components/data.table'
import {
  useToeicTipsListQuery,
  useToeicTipsMutations,
} from '@/features/practice/hooks/use.grammar-handbook.admin'
import { ToeicTipsDrawer } from '@/features/practice/components/toeic.tips.drawer'
import type {
  ToeicTipItem,
  ToeicTipQuery,
  ToeicTipPayload,
} from '@/features/practice/types/grammar-handbook-admin.types'

const SKILL_OPTIONS = [
  { value: 'ALL', label: 'Tất cả Kỹ năng' },
  { value: 'LISTENING', label: 'Listening (Nghe)' },
  { value: 'READING', label: 'Reading (Đọc)' },
  { value: 'SPEAKING', label: 'Speaking (Nói)' },
  { value: 'WRITING', label: 'Writing (Viết)' },
]

const PART_OPTIONS = [
  { value: 'ALL', label: 'Tất cả Part' },
  { value: 'PART_1', label: 'Part 1: Tranh ảnh' },
  { value: 'PART_2', label: 'Part 2: Hỏi & Đáp' },
  { value: 'PART_3', label: 'Part 3: Hội thoại' },
  { value: 'PART_4', label: 'Part 4: Bài nói ngắn' },
  { value: 'PART_5', label: 'Part 5: Hoàn thành câu' },
  { value: 'PART_6', label: 'Part 6: Hoàn thành đoạn' },
  { value: 'PART_7', label: 'Part 7: Đọc hiểu' },
]

const SKILL_COLORS: Record<string, string> = {
  LISTENING: 'blue',
  READING: 'green',
  SPEAKING: 'orange',
  WRITING: 'purple',
}

function getImageUrl(url?: string): string {
  if (!url) return ''
  if (url.startsWith('http')) return url
  const base = (API_CONFIG.BASE_URL || '').replace(/\/+$/, '')
  const cleanKey = url.replace(/^\/+/, '')
  return `${base}/media/stream/${cleanKey}`
}

export function ToeicTipsTab() {
  const [query, setQuery] = useState<ToeicTipQuery>({
    page: 1,
    limit: 15,
    search: '',
    skill: 'ALL',
    part: 'ALL',
  })

  const [selectedTip, setSelectedTip] = useState<ToeicTipItem | null>(null)
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [workingId, setWorkingId] = useState<string | null>(null)

  const { data, isLoading, refetch } = useToeicTipsListQuery(query)
  const { save, togglePublish, remove, uploadImage } = useToeicTipsMutations()

  const handleSearchChange = (val: string) => {
    setQuery((prev) => ({ ...prev, search: val, page: 1 }))
  }

  const handleSkillChange = (val: string) => {
    setQuery((prev) => ({ ...prev, skill: val, page: 1 }))
  }

  const handlePartChange = (val: string) => {
    setQuery((prev) => ({ ...prev, part: val, page: 1 }))
  }

  const handleResetFilters = () => {
    setQuery({
      page: 1,
      limit: 15,
      search: '',
      skill: 'ALL',
      part: 'ALL',
    })
  }

  const handleTogglePublish = async (row: ToeicTipItem, checked: boolean) => {
    setWorkingId(row._id)
    try {
      await togglePublish.mutateAsync({ id: row._id, is_published: checked })
      toast.success(checked ? 'Đã xuất bản mẹo TOEIC' : 'Đã ẩn mẹo TOEIC')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể đổi trạng thái'
      toast.error(msg)
    } finally {
      setWorkingId(null)
    }
  }

  const handleDelete = async (row: ToeicTipItem) => {
    setWorkingId(row._id)
    try {
      await remove.mutateAsync(row._id)
      toast.success(`Đã xóa mẹo TOEIC: ${row.title}`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể xóa mẹo'
      toast.error(msg)
    } finally {
      setWorkingId(null)
    }
  }

  const handleSave = async (payload: ToeicTipPayload) => {
    await save.mutateAsync({
      id: selectedTip ? selectedTip._id : null,
      payload,
    })
    toast.success(selectedTip ? 'Đã cập nhật mẹo TOEIC thành công' : 'Đã tạo mẹo TOEIC mới thành công')
  }

  const handleUploadImage = async (id: string, file: File) => {
    return uploadImage.mutateAsync({ id, file })
  }

  const columns: DataTableColumn<ToeicTipItem>[] = [
    {
      title: 'Ảnh R2',
      key: 'image',
      width: 80,
      align: 'center',
      render: (row) =>
        row.image_url ? (
          <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 flex-shrink-0 mx-auto">
            <Image
              src={getImageUrl(row.image_url)}
              alt={row.title}
              width={48}
              height={48}
              loading="lazy"
              style={{ objectFit: 'cover' }}
            />
          </div>
        ) : (
          <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 mx-auto">
            <BulbOutlined />
          </div>
        ),
    },
    {
      title: 'Thứ tự',
      key: 'order',
      sortable: true,
      dataIndex: 'order',
      width: 80,
      align: 'center',
      render: (row) => <span className="font-bold text-slate-600 dark:text-slate-400">#{row.order || 0}</span>,
    },
    {
      title: 'Tiêu đề & Tóm tắt chiến thuật',
      key: 'title',
      sortable: true,
      dataIndex: 'title',
      render: (row) => (
        <div>
          <button
            type="button"
            className="font-bold text-slate-800 dark:text-slate-100 text-left hover:text-primary transition-colors cursor-pointer text-sm"
            onClick={() => {
              setSelectedTip(row)
              setDrawerVisible(true)
            }}
          >
            {row.title}
          </button>
          <div className="text-xs text-slate-500 mt-1 line-clamp-2 leading-4">
            {row.summary}
          </div>
        </div>
      ),
    },
    {
      title: 'Kỹ năng & Part',
      key: 'skill_part',
      sortable: true,
      dataIndex: 'skill',
      width: 170,
      align: 'center',
      render: (row) => (
        <Space direction="vertical" size={2}>
          <Tag color={SKILL_COLORS[row.skill] || 'default'} className="font-bold">
            {row.skill}
          </Tag>
          {row.part ? (
            <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">{row.part}</span>
          ) : (
            <span className="text-[11px] text-slate-400 italic">Tổng quan</span>
          )}
        </Space>
      ),
    },
    {
      title: 'Bẫy & Chiến thuật',
      key: 'traps_takeaways',
      width: 170,
      align: 'center',
      render: (row) => (
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs text-amber-700 dark:text-amber-400 font-medium">
            ⚠️ {row.traps?.length || 0} bẫy đề thi
          </span>
          <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
            💡 {row.key_takeaways?.length || 0} chiến thuật
          </span>
        </div>
      ),
    },
    {
      title: 'Xuất bản',
      key: 'publish',
      sortable: true,
      dataIndex: 'is_published',
      width: 110,
      align: 'center',
      render: (row) => (
        <TableStatusSwitch
          checked={row.is_published}
          loading={workingId === row._id}
          disabled={Boolean(workingId)}
          checkedChildren="Bật"
          unCheckedChildren="Ẩn"
          ariaLabel={`Xuất bản mẹo ${row.title}`}
          onChange={(checked) => void handleTogglePublish(row, checked)}
        />
      ),
    },
    {
      title: 'Cập nhật',
      key: 'updated_at',
      sortable: true,
      dataIndex: 'updated_at',
      width: 115,
      align: 'center',
      render: (row) =>
        row.updated_at ? (
          <div className="font-mono text-xs leading-tight text-slate-600 dark:text-slate-400">
            <div className="whitespace-nowrap font-medium">{dayjs(row.updated_at).format('DD/MM/YYYY')}</div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 whitespace-nowrap">
              {dayjs(row.updated_at).format('HH:mm')}
            </div>
          </div>
        ) : (
          <span className="text-slate-400">—</span>
        ),
    },
    {
      title: 'Ngày tạo',
      key: 'created_at',
      sortable: true,
      dataIndex: 'created_at',
      width: 115,
      align: 'center',
      initiallyHidden: true,
      render: (row) =>
        row.created_at ? (
          <div className="font-mono text-xs leading-tight text-slate-600 dark:text-slate-400">
            <div className="whitespace-nowrap font-medium">{dayjs(row.created_at).format('DD/MM/YYYY')}</div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 whitespace-nowrap">
              {dayjs(row.created_at).format('HH:mm')}
            </div>
          </div>
        ) : (
          <span className="text-slate-400">—</span>
        ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 120,
      align: 'center',
      render: (row) => (
        <TableRowActions
          onEdit={() => {
            setSelectedTip(row)
            setDrawerVisible(true)
          }}
          onDelete={() => handleDelete(row)}
          deleteTitle="Xóa mẹo làm bài này?"
          deleteDescription="Mẹo sẽ được chuyển vào trạng thái xóa mềm."
        />
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <DataTable<ToeicTipItem>
        columns={columns}
        data={data?.items || []}
        isLoading={isLoading}
        rowKey="_id"
        onResetFilters={handleResetFilters}
        extraActions={
          <button
            type="button"
            onClick={() => {
              setSelectedTip(null)
              setDrawerVisible(true)
            }}
            className="h-10 px-4 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs shadow-indigo-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm mẹo TOEIC mới</span>
          </button>
        }
        search={query.search}
        onSearchChange={handleSearchChange}
        searchLabel="Tìm kiếm mẹo TOEIC"
        searchPlaceholder="Tìm theo tiêu đề, tóm tắt..."
        extraFilters={
          <>
            <CustomSelect
              value={query.skill}
              onChange={handleSkillChange}
              options={SKILL_OPTIONS}
              style={{ width: 170 }}
              placeholder="Chọn kỹ năng"
            />

            <CustomSelect
              value={query.part}
              onChange={handlePartChange}
              options={PART_OPTIONS}
              style={{ width: 180 }}
              placeholder="Chọn Part"
            />
          </>
        }
        pagination={{
          currentPage: query.page || 1,
          totalPages: Math.ceil((data?.pagination?.total || 0) / (query.limit || 15)) || 1,
          pageSize: query.limit || 15,
          totalItems: data?.pagination?.total || 0,
          showTotal: true,
          pageSizeOptions: [10, 15, 25, 50],
          onPageChange: (page) => setQuery((prev) => ({ ...prev, page })),
          onPageSizeChange: (limit) => setQuery((prev) => ({ ...prev, limit, page: 1 })),
        }}
      />

      <ToeicTipsDrawer
        visible={drawerVisible}
        tip={selectedTip}
        onClose={() => setDrawerVisible(false)}
        onSave={handleSave}
        onUploadImage={handleUploadImage}
        loading={save.isPending}
      />
    </div>
  )
}



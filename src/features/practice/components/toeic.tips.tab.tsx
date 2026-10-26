// Tab quản lý chiến thuật & mẹo làm bài thi TOEIC 4 kỹ năng dành cho quản trị viên.

import React, { useState } from 'react'
import {
  Table,
  Space,
  Tag,
  Image,
  ConfigProvider,
  Checkbox,
  Dropdown,
} from 'antd'
import { CustomSwitch } from '@/components/custom.switch'
import type { ColumnsType } from 'antd/es/table'
import { BulbOutlined } from '@ant-design/icons'
import {
  Search,
  X,
  RotateCcw,
  Plus,
  SlidersHorizontal,
  ChevronDown,
  Columns3,
  Check,
} from 'lucide-react'
import { TableRowActions } from '@/components/table.row.actions'
import { toast } from '@/store/toast.store'
import { API_CONFIG } from '@/config/api.config'
import { CustomSelect } from '@/components/custom.select'
import { Pagination } from '@/components/pagination'
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

type DensityType = 'compact' | 'middle' | 'comfortable'
const DENSITY_OPTIONS: { key: DensityType; label: string }[] = [
  { key: 'compact', label: 'Thu nhỏ' },
  { key: 'middle', label: 'Vừa' },
  { key: 'comfortable', label: 'Rộng' },
]

const DENSITY_TOKENS: Record<DensityType, { cellPaddingBlock: number; cellPaddingInline: number }> = {
  compact: { cellPaddingBlock: 6, cellPaddingInline: 12 },
  middle: { cellPaddingBlock: 10, cellPaddingInline: 14 },
  comfortable: { cellPaddingBlock: 16, cellPaddingInline: 16 },
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
  const [density, setDensity] = useState<DensityType>('middle')
  const [densityOpen, setDensityOpen] = useState(false)
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    'image',
    'order',
    'title',
    'skill_part',
    'traps_takeaways',
    'publish',
  ])

  const columnOptions = [
    { label: 'Ảnh R2', value: 'image' },
    { label: 'Thứ tự', value: 'order' },
    { label: 'Tiêu đề & Tóm tắt', value: 'title' },
    { label: 'Kỹ năng & Part', value: 'skill_part' },
    { label: 'Bẫy & Chiến thuật', value: 'traps_takeaways' },
    { label: 'Xuất bản', value: 'publish' },
  ]

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

  const hasActiveFilters = Boolean(
    query.search ||
    (query.skill && query.skill !== 'ALL') ||
    (query.part && query.part !== 'ALL')
  )

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

  const columns: ColumnsType<ToeicTipItem> = [
      {
        title: 'Ảnh R2',
        key: 'image',
        width: 80,
        align: 'center',
        render: (_, row) =>
          row.image_url ? (
            <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 flex-shrink-0 mx-auto">
              <Image
                src={getImageUrl(row.image_url)}
                alt={row.title}
                width={48}
                height={48}
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
        dataIndex: 'order',
        key: 'order',
        width: 80,
        align: 'center',
        render: (order: number) => <span className="font-bold text-slate-600 dark:text-slate-400">#{order || 0}</span>,
      },
      {
        title: 'Tiêu đề & Tóm tắt chiến thuật',
        key: 'title',
        render: (_, row) => (
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
        width: 170,
        align: 'center',
        render: (_, row) => (
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
        render: (_, row) => (
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
        width: 110,
        align: 'center',
        render: (_, row) => (
          <CustomSwitch
            size="sm"
            color="emerald"
            checked={row.is_published}
            loading={workingId === row._id}
            onChange={(checked) => void handleTogglePublish(row, checked)}
          />
        ),
      },
      {
        title: 'Thao tác',
        key: 'actions',
        width: 120,
        align: 'center',
        render: (_, row) => (
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

  const displayedColumns = columns.filter(
    (col) => col.key === 'actions' || visibleColumns.includes(String(col.key))
  )

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo tiêu đề, tóm tắt..."
              value={query.search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="h-10 pl-9 pr-8 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all w-64"
            />
            {query.search && (
              <button
                type="button"
                onClick={() => handleSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded-md transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

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

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Đặt lại</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              type="button"
              onClick={() => setDensityOpen(!densityOpen)}
              className="h-10 px-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 shadow-2xs"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{DENSITY_OPTIONS.find((o) => o.key === density)?.label || 'Vừa'}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
            {densityOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setDensityOpen(false)} />
                <div className="absolute right-0 mt-2 w-36 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl z-50 p-1.5 animate-in fade-in zoom-in-95 duration-100">
                  {DENSITY_OPTIONS.map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => {
                        setDensity(opt.key)
                        setDensityOpen(false)
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                        density === opt.key
                          ? 'bg-primary/10 text-primary font-semibold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {density === opt.key && <Check className="w-3.5 h-3.5 text-primary" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <Dropdown
            trigger={['click']}
            popupRender={() => (
              <div className="rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200/80 dark:border-slate-800 p-3 shadow-xl backdrop-blur-xl">
                <Checkbox.Group
                  value={visibleColumns}
                  options={columnOptions}
                  onChange={(values) => setVisibleColumns(values.map(String))}
                  style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
                />
              </div>
            )}
          >
            <button
              type="button"
              className="h-10 px-3.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 shadow-2xs cursor-pointer"
            >
              <Columns3 className="w-3.5 h-3.5" />
              <span>Cột</span>
            </button>
          </Dropdown>

          <button
            type="button"
            onClick={() => refetch()}
            disabled={isLoading}
            className="h-10 px-3.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 shadow-2xs cursor-pointer"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Làm mới</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedTip(null)
              setDrawerVisible(true)
            }}
            className="h-10 px-4 rounded-xl text-xs font-semibold bg-primary hover:bg-primary-hover text-white shadow-xs hover:shadow-primary/20 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm mẹo TOEIC mới</span>
          </button>
        </div>
      </div>

      <div className="rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs [&_.ant-table-thead_th]:!text-center [&_.ant-table-thead_.ant-table-column-sorters]:!justify-center [&_.ant-table-thead_th]:!font-bold [&_.ant-table-thead_th]:!text-[13px]">
        <ConfigProvider
          theme={{
            components: {
              Table: {
                colorBgContainer: 'transparent',
                headerBg: 'transparent',
                rowHoverBg: 'rgba(241, 245, 249, 0.4)',
                borderColor: 'rgba(226, 232, 240, 0.6)',
                cellPaddingBlock: DENSITY_TOKENS[density].cellPaddingBlock,
                cellPaddingInline: DENSITY_TOKENS[density].cellPaddingInline,
              },
            },
          }}
        >
          <Table
            rowKey="_id"
            columns={displayedColumns}
            dataSource={data?.items || []}
            loading={isLoading}
            pagination={false}
          />
        </ConfigProvider>
      </div>

      <Pagination
        currentPage={query.page || 1}
        totalPages={Math.ceil((data?.pagination?.total || 0) / (query.limit || 15)) || 1}
        pageSize={query.limit || 15}
        totalItems={data?.pagination?.total || 0}
        showTotal={true}
        pageSizeOptions={[10, 15, 25, 50]}
        onPageChange={(page) => setQuery((prev) => ({ ...prev, page }))}
        onPageSizeChange={(limit) => setQuery((prev) => ({ ...prev, limit, page: 1 }))}
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


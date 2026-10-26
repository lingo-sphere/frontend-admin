// Tab quản lý sổ tay 44 chủ điểm ngữ pháp chi tiết dành cho quản trị viên.

import React, { useState } from 'react'
import {
  Table,
  Button,
  Space,
  Tag,
  Popconfirm,
  Image,
  ConfigProvider,
} from 'antd'
import { CustomSwitch } from '@/components/custom.switch'
import type { ColumnsType } from 'antd/es/table'
import {
  EditOutlined,
  DeleteOutlined,
  BookOutlined,
} from '@ant-design/icons'
import {
  Search,
  X,
  RotateCcw,
  Plus,
  SlidersHorizontal,
  ChevronDown,
  Check,
} from 'lucide-react'
import { toast } from '@/store/toast.store'
import { API_CONFIG } from '@/config/api.config'
import { CustomSelect } from '@/components/custom.select'
import { Pagination } from '@/components/pagination'
import {
  useGrammarHandbookListQuery,
  useGrammarHandbookMutations,
} from '@/features/practice/hooks/use.grammar-handbook.admin'
import { GrammarHandbookDrawer } from '@/features/practice/components/grammar.handbook.drawer'
import type {
  GrammarHandbookItem,
  GrammarHandbookQuery,
  GrammarHandbookPayload,
} from '@/features/practice/types/grammar-handbook-admin.types'

const CATEGORY_OPTIONS = [
  { value: 'ALL', label: 'Tất cả nhóm' },
  { value: 'TENSES', label: '12 Thì tiếng Anh' },
  { value: 'PARTS_OF_SPEECH', label: 'Từ loại (Danh/Tính/Trạng)' },
  { value: 'COMPARISONS', label: 'Các dạng câu so sánh' },
  { value: 'MODALS', label: 'Động từ khuyết thiếu' },
  { value: 'PASSIVE', label: 'Câu bị động' },
  { value: 'PASSIVE_VOICE', label: 'Bị động nâng cao' },
  { value: 'CONDITIONALS', label: 'Câu điều kiện & Đảo ngữ' },
  { value: 'RELATIVE_CLAUSES', label: 'Mệnh đề quan hệ' },
  { value: 'VERB_PATTERNS', label: 'Danh động từ & To-V' },
  { value: 'PARTICIPLES', label: 'Phân từ & Mệnh đề phân từ' },
  { value: 'AGREEMENT', label: 'Sự hòa hợp Chủ - Vị' },
  { value: 'CONJUNCTIONS', label: 'Liên từ kết hợp & Phụ thuộc' },
  { value: 'PREPOSITIONS', label: 'Giới từ thời gian, nơi chốn' },
  { value: 'ARTICLES', label: 'Mạo từ' },
  { value: 'QUANTIFIERS', label: 'Từ chỉ số lượng' },
  { value: 'INVERSION', label: 'Đảo ngữ phủ định' },
  { value: 'SUBJUNCTIVE', label: 'Thể giả định' },
  { value: 'REPORTED_SPEECH', label: 'Câu tường thuật' },
  { value: 'QUESTIONS', label: 'Câu hỏi đuôi' },
  { value: 'SENTENCE_STRUCTURE', label: 'Cấu trúc song song' },
]

const CEFR_OPTIONS = [
  { value: 'ALL', label: 'Tất cả Level' },
  { value: 'A1', label: 'A1' },
  { value: 'A2', label: 'A2' },
  { value: 'B1', label: 'B1' },
  { value: 'B2', label: 'B2' },
  { value: 'C1', label: 'C1' },
]

const CEFR_COLORS: Record<string, string> = {
  A1: 'cyan',
  A2: 'blue',
  B1: 'orange',
  B2: 'purple',
  C1: 'red',
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

export function GrammarHandbookTab() {
  const [query, setQuery] = useState<GrammarHandbookQuery>({
    page: 1,
    limit: 15,
    search: '',
    category: 'ALL',
    cefr_level: 'ALL',
  })

  const [selectedItem, setSelectedItem] = useState<GrammarHandbookItem | null>(null)
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [workingId, setWorkingId] = useState<string | null>(null)
  const [density, setDensity] = useState<DensityType>('middle')
  const [densityOpen, setDensityOpen] = useState(false)

  const { data, isLoading, refetch } = useGrammarHandbookListQuery(query)
  const { save, togglePublish, remove, uploadImage } = useGrammarHandbookMutations()

  const handleSearchChange = (val: string) => {
    setQuery((prev) => ({ ...prev, search: val, page: 1 }))
  }

  const handleCategoryChange = (val: string) => {
    setQuery((prev) => ({ ...prev, category: val, page: 1 }))
  }

  const handleCefrChange = (val: string) => {
    setQuery((prev) => ({ ...prev, cefr_level: val, page: 1 }))
  }

  const handleResetFilters = () => {
    setQuery({
      page: 1,
      limit: 15,
      search: '',
      category: 'ALL',
      cefr_level: 'ALL',
    })
  }

  const hasActiveFilters = Boolean(
    query.search ||
    (query.category && query.category !== 'ALL') ||
    (query.cefr_level && query.cefr_level !== 'ALL')
  )

  const handleTogglePublish = async (row: GrammarHandbookItem, checked: boolean) => {
    setWorkingId(row._id)
    try {
      await togglePublish.mutateAsync({ id: row._id, is_published: checked })
      toast.success(checked ? 'Đã xuất bản chủ điểm' : 'Đã ẩn chủ điểm')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể đổi trạng thái'
      toast.error(msg)
    } finally {
      setWorkingId(null)
    }
  }

  const handleDelete = async (row: GrammarHandbookItem) => {
    setWorkingId(row._id)
    try {
      await remove.mutateAsync(row._id)
      toast.success(`Đã xóa chủ điểm: ${row.title_vi || row.title_en}`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể xóa chủ điểm'
      toast.error(msg)
    } finally {
      setWorkingId(null)
    }
  }

  const handleSave = async (payload: GrammarHandbookPayload) => {
    await save.mutateAsync({
      id: selectedItem ? selectedItem._id : null,
      payload,
    })
    toast.success(selectedItem ? 'Đã cập nhật chủ điểm thành công' : 'Đã tạo chủ điểm mới thành công')
  }

  const handleUploadImage = async (id: string, file: File) => {
    return uploadImage.mutateAsync({ id, file })
  }

  const columns: ColumnsType<GrammarHandbookItem> = [
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
              alt={row.title_en}
              width={48}
              height={48}
              style={{ objectFit: 'cover' }}
            />
          </div>
        ) : (
          <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 mx-auto">
            <BookOutlined />
          </div>
        ),
    },
    {
      title: 'Tên chủ điểm (Việt / Anh)',
      key: 'title',
      render: (_, row) => (
        <div>
          <button
            type="button"
            className="font-bold text-slate-800 dark:text-slate-100 text-left hover:text-primary transition-colors cursor-pointer text-sm"
            onClick={() => {
              setSelectedItem(row)
              setDrawerVisible(true)
            }}
          >
            {row.title_vi}
          </button>
          <div className="text-xs text-slate-500 font-mono mt-0.5">{row.title_en}</div>
          {row.structure_form ? (
            <div className="text-[11px] font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded inline-block mt-1">
              {row.structure_form}
            </div>
          ) : null}
        </div>
      ),
    },
    {
      title: 'CEFR',
      dataIndex: 'cefr_level',
      key: 'cefr_level',
      width: 90,
      align: 'center',
      render: (level: string) => (
        <Tag color={CEFR_COLORS[level] || 'default'} className="font-bold">
          {level || 'B1'}
        </Tag>
      ),
    },
    {
      title: 'Nhóm ngữ pháp',
      dataIndex: 'category',
      key: 'category',
      width: 180,
      render: (cat: string) => {
        const found = CATEGORY_OPTIONS.find((c) => c.value === cat)
        return <span className="text-xs text-slate-700 dark:text-slate-300">{found?.label || cat}</span>
      },
    },
    {
      title: 'TOEIC Target',
      dataIndex: 'toeic_relevance',
      key: 'toeic_relevance',
      width: 120,
      align: 'center',
      render: (score: number) =>
        score ? <Tag color="gold">TOEIC {score}+</Tag> : <span className="text-slate-400">—</span>,
    },
    {
      title: 'Thể công thức',
      key: 'formulas',
      width: 130,
      align: 'center',
      render: (_, row) => (
        <Tag color="cyan">
          {row.formula_details?.length || 0} thể chi tiết
        </Tag>
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
      width: 140,
      align: 'center',
      render: (_, row) => (
        <Space size="small">
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              setSelectedItem(row)
              setDrawerVisible(true)
            }}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xóa chủ điểm ngữ pháp này?"
            description="Chủ điểm sẽ được chuyển vào trạng thái xóa mềm."
            onConfirm={() => void handleDelete(row)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button size="small" danger icon={<DeleteOutlined />} loading={workingId === row._id} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo tên, slug, công thức..."
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
            value={query.category}
            onChange={handleCategoryChange}
            options={CATEGORY_OPTIONS}
            style={{ width: 200 }}
            placeholder="Chọn nhóm"
          />

          <CustomSelect
            value={query.cefr_level}
            onChange={handleCefrChange}
            options={CEFR_OPTIONS}
            style={{ width: 130 }}
            placeholder="Chọn level"
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
              setSelectedItem(null)
              setDrawerVisible(true)
            }}
            className="h-10 px-4 rounded-xl text-xs font-semibold bg-primary hover:bg-primary-hover text-white shadow-xs hover:shadow-primary/20 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm chủ điểm mới</span>
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
            columns={columns}
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

      <GrammarHandbookDrawer
        visible={drawerVisible}
        item={selectedItem}
        onClose={() => setDrawerVisible(false)}
        onSave={handleSave}
        onUploadImage={handleUploadImage}
        loading={save.isPending}
      />
    </div>
  )
}


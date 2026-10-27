// Tab quản lý sổ tay 44 chủ điểm ngữ pháp chi tiết dành cho quản trị viên.

import React, { useState } from 'react'
import {
  Button,
  Space,
  Tag,
  Popconfirm,
  Image,
} from 'antd'
import { CustomSwitch } from '@/components/custom.switch'
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
} from 'lucide-react'
import { toast } from '@/store/toast.store'
import { API_CONFIG } from '@/config/api.config'
import { CustomSelect } from '@/components/custom.select'
import { DataTable, type DataTableColumn } from '@/components/data.table'
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

  const columns: DataTableColumn<GrammarHandbookItem>[] = [
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
              alt={row.title_en}
              width={48}
              height={48}
              loading="lazy"
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
      render: (row) => (
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
      key: 'cefr_level',
      width: 90,
      align: 'center',
      render: (row) => (
        <Tag color={CEFR_COLORS[row.cefr_level] || 'default'} className="font-bold">
          {row.cefr_level || 'B1'}
        </Tag>
      ),
    },
    {
      title: 'Nhóm ngữ pháp',
      key: 'category',
      width: 180,
      render: (row) => {
        const found = CATEGORY_OPTIONS.find((c) => c.value === row.category)
        return <span className="text-xs text-slate-700 dark:text-slate-300">{found?.label || row.category}</span>
      },
    },
    {
      title: 'TOEIC Target',
      key: 'toeic_relevance',
      width: 120,
      align: 'center',
      render: (row) =>
        row.toeic_relevance ? <Tag color="gold">TOEIC {row.toeic_relevance}+</Tag> : <span className="text-slate-400">—</span>,
    },
    {
      title: 'Thể công thức',
      key: 'formulas',
      width: 130,
      align: 'center',
      render: (row) => (
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
      render: (row) => (
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
      render: (row) => (
        <Space size="small" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
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
      <DataTable<GrammarHandbookItem>
        columns={columns}
        data={data?.items || []}
        isLoading={isLoading}
        rowKey="_id"
        onResetFilters={handleResetFilters}
        extraActions={
          <>
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
          </>
        }
        filterSlot={
          <>
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


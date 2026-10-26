/**
 * @file grammar.handbook.tab.tsx
 * @description Tab Quản lý Sổ tay 44 Chủ điểm Ngữ pháp chi tiết trong Admin
 */

import React, { useState } from 'react'
import {
  Table,
  Button,
  Input,
  Select,
  Switch,
  Space,
  Tag,
  Popconfirm,
  Card,
  Image,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  SearchOutlined,
  PlusOutlined,
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  BookOutlined,
} from '@ant-design/icons'
import { toast } from '@/store/toast.store'
import { API_CONFIG } from '@/config/api.config'
import {
  useGrammarHandbookListQuery,
  useGrammarHandbookMutations,
} from '../hooks/use.grammar-handbook.admin'
import { GrammarHandbookDrawer } from './grammar.handbook.drawer'
import type {
  GrammarHandbookItem,
  GrammarHandbookQuery,
  GrammarHandbookPayload,
} from '../types/grammar-handbook-admin.types'

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

  const handleTogglePublish = async (row: GrammarHandbookItem, checked: boolean) => {
    setWorkingId(row._id)
    try {
      await togglePublish.mutateAsync({ id: row._id, is_published: checked })
      toast.success(checked ? 'Đã xuất bản chủ điểm' : 'Đã ẩn chủ điểm')
    } catch (err: any) {
      toast.error(err.message || 'Không thể đổi trạng thái')
    } finally {
      setWorkingId(null)
    }
  }

  const handleDelete = async (row: GrammarHandbookItem) => {
    setWorkingId(row._id)
    try {
      await remove.mutateAsync(row._id)
      toast.success(`Đã xóa chủ điểm: ${row.title_vi || row.title_en}`)
    } catch (err: any) {
      toast.error(err.message || 'Không thể xóa chủ điểm')
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
      render: (_, row) =>
        row.image_url ? (
          <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 flex-shrink-0">
            <Image
              src={getImageUrl(row.image_url)}
              alt={row.title_en}
              width={48}
              height={48}
              style={{ objectFit: 'cover' }}
            />
          </div>
        ) : (
          <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
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
            className="font-bold text-slate-800 text-left hover:text-primary transition-colors cursor-pointer text-sm"
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
      width: 160,
      render: (cat: string) => {
        const found = CATEGORY_OPTIONS.find((c) => c.value === cat)
        return <span className="text-xs text-slate-700">{found?.label || cat}</span>
      },
    },
    {
      title: 'TOEIC Target',
      dataIndex: 'toeic_relevance',
      key: 'toeic_relevance',
      width: 110,
      render: (score: number) =>
        score ? <Tag color="gold">TOEIC {score}+</Tag> : <span className="text-slate-400">—</span>,
    },
    {
      title: 'Thể công thức',
      key: 'formulas',
      width: 120,
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
      render: (_, row) => (
        <Switch
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
      {/* Top Filter & Actions Bar */}
      <Card size="small" className="border-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <Input
              placeholder="Tìm theo tên, slug, công thức..."
              prefix={<SearchOutlined className="text-slate-400" />}
              allowClear
              value={query.search}
              onChange={(e) => handleSearchChange(e.target.value)}
              style={{ width: 260 }}
            />

            <Select
              value={query.category}
              onChange={handleCategoryChange}
              options={CATEGORY_OPTIONS}
              style={{ width: 200 }}
              placeholder="Chọn nhóm"
            />

            <Select
              value={query.cefr_level}
              onChange={handleCefrChange}
              options={CEFR_OPTIONS}
              style={{ width: 130 }}
              placeholder="Chọn level"
            />
          </div>

          <Space>
            <Button icon={<ReloadOutlined />} onClick={() => refetch()} loading={isLoading}>
              Làm mới
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setSelectedItem(null)
                setDrawerVisible(true)
              }}
            >
              Thêm chủ điểm mới
            </Button>
          </Space>
        </div>
      </Card>

      {/* Main Table */}
      <Table
        rowKey="_id"
        columns={columns}
        dataSource={data?.items || []}
        loading={isLoading}
        pagination={{
          current: query.page,
          pageSize: query.limit,
          total: data?.pagination?.total || 0,
          showSizeChanger: true,
          pageSizeOptions: ['10', '15', '25', '50'],
          showTotal: (total) => `Tổng cộng ${total} chủ điểm`,
          onChange: (page, limit) => setQuery((prev) => ({ ...prev, page, limit })),
        }}
        bordered
        size="middle"
      />

      {/* Editor Drawer */}
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


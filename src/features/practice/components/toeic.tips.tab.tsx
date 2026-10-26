/**
 * @file toeic.tips.tab.tsx
 * @description Tab Quản lý Chiến thuật & Mẹo làm bài thi TOEIC 4 Kỹ năng trong Admin
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
  BulbOutlined,
  StarOutlined,
} from '@ant-design/icons'
import { toast } from '@/store/toast.store'
import { API_CONFIG } from '@/config/api.config'
import {
  useToeicTipsListQuery,
  useToeicTipsMutations,
} from '../hooks/use.grammar-handbook.admin'
import { ToeicTipsDrawer } from './toeic.tips.drawer'
import type {
  ToeicTipItem,
  ToeicTipQuery,
  ToeicTipPayload,
} from '../types/grammar-handbook-admin.types'

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

  const handleTogglePublish = async (row: ToeicTipItem, checked: boolean) => {
    setWorkingId(row._id)
    try {
      await togglePublish.mutateAsync({ id: row._id, is_published: checked })
      toast.success(checked ? 'Đã xuất bản mẹo TOEIC' : 'Đã ẩn mẹo TOEIC')
    } catch (err: any) {
      toast.error(err.message || 'Không thể đổi trạng thái')
    } finally {
      setWorkingId(null)
    }
  }

  const handleDelete = async (row: ToeicTipItem) => {
    setWorkingId(row._id)
    try {
      await remove.mutateAsync(row._id)
      toast.success(`Đã xóa mẹo TOEIC: ${row.title}`)
    } catch (err: any) {
      toast.error(err.message || 'Không thể xóa mẹo')
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
      render: (_, row) =>
        row.image_url ? (
          <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 flex-shrink-0">
            <Image
              src={getImageUrl(row.image_url)}
              alt={row.title}
              width={48}
              height={48}
              style={{ objectFit: 'cover' }}
            />
          </div>
        ) : (
          <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
            <BulbOutlined />
          </div>
        ),
    },
    {
      title: 'Thứ tự',
      dataIndex: 'order',
      key: 'order',
      width: 75,
      render: (order: number) => <span className="font-bold text-slate-600">#{order || 0}</span>,
    },
    {
      title: 'Tiêu đề & Tóm tắt chiến thuật',
      key: 'title',
      render: (_, row) => (
        <div>
          <button
            type="button"
            className="font-bold text-slate-800 text-left hover:text-primary transition-colors cursor-pointer text-sm"
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
      render: (_, row) => (
        <Space direction="vertical" size={2}>
          <Tag color={SKILL_COLORS[row.skill] || 'default'} className="font-bold">
            {row.skill}
          </Tag>
          {row.part ? (
            <span className="text-[11px] font-semibold text-slate-600">{row.part}</span>
          ) : (
            <span className="text-[11px] text-slate-400 italic">Tổng quan</span>
          )}
        </Space>
      ),
    },
    {
      title: 'Bẫy & Chiến thuật',
      key: 'traps_takeaways',
      width: 160,
      render: (_, row) => (
        <Space orientation="vertical" size={2}>
          <span className="text-xs text-amber-800 font-medium">
            ⚠️ {row.traps?.length || 0} bẫy đề thi
          </span>
          <span className="text-xs text-emerald-800 font-medium">
            💡 {row.key_takeaways?.length || 0} chiến thuật
          </span>
        </Space>
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
              setSelectedTip(row)
              setDrawerVisible(true)
            }}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xóa mẹo làm bài này?"
            description="Mẹo sẽ được chuyển vào trạng thái xóa mềm."
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
              placeholder="Tìm theo tiêu đề, tóm tắt..."
              prefix={<SearchOutlined className="text-slate-400" />}
              allowClear
              value={query.search}
              onChange={(e) => handleSearchChange(e.target.value)}
              style={{ width: 260 }}
            />

            <Select
              value={query.skill}
              onChange={handleSkillChange}
              options={SKILL_OPTIONS}
              style={{ width: 170 }}
              placeholder="Chọn kỹ năng"
            />

            <Select
              value={query.part}
              onChange={handlePartChange}
              options={PART_OPTIONS}
              style={{ width: 180 }}
              placeholder="Chọn Part"
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
                setSelectedTip(null)
                setDrawerVisible(true)
              }}
            >
              Thêm mẹo TOEIC mới
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
          showTotal: (total) => `Tổng cộng ${total} mẹo TOEIC`,
          onChange: (page, limit) => setQuery((prev) => ({ ...prev, page, limit })),
        }}
        bordered
        size="middle"
      />

      {/* Editor Drawer */}
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

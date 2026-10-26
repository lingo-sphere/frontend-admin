// Trang quản lý ngữ cảnh luyện tập (Practice Contexts) dành cho quản trị viên.

import React, { useMemo, useState } from 'react'
import {
  Alert,
  Badge,
  Button,
  Checkbox,
  ConfigProvider,
  Dropdown,
  Form,
  Input,
  InputNumber,
  Modal,
  Switch,
  Table,
  Tag,
  Tooltip,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  CheckCircle2,
  Edit3,
  FolderTree,
  GitBranch,
  Layers,
  Plus,
  RotateCcw,
  Search,
  X,
  SlidersHorizontal,
  Columns3,
  ChevronDown,
} from 'lucide-react'
import { toast } from '@/store/toast.store'
import { CustomSelect } from '@/components/custom.select'
import { TableRowActions } from '@/components/table.row.actions'
import {
  usePracticeContextsAdmin,
} from '@/features/practice/hooks/use.practice.contexts'
import type {
  CreatePracticeContextPayload,
  PracticeContext,
} from '@/features/practice/services/practice.service'

const DOMAIN_OPTIONS = [
  { value: 'SPEAKING', label: 'Luyện nói (Speaking)', color: 'blue' },
  { value: 'LISTENING', label: 'Luyện nghe (Listening)', color: 'cyan' },
  { value: 'READING', label: 'Luyện đọc (Reading)', color: 'green' },
  { value: 'WRITING', label: 'Luyện viết (Writing)', color: 'orange' },
  { value: 'GRAMMAR', label: 'Ngữ pháp (Grammar)', color: 'purple' },
  { value: 'VOCABULARY', label: 'Từ vựng (Vocabulary)', color: 'gold' },
]

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

const DENSITY_LABELS: Record<'compact' | 'normal' | 'comfortable', string> = {
  compact: 'Gọn',
  normal: 'Vừa',
  comfortable: 'Rộng',
}

const DENSITY_TOKENS = {
  compact: { cellPaddingBlockMD: 6, cellPaddingInlineMD: 8, borderColor: 'rgba(226, 232, 240, 0.8)' },
  normal: { cellPaddingBlockMD: 10, cellPaddingInlineMD: 12, borderColor: 'rgba(226, 232, 240, 0.8)' },
  comfortable: { cellPaddingBlockMD: 16, cellPaddingInlineMD: 16, borderColor: 'rgba(226, 232, 240, 0.8)' },
}

const CONTEXT_COLUMN_OPTIONS = [
  { label: 'Tên ngữ cảnh', value: 'name_en' },
  { label: 'Mã Code', value: 'code' },
  { label: 'Cấp bậc', value: 'level' },
  { label: 'Kỹ năng (Domains)', value: 'domains' },
  { label: 'Bài tập', value: 'total_exercises' },
  { label: 'Trạng thái', value: 'status' },
]

interface ContextFormValues {
  name_en: string
  name_vi?: string
  code?: string
  parent_id?: string
  domains?: string[]
  cefr_level?: string
  target_level?: string
  description?: string
  description_vi?: string
  sort_order?: number
  status: string
  is_selectable?: boolean
}

export function PracticeContextsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLevel, setSelectedLevel] = useState<number | 'ALL'>('ALL')
  const [selectedDomain, setSelectedDomain] = useState<string | 'ALL'>('ALL')
  const [selectedStatus, setSelectedStatus] = useState<string | 'ALL'>('ALL')
  const [density, setDensity] = useState<'compact' | 'normal' | 'comfortable'>('normal')
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    'name_en',
    'code',
    'level',
    'domains',
    'total_exercises',
    'status',
  ])

  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<PracticeContext | null>(null)

  const [form] = Form.useForm<ContextFormValues>()
  const selectedParentId = Form.useWatch('parent_id', form)

  const {
    contexts,
    isLoading,
    isFetching,
    refetch,
    createContext,
    updateContext,
    deleteContext,
  } = usePracticeContextsAdmin({ include_disabled: true })

  const level0Contexts = useMemo(() => contexts.filter((c) => c.level === 0), [contexts])
  const level1Contexts = useMemo(() => contexts.filter((c) => c.level === 1), [contexts])

  const contextMap = useMemo(() => {
    const map = new Map<string, PracticeContext>()
    contexts.forEach((c) => map.set(c._id, c))
    return map
  }, [contexts])

  const calculatedLevel = useMemo(() => {
    if (!selectedParentId) return 0
    const parent = contextMap.get(selectedParentId)
    if (!parent) return 0
    return Math.min(parent.level + 1, 2)
  }, [selectedParentId, contextMap])

  const filteredContexts = useMemo(() => {
    return contexts.filter((ctx) => {
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase()
        const matchNameEn = (ctx.name_en || ctx.name || '').toLowerCase().includes(query)
        const matchNameVi = (ctx.name_vi || '').toLowerCase().includes(query)
        const matchCode = (ctx.code || '').toLowerCase().includes(query)
        if (!matchNameEn && !matchNameVi && !matchCode) return false
      }

      if (selectedLevel !== 'ALL' && ctx.level !== selectedLevel) {
        return false
      }

      if (selectedDomain !== 'ALL') {
        if (!ctx.domains || !ctx.domains.includes(selectedDomain)) return false
      }

      if (selectedStatus !== 'ALL' && ctx.status !== selectedStatus) {
        return false
      }

      return true
    })
  }, [contexts, searchTerm, selectedLevel, selectedDomain, selectedStatus])

  const treeData = useMemo(() => {
    if (searchTerm.trim() || selectedLevel !== 'ALL' || selectedDomain !== 'ALL' || selectedStatus !== 'ALL') {
      return filteredContexts.map((c) => ({ ...c, key: c._id }))
    }

    interface TreeNode extends PracticeContext {
      key: string
      children?: TreeNode[]
    }

    const nodeMap = new Map<string, TreeNode>()
    contexts.forEach((c) => {
      nodeMap.set(c._id, { ...c, key: c._id, children: [] })
    })

    const roots: TreeNode[] = []

    contexts.forEach((c) => {
      const node = nodeMap.get(c._id)!
      if (c.parent_id && nodeMap.has(c.parent_id)) {
        const parentNode = nodeMap.get(c.parent_id)!
        parentNode.children = parentNode.children || []
        parentNode.children.push(node)
      } else if (c.level === 0) {
        roots.push(node)
      }
    })

    const pruneEmptyChildren = (nodes: TreeNode[]) => {
      nodes.forEach((n) => {
        if (n.children && n.children.length > 0) {
          pruneEmptyChildren(n.children)
        } else {
          delete n.children
        }
      })
    }
    pruneEmptyChildren(roots)

    return roots
  }, [contexts, filteredContexts, searchTerm, selectedLevel, selectedDomain, selectedStatus])

  const handleOpenCreateModal = (parentId?: string) => {
    setEditingItem(null)
    form.resetFields()
    form.setFieldsValue({
      parent_id: parentId,
      domains: ['SPEAKING', 'LISTENING', 'READING', 'WRITING', 'GRAMMAR'],
      status: 'ACTIVE',
      sort_order: 0,
      is_selectable: true,
    })
    setModalOpen(true)
  }

  const handleOpenEditModal = (record: PracticeContext) => {
    setEditingItem(record)
    form.resetFields()
    form.setFieldsValue({
      name_en: record.name_en || record.name,
      name_vi: record.name_vi,
      code: record.code,
      parent_id: record.parent_id,
      domains: record.domains || ['SPEAKING', 'LISTENING', 'READING', 'WRITING', 'GRAMMAR'],
      cefr_level: record.cefr_level,
      target_level: record.target_level,
      description: record.description,
      description_vi: record.description_vi,
      sort_order: record.sort_order ?? 0,
      status: record.status || 'ACTIVE',
      is_selectable: record.is_selectable ?? true,
    })
    setModalOpen(true)
  }

  const handleSubmitForm = async () => {
    try {
      const values = await form.validateFields()
      const payload: CreatePracticeContextPayload = {
        name_en: values.name_en.trim(),
        name_vi: values.name_vi?.trim() || undefined,
        code: values.code?.trim() || undefined,
        parent_id: values.parent_id || undefined,
        domains: values.domains,
        cefr_level: values.cefr_level || undefined,
        target_level: values.target_level || undefined,
        description: values.description?.trim() || undefined,
        description_vi: values.description_vi?.trim() || undefined,
        sort_order: values.sort_order ?? 0,
        status: values.status,
        is_selectable: values.is_selectable ?? true,
      }

      if (editingItem) {
        await updateContext.mutateAsync({
          id: editingItem._id,
          payload,
        })
        toast.success('Cập nhật ngữ cảnh thành công!')
      } else {
        await createContext.mutateAsync(payload)
        toast.success('Thêm mới ngữ cảnh thành công!')
      }

      setModalOpen(false)
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'errorFields' in err) return
      const msg = err instanceof Error ? err.message : 'Có lỗi xảy ra'
      toast.error(msg)
    }
  }

  const handleToggleStatus = async (record: PracticeContext, checked: boolean) => {
    try {
      await updateContext.mutateAsync({
        id: record._id,
        payload: { status: checked ? 'ACTIVE' : 'INACTIVE' },
      })
      toast.success(checked ? 'Đã kích hoạt ngữ cảnh' : 'Đã tạm ẩn ngữ cảnh')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể đổi trạng thái'
      toast.error(msg)
    }
  }

  const handleDeleteContext = async (id: string) => {
    try {
      await deleteContext.mutateAsync(id)
      toast.success('Đã xóa ngữ cảnh thành công')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể xóa ngữ cảnh này'
      toast.error(msg)
    }
  }

  const columns: ColumnsType<PracticeContext> = [
    {
      title: 'Tên ngữ cảnh',
      dataIndex: 'name_en',
      key: 'name_en',
      width: 300,
      render: (_, record: PracticeContext) => {
        const en = record.name_en || record.name
        const vi = record.name_vi
        return (
          <div className="flex flex-col">
            <span className="font-semibold text-slate-800">{en}</span>
            {vi && <span className="text-xs text-slate-500">{vi}</span>}
            {record.path_string && (
              <span className="mt-0.5 text-[11px] text-slate-400 truncate max-w-xs" title={record.path_string}>
                {record.path_string}
              </span>
            )}
          </div>
        )
      },
    },
    {
      title: 'Mã Code',
      dataIndex: 'code',
      key: 'code',
      width: 180,
      render: (code: string) => (
        <code className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700">
          {code}
        </code>
      ),
    },
    {
      title: 'Cấp bậc',
      dataIndex: 'level',
      key: 'level',
      width: 140,
      render: (level: number) => {
        if (level === 0) {
          return <Tag color="purple" className="font-medium">Level 0: Chủ đề lớn</Tag>
        }
        if (level === 1) {
          return <Tag color="blue" className="font-medium">Level 1: Chủ điểm</Tag>
        }
        return <Tag color="green" className="font-medium">Level 2: Tình huống</Tag>
      },
    },
    {
      title: 'Kỹ năng (Domains)',
      dataIndex: 'domains',
      key: 'domains',
      width: 200,
      render: (domains: string[]) => {
        if (!domains || domains.length === 0) {
          return <span className="text-xs text-slate-400">Tất cả</span>
        }
        return (
          <div className="flex flex-wrap gap-1">
            {domains.map((dom) => {
              const matched = DOMAIN_OPTIONS.find((d) => d.value === dom)
              return (
                <Tag key={dom} color={matched?.color || 'default'} className="text-[11px] m-0">
                  {dom}
                </Tag>
              )
            })}
          </div>
        )
      },
    },
    {
      title: 'Bài tập',
      dataIndex: 'total_exercises',
      key: 'total_exercises',
      width: 100,
      align: 'center',
      render: (count?: number) => {
        const val = count || 0
        return (
          <Badge
            count={val}
            overflowCount={999}
            style={{ backgroundColor: val > 0 ? '#10b981' : '#94a3b8' }}
          />
        )
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string, record: PracticeContext) => (
        <Switch
          checked={status === 'ACTIVE'}
          checkedChildren="Bật"
          unCheckedChildren="Ẩn"
          size="small"
          onChange={(checked) => handleToggleStatus(record, checked)}
        />
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 150,
      fixed: 'right',
      align: 'center',
      render: (_, record: PracticeContext) => {
        const canAddChild = record.level < 2

        return (
          <TableRowActions
            onEdit={() => handleOpenEditModal(record)}
            onDelete={() => handleDeleteContext(record._id)}
            deleteTitle="Xóa ngữ cảnh"
            deleteDescription="Bạn có chắc chắn muốn xóa ngữ cảnh này? Không thể hoàn tác nếu không có ràng buộc."
            extraActions={
              canAddChild ? (
                <Tooltip title={`Thêm cấp con (Level ${record.level + 1})`}>
                  <button
                    type="button"
                    onClick={() => handleOpenCreateModal(record._id)}
                    className="p-1.5 rounded-lg text-blue-600 dark:text-blue-400 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/50 border border-blue-200/60 dark:border-blue-800/60 transition-colors cursor-pointer"
                  >
                    <Plus size={14} />
                  </button>
                </Tooltip>
              ) : null
            }
          />
        )
      },
    },
  ]

  const displayedColumns = columns.filter(
    (col) => col.key === 'actions' || visibleColumns.includes(String(col.key))
  )

  return (
    <div className="space-y-4 p-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <FolderTree size={22} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 m-0">Quản lý Ngữ cảnh (Practice Contexts)</h1>
              <p className="text-sm text-slate-500 m-0">
                Phân loại bài tập 4 kỹ năng (Nghe, Nói, Đọc, Viết) và Ngữ pháp theo cây phân cấp 3 tầng chuẩn TOEIC/CEFR.
              </p>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Giới hạn 3 cấp độ:</span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 font-medium">
              <Layers size={13} /> Level 0: Chủ đề lớn (Theme)
            </span>
            <span className="text-slate-300">➔</span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 font-medium">
              <GitBranch size={13} /> Level 1: Nhóm chủ điểm (Topic)
            </span>
            <span className="text-slate-300">➔</span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-green-50 text-green-700 font-medium">
              <CheckCircle2 size={13} /> Level 2: Tình huống cụ thể (Situation - Tối đa)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            icon={<RotateCcw size={15} />}
            loading={isFetching}
            onClick={() => refetch()}
          >
            Làm mới
          </Button>

          <Button
            type="primary"
            icon={<Plus size={16} />}
            className="bg-indigo-600 hover:bg-indigo-700"
            onClick={() => handleOpenCreateModal()}
          >
            Thêm chủ đề gốc (Level 0)
          </Button>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          <div className="flex items-center gap-2 w-full sm:w-72 h-10 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
            <input
              type="text"
              placeholder="Tìm theo tên tiếng Anh, tiếng Việt, mã code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent border-0 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 p-0 text-xs focus:ring-0"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <CustomSelect
            value={selectedLevel}
            onChange={(val) => setSelectedLevel(val)}
            options={[
              { value: 'ALL', label: 'Tất cả cấp bậc' },
              { value: 0, label: 'Level 0: Chủ đề lớn (Theme)' },
              { value: 1, label: 'Level 1: Nhóm chủ điểm (Topic)' },
              { value: 2, label: 'Level 2: Tình huống cụ thể' },
            ]}
          />

          <CustomSelect
            value={selectedDomain}
            onChange={(val) => setSelectedDomain(val)}
            options={[
              { value: 'ALL', label: 'Tất cả kỹ năng (Domains)' },
              ...DOMAIN_OPTIONS,
            ]}
          />

          <CustomSelect
            value={selectedStatus}
            onChange={(val) => setSelectedStatus(val)}
            options={[
              { value: 'ALL', label: 'Tất cả trạng thái' },
              { value: 'ACTIVE', label: 'Đang hoạt động (ACTIVE)' },
              { value: 'INACTIVE', label: 'Tạm ẩn (INACTIVE)' },
            ]}
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Dropdown
            trigger={['click']}
            menu={{
              items: [
                { key: 'compact', label: 'Gọn' },
                { key: 'normal', label: 'Vừa' },
                { key: 'comfortable', label: 'Rộng' },
              ],
              selectedKeys: [density],
              onClick: ({ key }) => setDensity(key as 'compact' | 'normal' | 'comfortable'),
            }}
          >
            <button
              type="button"
              className="flex items-center gap-1.5 h-10 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer shadow-2xs"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{DENSITY_LABELS[density]}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
          </Dropdown>

          <button
            type="button"
            onClick={() => {
              setSearchTerm('')
              setSelectedLevel('ALL')
              setSelectedDomain('ALL')
              setSelectedStatus('ALL')
            }}
            className="flex items-center gap-1.5 h-10 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer shadow-2xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Đặt lại</span>
          </button>

          <Dropdown
            trigger={['click']}
            popupRender={() => (
              <div className="rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200/80 dark:border-slate-800 p-3 shadow-xl backdrop-blur-xl">
                <Checkbox.Group
                  value={visibleColumns}
                  options={CONTEXT_COLUMN_OPTIONS}
                  onChange={(values) => setVisibleColumns(values.map(String))}
                  style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
                />
              </div>
            )}
          >
            <button
              type="button"
              className="flex items-center gap-1.5 h-10 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer shadow-2xs"
            >
              <Columns3 className="w-3.5 h-3.5" />
              <span>Cột</span>
            </button>
          </Dropdown>
        </div>
      </div>

      <div className="rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs [&_.ant-table-thead_th]:!text-center [&_.ant-table-thead_.ant-table-column-sorters]:!justify-center [&_.ant-table-thead_.ant-table-column-sorters]:!gap-1.5">
        <ConfigProvider theme={{ components: { Table: DENSITY_TOKENS[density] } }}>
          <Table
            columns={displayedColumns}
            dataSource={treeData}
            loading={isLoading}
            pagination={false}
            rowKey="_id"
            scroll={{ x: 1100 }}
            defaultExpandAllRows={false}
          />
        </ConfigProvider>
      </div>

      <Modal
        title={
          <div className="flex items-center gap-2 text-base font-semibold">
            {editingItem ? <Edit3 size={18} className="text-indigo-600" /> : <Plus size={18} className="text-indigo-600" />}
            <span>{editingItem ? 'Chỉnh sửa ngữ cảnh' : 'Thêm mới ngữ cảnh'}</span>
          </div>
        }
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmitForm}
        okText={editingItem ? 'Lưu thay đổi' : 'Tạo mới'}
        cancelText="Hủy bỏ"
        width={680}
        confirmLoading={createContext.isPending || updateContext.isPending}
        destroyOnClose
      >
        <Alert
          type="info"
          showIcon
          className="mb-4 text-xs"
          message={
            <span>
              <strong>Giới hạn 3 cấp độ:</strong> Ngữ cảnh cha chỉ được chọn từ Level 0 hoặc Level 1. Ngữ cảnh Level 2 không thể làm cha vì hệ thống giới hạn tối đa 3 cấp.
            </span>
          }
        />

        <Form form={form} layout="vertical" requiredMark="optional">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
            <Form.Item
              name="name_en"
              label="Tên ngữ cảnh (Tiếng Anh)"
              rules={[{ required: true, message: 'Vui lòng nhập tên tiếng Anh' }]}
            >
              <Input placeholder="Ví dụ: Job Interview, Ordering Food..." />
            </Form.Item>

            <Form.Item name="name_vi" label="Tên ngữ cảnh (Tiếng Việt)">
              <Input placeholder="Ví dụ: Phỏng vấn xin việc, Gọi món..." />
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
            <Form.Item
              name="code"
              label="Mã định danh (Code)"
              tooltip="Mã duy nhất viết hoa phân cách bằng gạch dưới (VD: JOB_INTERVIEW). Để trống hệ thống sẽ tự sinh từ tên tiếng Anh."
            >
              <Input placeholder="Tự sinh nếu để trống (VD: JOB_INTERVIEW)" className="font-mono uppercase" />
            </Form.Item>

            <Form.Item
              name="parent_id"
              label={
                <div className="flex items-center justify-between w-full">
                  <span>Ngữ cảnh cha</span>
                  <Tag color={calculatedLevel === 0 ? 'purple' : calculatedLevel === 1 ? 'blue' : 'green'} className="ml-2 font-mono">
                    Level {calculatedLevel}
                  </Tag>
                </div>
              }
              tooltip="Chọn ngữ cảnh cha. Nếu để trống, ngữ cảnh này sẽ là Chủ đề lớn (Level 0). Chỉ có thể chọn ngữ cảnh Level 0 hoặc Level 1 làm cha."
            >
              <CustomSelect
                placeholder="-- Là ngữ cảnh gốc (Level 0) --"
                allowClear
                options={[
                  {
                    label: '🌟 CẤP ĐỘ 0 (Theme) ➔ Tạo mục con thành Level 1',
                    options: level0Contexts
                      .filter((c) => editingItem?._id !== c._id)
                      .map((c) => ({
                        value: c._id,
                        label: `${c.name_en || c.name} (${c.name_vi || c.code})`,
                      })),
                  },
                  {
                    label: '📁 CẤP ĐỘ 1 (Topic) ➔ Tạo mục con thành Level 2',
                    options: level1Contexts
                      .filter((c) => editingItem?._id !== c._id)
                      .map((c) => ({
                        value: c._id,
                        label: `↳ ${c.name_en || c.name} (${c.name_vi || c.code})`,
                      })),
                  },
                ]}
              />
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
            <Form.Item
              name="domains"
              label="Kỹ năng áp dụng"
              tooltip="Các kỹ năng có thể gắn bài tập vào ngữ cảnh này"
            >
              <CustomSelect
                mode="multiple"
                placeholder="Chọn kỹ năng áp dụng"
                options={DOMAIN_OPTIONS}
              />
            </Form.Item>

            <Form.Item name="cefr_level" label="Trình độ CEFR khuyến nghị">
              <CustomSelect
                placeholder="-- Chọn trình độ --"
                allowClear
                options={CEFR_LEVELS.map((lvl) => ({ value: lvl, label: lvl }))}
              />
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
            <Form.Item name="status" label="Trạng thái">
              <CustomSelect
                options={[
                  { value: 'ACTIVE', label: 'Hoạt động (ACTIVE)' },
                  { value: 'INACTIVE', label: 'Tạm ẩn (INACTIVE)' },
                ]}
              />
            </Form.Item>

            <Form.Item name="sort_order" label="Thứ tự hiển thị">
              <InputNumber min={0} max={9999} style={{ width: '100%' }} placeholder="0" />
            </Form.Item>
          </div>

          <Form.Item name="description" label="Mô tả chi tiết (Tiếng Anh)">
            <Input.TextArea rows={2} placeholder="Mô tả bối cảnh tình huống bằng tiếng Anh..." />
          </Form.Item>

          <Form.Item name="description_vi" label="Mô tả chi tiết (Tiếng Việt)">
            <Input.TextArea rows={2} placeholder="Mô tả bối cảnh tình huống bằng tiếng Việt..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
export default PracticeContextsPage


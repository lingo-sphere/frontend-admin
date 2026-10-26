import React, { useMemo, useState } from 'react'
import {
  Alert,
  Badge,
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Tooltip,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  AlertCircle,
  CheckCircle2,
  Edit3,
  FolderTree,
  GitBranch,
  Layers,
  Plus,
  RotateCcw,
  Search,
  Trash2,
} from 'lucide-react'
import { toast } from '@/store/toast.store'
import {
  usePracticeContextsAdmin,
} from '../hooks/use.practice.contexts'
import type {
  CreatePracticeContextPayload,
  PracticeContext,
  UpdatePracticeContextPayload,
} from '../services/practice.service'

const DOMAIN_OPTIONS = [
  { value: 'SPEAKING', label: 'Luyện nói (Speaking)', color: 'blue' },
  { value: 'LISTENING', label: 'Luyện nghe (Listening)', color: 'cyan' },
  { value: 'READING', label: 'Luyện đọc (Reading)', color: 'green' },
  { value: 'WRITING', label: 'Luyện viết (Writing)', color: 'orange' },
  { value: 'GRAMMAR', label: 'Ngữ pháp (Grammar)', color: 'purple' },
  { value: 'VOCABULARY', label: 'Từ vựng (Vocabulary)', color: 'gold' },
]

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

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

  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<PracticeContext | null>(null)
  const [presetParentId, setPresetParentId] = useState<string | undefined>(undefined)

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

  // Phân loại contexts
  const level0Contexts = useMemo(() => contexts.filter((c) => c.level === 0), [contexts])
  const level1Contexts = useMemo(() => contexts.filter((c) => c.level === 1), [contexts])
  const level2Contexts = useMemo(() => contexts.filter((c) => c.level === 2), [contexts])

  // Context map để tra cứu nhanh
  const contextMap = useMemo(() => {
    const map = new Map<string, PracticeContext>()
    contexts.forEach((c) => map.set(c._id, c))
    return map
  }, [contexts])

  // Tính level dự kiến dựa trên parent_id được chọn trong Form
  const calculatedLevel = useMemo(() => {
    if (!selectedParentId) return 0
    const parent = contextMap.get(selectedParentId)
    if (!parent) return 0
    return Math.min(parent.level + 1, 2)
  }, [selectedParentId, contextMap])

  // Lọc contexts hiển thị
  const filteredContexts = useMemo(() => {
    return contexts.filter((ctx) => {
      // Search
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase()
        const matchNameEn = (ctx.name_en || ctx.name || '').toLowerCase().includes(query)
        const matchNameVi = (ctx.name_vi || '').toLowerCase().includes(query)
        const matchCode = (ctx.code || '').toLowerCase().includes(query)
        if (!matchNameEn && !matchNameVi && !matchCode) return false
      }

      // Level
      if (selectedLevel !== 'ALL' && ctx.level !== selectedLevel) {
        return false
      }

      // Domain
      if (selectedDomain !== 'ALL') {
        if (!ctx.domains || !ctx.domains.includes(selectedDomain)) return false
      }

      // Status
      if (selectedStatus !== 'ALL' && ctx.status !== selectedStatus) {
        return false
      }

      return true
    })
  }, [contexts, searchTerm, selectedLevel, selectedDomain, selectedStatus])

  // Xây dựng cây phân cấp (Tree Table Data)
  const treeData = useMemo(() => {
    // Nếu đang search hoặc lọc level cụ thể thì hiển thị dạng phẳng (Flat List) để dễ quan sát kết quả
    if (searchTerm.trim() || selectedLevel !== 'ALL' || selectedDomain !== 'ALL' || selectedStatus !== 'ALL') {
      return filteredContexts.map((c) => ({ ...c, key: c._id }))
    }

    // Nếu không search/lọc: Hiển thị đúng cấu trúc Cây 3 Cấp Độ (Level 0 -> Level 1 -> Level 2)
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

    // Dọn dẹp mảng children rỗng
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

  // Mở modal tạo mới
  const handleOpenCreateModal = (parentId?: string) => {
    setEditingItem(null)
    setPresetParentId(parentId)
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

  // Mở modal chỉnh sửa
  const handleOpenEditModal = (record: PracticeContext) => {
    setEditingItem(record)
    setPresetParentId(record.parent_id)
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

  // Submit Form
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
    } catch (err: any) {
      if (err?.errorFields) return // Lỗi validate Form
      const msg = err?.response?.data?.message || err?.message || 'Có lỗi xảy ra'
      toast.error(msg)
    }
  }

  // Chuyển đổi trạng thái Active/Inactive nhanh
  const handleToggleStatus = async (record: PracticeContext, checked: boolean) => {
    try {
      await updateContext.mutateAsync({
        id: record._id,
        payload: { status: checked ? 'ACTIVE' : 'INACTIVE' },
      })
      toast.success(checked ? 'Đã kích hoạt ngữ cảnh' : 'Đã tạm ẩn ngữ cảnh')
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Không thể đổi trạng thái')
    }
  }

  // Xóa context
  const handleDeleteContext = async (id: string) => {
    try {
      await deleteContext.mutateAsync(id)
      toast.success('Đã xóa ngữ cảnh thành công')
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Không thể xóa ngữ cảnh này'
      toast.error(msg)
    }
  }

  // Bảng phân cấp
  const columns: ColumnsType<any> = [
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
      width: 180,
      fixed: 'right',
      render: (_, record: PracticeContext) => {
        const canAddChild = record.level < 2

        return (
          <Space orientation="horizontal" size="small">
            {canAddChild ? (
              <Tooltip title={`Thêm cấp con (Level ${record.level + 1})`}>
                <Button
                  size="small"
                  type="text"
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  icon={<Plus size={14} />}
                  onClick={() => handleOpenCreateModal(record._id)}
                >
                  Con
                </Button>
              </Tooltip>
            ) : (
              <Tooltip title="Đã đạt trần tối đa 3 cấp độ (Level 2). Không thể tạo cấp sâu hơn.">
                <Button size="small" type="text" disabled className="text-slate-300">
                  Đầy
                </Button>
              </Tooltip>
            )}

            <Button
              size="small"
              type="text"
              icon={<Edit3 size={14} />}
              onClick={() => handleOpenEditModal(record)}
            >
              Sửa
            </Button>

            <Popconfirm
              title="Xóa ngữ cảnh"
              description="Bạn có chắc chắn muốn xóa ngữ cảnh này? Không thể hoàn tác nếu không có ràng buộc."
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
              onConfirm={() => handleDeleteContext(record._id)}
            >
              <Button
                size="small"
                type="text"
                danger
                icon={<Trash2 size={14} />}
              />
            </Popconfirm>
          </Space>
        )
      },
    },
  ]

  return (
    <div className="space-y-4 p-4">
      {/* Header & Badges quy tắc 3 cấp */}
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

      {/* Filter Bar */}
      <Card bodyStyle={{ padding: '16px' }} className="shadow-sm border-slate-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Input
            placeholder="Tìm theo tên tiếng Anh, tiếng Việt, mã code..."
            prefix={<Search size={15} className="text-slate-400" />}
            value={searchTerm}
            allowClear
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <Select
            value={selectedLevel}
            onChange={(val) => setSelectedLevel(val)}
            options={[
              { value: 'ALL', label: 'Tất cả cấp bậc' },
              { value: 0, label: 'Level 0: Chủ đề lớn (Theme)' },
              { value: 1, label: 'Level 1: Nhóm chủ điểm (Topic)' },
              { value: 2, label: 'Level 2: Tình huống cụ thể' },
            ]}
          />

          <Select
            value={selectedDomain}
            onChange={(val) => setSelectedDomain(val)}
            options={[
              { value: 'ALL', label: 'Tất cả kỹ năng (Domains)' },
              ...DOMAIN_OPTIONS,
            ]}
          />

          <Select
            value={selectedStatus}
            onChange={(val) => setSelectedStatus(val)}
            options={[
              { value: 'ALL', label: 'Tất cả trạng thái' },
              { value: 'ACTIVE', label: 'Đang hoạt động (ACTIVE)' },
              { value: 'INACTIVE', label: 'Tạm ẩn (INACTIVE)' },
            ]}
          />
        </div>
      </Card>

      {/* Main Table */}
      <Card bodyStyle={{ padding: '0px' }} className="shadow-sm border-slate-200 overflow-hidden">
        <Table
          columns={columns}
          dataSource={treeData}
          loading={isLoading}
          pagination={false}
          rowKey="_id"
          scroll={{ x: 1100 }}
          defaultExpandAllRows={false}
        />
      </Card>

      {/* Modal Create / Edit */}
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
              <Select
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
              <Select
                mode="multiple"
                placeholder="Chọn kỹ năng áp dụng"
                options={DOMAIN_OPTIONS}
              />
            </Form.Item>

            <Form.Item name="cefr_level" label="Trình độ CEFR khuyến nghị">
              <Select
                placeholder="-- Chọn trình độ --"
                allowClear
                options={CEFR_LEVELS.map((lvl) => ({ value: lvl, label: lvl }))}
              />
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
            <Form.Item name="status" label="Trạng thái">
              <Select
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


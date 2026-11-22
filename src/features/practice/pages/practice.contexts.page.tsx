// Trang quản lý ngữ cảnh luyện tập (Practice Contexts) dành cho quản trị viên hỗ trợ song ngữ Anh - Việt.

import React, { useMemo, useState } from 'react'
import {
  Alert,
  Badge,
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Tag,
  Tooltip,
} from 'antd'
import {
  CheckCircle2,
  Edit3,
  FolderTree,
  GitBranch,
  Layers,
  Plus,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from '@/store/toast.store'
import { CustomSelect } from '@/components/custom.select'
import { DataTable, type DataTableColumn } from '@/components/data.table'
import { TableRowActions } from '@/components/table.row.actions'
import { TableStatusSwitch } from '@/components/table.status.switch'
import { usePracticeContextsAdmin } from '@/features/practice/hooks/use.practice.contexts'
import type {
  CreatePracticeContextPayload,
  PracticeContext,
} from '@/features/practice/services/practice.service'

const getDomainOptions = (isVi: boolean) => [
  { value: 'SPEAKING', label: isVi ? 'Luyện nói (Speaking)' : 'Speaking', color: 'blue' },
  { value: 'LISTENING', label: isVi ? 'Luyện nghe (Listening)' : 'Listening', color: 'cyan' },
  { value: 'READING', label: isVi ? 'Luyện đọc (Reading)' : 'Reading', color: 'green' },
  { value: 'WRITING', label: isVi ? 'Luyện viết (Writing)' : 'Writing', color: 'orange' },
  { value: 'GRAMMAR', label: isVi ? 'Ngữ pháp (Grammar)' : 'Grammar', color: 'purple' },
  { value: 'VOCABULARY', label: isVi ? 'Từ vựng (Vocabulary)' : 'Vocabulary', color: 'gold' },
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
  const { t, i18n } = useTranslation()
  const isVi = i18n.language === 'vi'
  const domainOptions = useMemo(() => getDomainOptions(isVi), [isVi])

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLevel, setSelectedLevel] = useState<number | 'ALL'>('ALL')
  const [selectedDomain, setSelectedDomain] = useState<string | 'ALL'>('ALL')
  const [selectedStatus, setSelectedStatus] = useState<string | 'ALL'>('ALL')

  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<PracticeContext | null>(null)

  const [form] = Form.useForm<ContextFormValues>()
  const selectedParentId = Form.useWatch('parent_id', form)

  const {
    contexts,
    isLoading,
    createContext,
    updateContext,
    deleteContext,
  } = usePracticeContextsAdmin({ include_disabled: true })

  const level0Contexts = useMemo(
    () => contexts.filter((c) => c.level === 0),
    [contexts]
  )
  const level1Contexts = useMemo(
    () => contexts.filter((c) => c.level === 1),
    [contexts]
  )

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
    if (
      searchTerm.trim() ||
      selectedLevel !== 'ALL' ||
      selectedDomain !== 'ALL' ||
      selectedStatus !== 'ALL'
    ) {
      return filteredContexts.map((c) => ({ ...c, key: c._id }))
    }

    const rootItems = contexts.filter((c) => c.level === 0)
    const mapTree = (item: PracticeContext): PracticeContext & { key: string; children?: PracticeContext[] } => {
      const children = contexts.filter((c) => c.parent_id === item._id)
      return {
        ...item,
        key: item._id,
        children: children.length > 0 ? children.map(mapTree) : undefined,
      }
    }
    return rootItems.map(mapTree)
  }, [contexts, filteredContexts, searchTerm, selectedLevel, selectedDomain, selectedStatus])

  const handleOpenCreateModal = (parentId?: string) => {
    setEditingItem(null)
    form.resetFields()
    form.setFieldsValue({
      parent_id: parentId,
      status: 'ACTIVE',
      sort_order: 0,
      domains: ['SPEAKING', 'LISTENING', 'READING', 'WRITING', 'GRAMMAR'],
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
      domains: record.domains || [
        'SPEAKING',
        'LISTENING',
        'READING',
        'WRITING',
        'GRAMMAR',
      ],
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
        name_vi: values.name_vi?.trim() || '',
        code: values.code?.trim() || undefined,
        parent_id: values.parent_id || null,
        domains: values.domains,
        cefr_level: values.cefr_level || '',
        target_level: values.target_level || '',
        description: values.description?.trim() || '',
        description_vi: values.description_vi?.trim() || '',
        sort_order: values.sort_order ?? 0,
        status: values.status,
        is_selectable: values.is_selectable ?? true,
      }

      if (editingItem) {
        await updateContext.mutateAsync({
          id: editingItem._id,
          payload,
        })
        toast.success(t('practice.contexts.updateSuccess'))
      } else {
        await createContext.mutateAsync(payload)
        toast.success(t('practice.contexts.createSuccess'))
      }

      setModalOpen(false)
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'errorFields' in err) return
      const msg = err instanceof Error ? err.message : t('common.error')
      toast.error(msg)
    }
  }

  const [togglingId, setTogglingId] = useState<string | null>(null)

  const handleToggleStatus = async (
    record: PracticeContext,
    checked: boolean
  ) => {
    setTogglingId(record._id)
    try {
      await updateContext.mutateAsync({
        id: record._id,
        payload: { status: checked ? 'ACTIVE' : 'INACTIVE' },
      })
      toast.success(checked ? t('practice.contexts.statusActivated') : t('practice.contexts.statusDeactivated'))
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('common.error')
      toast.error(msg)
    } finally {
      setTogglingId(null)
    }
  }

  const handleDeleteContext = async (id: string) => {
    try {
      await deleteContext.mutateAsync(id)
      toast.success(t('practice.contexts.deleteSuccess'))
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('common.error')
      toast.error(msg)
    }
  }

  const columns: DataTableColumn<PracticeContext>[] = [
    {
      title: t('practice.contexts.name'),
      key: 'name_en',
      width: 320,
      sortable: true,
      sorter: (a, b) =>
        (a.name_en || a.name || '').localeCompare(
          b.name_en || b.name || '',
          isVi ? 'vi' : 'en'
        ),
      render: (record: PracticeContext) => {
        const en = record.name_en || record.name
        const vi = record.name_vi
        if (record.level === 0) {
          return (
            <div className="inline-flex items-center gap-2.5 py-1 align-middle">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300 shrink-0 border border-purple-200/80 dark:border-purple-800 shadow-xs">
                <Layers size={16} />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900 dark:text-slate-100 tracking-tight">
                    {isVi && vi ? vi : en}
                  </span>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300">
                    Theme
                  </span>
                </div>
                {isVi ? (
                  en && vi && (
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {en}
                    </span>
                  )
                ) : (
                  vi && (
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {vi}
                    </span>
                  )
                )}
                {record.path_string && (
                  <span
                    className="text-[11px] text-slate-400 truncate w-full min-w-0"
                    title={record.path_string}
                  >
                    {record.path_string}
                  </span>
                )}
              </div>
            </div>
          )
        }
        if (record.level === 1) {
          return (
            <div className="inline-flex items-center gap-2 py-0.5 align-middle">
              <div className="flex items-center gap-1.5 text-blue-500 dark:text-blue-400">
                <span className="text-slate-400 dark:text-slate-500 font-mono text-xs select-none">
                  └─
                </span>
                <div className="flex items-center justify-center w-6 h-6 rounded-md bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 shrink-0 border border-blue-200/70 dark:border-blue-800">
                  <GitBranch size={13} />
                </div>
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                    {isVi && vi ? vi : en}
                  </span>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-300">
                    Topic
                  </span>
                </div>
                {isVi ? (
                  en && vi && (
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {en}
                    </span>
                  )
                ) : (
                  vi && (
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {vi}
                    </span>
                  )
                )}
                {record.path_string && (
                  <span
                    className="text-[10px] text-slate-400 truncate w-full min-w-0"
                    title={record.path_string}
                  >
                    {record.path_string}
                  </span>
                )}
              </div>
            </div>
          )
        }
        return (
          <div className="inline-flex items-center gap-2 py-0.5 align-middle">
            <div className="flex items-center gap-1.5 text-emerald-500 dark:text-emerald-400">
              <span className="text-slate-400 dark:text-slate-500 font-mono text-xs select-none">
                └──
              </span>
              <div className="flex items-center justify-center w-5 h-5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 shrink-0 border border-emerald-200/70 dark:border-emerald-800">
                <CheckCircle2 size={12} />
              </div>
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-normal text-xs text-slate-700 dark:text-slate-300">
                  {isVi && vi ? vi : en}
                </span>
                <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-normal bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                  Situation
                </span>
              </div>
              {isVi ? (
                en && vi && (
                  <span className="text-[11px] text-slate-400 dark:text-slate-500">
                    {en}
                  </span>
                )
              ) : (
                vi && (
                  <span className="text-[11px] text-slate-400 dark:text-slate-500">
                    {vi}
                  </span>
                )
              )}
              {record.path_string && (
                <span
                  className="text-[10px] text-slate-400 truncate w-full min-w-0"
                  title={record.path_string}
                >
                  {record.path_string}
                </span>
              )}
            </div>
          </div>
        )
      },
    },
    {
      title: t('practice.contexts.code'),
      key: 'code',
      width: 180,
      sortable: true,
      dataIndex: 'code',
      align: 'center',
      render: (record: PracticeContext) => {
        if (record.level === 0) {
          return (
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-purple-100/80 text-purple-800 dark:bg-purple-950/80 dark:text-purple-200 border border-purple-200/90 dark:border-purple-800 shadow-xs">
              {record.code}
            </span>
          )
        }
        if (record.level === 1) {
          return (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-mono font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/60">
              {record.code}
            </span>
          )
        }
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80">
            {record.code}
          </span>
        )
      },
    },
    {
      title: t('practice.contexts.level'),
      key: 'level',
      width: 160,
      sortable: true,
      dataIndex: 'level',
      align: 'center',
      render: (record: PracticeContext) => {
        if (record.level === 0) {
          return (
            <Tag
              color="purple"
              className="font-semibold px-2.5 py-1 rounded-md inline-flex items-center gap-1.5 border-purple-300 dark:border-purple-800 shadow-xs"
            >
              <Layers size={13} /> {isVi ? 'Level 0: Chủ đề lớn' : 'Level 0: Theme'}
            </Tag>
          )
        }
        if (record.level === 1) {
          return (
            <Tag
              color="blue"
              className="font-medium px-2 py-0.5 rounded-md inline-flex items-center gap-1.5 border-blue-300 dark:border-blue-800"
            >
              <GitBranch size={12} /> {isVi ? 'Level 1: Chủ điểm' : 'Level 1: Topic'}
            </Tag>
          )
        }
        return (
          <Tag
            color="green"
            className="font-normal px-2 py-0.5 rounded-md inline-flex items-center gap-1.5 border-emerald-300 dark:border-emerald-800"
          >
            <CheckCircle2 size={12} /> {isVi ? 'Level 2: Tình huống' : 'Level 2: Situation'}
          </Tag>
        )
      },
    },
    {
      title: t('practice.contexts.domains'),
      key: 'domains',
      width: 200,
      align: 'center',
      render: (record: PracticeContext) => {
        const domains = record.domains
        if (!domains || domains.length === 0) {
          return <span className="text-xs text-slate-400">{t('practice.contexts.all')}</span>
        }
        return (
          <div className="flex flex-wrap justify-center gap-1">
            {domains.map((dom) => {
              const matched = domainOptions.find((d) => d.value === dom)
              return (
                <Tag
                  key={dom}
                  color={matched?.color || 'default'}
                  className="text-[11px] m-0"
                >
                  {dom}
                </Tag>
              )
            })}
          </div>
        )
      },
    },
    {
      title: t('practice.contexts.exercises'),
      key: 'total_exercises',
      width: 100,
      sortable: true,
      dataIndex: 'total_exercises',
      align: 'center',
      render: (record: PracticeContext) => {
        const val = record.total_exercises || 0
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
      title: t('practice.contexts.status'),
      key: 'status',
      width: 120,
      align: 'center',
      render: (record: PracticeContext) => (
        <TableStatusSwitch
          checked={record.status === 'ACTIVE'}
          loading={togglingId === record._id}
          disabled={Boolean(togglingId)}
          checkedChildren={isVi ? 'Bật' : 'ON'}
          unCheckedChildren={isVi ? 'Ẩn' : 'OFF'}
          ariaLabel={isVi ? `Trạng thái ngữ cảnh ${record.name_vi || record.name_en}` : `Status for context ${record.name_en || record.name_vi}`}
          onChange={(checked) => handleToggleStatus(record, checked)}
        />
      ),
    },
    {
      title: t('practice.contexts.actions'),
      key: 'actions',
      width: 150,
      align: 'center',
      render: (record: PracticeContext) => {
        const canAddChild = record.level < 2

        return (
          <TableRowActions
            onEdit={() => handleOpenEditModal(record)}
            onDelete={() => handleDeleteContext(record._id)}
            deleteTitle={t('practice.contexts.deleteTitle')}
            deleteDescription={t('practice.contexts.deleteDesc')}
            extraActions={
              canAddChild ? (
                <Tooltip title={t('practice.contexts.addChild', { level: record.level + 1 })}>
                  <Button
                    size="small"
                    icon={<Plus size={14} />}
                    onClick={() => handleOpenCreateModal(record._id)}
                    className="!text-blue-600 !border-blue-200/80 !bg-blue-50/80 hover:!bg-blue-100 hover:!border-blue-300 dark:!bg-blue-950/60 dark:!border-blue-800 dark:!text-blue-400 dark:hover:!bg-blue-900/60 shadow-2xs"
                  />
                </Tooltip>
              ) : null
            }
          />
        )
      },
    },
  ]

  return (
    <div className="space-y-4 p-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-lg">
              <FolderTree size={22} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 m-0">
                {t('practice.contexts.title')}
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 m-0">
                {t('practice.contexts.subtitle')}
              </p>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">
              {t('practice.contexts.threeLevelsLimit')}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 font-medium">
              <Layers size={13} /> {t('practice.contexts.level0')}
            </span>
            <span className="text-slate-300">➔</span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-medium">
              <GitBranch size={13} /> {t('practice.contexts.level1')}
            </span>
            <span className="text-slate-300">➔</span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-green-50 text-green-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-medium">
              <CheckCircle2 size={13} /> {t('practice.contexts.level2')}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="primary"
            icon={<Plus size={16} />}
            className="bg-indigo-600 hover:bg-indigo-700"
            onClick={() => handleOpenCreateModal()}
          >
            {t('practice.contexts.addRoot')}
          </Button>
        </div>
      </div>

      <DataTable<PracticeContext>
        columns={columns}
        data={treeData}
        isLoading={isLoading}
        rowKey="_id"
        rowClassName={(record) => {
          if (record.level === 0) {
            return '[&>td]:!bg-slate-100/90 dark:[&>td]:!bg-slate-800/85 hover:[&>td]:!bg-slate-200/80 dark:hover:[&>td]:!bg-slate-700/80 [&>td:first-child]:!border-l-4 [&>td:first-child]:!border-l-purple-600 border-t-2 border-slate-300/80 dark:border-slate-700/80 font-medium transition-colors duration-150'
          }
          if (record.level === 1) {
            return '[&>td]:!bg-white dark:[&>td]:!bg-slate-900/95 hover:[&>td]:!bg-blue-50/40 dark:hover:[&>td]:!bg-blue-950/20 [&>td:first-child]:!border-l-4 [&>td:first-child]:!border-l-blue-400 border-t border-slate-200/60 dark:border-slate-800/60 transition-colors duration-150'
          }
          return '[&>td]:!bg-slate-50/70 dark:[&>td]:!bg-slate-950/50 hover:[&>td]:!bg-emerald-50/30 dark:hover:[&>td]:!bg-emerald-950/20 [&>td:first-child]:!border-l-4 [&>td:first-child]:!border-l-emerald-400 border-t border-dashed border-slate-200/60 dark:border-slate-800/60 transition-colors duration-150'
        }}
        search={searchTerm}
        onSearchChange={setSearchTerm}
        searchLabel={t('practice.contexts.searchLabel')}
        searchPlaceholder={t('practice.contexts.searchPlaceholder')}
        onResetFilters={() => {
          setSearchTerm('')
          setSelectedLevel('ALL')
          setSelectedDomain('ALL')
          setSelectedStatus('ALL')
        }}
        extraFilters={
          <>
            <CustomSelect
              value={selectedLevel}
              onChange={(val) => setSelectedLevel(val)}
              className="w-44"
              options={[
                { value: 'ALL', label: t('practice.contexts.allLevels') },
                { value: 0, label: t('practice.contexts.level0') },
                { value: 1, label: t('practice.contexts.level1') },
                { value: 2, label: t('practice.contexts.level2') },
              ]}
            />

            <CustomSelect
              value={selectedDomain}
              onChange={(val) => setSelectedDomain(val)}
              className="w-52"
              options={[
                { value: 'ALL', label: t('practice.contexts.allDomains') },
                ...domainOptions,
              ]}
            />

            <CustomSelect
              value={selectedStatus}
              onChange={(val) => setSelectedStatus(val)}
              className="w-40"
              options={[
                { value: 'ALL', label: t('practice.contexts.allStatus') },
                { value: 'ACTIVE', label: t('practice.contexts.activeStatus') },
                { value: 'INACTIVE', label: t('practice.contexts.inactiveStatus') },
              ]}
            />
          </>
        }
      />

      <Modal
        title={
          <div className="flex items-center gap-2 text-base font-semibold">
            {editingItem ? (
              <Edit3 size={18} className="text-indigo-600" />
            ) : (
              <Plus size={18} className="text-indigo-600" />
            )}
            <span>
              {editingItem ? t('practice.contexts.edit') : t('practice.contexts.create')}
            </span>
          </div>
        }
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmitForm}
        okText={editingItem ? t('practice.contexts.save') : t('practice.contexts.createBtn')}
        cancelText={t('practice.contexts.cancel')}
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
              <strong>{t('practice.contexts.threeLevelsLimit')}</strong>{' '}
              {isVi
                ? 'Ngữ cảnh cha chỉ được chọn từ Level 0 hoặc Level 1. Ngữ cảnh Level 2 không thể làm cha vì hệ thống giới hạn tối đa 3 cấp.'
                : 'Parent contexts can only be selected from Level 0 or Level 1. Level 2 contexts cannot be parents as the system allows a maximum of 3 levels.'}
            </span>
          }
        />

        <Form form={form} layout="vertical" requiredMark="optional">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
            <Form.Item
              name="name_en"
              label={t('practice.contexts.nameEn')}
              rules={[
                { required: true, message: isVi ? 'Vui lòng nhập tên tiếng Anh' : 'Please enter English name' },
              ]}
            >
              <Input placeholder="Ví dụ: Job Interview, Ordering Food..." />
            </Form.Item>

            <Form.Item name="name_vi" label={t('practice.contexts.nameVi')}>
              <Input placeholder="Ví dụ: Phỏng vấn xin việc, Gọi món..." />
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
            <Form.Item
              name="code"
              label={t('practice.contexts.code')}
              tooltip={isVi ? 'Mã duy nhất viết hoa phân cách bằng gạch dưới. Tự sinh nếu để trống khi tạo.' : 'Unique uppercase code separated by underscores. Auto-generated if left empty.'}
            >
              <Input
                disabled={Boolean(editingItem)}
                placeholder="JOB_INTERVIEW"
                className="font-mono uppercase"
              />
            </Form.Item>

            <Form.Item
              name="parent_id"
              label={
                <div className="flex items-center justify-between w-full">
                  <span>{t('practice.contexts.parent')}</span>
                  <Tag
                    color={
                      calculatedLevel === 0
                        ? 'purple'
                        : calculatedLevel === 1
                        ? 'blue'
                        : 'green'
                    }
                    className="ml-2 font-mono"
                  >
                    Level {calculatedLevel}
                  </Tag>
                </div>
              }
              tooltip={isVi ? 'Chọn ngữ cảnh cha. Nếu để trống, ngữ cảnh này sẽ là Level 0.' : 'Select parent context. If left blank, this will be Level 0.'}
            >
              <CustomSelect
                placeholder={t('practice.contexts.parentPlaceholder')}
                allowClear
                options={[
                  {
                    label: isVi ? '🌟 CẤP ĐỘ 0 (Theme) ➔ Tạo mục con thành Level 1' : '🌟 LEVEL 0 (Theme) ➔ Sub-items become Level 1',
                    options: level0Contexts
                      .filter((c) => editingItem?._id !== c._id)
                      .map((c) => ({
                        value: c._id,
                        label: `${c.name_en || c.name} (${c.name_vi || c.code})`,
                      })),
                  },
                  {
                    label: isVi ? '📁 CẤP ĐỘ 1 (Topic) ➔ Tạo mục con thành Level 2' : '📁 LEVEL 1 (Topic) ➔ Sub-items become Level 2',
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
              label={t('practice.contexts.domainsLabel')}
            >
              <CustomSelect
                mode="multiple"
                placeholder={isVi ? 'Chọn kỹ năng áp dụng' : 'Select applicable skills'}
                options={domainOptions}
              />
            </Form.Item>

            <Form.Item name="cefr_level" label={t('practice.contexts.cefrLabel')}>
              <CustomSelect
                placeholder={t('practice.contexts.cefrPlaceholder')}
                allowClear
                options={CEFR_LEVELS.map((lvl) => ({ value: lvl, label: lvl }))}
              />
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
            <Form.Item name="status" label={t('practice.contexts.status')}>
              <CustomSelect
                options={[
                  { value: 'ACTIVE', label: t('practice.contexts.activeStatus') },
                  { value: 'INACTIVE', label: t('practice.contexts.inactiveStatus') },
                ]}
              />
            </Form.Item>

            <Form.Item name="sort_order" label={t('practice.contexts.sortOrder')}>
              <InputNumber
                min={0}
                max={9999}
                style={{ width: '100%' }}
                placeholder="0"
              />
            </Form.Item>
          </div>

          <Form.Item name="description" label={t('practice.contexts.descEn')}>
            <Input.TextArea
              rows={2}
              placeholder={isVi ? 'Mô tả bối cảnh tình huống bằng tiếng Anh...' : 'Describe situation context in English...'}
            />
          </Form.Item>

          <Form.Item name="description_vi" label={t('practice.contexts.descVi')}>
            <Input.TextArea
              rows={2}
              placeholder={isVi ? 'Mô tả bối cảnh tình huống bằng tiếng Việt...' : 'Describe situation context in Vietnamese...'}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default PracticeContextsPage

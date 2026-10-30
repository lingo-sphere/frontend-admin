// Trang quản lý bài luyện nói (Speaking) dành cho quản trị viên.

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button, ConfigProvider, Segmented, Space, Tag, theme as antdTheme } from 'antd'
import { AdminTabs } from '@/components/admin.tabs'
import { TableStatusSwitch } from '@/components/table.status.switch'
import { Plus, RotateCcw } from 'lucide-react'
import dayjs from 'dayjs'
import { useAdminLayout } from '@/contexts/admin.layout.context'
import { toast } from '@/store/toast.store'
import { CustomSelect } from '@/components/custom.select'
import { DataTable, type IpaColumn } from '@/components/data.table'
import { SpeakingMediaPreview } from '@/features/practice/components/speaking.media.field'
import { SpeakingAdminEditor } from '@/features/practice/components/speaking.admin.editor'
import { IpaRowActions } from '@/features/practice/components/ipa.row.actions'
import { useIpaTableState } from '@/features/practice/hooks/use.ipa.table-state'
import { useSpeakingAdmin, useSpeakingMutations } from '@/features/practice/hooks/use.speaking.admin'
import { usePracticeContexts } from '@/features/practice/hooks/use.practice.contexts'
import { speakingAdminService } from '@/features/practice/services/speaking-admin.service'
import { speakingPayload } from '@/features/practice/helpers/speaking-admin.helper'
import { ipaError } from '@/features/practice/helpers/ipa-admin.helper'
import { ipaLevels } from '@/features/practice/types/ipa-admin.types'
import { speakingLabels, speakingTypes, type SpeakingRecord, type SpeakingType } from '@/features/practice/types/speaking-admin.types'

const speakingEnLabels: Record<SpeakingType, string> = {
  READ_ALOUD: 'Read Aloud',
  DESCRIBE_PICTURE: 'Describe Picture',
  SHORT_DIALOGUE: 'Short Dialogue',
  ANSWER_QUESTION: 'Answer Questions',
  OPINION_RESPONSE: 'Express Opinion'
}

function SpeakingTable({ type }: { type: SpeakingType }) {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'

  const statuses = [
    { value: 'DRAFT', label: isVi ? 'Nháp' : 'Draft' },
    { value: 'PUBLISHED', label: isVi ? 'Đã xuất bản' : 'Published' },
    { value: 'ARCHIVED', label: isVi ? 'Lưu trữ' : 'Archived' }
  ]
  const levels = ipaLevels.map(value => ({ value, label: value }))
  const difficulties = [
    { value: 'EASY', label: isVi ? 'Dễ' : 'Easy' },
    { value: 'MEDIUM', label: isVi ? 'Vừa' : 'Medium' },
    { value: 'HARD', label: isVi ? 'Khó' : 'Hard' }
  ]

  const state = useIpaTableState()
  const speakingQuery = useMemo(() => ({
    ...state.query,
    filters: JSON.stringify({ ...state.filters, exercise_type: [type] })
  }), [state.query, state.filters, type])
  const result = useSpeakingAdmin(speakingQuery)
  const mutations = useSpeakingMutations()
  const { contexts, isLoading: loadingContexts } = usePracticeContexts()
  const contextOptions = contexts.map(context => ({
    value: context._id,
    label: isVi ? (context.name_vi || context.name || context.code) : (context.name || context.name_vi || context.code),
    pId: context.parent_id
  }))
  const contextSelectOptions = useMemo(() => {
    const l0 = contexts.filter(c => c.level === 0 || !c.parent_id)
    if (l0.length > 0) {
      return l0.map(parent => {
        const parentName = isVi ? (parent.name_vi || parent.name || parent.code) : (parent.name || parent.name_vi || parent.code)
        const children = contexts.filter(c => c.parent_id === parent._id)
        if (children.length === 0) {
          return {
            value: parent._id,
            label: parentName,
          }
        }
        return {
          label: parentName,
          options: [
            { value: parent._id, label: `${parentName} (${isVi ? 'Tất cả' : 'All'})` },
            ...children.map(child => ({
              value: child._id,
              label: isVi ? (child.name_vi || child.name || child.code) : (child.name || child.name_vi || child.code),
            }))
          ]
        }
      })
    }
    return contexts.map(c => ({
      value: c._id,
      label: isVi ? (c.name_vi || c.name || c.code) : (c.name || c.name_vi || c.code),
    }))
  }, [contexts, isVi])
  const [editor, setEditor] = useState<{ id: string | null; readOnly: boolean } | null>(null)
  const [working, setWorking] = useState<string | null>(null)
  const trash = state.query.trash === 'true'

  const totalPages = result.data?.pagination?.totalPages
  const currentPage = state.query.page
  const { change } = state

  useEffect(() => {
    if (!result.isPlaceholderData && totalPages !== undefined && currentPage > Math.max(1, totalPages)) {
      change({ page: String(Math.max(1, totalPages)) })
    }
  }, [result.isPlaceholderData, totalPages, currentPage, change])

  const status = async (row: SpeakingRecord, published: boolean) => {
    setWorking(row._id)
    try {
      const detail = await speakingAdminService.detail(row._id)
      await mutations.save.mutateAsync({ id: row._id, payload: { ...speakingPayload(type, detail), status: published ? 'PUBLISHED' : 'DRAFT' } })
      toast.success(isVi ? 'Đã cập nhật trạng thái Speaking' : 'Speaking exercise status updated')
    } catch (cause) {
      toast.error(ipaError(cause))
    } finally {
      setWorking(null)
    }
  }

  const removeOrRestore = async (row: SpeakingRecord) => {
    setWorking(row._id)
    try {
      await (trash ? mutations.restore : mutations.remove).mutateAsync({ id: row._id, revision: row.revision })
      toast.success(trash ? (isVi ? 'Đã khôi phục về nháp' : 'Restored to draft') : (isVi ? 'Đã chuyển vào thùng rác' : 'Moved to trash'))
    } catch (cause) {
      toast.error(ipaError(cause))
    } finally {
      setWorking(null)
    }
  }

  const columns: IpaColumn<SpeakingRecord>[] = [
    { key: 'title', label: isVi ? 'Tiêu đề' : 'Title', width: 160, filterKind: 'text', render: (_, row) => <Button type="link" style={{ padding: 0, textAlign: 'left', whiteSpace: 'normal', height: 'auto', lineHeight: '1.3' }} onClick={() => setEditor({ id: row._id, readOnly: true })}><span className="font-semibold text-xs text-indigo-600 dark:text-indigo-400 hover:underline">{row.title}</span></Button> },
    { key: 'title_vi', label: isVi ? 'Tiêu đề tiếng Việt' : 'Vietnamese Title', width: 160, filterKind: 'text', initiallyHidden: true },
    { key: 'context_id', label: isVi ? 'Chủ đề' : 'Context', width: 120, filterKind: 'tree', filterOptions: contextSelectOptions, render: value => contextOptions.find(context => context.value === value)?.label || (isVi ? 'Chưa gán' : 'None') },
    { key: 'prompt_media_id', label: isVi ? 'Ảnh đề' : 'Prompt Image', width: 75, align: 'center', filterKind: 'media', initiallyHidden: type !== 'DESCRIBE_PICTURE', render: value => value ? <SpeakingMediaPreview value={value} kind="image" width={52} height={38} /> : (isVi ? 'Chưa có' : 'None') },
    { key: 'reference_media_id', label: isVi ? 'Audio mẫu' : 'Sample Audio', width: 120, filterKind: 'media', render: value => value ? <SpeakingMediaPreview value={value} kind="audio" /> : (isVi ? 'Chưa có' : 'None') },
    { key: 'preparation_time_seconds', label: isVi ? 'Chuẩn bị (s)' : 'Prep (s)', width: 80, filterKind: 'number' },
    { key: 'response_time_seconds', label: isVi ? 'Trả lời (s)' : 'Response (s)', width: 80, filterKind: 'number' },
    { key: 'estimated_minutes', label: isVi ? 'Ước tính (phút)' : 'Est. (min)', width: 100, filterKind: 'number', initiallyHidden: true },
    { key: 'cefr_level', label: 'CEFR', width: 55, filterKind: 'enum', filterOptions: levels },
    { key: 'difficulty_level', label: isVi ? 'Độ khó' : 'Difficulty', width: 65, filterKind: 'enum', filterOptions: difficulties, render: value => difficulties.find(item => item.value === value)?.label || value },
    { key: 'status', label: isVi ? 'Trạng thái' : 'Status', width: 100, align: 'center', filterKind: 'enum', filterOptions: statuses, render: (_, row) => trash ? <Tag>{isVi ? 'Đã xóa' : 'Deleted'}</Tag> : <TableStatusSwitch checked={row.status === 'PUBLISHED'} disabled={Boolean(working)} loading={working === row._id} checkedChildren="Bật" unCheckedChildren="Ẩn" ariaLabel={`Xuất bản ${row.title}`} onChange={value => { void status(row, value) }} /> },
    { key: 'created_at', label: isVi ? 'Ngày tạo' : 'Created At', width: 105, filterKind: 'date', initiallyHidden: true, render: value => value ? <div className="font-mono text-xs leading-tight text-slate-600 dark:text-slate-400"><div className="whitespace-nowrap font-medium">{dayjs(value).format('DD/MM/YYYY')}</div><div className="text-[10px] text-slate-400 dark:text-slate-500 whitespace-nowrap">{dayjs(value).format('HH:mm')}</div></div> : '—' },
    { key: 'updated_at', label: isVi ? 'Cập nhật' : 'Updated At', width: 105, filterKind: 'date', render: value => value ? <div className="font-mono text-xs leading-tight text-slate-600 dark:text-slate-400"><div className="whitespace-nowrap font-medium">{dayjs(value).format('DD/MM/YYYY')}</div><div className="text-[10px] text-slate-400 dark:text-slate-500 whitespace-nowrap">{dayjs(value).format('HH:mm')}</div></div> : '—' },
    { key: 'actions', label: isVi ? 'Thao tác' : 'Actions', width: 85, render: (_, row) => <IpaRowActions onView={() => setEditor({ id: row._id, readOnly: true })} onEdit={!trash ? () => setEditor({ id: row._id, readOnly: false }) : undefined} onDeleteOrRestore={() => removeOrRestore(row)} trash={trash} loading={working === row._id} disabled={Boolean(working)} isVi={isVi} /> },
  ]

  return <>
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <Segmented value={String(trash)} options={[{ value: 'false', label: isVi ? 'Bài nói' : 'Exercises' }, { value: 'true', label: isVi ? 'Thùng rác' : 'Trash' }]} onChange={value => state.change({ trash: value, page: '1' })} />
      <Space>
        <Button icon={<RotateCcw size={14} />} loading={result.isFetching} onClick={() => result.refetch()}>{isVi ? 'Làm mới' : 'Refresh'}</Button>
        {!trash && <Button type="primary" icon={<Plus size={15} />} onClick={() => setEditor({ id: null, readOnly: false })}>{isVi ? 'Thêm bài nói' : 'Add Exercise'}</Button>}
      </Space>
    </div>
    <DataTable columns={columns} items={result.data?.items || []} total={result.data?.pagination.total || 0} loading={result.isFetching} error={result.error} retry={result.refetch} state={state} searchLabel={isVi ? 'Tìm kiếm bài nói' : 'Search speaking exercises'} searchPlaceholder={isVi ? 'Tìm tiêu đề, đề bài, văn bản, bối cảnh...' : 'Search title, prompt, text, context...'} extraFilters={<>
      <CustomSelect aria-label={isVi ? 'Lọc chủ đề' : 'Filter context'} mode="multiple" placeholder={isVi ? 'Chủ đề' : 'Context'} allowClear className="w-48" options={contextSelectOptions} loading={loadingContexts} value={state.filters.context_id || []} onChange={values => state.setFilter('context_id', values)} />
      <CustomSelect aria-label="Lọc CEFR" mode="multiple" placeholder="CEFR" allowClear className="w-28" options={levels} value={state.filters.cefr_level || []} onChange={values => state.setFilter('cefr_level', values)} />
      <CustomSelect aria-label={isVi ? 'Lọc độ khó' : 'Filter difficulty'} mode="multiple" placeholder={isVi ? 'Độ khó' : 'Difficulty'} allowClear className="w-32" options={difficulties} value={state.filters.difficulty_level || []} onChange={values => state.setFilter('difficulty_level', values)} />
      <CustomSelect aria-label={isVi ? 'Lọc trạng thái' : 'Filter status'} mode="multiple" placeholder={isVi ? 'Trạng thái' : 'Status'} allowClear className="w-40" options={statuses} value={state.filters.status || []} onChange={values => state.setFilter('status', values)} />
    </>} />
    {editor && <SpeakingAdminEditor key={editor.id || 'new'} type={type} {...editor} trash={trash} onClose={() => setEditor(null)} />}
  </>
}

export function PracticeSpeakingPage() {
  const [params] = useSearchParams()
  const state = useIpaTableState()
  const { theme } = useAdminLayout()
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'

  const type = speakingTypes.includes(params.get('tab') as SpeakingType) ? params.get('tab') as SpeakingType : 'READ_ALOUD'
  return <ConfigProvider theme={{ algorithm: theme === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm, token: { colorPrimary: '#4f46e5', borderRadius: 10 } }}>
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{isVi ? 'Quản lý Luyện nói' : 'Speaking Management'}</h1>
        <p className="mt-1 text-sm text-slate-500">{isVi ? 'Quản lý năm dạng bài và nghe thử audio TTS của AI trước khi xuất bản.' : 'Manage speaking exercise types and preview AI TTS audio before publishing.'}</p>
      </div>
      <AdminTabs
        activeKey={type}
        onChange={tab => state.change({ tab, page: '1', sort: undefined, order: undefined, filters: JSON.stringify(Object.fromEntries(Object.entries(state.filters).filter(([key]) => ['context_id', 'cefr_level', 'difficulty_level', 'status'].includes(key)))) })}
        items={speakingTypes.map(value => ({
          key: value,
          label: isVi ? speakingLabels[value] : speakingEnLabels[value],
          children: value === type ? <SpeakingTable key={value} type={value} /> : null,
        }))}
      />
    </div>
  </ConfigProvider>
}

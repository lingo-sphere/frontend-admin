import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button, ConfigProvider, Popconfirm, Segmented, Select, Space, Switch, Tabs, Tag, TreeSelect, theme as antdTheme } from 'antd'
import { Plus, RotateCcw } from 'lucide-react'
import dayjs from 'dayjs'
import { useAdminLayout } from '@/contexts/admin.layout.context'
import { toast } from '@/store/toast.store'
import { IpaDataTable, type IpaColumn } from '../components/ipa.data.table'
import { SpeakingMediaPreview } from '../components/speaking.media.field'
import { SpeakingAdminEditor } from '../components/speaking.admin.editor'
import { useIpaTableState } from '../hooks/use.ipa.table-state'
import { useSpeakingAdmin, useSpeakingMutations } from '../hooks/use.speaking.admin'
import { usePracticeContexts } from '../hooks/use.practice.contexts'
import { speakingAdminService } from '../services/speaking-admin.service'
import { speakingPayload } from '../helpers/speaking-admin.helper'
import { ipaError } from '../helpers/ipa-admin.helper'
import { ipaLevels } from '../types/ipa-admin.types'
import { speakingLabels, speakingTypes, type SpeakingRecord, type SpeakingType } from '../types/speaking-admin.types'

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
  const result = useSpeakingAdmin({ ...state.query, filters: JSON.stringify({ ...state.filters, exercise_type: [type] }) })
  const mutations = useSpeakingMutations()
  const { contexts } = usePracticeContexts()
  const contextOptions = contexts.map(context => ({
    value: context._id,
    label: isVi ? (context.name_vi || context.name || context.code) : (context.name || context.name_vi || context.code),
    pId: context.parent_id
  }))
  const [editor, setEditor] = useState<{ id: string | null; readOnly: boolean } | null>(null)
  const [working, setWorking] = useState<string | null>(null)
  const trash = state.query.trash === 'true'

  useEffect(() => {
    if (!result.isPlaceholderData && result.data && state.query.page > Math.max(1, result.data.pagination.totalPages)) {
      state.change({ page: String(Math.max(1, result.data.pagination.totalPages)) })
    }
  }, [result.data, result.isPlaceholderData, state])

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
    { key: 'title', label: isVi ? 'Tiêu đề' : 'Title', fixed: 'left', width: 240, filterKind: 'text', render: (_, row) => <Button type="link" style={{ padding: 0, maxWidth: 220, whiteSpace: 'normal', textAlign: 'left' }} onClick={() => setEditor({ id: row._id, readOnly: true })}>{row.title}</Button> },
    { key: 'title_vi', label: isVi ? 'Tiêu đề tiếng Việt' : 'Vietnamese Title', width: 220, filterKind: 'text', initiallyHidden: true },
    { key: 'context_id', label: isVi ? 'Chủ đề' : 'Context', width: 180, filterKind: 'tree', filterOptions: contextOptions, render: value => contextOptions.find(context => context.value === value)?.label || (isVi ? 'Chưa gán' : 'None') },
    { key: 'prompt_media_id', label: isVi ? 'Ảnh đề' : 'Prompt Image', width: 180, filterKind: 'media', initiallyHidden: type !== 'DESCRIBE_PICTURE', render: value => value ? <SpeakingMediaPreview value={value} kind="image" /> : (isVi ? 'Chưa có' : 'None') },
    { key: 'reference_media_id', label: isVi ? 'Audio mẫu' : 'Sample Audio', width: 210, filterKind: 'media', render: value => value ? <SpeakingMediaPreview value={value} kind="audio" /> : (isVi ? 'Chưa có' : 'None') },
    { key: 'preparation_time_seconds', label: isVi ? 'Chuẩn bị mặc định (s)' : 'Prep Time (s)', width: 175, filterKind: 'number' },
    { key: 'response_time_seconds', label: isVi ? 'Trả lời mặc định (s)' : 'Response Time (s)', width: 175, filterKind: 'number' },
    { key: 'estimated_minutes', label: isVi ? 'Ước tính (phút)' : 'Est. (min)', width: 145, filterKind: 'number', initiallyHidden: true },
    { key: 'cefr_level', label: 'CEFR', width: 100, filterKind: 'enum', filterOptions: levels },
    { key: 'difficulty_level', label: isVi ? 'Độ khó' : 'Difficulty', width: 110, filterKind: 'enum', filterOptions: difficulties, render: value => difficulties.find(item => item.value === value)?.label || value },
    { key: 'status', label: isVi ? 'Trạng thái' : 'Status', width: 160, filterKind: 'enum', filterOptions: statuses, render: (_, row) => trash ? <Tag>{isVi ? 'Đã xóa' : 'Deleted'}</Tag> : <Space orientation="vertical" size={0}><Switch aria-label={`Xuất bản ${row.title}`} checked={row.status === 'PUBLISHED'} disabled={Boolean(working)} loading={working === row._id} onChange={value => { void status(row, value) }} /><span>{statuses.find(item => item.value === row.status)?.label}</span></Space> },
    { key: 'created_at', label: isVi ? 'Ngày tạo' : 'Created At', width: 170, filterKind: 'date', initiallyHidden: true, render: value => value ? dayjs(value).format('DD/MM/YYYY HH:mm') : '—' },
    { key: 'updated_at', label: isVi ? 'Cập nhật' : 'Updated At', width: 170, filterKind: 'date', render: value => value ? dayjs(value).format('DD/MM/YYYY HH:mm') : '—' },
    { key: 'actions', label: isVi ? 'Thao tác' : 'Actions', fixed: 'right', width: 220, render: (_, row) => <Space><Button size="small" onClick={() => setEditor({ id: row._id, readOnly: true })}>{isVi ? 'Xem' : 'View'}</Button>{!trash && <Button size="small" type="primary" onClick={() => setEditor({ id: row._id, readOnly: false })}>{isVi ? 'Sửa' : 'Edit'}</Button>}<Popconfirm title={trash ? (isVi ? 'Khôi phục bài về nháp?' : 'Restore exercise to draft?') : (isVi ? 'Chuyển bài vào thùng rác?' : 'Move exercise to trash?')} description={isVi ? 'Giữ lại lịch sử làm bài và media.' : 'Preserves attempt history and media.'} okText={trash ? (isVi ? 'Khôi phục' : 'Restore') : (isVi ? 'Xóa' : 'Delete')} cancelText={isVi ? 'Hủy' : 'Cancel'} onConfirm={() => removeOrRestore(row)}><Button size="small" danger={!trash} disabled={Boolean(working)} loading={working === row._id}>{trash ? (isVi ? 'Khôi phục' : 'Restore') : (isVi ? 'Xóa' : 'Delete')}</Button></Popconfirm></Space> },
  ]

  return <>
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <Segmented value={String(trash)} options={[{ value: 'false', label: isVi ? 'Bài nói' : 'Exercises' }, { value: 'true', label: isVi ? 'Thùng rác' : 'Trash' }]} onChange={value => state.change({ trash: value, page: '1' })} />
      <Space>
        <Button icon={<RotateCcw size={14} />} loading={result.isFetching} onClick={() => result.refetch()}>{isVi ? 'Làm mới' : 'Refresh'}</Button>
        {!trash && <Button type="primary" icon={<Plus size={15} />} onClick={() => setEditor({ id: null, readOnly: false })}>{isVi ? 'Thêm bài nói' : 'Add Exercise'}</Button>}
      </Space>
    </div>
    <IpaDataTable columns={columns} items={result.data?.items || []} total={result.data?.pagination.total || 0} loading={result.isFetching} error={result.error} retry={result.refetch} state={state} searchLabel={isVi ? 'Tìm kiếm bài nói' : 'Search speaking exercises'} searchPlaceholder={isVi ? 'Tìm tiêu đề, đề bài, văn bản, bối cảnh...' : 'Search title, prompt, text, context...'} extraFilters={<>
      <TreeSelect aria-label={isVi ? 'Lọc chủ đề' : 'Filter context'} multiple treeDataSimpleMode showSearch treeNodeFilterProp="title" placeholder={isVi ? 'Chủ đề' : 'Context'} allowClear style={{ minWidth: 190 }} treeData={contextOptions.map(item => ({ ...item, id: item.value, title: item.label }))} value={state.filters.context_id || []} onChange={values => state.setFilter('context_id', values)} />
      <Select aria-label="Lọc CEFR" mode="multiple" placeholder="CEFR" allowClear style={{ minWidth: 110 }} options={levels} value={state.filters.cefr_level || []} onChange={values => state.setFilter('cefr_level', values)} />
      <Select aria-label={isVi ? 'Lọc độ khó' : 'Filter difficulty'} mode="multiple" placeholder={isVi ? 'Độ khó' : 'Difficulty'} allowClear style={{ minWidth: 130 }} options={difficulties} value={state.filters.difficulty_level || []} onChange={values => state.setFilter('difficulty_level', values)} />
      <Select aria-label={isVi ? 'Lọc trạng thái' : 'Filter status'} mode="multiple" placeholder={isVi ? 'Trạng thái' : 'Status'} allowClear style={{ minWidth: 170 }} options={statuses} value={state.filters.status || []} onChange={values => state.setFilter('status', values)} />
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
      <Tabs activeKey={type} destroyOnHidden onChange={tab => state.change({ tab, page: '1', sort: undefined, order: undefined, filters: JSON.stringify(Object.fromEntries(Object.entries(state.filters).filter(([key]) => ['context_id', 'cefr_level', 'difficulty_level', 'status'].includes(key)))) })} items={speakingTypes.map(value => ({ key: value, label: isVi ? speakingLabels[value] : speakingEnLabels[value], children: <SpeakingTable key={value} type={value} /> }))} />
    </div>
  </ConfigProvider>
}

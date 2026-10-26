import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button, ConfigProvider, Image, Popconfirm, Segmented, Select, Space, Switch, Tabs, Tag, TreeSelect, theme as antdTheme } from 'antd'
import { Plus, RotateCcw } from 'lucide-react'
import dayjs from 'dayjs'
import { useAdminLayout } from '@/contexts/admin.layout.context'
import { resolveMediaUrl } from '@/lib/media.utils'
import { toast } from '@/store/toast.store'
import { IpaDataTable, type IpaColumn } from '../components/ipa.data.table'
import { IpaAudioPreview } from '../components/ipa.audio.field'
import { ListeningAdminEditor } from '../components/listening.admin.editor'
import { useIpaTableState } from '../hooks/use.ipa.table-state'
import { useListeningAdmin, useListeningMutations } from '../hooks/use.listening.admin'
import { usePracticeContexts } from '../hooks/use.practice.contexts'
import { listeningAdminService } from '../services/listening-admin.service'
import { listeningPayload } from '../helpers/listening-admin.helper'
import { ipaError } from '../helpers/ipa-admin.helper'
import { ipaLevels } from '../types/ipa-admin.types'
import { listeningLabels, listeningSubtypes, listeningTypes, type ListeningRecord, type ListeningType } from '../types/listening-admin.types'

const listeningEnLabels: Record<ListeningType, string> = {
  part1: 'Part 1 · Photographs',
  part2: 'Part 2 · Question & Response',
  part3: 'Part 3 · Conversations',
  part4: 'Part 4 · Short Talks',
  dictation: 'Dictation'
}

const subtypeEnLabels: Record<string, string> = {
  picture_type: 'Picture Type',
  question_type: 'Question Type',
  conversation_type: 'Conversation Type',
  talk_type: 'Talk Type'
}

function ListeningTable({ type }: { type: ListeningType }) {
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
  const result = useListeningAdmin(type, state.query)
  const mutations = useListeningMutations(type)
  const { contexts } = usePracticeContexts()
  const contextOptions = contexts.map(context => ({
    value: context._id,
    label: isVi ? (context.name_vi || context.name || context.code) : (context.name || context.name_vi || context.code),
    pId: context.parent_id
  }))
  const [editor, setEditor] = useState<{ id: string | null; readOnly: boolean } | null>(null)
  const [working, setWorking] = useState<string | null>(null)
  const trash = state.query.trash === 'true'
  const subtype = listeningSubtypes[type]

  useEffect(() => {
    if (!result.isPlaceholderData && result.data && state.query.page > Math.max(1, result.data.pagination.totalPages)) {
      state.change({ page: String(Math.max(1, result.data.pagination.totalPages)) })
    }
  }, [result.data, result.isPlaceholderData, state])

  const changeStatus = async (row: ListeningRecord, published: boolean) => {
    setWorking(row._id)
    try {
      const detail = await listeningAdminService.detail(type, row._id)
      await mutations.save.mutateAsync({ id: row._id, payload: { ...listeningPayload(type, detail), status: published ? 'PUBLISHED' : 'DRAFT' } })
      toast.success(isVi ? 'Đã cập nhật trạng thái bài nghe' : 'Listening exercise status updated')
    } catch (error) {
      toast.error(ipaError(error))
    } finally {
      setWorking(null)
    }
  }

  const removeOrRestore = async (row: ListeningRecord) => {
    setWorking(row._id)
    try {
      await (trash ? mutations.restore : mutations.remove).mutateAsync({ id: row._id, revision: row.revision })
      toast.success(trash ? (isVi ? 'Đã khôi phục về nháp' : 'Restored to draft') : (isVi ? 'Đã chuyển vào thùng rác' : 'Moved to trash'))
    } catch (error) {
      toast.error(ipaError(error))
    } finally {
      setWorking(null)
    }
  }

  const columns: IpaColumn<ListeningRecord>[] = [
    { key: 'title', label: isVi ? 'Tiêu đề' : 'Title', fixed: 'left', width: 240, filterKind: 'text', render: (_, row) => <Button type="link" style={{ padding: 0, maxWidth: 220, whiteSpace: 'normal', textAlign: 'left' }} onClick={() => setEditor({ id: row._id, readOnly: true })}>{row.title}</Button> },
    { key: 'title_vi', label: isVi ? 'Tiêu đề tiếng Việt' : 'Vietnamese Title', width: 220, filterKind: 'text', initiallyHidden: true },
    { key: 'context_id', label: isVi ? 'Chủ đề' : 'Context', width: 180, filterKind: 'tree', filterOptions: contextOptions, render: value => contextOptions.find(context => context.value === value)?.label || (isVi ? 'Chưa gán' : 'None') },
    ...(subtype.field ? [{ key: subtype.field, label: isVi ? subtype.label : (subtypeEnLabels[subtype.field] || subtype.label), width: 170, filterKind: 'enum' as const, filterOptions: subtype.values.map(value => ({ value, label: value })) }] : []),
    { key: 'audio_url', label: 'Audio', width: 210, filterKind: 'media', render: value => value ? <IpaAudioPreview value={value} /> : (isVi ? 'Chưa có' : 'None') },
    ...(type !== 'dictation' && type !== 'part2' ? [{ key: 'image_url', label: isVi ? 'Ảnh' : 'Image', width: 110, filterKind: 'media' as const, render: (value: string) => value ? <Image width={70} height={50} style={{ objectFit: 'contain' }} src={resolveMediaUrl(value)} /> : (isVi ? 'Chưa có' : 'None') }] : []),
    { key: type === 'part2' ? 'audio_duration_seconds' : 'duration_seconds', label: isVi ? 'Thời lượng (giây)' : 'Duration (s)', width: 150, filterKind: 'number' },
    ...(type === 'dictation' ? [{ key: 'total_segments', label: isVi ? 'Số đoạn' : 'Segments', width: 100, filterKind: 'number' as const }, { key: 'total_words', label: isVi ? 'Số từ' : 'Words', width: 100, filterKind: 'number' as const }, { key: 'total_blanks', label: isVi ? 'Số ô trống' : 'Blanks', width: 120, filterKind: 'number' as const }] : []),
    { key: 'transcript', label: 'Transcript', width: 250, filterKind: 'text', ellipsis: true, initiallyHidden: true },
    { key: 'cefr_level', label: 'CEFR', width: 100, filterKind: 'enum', filterOptions: levels },
    { key: 'difficulty_level', label: isVi ? 'Độ khó' : 'Difficulty', width: 110, filterKind: 'enum', filterOptions: difficulties, render: value => difficulties.find(option => option.value === value)?.label || value },
    { key: 'status', label: isVi ? 'Trạng thái' : 'Status', width: 165, filterKind: 'enum', filterOptions: statuses, render: (_, row) => trash ? <Tag>{isVi ? 'Đã xóa' : 'Deleted'}</Tag> : <Space orientation="vertical" size={0}><Switch aria-label={`Xuất bản ${row.title}`} checked={row.status === 'PUBLISHED'} disabled={Boolean(working)} loading={working === row._id} onChange={value => { void changeStatus(row, value) }} /><span>{statuses.find(option => option.value === row.status)?.label}</span></Space> },
    { key: 'created_at', label: isVi ? 'Ngày tạo' : 'Created At', width: 170, filterKind: 'date', initiallyHidden: true, render: value => value ? dayjs(value).format('DD/MM/YYYY HH:mm') : '—' },
    { key: 'updated_at', label: isVi ? 'Cập nhật' : 'Updated At', width: 170, filterKind: 'date', render: value => value ? dayjs(value).format('DD/MM/YYYY HH:mm') : '—' },
    { key: 'actions', label: isVi ? 'Thao tác' : 'Actions', width: 220, fixed: 'right', render: (_, row) => <Space><Button size="small" onClick={() => setEditor({ id: row._id, readOnly: true })}>{isVi ? 'Xem' : 'View'}</Button>{!trash && <Button size="small" type="primary" onClick={() => setEditor({ id: row._id, readOnly: false })}>{isVi ? 'Sửa' : 'Edit'}</Button>}<Popconfirm title={trash ? (isVi ? 'Khôi phục bài về nháp?' : 'Restore exercise to draft?') : (isVi ? 'Chuyển bài vào thùng rác?' : 'Move exercise to trash?')} description={isVi ? 'Giữ lại lịch sử làm bài và file media.' : 'Preserves attempt history and media files.'} okText={trash ? (isVi ? 'Khôi phục' : 'Restore') : (isVi ? 'Xóa' : 'Delete')} cancelText={isVi ? 'Hủy' : 'Cancel'} onConfirm={() => removeOrRestore(row)}><Button size="small" danger={!trash} loading={working === row._id} disabled={Boolean(working)}>{trash ? (isVi ? 'Khôi phục' : 'Restore') : (isVi ? 'Xóa' : 'Delete')}</Button></Popconfirm></Space> },
  ]

  return <>
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <Segmented value={String(trash)} options={[{ value: 'false', label: isVi ? 'Bài nghe' : 'Exercises' }, { value: 'true', label: isVi ? 'Thùng rác' : 'Trash' }]} onChange={value => state.change({ trash: value, page: '1' })} />
      <Space>
        <Button icon={<RotateCcw size={14} />} loading={result.isFetching} onClick={() => result.refetch()}>{isVi ? 'Làm mới' : 'Refresh'}</Button>
        {!trash && <Button type="primary" icon={<Plus size={15} />} onClick={() => setEditor({ id: null, readOnly: false })}>{isVi ? 'Thêm bài nghe' : 'Add Exercise'}</Button>}
      </Space>
    </div>
    <IpaDataTable columns={columns} items={result.data?.items || []} total={result.data?.pagination.total || 0} loading={result.isFetching} error={result.error} retry={result.refetch} state={state} searchLabel={isVi ? 'Tìm kiếm bài nghe' : 'Search listening exercises'} searchPlaceholder={isVi ? 'Tìm tiêu đề, transcript, mô tả...' : 'Search title, transcript, description...'} extraFilters={<>
      <TreeSelect aria-label={isVi ? 'Lọc chủ đề' : 'Filter context'} multiple treeDataSimpleMode showSearch treeNodeFilterProp="title" placeholder={isVi ? 'Chủ đề' : 'Context'} allowClear style={{ minWidth: 190 }} treeData={contextOptions.map(context => ({ ...context, id: context.value, title: context.label }))} value={state.filters.context_id || []} onChange={values => state.setFilter('context_id', values)} />
      <Select aria-label="Lọc CEFR" mode="multiple" placeholder="CEFR" allowClear style={{ minWidth: 110 }} options={levels} value={state.filters.cefr_level || []} onChange={values => state.setFilter('cefr_level', values)} />
      <Select aria-label={isVi ? 'Lọc độ khó' : 'Filter difficulty'} mode="multiple" placeholder={isVi ? 'Độ khó' : 'Difficulty'} allowClear style={{ minWidth: 130 }} options={difficulties} value={state.filters.difficulty_level || []} onChange={values => state.setFilter('difficulty_level', values)} />
      <Select aria-label={isVi ? 'Lọc trạng thái' : 'Filter status'} mode="multiple" placeholder={isVi ? 'Trạng thái' : 'Status'} allowClear style={{ minWidth: 170 }} options={statuses} value={state.filters.status || []} onChange={values => state.setFilter('status', values)} />
    </>} />
    {editor && <ListeningAdminEditor key={editor.id || 'new'} type={type} {...editor} trash={trash} onClose={() => setEditor(null)} />}
  </>
}

export function PracticeListeningPage() {
  const [params] = useSearchParams()
  const state = useIpaTableState()
  const { theme } = useAdminLayout()
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'

  const type = listeningTypes.includes(params.get('tab') as ListeningType) ? params.get('tab') as ListeningType : 'part1'
  const switchTab = (tab: string) => {
    const common = Object.fromEntries(Object.entries(state.filters).filter(([key]) => ['context_id', 'cefr_level', 'difficulty_level', 'status'].includes(key)))
    state.change({ tab, filters: JSON.stringify(common), page: '1', sort: undefined, order: undefined })
  }

  return <ConfigProvider theme={{ algorithm: theme === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm, token: { colorPrimary: '#4f46e5', borderRadius: 10 } }}>
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{isVi ? 'Quản lý Luyện nghe' : 'Listening Management'}</h1>
        <p className="mt-1 text-sm text-slate-500">{isVi ? 'Một kho bài cho mỗi Part. Lọc Chủ đề để tìm nội dung theo ngữ cảnh.' : 'Manage exercises per TOEIC Part. Filter by Context to find content.'}</p>
      </div>
      <Tabs activeKey={type} onChange={switchTab} destroyOnHidden items={listeningTypes.map(value => ({ key: value, label: isVi ? listeningLabels[value] : listeningEnLabels[value], children: <ListeningTable key={value} type={value} /> }))} />
    </div>
  </ConfigProvider>
}

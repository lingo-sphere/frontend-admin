// Trang quản lý bài luyện nghe (Listening) dành cho quản trị viên.

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button, ConfigProvider, Image, Segmented, Space, Tabs, Tag, theme as antdTheme } from 'antd'
import { CustomSwitch } from '@/components/custom.switch'
import { Plus, RotateCcw } from 'lucide-react'
import dayjs from 'dayjs'
import { useAdminLayout } from '@/contexts/admin.layout.context'
import { resolveMediaUrl } from '@/lib/media.utils'
import { toast } from '@/store/toast.store'
import { CustomSelect } from '@/components/custom.select'
import { DataTable, type IpaColumn } from '@/components/data.table'
import { IpaAudioPreview } from '@/features/practice/components/ipa.audio.field'
import { IpaRowActions } from '@/features/practice/components/ipa.row.actions'
import { ListeningAdminEditor } from '@/features/practice/components/listening.admin.editor'
import { useIpaTableState } from '@/features/practice/hooks/use.ipa.table-state'
import { useListeningAdmin, useListeningMutations } from '@/features/practice/hooks/use.listening.admin'
import { usePracticeContexts } from '@/features/practice/hooks/use.practice.contexts'
import { listeningAdminService } from '@/features/practice/services/listening-admin.service'
import { listeningPayload } from '@/features/practice/helpers/listening-admin.helper'
import { ipaError } from '@/features/practice/helpers/ipa-admin.helper'
import { ipaLevels } from '@/features/practice/types/ipa-admin.types'
import { listeningLabels, listeningSubtypes, listeningTypes, type ListeningRecord, type ListeningType } from '@/features/practice/types/listening-admin.types'

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
  const subtype = listeningSubtypes[type]

  const totalPages = result.data?.pagination?.totalPages
  const currentPage = state.query.page
  const { change } = state

  useEffect(() => {
    if (!result.isPlaceholderData && totalPages !== undefined && currentPage > Math.max(1, totalPages)) {
      change({ page: String(Math.max(1, totalPages)) })
    }
  }, [result.isPlaceholderData, totalPages, currentPage, change])

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
    { key: 'title', label: isVi ? 'Tiêu đề' : 'Title', width: 140, filterKind: 'text', render: (_, row) => <Button type="link" style={{ padding: 0, textAlign: 'left', whiteSpace: 'normal', height: 'auto', lineHeight: '1.3' }} onClick={() => setEditor({ id: row._id, readOnly: true })}><span className="font-semibold text-xs text-indigo-600 dark:text-indigo-400 hover:underline">{row.title}</span></Button> },
    { key: 'title_vi', label: isVi ? 'Tiêu đề tiếng Việt' : 'Vietnamese Title', width: 140, filterKind: 'text', initiallyHidden: true },
    { key: 'context_id', label: isVi ? 'Chủ đề' : 'Context', width: 110, filterKind: 'tree', filterOptions: contextSelectOptions, render: value => contextOptions.find(context => context.value === value)?.label || (isVi ? 'Chưa gán' : 'None') },
    ...(subtype.field ? [{ key: subtype.field, label: isVi ? subtype.label : (subtypeEnLabels[subtype.field] || subtype.label), width: 110, align: 'center' as const, filterKind: 'enum' as const, filterOptions: subtype.values.map(value => ({ value, label: value })) }] : []),
    { key: 'audio_url', label: 'Audio', width: 155, align: 'center', filterKind: 'media', render: (value, row) => value ? <IpaAudioPreview value={value} duration={row.duration_seconds ?? row.audio_duration_seconds} /> : (isVi ? 'Chưa có' : 'None') },
    ...(type !== 'dictation' && type !== 'part2' ? [{ key: 'image_url', label: isVi ? 'Ảnh' : 'Image', width: 70, align: 'center' as const, filterKind: 'media' as const, render: (value: string) => value ? <Image width={52} height={38} loading="lazy" style={{ objectFit: 'cover', borderRadius: 6 }} src={resolveMediaUrl(value)} /> : (isVi ? 'Chưa có' : 'None') }] : []),
    {
      key: type === 'part2' ? 'audio_duration_seconds' : 'duration_seconds',
      label: isVi ? 'Thời lượng' : 'Duration',
      width: 65,
      align: 'center',
      filterKind: 'number',
      render: (_, row) => {
        const raw = type === 'part2' ? row.audio_duration_seconds : row.duration_seconds
        const sec = typeof raw === 'number' && !isNaN(raw) ? raw : null
        if (sec !== null && sec > 0) {
          const mins = Math.floor(sec / 60)
          const remainder = Math.round(sec % 60)
          const formatted = mins > 0 ? `${mins}:${remainder.toString().padStart(2, '0')}` : `${remainder}s`
          return (
            <span className="inline-flex items-center gap-1 font-mono text-xs font-semibold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
              {formatted}
            </span>
          )
        }
        return <span className="text-slate-400">—</span>
      }
    },
    ...(type === 'dictation' ? [{ key: 'total_segments', label: isVi ? 'Số đoạn' : 'Segments', width: 65, align: 'center' as const, filterKind: 'number' as const }, { key: 'total_words', label: isVi ? 'Số từ' : 'Words', width: 65, align: 'center' as const, filterKind: 'number' as const }, { key: 'total_blanks', label: isVi ? 'Số ô trống' : 'Blanks', width: 65, align: 'center' as const, filterKind: 'number' as const }] : []),
    { key: 'transcript', label: 'Transcript', width: 200, filterKind: 'text', ellipsis: true, initiallyHidden: true },
    { key: 'cefr_level', label: 'CEFR', width: 55, align: 'center', filterKind: 'enum', filterOptions: levels },
    { key: 'difficulty_level', label: isVi ? 'Độ khó' : 'Difficulty', width: 65, align: 'center', filterKind: 'enum', filterOptions: difficulties, render: value => difficulties.find(option => option.value === value)?.label || value },
    { key: 'status', label: isVi ? 'Trạng thái' : 'Status', width: 90, align: 'center', filterKind: 'enum', filterOptions: statuses, render: (_, row) => trash ? <Tag>{isVi ? 'Đã xóa' : 'Deleted'}</Tag> : <div className="inline-flex flex-col items-center gap-0.5"><CustomSwitch size="sm" color="emerald" aria-label={`Xuất bản ${row.title}`} checked={row.status === 'PUBLISHED'} disabled={Boolean(working)} loading={working === row._id} onChange={value => { void changeStatus(row, value) }} /><span className="text-[10px] text-slate-500 whitespace-nowrap">{statuses.find(option => option.value === row.status)?.label}</span></div> },
    { key: 'created_at', label: isVi ? 'Ngày tạo' : 'Created At', width: 105, align: 'center', filterKind: 'date', initiallyHidden: true, render: value => value ? <div className="font-mono text-xs leading-tight text-center text-slate-600 dark:text-slate-400"><div className="whitespace-nowrap font-medium">{dayjs(value).format('DD/MM/YYYY')}</div><div className="text-[10px] text-slate-400 dark:text-slate-500 whitespace-nowrap">{dayjs(value).format('HH:mm')}</div></div> : '—' },
    { key: 'updated_at', label: isVi ? 'Cập nhật' : 'Updated At', width: 105, align: 'center', filterKind: 'date', render: value => value ? <div className="font-mono text-xs leading-tight text-center text-slate-600 dark:text-slate-400"><div className="whitespace-nowrap font-medium">{dayjs(value).format('DD/MM/YYYY')}</div><div className="text-[10px] text-slate-400 dark:text-slate-500 whitespace-nowrap">{dayjs(value).format('HH:mm')}</div></div> : '—' },
    { key: 'actions', label: isVi ? 'Thao tác' : 'Actions', width: 85, align: 'center', render: (_, row) => <IpaRowActions onView={() => setEditor({ id: row._id, readOnly: true })} onEdit={!trash ? () => setEditor({ id: row._id, readOnly: false }) : undefined} onDeleteOrRestore={() => removeOrRestore(row)} trash={trash} loading={working === row._id} disabled={Boolean(working)} isVi={isVi} /> },
  ]

  return <>
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <Segmented value={String(trash)} options={[{ value: 'false', label: isVi ? 'Bài nghe' : 'Exercises' }, { value: 'true', label: isVi ? 'Thùng rác' : 'Trash' }]} onChange={value => state.change({ trash: value, page: '1' })} />
      <Space>
        <Button icon={<RotateCcw size={14} />} loading={result.isFetching} onClick={() => result.refetch()}>{isVi ? 'Làm mới' : 'Refresh'}</Button>
        {!trash && <Button type="primary" icon={<Plus size={15} />} onClick={() => setEditor({ id: null, readOnly: false })}>{isVi ? 'Thêm bài nghe' : 'Add Exercise'}</Button>}
      </Space>
    </div>
    <DataTable columns={columns} items={result.data?.items || []} total={result.data?.pagination.total || 0} loading={result.isFetching} error={result.error} retry={result.refetch} state={state} searchLabel={isVi ? 'Tìm kiếm bài nghe' : 'Search listening exercises'} searchPlaceholder={isVi ? 'Tìm tiêu đề, transcript, mô tả...' : 'Search title, transcript, description...'} extraFilters={<>
      <CustomSelect aria-label={isVi ? 'Lọc chủ đề' : 'Filter context'} mode="multiple" placeholder={isVi ? 'Chủ đề' : 'Context'} allowClear className="w-48" options={contextSelectOptions} loading={loadingContexts} value={state.filters.context_id || []} onChange={values => state.setFilter('context_id', values)} />
      <CustomSelect aria-label="Lọc CEFR" mode="multiple" placeholder="CEFR" allowClear className="w-28" options={levels} value={state.filters.cefr_level || []} onChange={values => state.setFilter('cefr_level', values)} />
      <CustomSelect aria-label={isVi ? 'Lọc độ khó' : 'Filter difficulty'} mode="multiple" placeholder={isVi ? 'Độ khó' : 'Difficulty'} allowClear className="w-32" options={difficulties} value={state.filters.difficulty_level || []} onChange={values => state.setFilter('difficulty_level', values)} />
      <CustomSelect aria-label={isVi ? 'Lọc trạng thái' : 'Filter status'} mode="multiple" placeholder={isVi ? 'Trạng thái' : 'Status'} allowClear className="w-40" options={statuses} value={state.filters.status || []} onChange={values => state.setFilter('status', values)} />
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
      <Tabs activeKey={type} onChange={switchTab} destroyOnHidden items={listeningTypes.map(value => ({ key: value, label: isVi ? listeningLabels[value] : listeningEnLabels[value], children: value === type ? <ListeningTable key={value} type={value} /> : null }))} />
    </div>
  </ConfigProvider>
}

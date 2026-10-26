import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button, ConfigProvider, Popconfirm, Segmented, Select, Space, Switch, Tabs, Tag, theme as antdTheme } from 'antd'
import { Plus, RotateCcw } from 'lucide-react'
import dayjs from 'dayjs'
import { useAdminLayout } from '@/contexts/admin.layout.context'
import { toast } from '@/store/toast.store'
import { IpaDataTable, type IpaColumn } from '../components/ipa.data.table'
import { IpaAudioPreview } from '../components/ipa.audio.field'
import { IpaSymbolEditor } from '../components/ipa.symbol.editor'
import { IpaExerciseEditor } from '../components/ipa.exercise.editor'
import { useIpaTableState } from '../hooks/use.ipa.table-state'
import { useIpaExercises, useIpaMutations, useIpaSymbols } from '../hooks/use.ipa.admin'
import { usePracticeContexts } from '../hooks/use.practice.contexts'
import { ipaAdminService } from '../services/ipa-admin.service'
import { exercisePayload, ipaError, symbolPayload } from '../helpers/ipa-admin.helper'
import { ipaAudioFields, ipaLevels, ipaTypes, ipaTypeLabels, type IpaExerciseRecord, type IpaSymbolRecord } from '../types/ipa-admin.types'

const ipaEnTypes: Record<string, string> = {
  MINIMAL_PAIR_LISTEN: 'Minimal Pairs (Listen)',
  PHONEME_LISTEN: 'Phoneme Identification',
  WORD_TRANSCRIPTION: 'Transcription Listening'
}

const levels = ipaLevels.map(value => ({ value, label: value }))
const date = (value?: string) => value ? dayjs(value).format('DD/MM/YYYY HH:mm') : '—'

function SymbolsTable() {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'

  const types = [
    { value: 'VOWEL', label: isVi ? 'Nguyên âm' : 'Vowel' },
    { value: 'CONSONANT', label: isVi ? 'Phụ âm' : 'Consonant' },
    { value: 'DIPHTHONG', label: isVi ? 'Nguyên âm đôi' : 'Diphthong' }
  ]
  const symbolStatuses = [
    { value: 'ACTIVE', label: isVi ? 'Hoạt động' : 'Active' },
    { value: 'INACTIVE', label: isVi ? 'Tạm ẩn' : 'Inactive' }
  ]
  const audio = (key?: string) => key ? <IpaAudioPreview value={key} /> : <span className="text-slate-400">{isVi ? 'Chưa có' : 'None'}</span>

  const state = useIpaTableState()
  const result = useIpaSymbols(state.query)
  const [editor, setEditor] = useState<{ id: string; readOnly: boolean } | null>(null)
  const { updateSymbol } = useIpaMutations()
  const [working, setWorking] = useState<string | null>(null)

  useEffect(() => {
    if (!result.isPlaceholderData && result.data && state.query.page > Math.max(1, result.data.pagination.totalPages)) {
      state.change({ page: String(Math.max(1, result.data.pagination.totalPages)) })
    }
  }, [result.data, result.isPlaceholderData, state])

  const toggle = async (record: IpaSymbolRecord, active: boolean) => {
    setWorking(record.id)
    try {
      const detail = await ipaAdminService.symbol(record.id)
      await updateSymbol.mutateAsync({ id: record.id, payload: { ...symbolPayload(detail), status: active ? 'ACTIVE' : 'INACTIVE' } })
      toast.success(isVi ? 'Đã cập nhật trạng thái IPA' : 'IPA symbol status updated')
    } catch (error) {
      toast.error(ipaError(error))
    } finally {
      setWorking(null)
    }
  }

  const audioLabelsVi = ['Audio âm', 'Audio âm US', 'Audio âm UK', 'Audio ví dụ', 'Audio ví dụ US', 'Audio ví dụ UK']
  const audioLabelsEn = ['Phoneme Audio', 'Phoneme US Audio', 'Phoneme UK Audio', 'Example Audio', 'Example US Audio', 'Example UK Audio']

  const columns: IpaColumn<IpaSymbolRecord>[] = [
    { key: 'symbol', label: isVi ? 'Ký hiệu IPA' : 'IPA Symbol', fixed: 'left', width: 125, filterKind: 'text', render: value => <strong className="font-mono text-lg">/{value}/</strong> },
    { key: 'symbol_type', label: isVi ? 'Loại âm' : 'Type', width: 150, filterKind: 'enum', filterOptions: types, render: value => types.find(type => type.value === value)?.label || value },
    { key: 'description_vi', label: isVi ? 'Mô tả tiếng Việt' : 'Vietnamese Description', width: 250, ellipsis: true, filterKind: 'text', initiallyHidden: true },
    { key: 'description_en', label: isVi ? 'Mô tả tiếng Anh' : 'English Description', width: 250, ellipsis: true, filterKind: 'text', initiallyHidden: true },
    { key: 'example_word', label: isVi ? 'Từ ví dụ' : 'Example Word', width: 160, filterKind: 'text' },
    { key: 'example_word_ipa', label: isVi ? 'Phiên âm ví dụ' : 'Example IPA', width: 160, filterKind: 'text' },
    { key: 'related_symbols', label: isVi ? 'Âm liên quan' : 'Related Symbols', width: 160, filterKind: 'text', initiallyHidden: true, render: values => ((values || []) as string[]).map(value => `/${value}/`).join(', ') },
    { key: 'cefr_min_level', label: 'CEFR', width: 100, filterKind: 'enum', filterOptions: levels },
    ...ipaAudioFields.map((field, index): IpaColumn<IpaSymbolRecord> => ({ key: field, label: isVi ? audioLabelsVi[index] : audioLabelsEn[index], width: 210, filterKind: 'media', render: value => audio(value), initiallyHidden: index !== 0 })),
    { key: 'status', label: isVi ? 'Trạng thái' : 'Status', width: 140, filterKind: 'enum', filterOptions: symbolStatuses, render: (_, record) => <Switch checked={record.status === 'ACTIVE'} checkedChildren={isVi ? "Hoạt động" : "Active"} unCheckedChildren={isVi ? "Tạm ẩn" : "Inactive"} loading={working === record.id} disabled={Boolean(working)} onChange={active => { void toggle(record, active) }} /> },
    { key: 'created_at', label: isVi ? 'Ngày tạo' : 'Created At', width: 170, filterKind: 'date', render: date, initiallyHidden: true },
    { key: 'updated_at', label: isVi ? 'Cập nhật' : 'Updated At', width: 170, filterKind: 'date', render: date, initiallyHidden: true },
    { key: 'actions', label: isVi ? 'Thao tác' : 'Actions', fixed: 'right', width: 160, render: (_, record) => <Space><Button size="small" onClick={() => setEditor({ id: record.id, readOnly: true })}>{isVi ? 'Xem' : 'View'}</Button><Button size="small" type="primary" onClick={() => setEditor({ id: record.id, readOnly: false })}>{isVi ? 'Sửa' : 'Edit'}</Button></Space> },
  ]

  return <>
    <div className="mb-3 flex items-center justify-between">
      <p className="text-sm text-slate-500">{isVi ? 'Danh mục âm cố định · chỉ xem và chỉnh sửa' : 'Fixed phoneme inventory · view and edit only'}</p>
      <Button icon={<RotateCcw size={14} />} loading={result.isFetching} onClick={() => result.refetch()}>{isVi ? 'Làm mới' : 'Refresh'}</Button>
    </div>
    <IpaDataTable columns={columns} items={result.data?.items || []} total={result.data?.pagination.total || 0} loading={result.isFetching} error={result.error} retry={result.refetch} state={state} extraFilters={<>
      <Select mode="multiple" aria-label={isVi ? "Lọc loại âm" : "Filter type"} placeholder={isVi ? "Loại âm" : "Type"} style={{ minWidth: 170 }} allowClear options={types} value={state.filters.symbol_type || []} onChange={values => state.setFilter('symbol_type', values)} />
      <Select mode="multiple" aria-label="Lọc CEFR" placeholder="CEFR" style={{ minWidth: 110 }} allowClear options={levels} value={state.filters.cefr_min_level || []} onChange={values => state.setFilter('cefr_min_level', values)} />
      <Select mode="multiple" aria-label={isVi ? "Lọc trạng thái" : "Filter status"} placeholder={isVi ? "Trạng thái" : "Status"} style={{ minWidth: 170 }} allowClear options={symbolStatuses} value={state.filters.status || []} onChange={values => state.setFilter('status', values)} />
    </>} />
    {editor && <IpaSymbolEditor key={editor.id} {...editor} onClose={() => setEditor(null)} />}
  </>
}

function ExercisesTable() {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'

  const exerciseStatuses = [
    { value: 'DRAFT', label: isVi ? 'Nháp' : 'Draft' },
    { value: 'PUBLISHED', label: isVi ? 'Đã xuất bản' : 'Published' },
    { value: 'ARCHIVED', label: isVi ? 'Lưu trữ' : 'Archived' }
  ]
  const difficulties = [
    { value: 'EASY', label: isVi ? 'Dễ' : 'Easy' },
    { value: 'MEDIUM', label: isVi ? 'Vừa' : 'Medium' },
    { value: 'HARD', label: isVi ? 'Khó' : 'Hard' }
  ]

  const state = useIpaTableState()
  const result = useIpaExercises(state.query)
  const { contexts } = usePracticeContexts()
  const contextOptions = contexts.map(item => ({
    value: item._id,
    label: isVi ? (item.name_vi || (item as typeof item & { name_en?: string }).name_en || item.name || item.code) : ((item as typeof item & { name_en?: string }).name_en || item.name_vi || item.name || item.code)
  }))
  const [editor, setEditor] = useState<{ id: string | null; readOnly: boolean } | null>(null)
  const { saveExercise, deleteExercise, restoreExercise } = useIpaMutations()
  const [working, setWorking] = useState<string | null>(null)
  const trash = state.query.trash === 'true'

  useEffect(() => {
    if (!result.isPlaceholderData && result.data && state.query.page > Math.max(1, result.data.pagination.totalPages)) {
      state.change({ page: String(Math.max(1, result.data.pagination.totalPages)) })
    }
  }, [result.data, result.isPlaceholderData, state])

  const toggle = async (record: IpaExerciseRecord, published: boolean) => {
    setWorking(record._id)
    try {
      const detail = await ipaAdminService.exercise(record._id)
      await saveExercise.mutateAsync({ id: record._id, payload: { ...exercisePayload(detail), status: published ? 'PUBLISHED' : 'DRAFT' } })
      toast.success(isVi ? 'Đã cập nhật trạng thái bài tập' : 'Exercise status updated')
    } catch (error) {
      toast.error(ipaError(error))
    } finally {
      setWorking(null)
    }
  }

  const removeOrRestore = async (record: IpaExerciseRecord) => {
    setWorking(record._id)
    try {
      if (trash) {
        await restoreExercise.mutateAsync({ id: record._id, revision: record.revision })
        toast.success(isVi ? 'Đã khôi phục bài tập về nháp' : 'Restored exercise to draft')
      } else {
        await deleteExercise.mutateAsync({ id: record._id, revision: record.revision })
        toast.success(isVi ? 'Đã chuyển bài tập vào thùng rác' : 'Moved exercise to trash')
      }
    } catch (error) {
      toast.error(ipaError(error))
    } finally {
      setWorking(null)
    }
  }

  const columns: IpaColumn<IpaExerciseRecord>[] = [
    { key: 'title', label: isVi ? 'Tiêu đề' : 'Title', fixed: 'left', width: 220, filterKind: 'text', render: (_, record) => <Button type="link" style={{ padding: 0 }} onClick={() => setEditor({ id: record._id, readOnly: true })}>{record.title}</Button> },
    { key: 'exercise_type', label: isVi ? 'Dạng bài' : 'Exercise Type', width: 220, filterKind: 'enum', filterOptions: ipaTypes.map(type => ({ value: type, label: isVi ? ipaTypeLabels[type] : (ipaEnTypes[type] || type) })), render: value => (isVi ? ipaTypeLabels[value as typeof ipaTypes[number]] || value : (ipaEnTypes[value as string] || value)) },
    { key: 'target_phoneme', label: isVi ? 'Âm mục tiêu' : 'Target Phoneme', width: 140, filterKind: 'text', render: value => <Tag color="indigo">/{value}/</Tag> },
    { key: 'context_id', label: isVi ? 'Chủ đề' : 'Context', width: 180, filterOptions: contextOptions, filterKind: 'enum', render: value => contextOptions.find(item => item.value === value)?.label || (isVi ? 'Chưa gán' : 'None') },
    { key: 'cefr_level', label: 'CEFR', width: 100, filterKind: 'enum', filterOptions: levels },
    { key: 'difficulty_level', label: isVi ? 'Độ khó' : 'Difficulty', width: 110, filterKind: 'enum', filterOptions: difficulties, render: value => difficulties.find(item => item.value === value)?.label || value },
    { key: 'status', label: isVi ? 'Trạng thái' : 'Status', width: 150, filterKind: 'enum', filterOptions: exerciseStatuses, render: (_, record) => trash ? <Tag>{isVi ? 'Đã xóa' : 'Deleted'}</Tag> : <Space orientation="vertical" size={0}><Switch checked={record.status === 'PUBLISHED'} loading={working === record._id} disabled={Boolean(working)} onChange={checked => { void toggle(record, checked) }} /><span>{exerciseStatuses.find(item => item.value === record.status)?.label}</span></Space> },
    { key: 'created_at', label: isVi ? 'Ngày tạo' : 'Created At', width: 170, filterKind: 'date', render: date, initiallyHidden: true },
    { key: 'updated_at', label: isVi ? 'Cập nhật' : 'Updated At', width: 170, filterKind: 'date', render: date, initiallyHidden: true },
    { key: 'actions', label: isVi ? 'Thao tác' : 'Actions', fixed: 'right', width: 210, render: (_, record) => <Space><Button size="small" onClick={() => setEditor({ id: record._id, readOnly: true })}>{isVi ? 'Xem' : 'View'}</Button>{!trash && <Button size="small" type="primary" onClick={() => setEditor({ id: record._id, readOnly: false })}>{isVi ? 'Sửa' : 'Edit'}</Button>}<Popconfirm title={trash ? (isVi ? 'Khôi phục bài tập về nháp?' : 'Restore exercise to draft?') : (isVi ? 'Chuyển bài tập vào thùng rác?' : 'Move exercise to trash?')} description={isVi ? 'Giữ lại lịch sử làm bài và media.' : 'Preserves attempt history and media.'} okText={trash ? (isVi ? 'Khôi phục' : 'Restore') : (isVi ? 'Xóa' : 'Delete')} cancelText={isVi ? 'Hủy' : 'Cancel'} onConfirm={() => removeOrRestore(record)}><Button size="small" danger={!trash} loading={working === record._id} disabled={Boolean(working)}>{trash ? (isVi ? 'Khôi phục' : 'Restore') : (isVi ? 'Xóa' : 'Delete')}</Button></Popconfirm></Space> },
  ]

  return <>
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <Segmented value={String(trash)} options={[{ value: 'false', label: isVi ? 'Bài tập' : 'Exercises' }, { value: 'true', label: isVi ? 'Thùng rác' : 'Trash' }]} onChange={value => state.change({ trash: value, page: '1' })} />
      <Space>
        <Button icon={<RotateCcw size={14} />} loading={result.isFetching} onClick={() => result.refetch()}>{isVi ? 'Làm mới' : 'Refresh'}</Button>
        {!trash && <Button type="primary" icon={<Plus size={15} />} onClick={() => setEditor({ id: null, readOnly: false })}>{isVi ? 'Thêm bài tập' : 'Add Exercise'}</Button>}
      </Space>
    </div>
    <IpaDataTable columns={columns} items={result.data?.items || []} total={result.data?.pagination.total || 0} loading={result.isFetching} error={result.error} retry={result.refetch} state={state} searchLabel={isVi ? "Tìm kiếm bài tập" : "Search exercises"} searchPlaceholder={isVi ? "Tìm tiêu đề, từ, âm, mô tả..." : "Search title, word, phoneme, description..."} extraFilters={<>
      <Select mode="multiple" aria-label={isVi ? "Lọc CEFR" : "Filter CEFR"} placeholder="CEFR" style={{ minWidth: 110 }} allowClear options={levels} value={state.filters.cefr_level || []} onChange={values => state.setFilter('cefr_level', values)} />
      <Select mode="multiple" aria-label={isVi ? "Lọc độ khó" : "Filter difficulty"} placeholder={isVi ? "Độ khó" : "Difficulty"} style={{ minWidth: 130 }} allowClear options={difficulties} value={state.filters.difficulty_level || []} onChange={values => state.setFilter('difficulty_level', values)} />
      <Select mode="multiple" aria-label={isVi ? "Lọc trạng thái" : "Filter status"} placeholder={isVi ? "Trạng thái" : "Status"} style={{ minWidth: 165 }} allowClear options={exerciseStatuses} value={state.filters.status || []} onChange={values => state.setFilter('status', values)} />
    </>} />
    {editor && <IpaExerciseEditor key={editor.id || 'new'} {...editor} type={state.filters.exercise_type?.length === 1 ? state.filters.exercise_type[0] as typeof ipaTypes[number] : 'MINIMAL_PAIR_LISTEN'} trash={trash} onClose={() => setEditor(null)} />}
  </>
}

export function PracticeIpaPage() {
  const [params] = useSearchParams()
  const state = useIpaTableState()
  const { theme } = useAdminLayout()
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'

  const tab = params.get('tab') === 'exercises' ? 'exercises' : 'symbols'
  return <ConfigProvider theme={{ algorithm: theme === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm, token: { colorPrimary: '#4f46e5', borderRadius: 10 } }}>
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{isVi ? 'Ngữ âm & IPA' : 'Phonetics & IPA'}</h1>
        <p className="mt-1 text-sm text-slate-500">{isVi ? 'Quản lý bảng âm cố định và bài tập nhận diện âm, cặp âm, phiên âm.' : 'Manage standard IPA chart, minimal pairs, phoneme recognition and transcription.'}</p>
      </div>
      <Tabs activeKey={tab} onChange={state.switchTab} items={[{ key: 'symbols', label: isVi ? 'Bảng âm IPA' : 'IPA Symbols', children: <SymbolsTable /> }, { key: 'exercises', label: isVi ? 'Bài tập IPA' : 'IPA Exercises', children: <ExercisesTable /> }]} destroyOnHidden />
    </div>
  </ConfigProvider>
}

// Trang quản lý ngữ pháp (Grammar Topics, Questions, Sổ tay ngữ pháp) dành cho quản trị viên.

import { useEffect, useMemo, useState } from 'react'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Alert, Button, Card, ConfigProvider, Segmented, Tag, Tree, theme as antdTheme } from 'antd'
import { CustomSwitch } from '@/components/custom.switch'
import { CustomSelect } from '@/components/custom.select'
import { IpaDataTable, type IpaColumn } from '@/components/data.table'
import { AdminTabs } from '@/components/admin.tabs'
import { BookOpen, Sparkles, Layers, ListTree, HelpCircle } from 'lucide-react'
import dayjs from 'dayjs'
import { useAdminLayout } from '@/contexts/admin.layout.context'
import { toast } from '@/store/toast.store'
import { GrammarTopicEditor } from '@/features/practice/components/grammar.topic.editor'
import { GrammarQuestionEditor } from '@/features/practice/components/grammar.question.editor'
import { GrammarHandbookTab } from '@/features/practice/components/grammar.handbook.tab'
import { ToeicTipsTab } from '@/features/practice/components/toeic.tips.tab'
import { IpaRowActions } from '@/features/practice/components/ipa.row.actions'
import { useIpaTableState } from '@/features/practice/hooks/use.ipa.table-state'
import { grammarAdminKeys, useGrammarMutations, useGrammarTree } from '@/features/practice/hooks/use.grammar.admin'
import { usePracticeContexts } from '@/features/practice/hooks/use.practice.contexts'
import { grammarAdminService } from '@/features/practice/services/grammar-admin.service'
import { grammarQuestionPayload, grammarTopicPayload } from '@/features/practice/helpers/grammar-admin.helper'
import { ipaError } from '@/features/practice/helpers/ipa-admin.helper'
import { ipaLevels, type IpaPage } from '@/features/practice/types/ipa-admin.types'
import { grammarTypes, grammarLabels, grammarCategories, grammarCategoryLabels, type GrammarKind, type GrammarTopic, type GrammarQuestion, type GrammarTreeNode } from '@/features/practice/types/grammar-admin.types'

interface TopicTreeData {
  key: string
  title: string
  children: TopicTreeData[]
}

type GrammarRecord = GrammarTopic | GrammarQuestion

const grammarEnLabels: Record<string, string> = {
  MULTIPLE_CHOICE: 'Multiple Choice',
  FILL_BLANK: 'Fill in Blanks',
  ORDERING: 'Sentence Ordering'
}

function GrammarBank({ kind, tree = [] }: { kind: GrammarKind; tree?: GrammarTreeNode[] }) {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'

  const safeTree = useMemo(() => Array.isArray(tree) ? tree : [], [tree])
  const levels = useMemo(() => ipaLevels.map(value => ({ value, label: value })), [])
  const categories = useMemo(() => grammarCategories.map(value => ({ value, label: isVi ? (grammarCategoryLabels[value] || value) : value })), [isVi])
  const difficulties = useMemo(() => [
    { value: 'EASY', label: isVi ? 'Dễ' : 'Easy' },
    { value: 'MEDIUM', label: isVi ? 'Vừa' : 'Medium' },
    { value: 'HARD', label: isVi ? 'Khó' : 'Hard' }
  ], [isVi])
  const questionStatuses = useMemo(() => [
    { value: 'DRAFT', label: isVi ? 'Nháp' : 'Draft' },
    { value: 'PUBLISHED', label: isVi ? 'Đã xuất bản' : 'Published' },
    { value: 'ARCHIVED', label: isVi ? 'Lưu trữ' : 'Archived' }
  ], [isVi])
  const topicStatuses = useMemo(() => [
    { value: 'ACTIVE', label: isVi ? 'Đang sử dụng' : 'Active' },
    { value: 'INACTIVE', label: isVi ? 'Ngừng sử dụng' : 'Inactive' }
  ], [isVi])

  const state = useIpaTableState()
  const mutations = useGrammarMutations()
  const { contexts = [], isLoading: loadingContexts } = usePracticeContexts()
  const result = useQuery<IpaPage<GrammarRecord>>({
    queryKey: [...grammarAdminKeys, kind, state.query],
    queryFn: () => kind === 'topics' ? grammarAdminService.topics(state.query) : grammarAdminService.questions(state.query),
    placeholderData: keepPreviousData
  })
  const [editor, setEditor] = useState<{ id: string | null; readOnly: boolean } | null>(null)
  const [working, setWorking] = useState<string | null>(null)
  const trash = state.query.trash === 'true'
  const topicOptions = useMemo(() => safeTree.map(row => ({ value: row._id, label: isVi ? (row.name_vi || row.name_en || row.code) : (row.name_en || row.name_vi || row.code), pId: row.parent_id })), [safeTree, isVi])
  const contextOptions = useMemo(() => contexts.map(row => ({ value: row._id, label: isVi ? (row.name_vi || row.name || row.code) : (row.name || row.name_vi || row.code), pId: row.parent_id })), [contexts, isVi])

  const topicSelectOptions = useMemo(() => {
    const roots = safeTree.filter(row => !row.parent_id)
    if (roots.length > 0) {
      return roots.map(parent => {
        const parentName = isVi ? (parent.name_vi || parent.name_en || parent.code) : (parent.name_en || parent.name_vi || parent.code)
        const children = safeTree.filter(row => row.parent_id === parent._id)
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
              label: isVi ? (child.name_vi || child.name_en || child.code) : (child.name_en || child.name_vi || child.code),
            }))
          ]
        }
      })
    }
    return safeTree.map(row => ({
      value: row._id,
      label: isVi ? (row.name_vi || row.name_en || row.code) : (row.name_en || row.name_vi || row.code),
    }))
  }, [safeTree, isVi])

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

  const statuses = kind === 'topics' ? topicStatuses : questionStatuses

  const totalPages = result.data?.pagination?.totalPages
  const currentPage = state.query.page
  const { change } = state

  useEffect(() => {
    if (!result.isPlaceholderData && totalPages !== undefined && currentPage > Math.max(1, totalPages)) {
      change({ page: String(Math.max(1, totalPages)) })
    }
  }, [result.isPlaceholderData, totalPages, currentPage, change])

  const toggle = async (row: GrammarRecord, value: boolean) => {
    setWorking(row._id)
    try {
      if (kind === 'topics') {
        const detail = await grammarAdminService.topic(row._id)
        await mutations.saveTopic.mutateAsync({ id: row._id, payload: { ...grammarTopicPayload(detail), status: value ? 'ACTIVE' : 'INACTIVE' } })
      } else {
        const detail = await grammarAdminService.question(row._id)
        await mutations.saveQuestion.mutateAsync({ id: row._id, payload: { ...grammarQuestionPayload(detail), status: value ? 'PUBLISHED' : 'DRAFT' } })
      }
      toast.success(isVi ? 'Đã cập nhật trạng thái' : 'Status updated successfully')
    } catch (error) {
      toast.error(ipaError(error))
    } finally {
      setWorking(null)
    }
  }

  const removeOrRestore = async (row: GrammarRecord) => {
    setWorking(row._id)
    try {
      await (trash ? mutations.restore : mutations.remove).mutateAsync({ kind, id: row._id, revision: row.revision })
      toast.success(trash ? (isVi ? 'Đã khôi phục' : 'Restored successfully') : (isVi ? 'Đã chuyển vào thùng rác' : 'Moved to trash'))
    } catch (error) {
      toast.error(ipaError(error))
    } finally {
      setWorking(null)
    }
  }

  const columns: IpaColumn<GrammarRecord>[] = kind === 'topics' ? [
    { key: 'code', label: isVi ? 'Mã' : 'Code', width: 180, filterKind: 'text' },
    { key: 'name_en', label: isVi ? 'Tên tiếng Anh' : 'English Name', fixed: 'left', width: 230, filterKind: 'text', render: (_, row) => <Button type="link" style={{ padding: 0, whiteSpace: 'normal', textAlign: 'left' }} onClick={() => setEditor({ id: row._id, readOnly: true })}>{(row as GrammarTopic).name_en}</Button> },
    { key: 'name_vi', label: isVi ? 'Tên tiếng Việt' : 'Vietnamese Name', width: 220, filterKind: 'text' },
    { key: 'category', label: isVi ? 'Nhóm' : 'Category', width: 140, filterKind: 'enum', filterOptions: categories, render: value => (isVi ? grammarCategoryLabels[value] : value) || value },
    { key: 'parent_id', label: isVi ? 'Chủ điểm cha' : 'Parent Topic', width: 140, filterKind: 'tree', filterOptions: topicSelectOptions, render: value => topicOptions.find(row => row.value === value)?.label || (isVi ? 'Gốc' : 'Root') },
    { key: 'level', label: isVi ? 'Cấp trong cây' : 'Level in Tree', width: 100, filterKind: 'number', initiallyHidden: true },
    { key: 'usage_count', label: isVi ? 'Câu liên kết' : 'Linked Questions', width: 90, filterKind: 'number' },
  ] : [
    { key: 'question_text_en', label: isVi ? 'Câu hỏi (Anh)' : 'Question Text (EN)', width: 200, filterKind: 'text', render: (_, row) => <Button type="link" style={{ padding: 0, textAlign: 'left', whiteSpace: 'normal', height: 'auto', lineHeight: '1.3' }} onClick={() => setEditor({ id: row._id, readOnly: true })}><span className="font-semibold text-xs text-indigo-600 dark:text-indigo-400 hover:underline">{(row as GrammarQuestion).question_text_en || (isVi ? '(Chưa có nội dung)' : '(No content)')}</span></Button> },
    { key: 'question_text_vi', label: isVi ? 'Câu hỏi (Việt)' : 'Question Text (VI)', width: 180, filterKind: 'text', initiallyHidden: true },
    { key: 'grammar_knowledge_id', label: isVi ? 'Chủ điểm ngữ pháp' : 'Grammar Topic', width: 140, filterKind: 'tree', filterOptions: topicSelectOptions, render: value => topicOptions.find(row => row.value === value)?.label || (isVi ? 'Chưa gán' : 'None') },
    { key: 'context_id', label: isVi ? 'Chủ đề' : 'Context', width: 120, filterKind: 'tree', filterOptions: contextSelectOptions, render: value => contextOptions.find(row => row.value === value)?.label || (isVi ? 'Chưa gán' : 'None') },
    { key: 'domain', label: isVi ? 'Ngân hàng' : 'Question Bank', width: 100, filterKind: 'enum', filterOptions: [{ value: 'GRAMMAR', label: isVi ? 'Ngữ pháp' : 'Grammar' }, { value: 'VOCABULARY', label: isVi ? 'Từ vựng liên kết' : 'Linked Vocab' }], render: value => value === 'VOCABULARY' ? (isVi ? 'Từ vựng liên kết' : 'Linked Vocab') : (isVi ? 'Ngữ pháp' : 'Grammar') },
    { key: 'question_type', label: isVi ? 'Dạng câu hỏi' : 'Question Type', width: 110, filterKind: 'enum', filterOptions: grammarTypes.map(value => ({ value, label: isVi ? grammarLabels[value] : (grammarEnLabels[value] || value) })), render: value => (isVi ? grammarLabels[value as keyof typeof grammarLabels] : grammarEnLabels[value as string]) || value },
    { key: 'cefr_level', label: 'CEFR', width: 55, filterKind: 'enum', filterOptions: levels },
    { key: 'difficulty_level', label: isVi ? 'Độ khó' : 'Difficulty', width: 65, filterKind: 'enum', filterOptions: difficulties, render: value => difficulties.find(item => item.value === value)?.label || value },
    { key: 'media_id', label: 'Media', width: 90, filterKind: 'media', initiallyHidden: true, render: value => value ? (isVi ? 'Có tệp' : 'Has file') : (isVi ? 'Chưa có' : 'None') },
  ]

  const sharedColumns: IpaColumn<GrammarRecord>[] = [
    { key: 'status', label: isVi ? 'Trạng thái' : 'Status', width: 90, filterKind: 'enum', filterOptions: statuses, render: (_, row) => trash ? <Tag>{isVi ? 'Đã xóa' : 'Deleted'}</Tag> : <div className="inline-flex flex-col items-start gap-0.5"><CustomSwitch size="sm" color="emerald" aria-label={`Trạng thái ${row._id}`} checked={kind === 'topics' ? (row as GrammarTopic).status === 'ACTIVE' : (row as GrammarQuestion).status === 'PUBLISHED'} disabled={Boolean(working)} loading={working === row._id} onChange={value => { void toggle(row, value) }} /><span className="text-[10px] text-slate-500 whitespace-nowrap">{statuses.find(item => item.value === (kind === 'topics' ? (row as GrammarTopic).status : (row as GrammarQuestion).status))?.label}</span></div> },
    { key: 'created_at', label: isVi ? 'Ngày tạo' : 'Created At', width: 105, filterKind: 'date', initiallyHidden: true, render: value => value ? <div className="font-mono text-xs leading-tight text-slate-600 dark:text-slate-400"><div className="whitespace-nowrap font-medium">{dayjs(value).format('DD/MM/YYYY')}</div><div className="text-[10px] text-slate-400 dark:text-slate-500 whitespace-nowrap">{dayjs(value).format('HH:mm')}</div></div> : '—' },
    { key: 'updated_at', label: isVi ? 'Cập nhật' : 'Updated At', width: 105, filterKind: 'date', render: value => value ? <div className="font-mono text-xs leading-tight text-slate-600 dark:text-slate-400"><div className="whitespace-nowrap font-medium">{dayjs(value).format('DD/MM/YYYY')}</div><div className="text-[10px] text-slate-400 dark:text-slate-500 whitespace-nowrap">{dayjs(value).format('HH:mm')}</div></div> : '—' },
    { key: 'actions', label: isVi ? 'Thao tác' : 'Actions', width: 85, render: (_, row) => <IpaRowActions onView={() => setEditor({ id: row._id, readOnly: true })} onEdit={!trash ? () => setEditor({ id: row._id, readOnly: false }) : undefined} onDeleteOrRestore={() => removeOrRestore(row)} trash={trash} loading={working === row._id} disabled={Boolean(working)} isVi={isVi} deleteTitle={trash ? (isVi ? 'Khôi phục bản ghi?' : 'Restore record?') : (isVi ? 'Chuyển vào thùng rác?' : 'Move to trash?')} deleteDescription={isVi ? 'Giữ lại lịch sử liên kết dữ liệu.' : 'Preserves linked attempt data.'} /> },
  ]

  return <>
    <IpaDataTable
      columns={[...columns, ...sharedColumns]}
      items={result.data?.items || []}
      total={result.data?.pagination.total || 0}
      loading={result.isFetching}
      error={result.error}
      retry={result.refetch}
      state={state}
      searchLabel={isVi ? 'Tìm kiếm' : 'Search'}
      searchPlaceholder={kind === 'topics' ? (isVi ? 'Tìm tên, mã, giải thích...' : 'Search name, code, description...') : (isVi ? 'Tìm câu hỏi, giải thích...' : 'Search question, explanation...')}
      extraActions={
        <div className="flex items-center gap-2">
          <Segmented
            value={String(trash)}
            options={[
              { value: 'false', label: kind === 'topics' ? (isVi ? 'Bản ghi' : 'Active') : (isVi ? 'Bản ghi' : 'Active') },
              { value: 'true', label: isVi ? 'Thùng rác' : 'Trash' }
            ]}
            onChange={value => state.change({ trash: value, page: '1' })}
          />
          {!trash && (
            <button
              type="button"
              onClick={() => setEditor({ id: null, readOnly: false })}
              className="h-10 px-4 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs shadow-indigo-500/20 flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
            >
              <span>{kind === 'topics' ? (isVi ? '+ Thêm chủ điểm' : '+ Add Topic') : (isVi ? '+ Thêm câu hỏi' : '+ Add Question')}</span>
            </button>
          )}
        </div>
      }
      extraFilters={<>
        {kind === 'topics' ? (
          <CustomSelect
            aria-label={isVi ? 'Lọc nhóm ngữ pháp' : 'Filter category'}
            mode="multiple"
            placeholder={isVi ? 'Nhóm ngữ pháp' : 'Category'}
            allowClear
            className="w-44"
            options={categories}
            value={state.filters.category || []}
            onChange={values => state.setFilter('category', values)}
          />
        ) : (
          <>
            <CustomSelect
              aria-label={isVi ? 'Lọc chủ điểm ngữ pháp' : 'Filter topic'}
              mode="multiple"
              placeholder={isVi ? 'Chủ điểm' : 'Topic'}
              allowClear
              className="w-44"
              options={topicSelectOptions}
              value={state.filters.grammar_knowledge_id || []}
              onChange={values => state.setFilter('grammar_knowledge_id', values)}
            />
            <CustomSelect
              aria-label={isVi ? 'Lọc chủ đề' : 'Filter context'}
              mode="multiple"
              placeholder={isVi ? 'Chủ đề' : 'Context'}
              allowClear
              className="w-40"
              options={contextSelectOptions}
              loading={loadingContexts}
              value={state.filters.context_id || []}
              onChange={values => state.setFilter('context_id', values)}
            />
            <CustomSelect
              aria-label={isVi ? 'Lọc dạng câu hỏi' : 'Filter question type'}
              mode="multiple"
              placeholder={isVi ? 'Dạng câu' : 'Question type'}
              allowClear
              className="w-40"
              options={grammarTypes.map(value => ({ value, label: isVi ? grammarLabels[value] : (grammarEnLabels[value] || value) }))}
              value={state.filters.question_type || []}
              onChange={values => state.setFilter('question_type', values)}
            />
          </>
        )}
        <CustomSelect
          aria-label={isVi ? 'Lọc CEFR' : 'Filter CEFR'}
          mode="multiple"
          placeholder="CEFR"
          allowClear
          className="w-28"
          options={levels}
          value={state.filters.cefr_level || []}
          onChange={values => state.setFilter('cefr_level', values)}
        />
        <CustomSelect
          aria-label={isVi ? 'Lọc trạng thái' : 'Filter status'}
          mode="multiple"
          placeholder={isVi ? 'Trạng thái' : 'Status'}
          allowClear
          className="w-36"
          options={statuses}
          value={state.filters.status || []}
          onChange={values => state.setFilter('status', values)}
        />
      </>}
    />
    {editor && (kind === 'topics' ? (
      <GrammarTopicEditor key={editor.id || 'new'} {...editor} trash={trash} onClose={() => setEditor(null)} />
    ) : (
      <GrammarQuestionEditor
        key={editor.id || 'new'}
        {...editor}
        trash={trash}
        initialTopic={state.filters.grammar_knowledge_id?.length === 1 ? state.filters.grammar_knowledge_id[0] : undefined}
        onClose={() => setEditor(null)}
      />
    ))}
  </>
}

export function PracticeGrammarPage() {
  const [params] = useSearchParams()
  const state = useIpaTableState()
  const { data: treeData, isFetching, error, refetch } = useGrammarTree()
  const tree = Array.isArray(treeData) ? treeData : []
  const { theme } = useAdminLayout()
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'

  const [mainTab, setMainTab] = useState<'handbook' | 'toeic_tips' | 'practice_bank'>('handbook')
  const kind: GrammarKind = params.get('tab') === 'questions' ? 'questions' : 'topics'

  const allIds = new Set(tree.map(r => String(r._id)))
  const build = (parent = '', seen: string[] = []): TopicTreeData[] =>
    tree
      .filter(row => {
        const p = row.parent_id || ''
        if (parent === '') {
          return p === '' || !allIds.has(p)
        }
        return p === parent && !seen.includes(row._id)
      })
      .map(row => ({
        key: row._id,
        title: `${isVi ? (row.name_vi || row.name_en) : (row.name_en || row.name_vi)}${row.status === 'INACTIVE' ? (isVi ? ' (ngừng sử dụng)' : ' (inactive)') : ''}`,
        children: build(row._id, [...seen, row._id])
      }))

  return (
    <ConfigProvider
      theme={{
        algorithm: theme === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: { colorPrimary: '#4f46e5', borderRadius: 10 }
      }}
    >
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {isVi ? 'Quản lý Ngữ pháp & Bí quyết TOEIC' : 'Grammar & TOEIC Tips Management'}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {isVi
              ? 'Hệ thống quản lý toàn diện Sổ tay 44 Chủ điểm ngữ pháp, Mẹo làm bài thi TOEIC 4 kỹ năng và Ngân hàng câu hỏi bài tập thực hành.'
              : 'Comprehensive management of 44 Grammar handbook points, 4-skill TOEIC tips, and practice question banks.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 p-1.5 rounded-2xl bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-2xs backdrop-blur-md w-fit">
          <button
            type="button"
            onClick={() => setMainTab('handbook')}
            className={`group flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              mainTab === 'handbook'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/80 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/50 dark:hover:bg-slate-800/50'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                mainTab === 'handbook'
                  ? 'bg-indigo-600 text-white shadow-xs shadow-indigo-600/30'
                  : 'bg-slate-200/80 dark:bg-slate-800 text-slate-500 group-hover:text-slate-800 dark:group-hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="leading-tight flex items-center gap-1.5">
                <span>{isVi ? 'Sổ tay 44 Ngữ pháp' : '44 Grammar Points'}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                    mainTab === 'handbook'
                      ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/50'
                      : 'bg-slate-200/70 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  44
                </span>
              </div>
              <div className="text-[11px] font-normal text-slate-400 dark:text-slate-500 mt-0.5">
                {isVi ? '44 chủ điểm & thể công thức' : '44 core topics & formulas'}
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setMainTab('toeic_tips')}
            className={`group flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              mainTab === 'toeic_tips'
                ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-sm border border-slate-200/80 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/50 dark:hover:bg-slate-800/50'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                mainTab === 'toeic_tips'
                  ? 'bg-amber-500 text-white shadow-xs shadow-amber-500/30'
                  : 'bg-slate-200/80 dark:bg-slate-800 text-slate-500 group-hover:text-slate-800 dark:group-hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="leading-tight flex items-center gap-1.5">
                <span>{isVi ? 'Tips làm bài TOEIC' : 'TOEIC Exam Tips'}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                    mainTab === 'toeic_tips'
                      ? 'bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/50'
                      : 'bg-slate-200/70 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  {isVi ? 'Chiến thuật' : 'Tips'}
                </span>
              </div>
              <div className="text-[11px] font-normal text-slate-400 dark:text-slate-500 mt-0.5">
                {isVi ? 'Bẫy đề & mẹo thi 4 kỹ năng' : 'Traps & 4-skill exam tactics'}
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setMainTab('practice_bank')}
            className={`group flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              mainTab === 'practice_bank'
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm border border-slate-200/80 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/50 dark:hover:bg-slate-800/50'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                mainTab === 'practice_bank'
                  ? 'bg-emerald-600 text-white shadow-xs shadow-emerald-600/30'
                  : 'bg-slate-200/80 dark:bg-slate-800 text-slate-500 group-hover:text-slate-800 dark:group-hover:text-slate-200'
              }`}
            >
              <Layers className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="leading-tight flex items-center gap-1.5">
                <span>{isVi ? 'Ngân hàng bài tập thực hành' : 'Practice Question Bank'}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                    mainTab === 'practice_bank'
                      ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/50'
                      : 'bg-slate-200/70 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  {isVi ? 'Thực hành' : 'Practice'}
                </span>
              </div>
              <div className="text-[11px] font-normal text-slate-400 dark:text-slate-500 mt-0.5">
                {isVi ? 'Cây chủ điểm & ngân hàng câu hỏi' : 'Topics tree & question bank'}
              </div>
            </div>
          </button>
        </div>

        <div key={mainTab} className="animate-in fade-in slide-in-from-bottom-2 duration-200 ease-out min-w-0">
          {mainTab === 'handbook' && <GrammarHandbookTab />}

          {mainTab === 'toeic_tips' && <ToeicTipsTab />}

          {mainTab === 'practice_bank' && (
            <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[260px_minmax(0,1fr)] pt-1">
              <Card
                size="small"
                title={isVi ? 'Cây chủ điểm' : 'Topics Tree'}
                loading={isFetching}
                extra={
                  state.filters.grammar_knowledge_id?.length ? (
                    <Button
                      size="small"
                      type="link"
                      style={{ padding: 0 }}
                      onClick={() =>
                        state.change({
                          tab: 'questions',
                          filters: undefined,
                          page: '1',
                          search: undefined,
                          sort: undefined,
                          order: undefined,
                        })
                      }
                    >
                      {isVi ? 'Xóa lọc' : 'Clear'}
                    </Button>
                  ) : null
                }
              >
                <Button
                  size="small"
                  block
                  style={{ marginBottom: 12 }}
                  onClick={() =>
                    state.change({
                      tab: 'questions',
                      filters: undefined,
                      page: '1',
                      search: undefined,
                      sort: undefined,
                      order: undefined,
                    })
                  }
                >
                  {isVi ? 'Tất cả câu hỏi' : 'All questions'}
                </Button>
                {error ? (
                  <Alert
                    type="error"
                    message={isVi ? 'Không tải được cây' : 'Failed to load tree'}
                    action={<Button onClick={() => refetch()}>{isVi ? 'Thử lại' : 'Retry'}</Button>}
                  />
                ) : (
                  <div className="max-h-[700px] overflow-auto">
                    <Tree
                      showLine
                      blockNode
                      selectedKeys={kind === 'questions' ? state.filters.grammar_knowledge_id || [] : []}
                      treeData={build()}
                      onSelect={(keys) => {
                        if (keys[0]) {
                          state.change({
                            tab: 'questions',
                            filters: JSON.stringify({ grammar_knowledge_id: [String(keys[0])] }),
                            page: '1',
                            search: undefined,
                            sort: undefined,
                            order: undefined,
                            trash: undefined,
                          })
                        }
                      }}
                    />
                  </div>
                )}
              </Card>

              <div className="min-w-0">
                <AdminTabs
                  activeKey={kind}
                  onChange={(tab) =>
                    state.change({
                      tab,
                      filters: undefined,
                      search: undefined,
                      page: '1',
                      sort: undefined,
                      order: undefined,
                      trash: undefined,
                    })
                  }
                  items={[
                    {
                      key: 'topics',
                      label: isVi ? 'Chủ điểm' : 'Topics',
                      icon: ListTree,
                    },
                    {
                      key: 'questions',
                      label: isVi ? 'Câu hỏi' : 'Questions',
                      icon: HelpCircle,
                    },
                  ]}
                  className="mb-3"
                />

                <div key={kind} className="animate-in fade-in slide-in-from-bottom-1 duration-150 ease-out min-w-0">
                  {kind === 'topics' ? (
                    <GrammarBank key="topics" kind="topics" tree={tree} />
                  ) : (
                    <GrammarBank key="questions" kind="questions" tree={tree} />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ConfigProvider>
  )
}

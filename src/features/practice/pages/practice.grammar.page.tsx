import { useEffect, useState } from 'react'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Alert, Button, Card, ConfigProvider, Popconfirm, Segmented, Select, Space, Switch, Tabs, Tag, Tree, TreeSelect, theme as antdTheme } from 'antd'
import { BookOutlined, BulbOutlined, UnorderedListOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { useAdminLayout } from '@/contexts/admin.layout.context'
import { toast } from '@/store/toast.store'
import { IpaDataTable, type IpaColumn } from '../components/ipa.data.table'
import { GrammarTopicEditor } from '../components/grammar.topic.editor'
import { GrammarQuestionEditor } from '../components/grammar.question.editor'
import { GrammarHandbookTab } from '../components/grammar.handbook.tab'
import { ToeicTipsTab } from '../components/toeic.tips.tab'
import { useIpaTableState } from '../hooks/use.ipa.table-state'
import { grammarAdminKeys, useGrammarMutations, useGrammarTree } from '../hooks/use.grammar.admin'
import { usePracticeContexts } from '../hooks/use.practice.contexts'
import { grammarAdminService } from '../services/grammar-admin.service'
import { grammarQuestionPayload, grammarTopicPayload } from '../helpers/grammar-admin.helper'
import { ipaError } from '../helpers/ipa-admin.helper'
import { ipaLevels, type IpaPage } from '../types/ipa-admin.types'
import { grammarTypes, grammarLabels, grammarCategories, grammarCategoryLabels, type GrammarKind, type GrammarTopic, type GrammarQuestion, type GrammarTreeNode } from '../types/grammar-admin.types'

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

  const safeTree = Array.isArray(tree) ? tree : []
  const levels = ipaLevels.map(value => ({ value, label: value }))
  const categories = grammarCategories.map(value => ({ value, label: isVi ? (grammarCategoryLabels[value] || value) : value }))
  const difficulties = [
    { value: 'EASY', label: isVi ? 'Dễ' : 'Easy' },
    { value: 'MEDIUM', label: isVi ? 'Vừa' : 'Medium' },
    { value: 'HARD', label: isVi ? 'Khó' : 'Hard' }
  ]
  const questionStatuses = [
    { value: 'DRAFT', label: isVi ? 'Nháp' : 'Draft' },
    { value: 'PUBLISHED', label: isVi ? 'Đã xuất bản' : 'Published' },
    { value: 'ARCHIVED', label: isVi ? 'Lưu trữ' : 'Archived' }
  ]
  const topicStatuses = [
    { value: 'ACTIVE', label: isVi ? 'Đang sử dụng' : 'Active' },
    { value: 'INACTIVE', label: isVi ? 'Ngừng sử dụng' : 'Inactive' }
  ]

  const state = useIpaTableState()
  const mutations = useGrammarMutations()
  const { contexts = [] } = usePracticeContexts()
  const result = useQuery<IpaPage<GrammarRecord>>({
    queryKey: [...grammarAdminKeys, kind, state.query],
    queryFn: () => kind === 'topics' ? grammarAdminService.topics(state.query) : grammarAdminService.questions(state.query),
    placeholderData: keepPreviousData
  })
  const [editor, setEditor] = useState<{ id: string | null; readOnly: boolean } | null>(null)
  const [working, setWorking] = useState<string | null>(null)
  const trash = state.query.trash === 'true'
  const topicOptions = safeTree.map(row => ({ value: row._id, label: isVi ? (row.name_vi || row.name_en || row.code) : (row.name_en || row.name_vi || row.code), pId: row.parent_id }))
  const contextOptions = contexts.map(row => ({ value: row._id, label: isVi ? (row.name_vi || row.name || row.code) : (row.name || row.name_vi || row.code), pId: row.parent_id }))
  const statuses = kind === 'topics' ? topicStatuses : questionStatuses

  useEffect(() => {
    if (!result.isPlaceholderData && result.data && state.query.page > Math.max(1, result.data.pagination.totalPages)) {
      state.change({ page: String(Math.max(1, result.data.pagination.totalPages)) })
    }
  }, [result.data, result.isPlaceholderData, state])

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
    { key: 'category', label: isVi ? 'Nhóm' : 'Category', width: 190, filterKind: 'enum', filterOptions: categories, render: value => (isVi ? grammarCategoryLabels[value] : value) || value },
    { key: 'parent_id', label: isVi ? 'Chủ điểm cha' : 'Parent Topic', width: 200, filterKind: 'tree', filterOptions: topicOptions, render: value => topicOptions.find(row => row.value === value)?.label || (isVi ? 'Gốc' : 'Root') },
    { key: 'level', label: isVi ? 'Cấp trong cây' : 'Level in Tree', width: 130, filterKind: 'number', initiallyHidden: true },
    { key: 'usage_count', label: isVi ? 'Câu liên kết' : 'Linked Questions', width: 140, filterKind: 'number' },
  ] : [
    { key: 'question_text_en', label: isVi ? 'Câu hỏi (Anh)' : 'Question Text (EN)', fixed: 'left', width: 280, filterKind: 'text', render: (_, row) => <Button type="link" style={{ padding: 0, maxWidth: 260, whiteSpace: 'normal', textAlign: 'left' }} onClick={() => setEditor({ id: row._id, readOnly: true })}>{(row as GrammarQuestion).question_text_en || (isVi ? '(Chưa có nội dung)' : '(No content)')}</Button> },
    { key: 'question_text_vi', label: isVi ? 'Câu hỏi (Việt)' : 'Question Text (VI)', width: 240, filterKind: 'text', initiallyHidden: true },
    { key: 'grammar_knowledge_id', label: isVi ? 'Chủ điểm ngữ pháp' : 'Grammar Topic', width: 210, filterKind: 'tree', filterOptions: topicOptions, render: value => topicOptions.find(row => row.value === value)?.label || (isVi ? 'Chưa gán' : 'None') },
    { key: 'context_id', label: isVi ? 'Chủ đề' : 'Context', width: 190, filterKind: 'tree', filterOptions: contextOptions, render: value => contextOptions.find(row => row.value === value)?.label || (isVi ? 'Chưa gán' : 'None') },
    { key: 'domain', label: isVi ? 'Ngân hàng' : 'Question Bank', width: 160, filterKind: 'enum', filterOptions: [{ value: 'GRAMMAR', label: isVi ? 'Ngữ pháp' : 'Grammar' }, { value: 'VOCABULARY', label: isVi ? 'Từ vựng liên kết' : 'Linked Vocab' }], render: value => value === 'VOCABULARY' ? (isVi ? 'Từ vựng liên kết' : 'Linked Vocab') : (isVi ? 'Ngữ pháp' : 'Grammar') },
    { key: 'question_type', label: isVi ? 'Dạng câu hỏi' : 'Question Type', width: 170, filterKind: 'enum', filterOptions: grammarTypes.map(value => ({ value, label: isVi ? grammarLabels[value] : (grammarEnLabels[value] || value) })), render: value => (isVi ? grammarLabels[value as keyof typeof grammarLabels] : grammarEnLabels[value as string]) || value },
    { key: 'cefr_level', label: 'CEFR', width: 100, filterKind: 'enum', filterOptions: levels },
    { key: 'difficulty_level', label: isVi ? 'Độ khó' : 'Difficulty', width: 110, filterKind: 'enum', filterOptions: difficulties, render: value => difficulties.find(item => item.value === value)?.label || value },
    { key: 'media_id', label: 'Media', width: 110, filterKind: 'media', initiallyHidden: true, render: value => value ? (isVi ? 'Có tệp' : 'Has file') : (isVi ? 'Chưa có' : 'None') },
  ]

  const sharedColumns: IpaColumn<GrammarRecord>[] = [
    { key: 'status', label: isVi ? 'Trạng thái' : 'Status', width: 160, filterKind: 'enum', filterOptions: statuses, render: (_, row) => trash ? <Tag>{isVi ? 'Đã xóa' : 'Deleted'}</Tag> : <Space orientation="vertical" size={0}><Switch aria-label={`Trạng thái ${row._id}`} checked={kind === 'topics' ? (row as GrammarTopic).status === 'ACTIVE' : (row as GrammarQuestion).status === 'PUBLISHED'} disabled={Boolean(working)} loading={working === row._id} onChange={value => { void toggle(row, value) }} /><span>{statuses.find(item => item.value === (kind === 'topics' ? (row as GrammarTopic).status : (row as GrammarQuestion).status))?.label}</span></Space> },
    { key: 'created_at', label: isVi ? 'Ngày tạo' : 'Created At', width: 170, filterKind: 'date', initiallyHidden: true, render: value => value ? dayjs(value).format('DD/MM/YYYY HH:mm') : '—' },
    { key: 'updated_at', label: isVi ? 'Cập nhật' : 'Updated At', width: 170, filterKind: 'date', render: value => value ? dayjs(value).format('DD/MM/YYYY HH:mm') : '—' },
    { key: 'actions', label: isVi ? 'Thao tác' : 'Actions', fixed: 'right', width: 220, render: (_, row) => <Space><Button size="small" onClick={() => setEditor({ id: row._id, readOnly: true })}>{isVi ? 'Xem' : 'View'}</Button>{!trash && <Button size="small" type="primary" onClick={() => setEditor({ id: row._id, readOnly: false })}>{isVi ? 'Sửa' : 'Edit'}</Button>}<Popconfirm title={trash ? (isVi ? 'Khôi phục bản ghi?' : 'Restore record?') : (isVi ? 'Chuyển vào thùng rác?' : 'Move to trash?')} description={isVi ? 'Giữ lại lịch sử liên kết dữ liệu.' : 'Preserves linked attempt data.'} okText={trash ? (isVi ? 'Khôi phục' : 'Restore') : (isVi ? 'Xóa' : 'Delete')} cancelText={isVi ? 'Hủy' : 'Cancel'} onConfirm={() => removeOrRestore(row)}><Button size="small" danger={!trash} disabled={Boolean(working)} loading={working === row._id}>{trash ? (isVi ? 'Khôi phục' : 'Restore') : (isVi ? 'Xóa' : 'Delete')}</Button></Popconfirm></Space> },
  ]

  return <>
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <Segmented value={String(trash)} options={[{ value: 'false', label: kind === 'topics' ? (isVi ? 'Chủ điểm' : 'Topics') : (isVi ? 'Câu hỏi' : 'Questions') }, { value: 'true', label: isVi ? 'Thùng rác' : 'Trash' }]} onChange={value => state.change({ trash: value, page: '1' })} />
      <Space>
        <Button loading={result.isFetching} onClick={() => result.refetch()}>{isVi ? 'Làm mới' : 'Refresh'}</Button>
        {!trash && <Button type="primary" onClick={() => setEditor({ id: null, readOnly: false })}>{kind === 'topics' ? (isVi ? 'Thêm chủ điểm' : 'Add Topic') : (isVi ? 'Thêm câu hỏi' : 'Add Question')}</Button>}
      </Space>
    </div>
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
      extraFilters={<>
        {kind === 'topics' ? (
          <Select
            aria-label={isVi ? 'Lọc nhóm ngữ pháp' : 'Filter category'}
            mode="multiple"
            placeholder={isVi ? 'Nhóm ngữ pháp' : 'Category'}
            allowClear
            style={{ minWidth: 170 }}
            options={categories}
            value={state.filters.category || []}
            onChange={values => state.setFilter('category', values)}
          />
        ) : (
          <>
            <TreeSelect
              aria-label={isVi ? 'Lọc chủ điểm ngữ pháp' : 'Filter topic'}
              multiple
              treeDataSimpleMode
              showSearch
              treeNodeFilterProp="title"
              placeholder={isVi ? 'Chủ điểm' : 'Topic'}
              allowClear
              style={{ minWidth: 180 }}
              treeData={topicOptions.map(row => ({ ...row, id: row.value, title: row.label }))}
              value={state.filters.grammar_knowledge_id || []}
              onChange={values => state.setFilter('grammar_knowledge_id', values)}
            />
            <TreeSelect
              aria-label={isVi ? 'Lọc chủ đề' : 'Filter context'}
              multiple
              treeDataSimpleMode
              showSearch
              treeNodeFilterProp="title"
              placeholder={isVi ? 'Chủ đề' : 'Context'}
              allowClear
              style={{ minWidth: 160 }}
              treeData={contextOptions.map(row => ({ ...row, id: row.value, title: row.label }))}
              value={state.filters.context_id || []}
              onChange={values => state.setFilter('context_id', values)}
            />
            <Select
              aria-label={isVi ? 'Lọc dạng câu hỏi' : 'Filter question type'}
              mode="multiple"
              placeholder={isVi ? 'Dạng câu' : 'Question type'}
              allowClear
              style={{ minWidth: 150 }}
              options={grammarTypes.map(value => ({ value, label: isVi ? grammarLabels[value] : (grammarEnLabels[value] || value) }))}
              value={state.filters.question_type || []}
              onChange={values => state.setFilter('question_type', values)}
            />
          </>
        )}
        <Select
          aria-label={isVi ? 'Lọc CEFR' : 'Filter CEFR'}
          mode="multiple"
          placeholder="CEFR"
          allowClear
          style={{ minWidth: 110 }}
          options={levels}
          value={state.filters.cefr_level || []}
          onChange={values => state.setFilter('cefr_level', values)}
        />
        <Select
          aria-label={isVi ? 'Lọc trạng thái' : 'Filter status'}
          mode="multiple"
          placeholder={isVi ? 'Trạng thái' : 'Status'}
          allowClear
          style={{ minWidth: 150 }}
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

        {/* Main High-Level Tabs */}
        <Tabs
          activeKey={mainTab}
          onChange={(key) => setMainTab(key as any)}
          type="line"
          size="large"
          className="font-medium"
          items={[
            {
              key: 'handbook',
              label: (
                <span className="flex items-center gap-1.5 font-bold">
                  <BookOutlined />
                  {isVi ? 'Sổ tay 44 Ngữ pháp' : '44 Grammar Points'}
                </span>
              ),
              children: <GrammarHandbookTab />,
            },
            {
              key: 'toeic_tips',
              label: (
                <span className="flex items-center gap-1.5 font-bold">
                  <BulbOutlined />
                  {isVi ? 'Tips làm bài TOEIC' : 'TOEIC Exam Tips'}
                </span>
              ),
              children: <ToeicTipsTab />,
            },
            {
              key: 'practice_bank',
              label: (
                <span className="flex items-center gap-1.5 font-bold">
                  <UnorderedListOutlined />
                  {isVi ? 'Ngân hàng bài tập thực hành' : 'Practice Question Bank'}
                </span>
              ),
              children: (
                <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[260px_minmax(0,1fr)] pt-2">
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
                    <Tabs
                      activeKey={kind}
                      destroyOnHidden
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
                          children: <GrammarBank key="topics" kind="topics" tree={tree} />,
                        },
                        {
                          key: 'questions',
                          label: isVi ? 'Câu hỏi' : 'Questions',
                          children: <GrammarBank key="questions" kind="questions" tree={tree} />,
                        },
                      ]}
                    />
                  </div>
                </div>
              ),
            },
          ]}
        />
      </div>
    </ConfigProvider>
  )
}

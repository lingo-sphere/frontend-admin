// Component giao diện VocabularyTopicsTab phục vụ khu vực Quản trị Admin, đồng bộ DataTable và phân trang như Khóa học.

import { useState, useMemo, useCallback } from 'react'
import { Folder, Edit2, Plus, Trash2, Layers, Search, Sparkles } from 'lucide-react'
import type { Topic } from '@/features/vocabulary/data/vocabulary.data'
import { DataTable, type DataTableColumn } from '@/components/data.table'
import { TableRowActions } from '@/components/table.row.actions'

interface VocabularyTopicsTabProps {
  topics: Topic[]
  onEditTopic: (topic: Topic) => void
  onCreateTopic: () => void
  onDeleteTopic: (topicId: string) => void
  onViewDecksOfTopic: (topicId: string) => void
}

export function VocabularyTopicsTab({
  topics,
  onEditTopic,
  onCreateTopic,
  onDeleteTopic,
  onViewDecksOfTopic,
}: VocabularyTopicsTabProps) {
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('grid')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchTopic, setSearchTopic] = useState('')

  const filteredTopics = useMemo(() => {
    if (!searchTopic.trim()) return topics
    const q = searchTopic.toLowerCase().trim()
    return topics.filter(
      (t) =>
        t.name_vi?.toLowerCase().includes(q) ||
        t.name_en?.toLowerCase().includes(q) ||
        t.slug?.toLowerCase().includes(q)
    )
  }, [topics, searchTopic])

  const paginatedTopics = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredTopics.slice(start, start + pageSize)
  }, [filteredTopics, currentPage, pageSize])

  const handleDelete = useCallback(
    (e: React.MouseEvent, topic: Topic) => {
      e.stopPropagation()
      const id = topic.id || topic._id
      if (!id) return
      const topicName = topic.name_vi || topic.name_en || 'chủ đề này'
      if (confirm(`Bạn có chắc chắn muốn xóa chủ đề "${topicName}"? Các liên kết từ vựng sẽ không bị mất.`)) {
        onDeleteTopic(id)
      }
    },
    [onDeleteTopic]
  )

  const columns: DataTableColumn<Topic>[] = useMemo(
    () => [
      {
        key: 'topic_info',
        dataIndex: 'name_vi',
        title: 'Chủ đề',
        render: (topic) => (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200/50 dark:border-indigo-800/50 font-bold shrink-0">
              {topic.icon_url || topic.icon ? (
                <span className="text-base">{topic.icon_url || topic.icon}</span>
              ) : (
                <Folder className="w-4 h-4" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                  {topic.name_vi || topic.name_en}
                </span>
                {topic.is_featured && (
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" aria-label="Chủ đề nổi bật" />
                )}
              </div>
              <p className="text-[11px] text-slate-400 font-mono">{topic.name_en}</p>
            </div>
          </div>
        ),
      },
      {
        key: 'cefr_level',
        title: 'Khung CEFR',
        width: '120px',
        align: 'center',
        render: (topic) => (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            {topic.cefr_level || 'B1-B2'}
          </span>
        ),
      },
      {
        key: 'lexical_count',
        title: 'Từ vựng',
        width: '120px',
        align: 'center',
        render: (topic) => (
          <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs">
            {topic.lexical_count || 0} từ
          </span>
        ),
      },
      {
        key: 'deck_count',
        title: 'Bộ thẻ liên kết',
        width: '150px',
        align: 'center',
        render: (topic) => {
          const topicId = topic.id || topic._id || ''
          return (
            <button
              type="button"
              onClick={() => onViewDecksOfTopic(topicId)}
              className="px-2.5 py-1 rounded-md bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 hover:bg-violet-100 font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{topic.deck_count || 0} bộ thẻ</span>
            </button>
          )
        },
      },
      {
        key: 'actions',
        title: 'Thao tác',
        width: '100px',
        align: 'center',
        sticky: 'right',
        render: (topic) => {
          const id = topic.id || topic._id || ''
          const topicName = topic.name_vi || topic.name_en || 'chủ đề này'
          return (
            <TableRowActions
              onEdit={() => onEditTopic(topic)}
              onDelete={() => onDeleteTopic(id)}
              deleteTitle={`Xóa chủ đề "${topicName}"?`}
              deleteDescription="Các liên kết từ vựng sẽ không bị mất."
            />
          )
        },
      },
    ],
    [onEditTopic, onViewDecksOfTopic, onDeleteTopic]
  )

  return (
    <DataTable<Topic>
      title={
        <div className="flex items-center gap-2">
          <span>Danh Sách Chủ Đề Từ Vựng (Topics)</span>
          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            {filteredTopics.length} chủ đề
          </span>
        </div>
      }
      subtitle="Phân loại từ vựng theo ngữ cảnh TOEIC. Nhấp vào chủ đề để xem và quản lý các bộ thẻ tương ứng."
      columns={columns}
      data={paginatedTopics}
      rowKey={(t) => t.id || t._id || ''}
      viewMode={viewMode}
      onViewModeChange={setViewMode}
      onResetFilters={() => {
        setSearchTopic('')
        setCurrentPage(1)
      }}
      extraActions={
        <button
          onClick={onCreateTopic}
          className="flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-xs transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Chủ Đề</span>
        </button>
      }
      filterSlot={
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTopic}
            onChange={(e) => {
              setSearchTopic(e.target.value)
              setCurrentPage(1)
            }}
            placeholder="Tìm chủ đề..."
            className="h-9 pl-8 pr-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 w-52 sm:w-64"
          />
        </div>
      }
      renderGridItem={(topic) => {
        const topicId = topic.id || topic._id || ''
        const deckCount = topic.deck_count ?? 0
        const wordCount = topic.lexical_count ?? 0

        return (
          <div
            key={topicId}
            onClick={() => onViewDecksOfTopic(topicId)}
            className="group p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-indigo-500/50 hover:shadow-md transition-all flex flex-col justify-between cursor-pointer min-h-[220px]"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200/50 dark:border-indigo-800/50 font-bold">
                  {topic.icon_url || topic.icon ? (
                    <span className="text-lg">{topic.icon_url || topic.icon}</span>
                  ) : (
                    <Folder className="w-5 h-5" />
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  {topic.is_featured && (
                    <span className="p-1 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400" aria-label="Chủ đề nổi bật">
                      <Sparkles className="w-3.5 h-3.5" />
                    </span>
                  )}
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                    {topic.cefr_level || 'B1-B2'}
                  </span>
                </div>
              </div>

              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {topic.name_vi || topic.name_en}
              </h4>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{topic.name_en}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-2">
                {topic.description_vi || topic.description || 'Chủ đề từ vựng trọng tâm trong đề thi TOEIC.'}
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-[11px]">
                  {wordCount} từ
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onViewDecksOfTopic(topicId)
                  }}
                  className="px-2 py-0.5 rounded-md bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 hover:bg-violet-100 font-semibold text-[11px] flex items-center gap-1 transition-colors"
                >
                  <Layers className="w-3 h-3" />
                  <span>{deckCount} bộ thẻ</span>
                </button>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onEditTopic(topic)
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Chỉnh sửa chủ đề"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => handleDelete(e, topic)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                  title="Xóa chủ đề"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )
      }}
      pagination={{
        currentPage,
        pageSize,
        totalItems: filteredTopics.length,
        onPageChange: setCurrentPage,
        onPageSizeChange: (limit) => {
          setPageSize(limit)
          setCurrentPage(1)
        },
      }}
    />
  )
}

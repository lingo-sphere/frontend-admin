/**
 * @file vocabulary.decks.tab.tsx
 * @description Component giao diện VocabularyDecksTab phục vụ khu vực Quản trị Admin, đồng bộ DataTable và phân trang như Khóa học.
 */

import { useState, useMemo, useCallback } from 'react'
import {
  Layers,
  Edit2,
  Plus,
  Trash2,
  Search,
  Filter,
  Sparkles,
  BookOpen,
} from 'lucide-react'
import type { FlashcardDeck, Topic } from '@/features/vocabulary/data/vocabulary.data'
import { DataTable, type DataTableColumn } from '@/components/data.table'
import { CustomSelect } from '@/components/custom.select'

interface VocabularyDecksTabProps {
  decks: FlashcardDeck[]
  topics: Topic[]
  selectedTopicId?: string
  onSelectTopicId: (topicId: string) => void
  onEditDeck: (deck: FlashcardDeck) => void
  onCreateDeck: (initialTopicId?: string) => void
  onDeleteDeck: (deckId: string) => void
  onManageCards: (deck: FlashcardDeck) => void
}

export function VocabularyDecksTab({
  decks,
  topics,
  selectedTopicId = 'ALL',
  onSelectTopicId,
  onEditDeck,
  onCreateDeck,
  onDeleteDeck,
  onManageCards,
}: VocabularyDecksTabProps) {
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('grid')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')

  const topicOptions = useMemo(() => [
    { value: 'ALL', label: `Tất cả chủ đề (${topics.length})` },
    ...topics.map((t) => ({
      value: t.id || t._id || '',
      label: t.name_vi || t.name_en || 'Chủ đề',
    })),
  ], [topics])

  // Filter decks by topic and search query
  const filteredDecks = useMemo(() => {
    return decks.filter((deck) => {
      // Filter by Topic
      if (selectedTopicId !== 'ALL') {
        const matchesTopic =
          deck.topic_id === selectedTopicId ||
          topics.find((t) => t.id === selectedTopicId || t._id === selectedTopicId)?.name_en?.toLowerCase() ===
            deck.topic_name?.toLowerCase()
        if (!matchesTopic) return false
      }

      // Filter by Search text
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim()
        const name = (deck.name_vi || deck.name || deck.title || '').toLowerCase()
        const desc = (deck.description_vi || deck.description || '').toLowerCase()
        if (!name.includes(q) && !desc.includes(q)) return false
      }

      return true
    })
  }, [decks, selectedTopicId, searchTerm, topics])

  const paginatedDecks = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredDecks.slice(start, start + pageSize)
  }, [filteredDecks, currentPage, pageSize])

  const selectedTopic = topics.find((t) => t.id === selectedTopicId || t._id === selectedTopicId)

  const handleDelete = useCallback(
    (e: React.MouseEvent, deck: FlashcardDeck) => {
      e.stopPropagation()
      const id = deck.id || deck._id
      if (!id) return
      const deckName = deck.name_vi || deck.name || 'bộ thẻ này'
      if (confirm(`Bạn có chắc chắn muốn xóa bộ thẻ "${deckName}"?`)) {
        onDeleteDeck(id)
      }
    },
    [onDeleteDeck]
  )

  const columns: DataTableColumn<FlashcardDeck>[] = useMemo(
    () => [
      {
        key: 'deck_info',
        title: 'Bộ thẻ',
        render: (deck) => {
          const isPublic = deck.visibility === 'PUBLIC' || deck.visibility === 'public'
          return (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 flex items-center justify-center border border-violet-200/50 dark:border-violet-800/50 font-bold shrink-0">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                    {deck.name_vi || deck.name || deck.title || 'Bộ thẻ từ vựng'}
                  </span>
                  {deck.is_featured && (
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" aria-label="Bộ thẻ nổi bật" />
                  )}
                  <span
                    className={`px-2 py-0.2 rounded-full text-[9px] font-bold border ${
                      isPublic
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {isPublic ? 'Công khai' : 'Riêng tư'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-1 max-w-sm">
                  {deck.description_vi || deck.description || 'Bộ từ vựng ôn tập hàng ngày'}
                </p>
              </div>
            </div>
          )
        },
      },
      {
        key: 'topic_name',
        title: 'Chủ đề',
        width: '160px',
        render: (deck) => {
          const deckTopic = topics.find((t) => t.id === deck.topic_id || t._id === deck.topic_id)
          const topicName = deckTopic?.name_vi || deckTopic?.name_en || deck.topic_name
          return topicName ? (
            <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200/40 dark:border-indigo-800/40">
              {topicName}
            </span>
          ) : (
            <span className="text-slate-400 text-xs">-</span>
          )
        },
      },
      {
        key: 'cefr_level',
        title: 'Khung CEFR',
        width: '120px',
        align: 'center',
        render: (deck) => (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {deck.cefr_level || 'B1-B2'}
          </span>
        ),
      },
      {
        key: 'card_count',
        title: 'Số thẻ ghi nhớ',
        width: '140px',
        align: 'center',
        render: (deck) => {
          const cardCount = deck.card_count ?? deck.total_cards ?? (deck.cards?.length || 0)
          return (
            <button
              type="button"
              onClick={() => onManageCards(deck)}
              className="px-2.5 py-1 rounded-md bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 hover:bg-violet-100 font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{cardCount} thẻ</span>
            </button>
          )
        },
      },
      {
        key: 'actions',
        title: 'Thao tác',
        width: '120px',
        align: 'right',
        sticky: 'right',
        render: (deck) => (
          <div className="flex items-center justify-end gap-1">
            <button
              type="button"
              onClick={() => onManageCards(deck)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-950/40 transition-colors cursor-pointer"
              title="Quản lý từ trong bộ thẻ"
            >
              <BookOpen className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onEditDeck(deck)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Chỉnh sửa thông tin bộ thẻ"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={(e) => handleDelete(e, deck)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
              title="Xóa bộ thẻ"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ),
      },
    ],
    [topics, onManageCards, onEditDeck, handleDelete]
  )

  return (
    <DataTable<FlashcardDeck>
      title={
        <div className="flex flex-wrap items-center gap-2">
          <span>Bộ Thẻ Flashcard Luyện Tập (Decks)</span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-violet-500/10 text-violet-600 dark:text-violet-400">
            {filteredDecks.length} bộ thẻ
          </span>
          {selectedTopic && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
              Chủ đề: {selectedTopic.name_vi || selectedTopic.name_en}
            </span>
          )}
        </div>
      }
      subtitle="Bộ thẻ tích hợp thuật toán Spaced Repetition (SRS). Nhấp vào bộ thẻ để quản lý danh sách từ vựng."
      columns={columns}
      data={paginatedDecks}
      rowKey={(d) => d.id || d._id || ''}
      viewMode={viewMode}
      onViewModeChange={setViewMode}
      onResetFilters={() => {
        onSelectTopicId('ALL')
        setSearchTerm('')
        setCurrentPage(1)
      }}
      extraActions={
        <button
          onClick={() => onCreateDeck(selectedTopicId !== 'ALL' ? selectedTopicId : undefined)}
          className="flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-xs transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo Bộ Thẻ Mới</span>
        </button>
      }
      filterSlot={
        <div className="flex flex-wrap items-center gap-2">
          <CustomSelect
            size="sm"
            value={selectedTopicId || 'ALL'}
            onChange={(val) => {
              onSelectTopicId(val)
              setCurrentPage(1)
            }}
            options={topicOptions}
            className="w-56"
          />

          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              placeholder="Tìm bộ thẻ..."
              className="h-9 pl-8 pr-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 w-40 sm:w-52"
            />
          </div>
        </div>
      }
      renderGridItem={(deck) => {
        const isPublic =
          deck.visibility === 'PUBLIC' || deck.visibility === 'public'
        const cardCount = deck.card_count ?? deck.total_cards ?? (deck.cards?.length || 0)
        const deckTopic = topics.find(
          (t) => t.id === deck.topic_id || t._id === deck.topic_id
        )

        return (
          <div
            key={deck.id || deck._id}
            onClick={() => onManageCards(deck)}
            className="group p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-violet-500/50 hover:shadow-md transition-all flex flex-col justify-between cursor-pointer min-h-[220px]"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 flex items-center justify-center border border-violet-200/50 dark:border-violet-800/50 font-bold">
                  <Layers className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-1.5">
                  {deck.is_featured && (
                    <span className="p-1 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400" aria-label="Bộ thẻ nổi bật">
                      <Sparkles className="w-3.5 h-3.5" />
                    </span>
                  )}
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      isPublic
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {isPublic ? 'Công khai' : 'Riêng tư'}
                  </span>
                </div>
              </div>

              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                {deck.name_vi || deck.name || deck.title || 'Bộ thẻ từ vựng'}
              </h4>

              <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                {(deckTopic || deck.topic_name) && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200/40 dark:border-indigo-800/40">
                    {deckTopic?.name_vi || deck.topic_name}
                  </span>
                )}
                {deck.cefr_level && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {deck.cefr_level}
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-2">
                {deck.description_vi || deck.description || 'Bộ từ vựng ôn tập hàng ngày theo kỹ thuật lặp lại ngắt quãng SRS.'}
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onManageCards(deck)
                }}
                className="flex items-center gap-1.5 text-xs font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-700 hover:underline cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>{cardCount} thẻ ghi nhớ</span>
              </button>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onEditDeck(deck)
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Chỉnh sửa thông tin bộ thẻ"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => handleDelete(e, deck)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                  title="Xóa bộ thẻ"
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
        totalItems: filteredDecks.length,
        onPageChange: setCurrentPage,
        onPageSizeChange: (limit) => {
          setPageSize(limit)
          setCurrentPage(1)
        },
      }}
    />
  )
}

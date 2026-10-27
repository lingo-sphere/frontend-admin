// Trang quản trị kho từ vựng và bộ thẻ trong giao diện Admin.
import { useState, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, RotateCcw, BookOpen, Bookmark, Layers, FileSpreadsheet, Volume2 } from 'lucide-react'
import { useReloadAnimation } from '@/hooks/use.reload.animation'
import { useDebounce } from '@/hooks/use.debounce'
import { DataTable } from '@/components/data.table'
import { AdminTabs } from '@/components/admin.tabs'
import { useNavigate } from 'react-router-dom'
import { toast } from '@/store/toast.store'
import type { LexicalItem, IpaSymbol, Topic, FlashcardDeck } from '@/features/vocabulary/data/vocabulary.data'
import { VocabularyFilterBar } from '@/features/vocabulary/components/vocabulary.filter.bar'
import { VocabularyTopicsTab } from '@/features/vocabulary/components/vocabulary.topics.tab'
import { VocabularyDecksTab } from '@/features/vocabulary/components/vocabulary.decks.tab'
import { VocabularyIpaTab } from '@/features/vocabulary/components/vocabulary.ipa.tab'
import { VocabularyDetailModal } from '@/features/vocabulary/components/vocabulary.detail.modal'
import { TopicFormModal } from '@/features/vocabulary/components/topic.form.modal'
import { DeckFormModal } from '@/features/vocabulary/components/deck.form.modal'
import { DeckCardsManagerModal } from '@/features/vocabulary/components/deck.cards.manager.modal'
import { getVocabularyColumns } from '@/features/vocabulary/components/vocabulary.table.columns'
import {
  useVocabularyWordsQuery,
  useVocabularyTopicsQuery,
  useVocabularyDecksQuery,
  useVocabularyIpaSymbolsQuery,
  useDeleteWordMutation,
  useDeleteTopicMutation,
  useDeleteDeckMutation,
} from '@/features/vocabulary/hooks/use.vocabulary.admin.query'

type VocabularyTabType = 'words' | 'topics' | 'decks' | 'ipa'

export function VocabularyPage() {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState<VocabularyTabType>('words')
  const [searchWord, setSearchWord] = useState<string>('')
  const debouncedSearch = useDebounce(searchWord, 300)
  const [filterLevel, setFilterLevel] = useState<string>('ALL')
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(20)

  const [detailModalId, setDetailModalId] = useState<string | null>(null)

  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false)
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null)

  const [isDeckModalOpen, setIsDeckModalOpen] = useState(false)
  const [editingDeck, setEditingDeck] = useState<FlashcardDeck | null>(null)
  const [initialDeckTopicId, setInitialDeckTopicId] = useState<string | undefined>(undefined)
  const [selectedTopicIdForDecks, setSelectedTopicIdForDecks] = useState<string>('ALL')

  const [isCardsManagerOpen, setIsCardsManagerOpen] = useState(false)
  const [selectedDeckForCards, setSelectedDeckForCards] = useState<FlashcardDeck | null>(null)
  const [sortKey, setSortKey] = useState<string | null>('word')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  const queryParams = useMemo(() => ({
    page: currentPage,
    limit: pageSize,
    q: debouncedSearch.trim() || undefined,
    cefr_level: filterLevel !== 'ALL' ? filterLevel : undefined,
    sort_by: sortKey || undefined,
    sort_order: sortOrder || undefined,
  }), [currentPage, pageSize, debouncedSearch, filterLevel, sortKey, sortOrder])

  const { data: wordsResponse, isLoading: isWordsLoading, refetch: refetchWords } = useVocabularyWordsQuery(queryParams)

  const { data: topics = [], isLoading: isTopicsLoading, refetch: refetchTopics } = useVocabularyTopicsQuery()
  const { data: decks = [], isLoading: isDecksLoading, refetch: refetchDecks } = useVocabularyDecksQuery()
  const { data: ipaSymbols = [], isLoading: isIpaLoading, refetch: refetchIpa } = useVocabularyIpaSymbolsQuery()

  const { mutateAsync: deleteWordMutate } = useDeleteWordMutation()
  const { mutateAsync: deleteTopicMutate } = useDeleteTopicMutation()
  const { mutateAsync: deleteDeckMutate } = useDeleteDeckMutation()

  const isLoading = isWordsLoading || isTopicsLoading || isDecksLoading || isIpaLoading

  const words: LexicalItem[] = wordsResponse?.items || []
  const totalWords: number = wordsResponse?.total || 0

  const { isReloading: isRefreshing, trigger: handleRefresh } = useReloadAnimation(async () => {
    await Promise.all([refetchWords(), refetchTopics(), refetchDecks(), refetchIpa()])
  })

  const handleEditIpaSymbol = (_symbol: IpaSymbol) => {
    toast.info(isVi ? 'Vào chi tiết IPA để chỉnh sửa mô tả.' : 'Open IPA detail to edit description.')
  }

  const handleDeleteWord = useCallback(async (wordId: string) => {
    try {
      await deleteWordMutate(wordId)
      toast.success('Đã xóa từ vựng thành công!')
    } catch {
      toast.error('Xóa từ vựng thất bại')
    }
  }, [deleteWordMutate])

  // Topic handlers
  const handleCreateTopic = () => {
    setEditingTopic(null)
    setIsTopicModalOpen(true)
  }

  const handleEditTopic = (topic: Topic) => {
    setEditingTopic(topic)
    setIsTopicModalOpen(true)
  }

  const handleDeleteTopic = async (topicId: string) => {
    try {
      await deleteTopicMutate(topicId)
      toast.success('Đã xóa chủ đề thành công!')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể xóa chủ đề này'
      toast.error(msg)
    }
  }

  const handleViewDecksOfTopic = (topicId: string) => {
    setSelectedTopicIdForDecks(topicId)
    setActiveTab('decks')
  }

  // Deck handlers
  const handleCreateDeck = (initialTopicId?: string) => {
    setEditingDeck(null)
    setInitialDeckTopicId(initialTopicId)
    setIsDeckModalOpen(true)
  }

  const handleEditDeck = (deck: FlashcardDeck) => {
    setEditingDeck(deck)
    setIsDeckModalOpen(true)
  }

  const handleDeleteDeck = async (deckId: string) => {
    try {
      await deleteDeckMutate(deckId)
      toast.success('Đã xóa bộ thẻ thành công!')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể xóa bộ thẻ'
      toast.error(msg)
    }
  }

  const handleManageCards = (deck: FlashcardDeck) => {
    setSelectedDeckForCards(deck)
    setIsCardsManagerOpen(true)
  }

  const handleResetFilters = async () => {
    setSearchWord('')
    setFilterLevel('ALL')
    setSortKey('word')
    setSortOrder('asc')
    setCurrentPage(1)
    await refetchWords()
    toast.success(isVi ? 'Đã đặt lại bộ lọc và tải lại từ vựng' : 'Vocabulary filters reset')
  }

  const columns = useMemo(() => {
    return getVocabularyColumns({
      isVi,
      onEditWord: (wordId) => navigate(`/vocabulary/${wordId}/edit`),
      onDeleteWord: handleDeleteWord,
    })
  }, [isVi, navigate, handleDeleteWord])

  return (
    <div className="space-y-6">
      {/* Vocabulary Detail Modal */}
      <VocabularyDetailModal
        isOpen={!!detailModalId}
        onClose={() => setDetailModalId(null)}
        vocabularyId={detailModalId}
        onEdit={(id) => navigate(`/vocabulary/${id}/edit`)}
      />

      {/* Topic Create / Edit Modal */}
      <TopicFormModal
        isOpen={isTopicModalOpen}
        onClose={() => setIsTopicModalOpen(false)}
        topic={editingTopic}
        onSuccess={() => refetchTopics()}
      />

      {/* Deck Create / Edit Modal */}
      <DeckFormModal
        isOpen={isDeckModalOpen}
        onClose={() => setIsDeckModalOpen(false)}
        deck={editingDeck}
        initialTopicId={initialDeckTopicId}
        topics={topics}
        onSuccess={() => {
          refetchDecks()
          refetchTopics()
        }}
      />

      {/* Deck Cards Manager Modal */}
      <DeckCardsManagerModal
        isOpen={isCardsManagerOpen}
        onClose={() => {
          setIsCardsManagerOpen(false)
          refetchDecks()
        }}
        deck={selectedDeckForCards}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            {isVi ? 'Kho Từ Vựng & Bộ Thẻ Flashcard' : 'Vocabulary & Flashcard Decks'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isVi
              ? 'Quản lý từ vựng chuẩn khung CEFR (A1-C2), bảng phát âm IPA, bộ thẻ ôn tập và chủ đề'
              : 'Manage CEFR standard vocabulary (A1-C2), IPA phonetics, review decks, and topic categories'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => handleRefresh()}
            disabled={isRefreshing}
            className="flex items-center gap-2 h-10 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer disabled:opacity-60"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-teal-500' : ''}`} />
            <span>{isVi ? 'Làm mới' : 'Refresh'}</span>
          </button>
          <button
            onClick={() => navigate('/vocabulary/import')}
            className="flex items-center gap-2 h-10 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-teal-500" />
            <span>{isVi ? 'Nhập File CSV' : 'Import CSV'}</span>
          </button>
          <button
            onClick={() => navigate('/vocabulary/create')}
            className="flex items-center gap-2 h-10 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isVi ? 'Thêm Từ Vựng Mới' : 'Add New Word'}</span>
          </button>
        </div>
      </div>

      <AdminTabs
        activeKey={activeTab}
        onChange={(k) => setActiveTab(k as VocabularyTabType)}
        items={[
          {
            key: 'words',
            label: isVi ? 'Kho từ vựng' : 'Word Bank',
            count: totalWords.toLocaleString(),
            icon: BookOpen,
          },
          {
            key: 'topics',
            label: isVi ? 'Chủ đề' : 'Topics',
            count: topics.length,
            icon: Bookmark,
          },
          {
            key: 'decks',
            label: isVi ? 'Bộ thẻ' : 'Decks',
            count: decks.length,
            icon: Layers,
          },
          {
            key: 'ipa',
            label: isVi ? 'Bảng IPA' : 'IPA Chart',
            count: ipaSymbols.length,
            icon: Volume2,
          },
        ]}
      />

      {activeTab === 'words' && (
        <DataTable<LexicalItem>
          columns={columns}
          data={words}
          rowKey={(w) => w.id}
          isLoading={isLoading}
          sortKey={sortKey}
          sortOrder={sortOrder}
          onSortChange={(k, o) => {
            setSortKey(k)
            setSortOrder(o || 'asc')
            setCurrentPage(1)
          }}
          onRowClick={(word) => setDetailModalId(word.id)}
          onResetFilters={handleResetFilters}
          filterSlot={
            <VocabularyFilterBar
              searchWord={searchWord}
              onSearchChange={(val) => {
                setSearchWord(val)
                setCurrentPage(1)
              }}
              filterLevel={filterLevel}
              onLevelChange={(val) => {
                setFilterLevel(val)
                setCurrentPage(1)
              }}
            />
          }
          pagination={{
            currentPage,
            pageSize,
            totalItems: totalWords,
            onPageChange: setCurrentPage,
            onPageSizeChange: (size) => {
              setPageSize(size)
              setCurrentPage(1)
            },
          }}
        />
      )}

      {activeTab === 'topics' && (
        <VocabularyTopicsTab
          topics={topics}
          onCreateTopic={handleCreateTopic}
          onEditTopic={handleEditTopic}
          onDeleteTopic={handleDeleteTopic}
          onViewDecksOfTopic={handleViewDecksOfTopic}
        />
      )}

      {activeTab === 'decks' && (
        <VocabularyDecksTab
          decks={decks}
          topics={topics}
          selectedTopicId={selectedTopicIdForDecks}
          onSelectTopicId={setSelectedTopicIdForDecks}
          onCreateDeck={handleCreateDeck}
          onEditDeck={handleEditDeck}
          onDeleteDeck={handleDeleteDeck}
          onManageCards={handleManageCards}
        />
      )}

      {activeTab === 'ipa' && <VocabularyIpaTab onEditIpaSymbol={handleEditIpaSymbol} />}
    </div>
  )
}

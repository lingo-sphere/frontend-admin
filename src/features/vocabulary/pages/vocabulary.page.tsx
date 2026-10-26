// Trang quản trị kho từ vựng và bộ thẻ trong giao diện Admin.
import { useState, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, RotateCcw, BookOpen, Bookmark, Layers, FileSpreadsheet, Volume2 } from 'lucide-react'
import { useReloadAnimation } from '@/hooks/use.reload.animation'
import { DataTable } from '@/components/data.table'
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
  const [filterLevel, setFilterLevel] = useState<string>('ALL')
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(20)

  // Modals state
  const [detailModalId, setDetailModalId] = useState<string | null>(null)

  // Topic modals state
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false)
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null)

  // Deck modals state
  const [isDeckModalOpen, setIsDeckModalOpen] = useState(false)
  const [editingDeck, setEditingDeck] = useState<FlashcardDeck | null>(null)
  const [initialDeckTopicId, setInitialDeckTopicId] = useState<string | undefined>(undefined)
  const [selectedTopicIdForDecks, setSelectedTopicIdForDecks] = useState<string>('ALL')

  // Cards Manager modal state
  const [isCardsManagerOpen, setIsCardsManagerOpen] = useState(false)
  const [selectedDeckForCards, setSelectedDeckForCards] = useState<FlashcardDeck | null>(null)

  // Server-side query với params
  const { data: wordsResponse, isLoading: isWordsLoading, refetch: refetchWords } = useVocabularyWordsQuery({
    page: currentPage,
    limit: pageSize,
    q: searchWord || undefined,
    cefr_level: filterLevel !== 'ALL' ? filterLevel : undefined,
  })

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

      <div className="flex items-center gap-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 w-fit">
        <button
          onClick={() => setActiveTab('words')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'words'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>
            {isVi ? `Kho từ vựng (${totalWords.toLocaleString()})` : `Word Bank (${totalWords.toLocaleString()})`}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('topics')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'topics'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5" />
          <span>
            {isVi ? `Chủ đề (${topics.length})` : `Topics (${topics.length})`}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('decks')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'decks'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>
            {isVi ? `Bộ thẻ (${decks.length})` : `Decks (${decks.length})`}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('ipa')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'ipa'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Volume2 className="w-3.5 h-3.5" />
          <span>
            {isVi ? `Bảng IPA (${ipaSymbols.length})` : `IPA Chart (${ipaSymbols.length})`}
          </span>
        </button>
      </div>

      {activeTab === 'words' && (
        <DataTable<LexicalItem>
          columns={columns}
          data={words}
          rowKey={(w) => w.id}
          isLoading={isLoading}
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

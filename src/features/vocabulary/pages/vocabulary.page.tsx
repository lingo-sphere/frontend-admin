// Trang quản trị kho từ vựng và bộ thẻ trong giao diện Admin.
import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, RotateCcw, BookOpen, Bookmark, Layers, FileSpreadsheet } from 'lucide-react'
import { DataTable } from '@/components/data.table'
import { useNavigate } from 'react-router-dom'
import { toast } from '@/store/toast.store'
import type { LexicalItem } from '@/features/vocabulary/data/vocabulary.data'
import { VocabularyFilterBar } from '@/features/vocabulary/components/vocabulary.filter.bar'
import { VocabularyTopicsTab } from '@/features/vocabulary/components/vocabulary.topics.tab'
import { VocabularyDecksTab } from '@/features/vocabulary/components/vocabulary.decks.tab'
import { getVocabularyColumns } from '@/features/vocabulary/components/vocabulary.table.columns'
import {
  useVocabularyWordsQuery,
  useVocabularyTopicsQuery,
  useVocabularyDecksQuery,
  useDeleteWordMutation,
} from '@/features/vocabulary/hooks/use.vocabulary.admin.query'

type VocabularyTabType = 'words' | 'topics' | 'decks'

export function VocabularyPage() {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState<VocabularyTabType>('words')

  const { data: words = [], isLoading: isWordsLoading, refetch: refetchWords } = useVocabularyWordsQuery()
  const { data: topics = [], isLoading: isTopicsLoading, refetch: refetchTopics } = useVocabularyTopicsQuery()
  const { data: decks = [], isLoading: isDecksLoading, refetch: refetchDecks } = useVocabularyDecksQuery()
  const { mutateAsync: deleteWordMutate } = useDeleteWordMutation()

  const isLoading = isWordsLoading || isTopicsLoading || isDecksLoading

  const [searchWord, setSearchWord] = useState<string>('')
  const [filterLevel, setFilterLevel] = useState<string>('ALL')
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(10)
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null)

  const handleRefresh = async () => {
    await Promise.all([refetchWords(), refetchTopics(), refetchDecks()])
  }

  const filteredWords = useMemo(() => {
    const list = words.filter((w) => {
      const matchSearch =
        w.word.toLowerCase().includes(searchWord.toLowerCase()) ||
        (w.word_type || '').toLowerCase().includes(searchWord.toLowerCase())
      const matchLevel = filterLevel === 'ALL' || w.cefr_level === filterLevel
      return matchSearch && matchLevel
    })

    if (!sortKey || !sortOrder) return list

    return [...list].sort((a, b) => {
      if (sortKey === 'word') {
        const comp = a.word.toLowerCase().localeCompare(b.word.toLowerCase())
        return sortOrder === 'asc' ? comp : -comp
      }
      return 0
    })
  }, [words, searchWord, filterLevel, sortKey, sortOrder])

  const paginatedWords = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredWords.slice(start, start + pageSize)
  }, [filteredWords, currentPage, pageSize])

  const handleDeleteWord = async (wordId: string) => {
    try {
      await deleteWordMutate(wordId)
      toast.success('Đã xóa từ vựng thành công!')
    } catch {
      toast.error('Xóa từ vựng thất bại')
    }
  }

  const handleResetFilters = () => {
    setSearchWord('')
    setFilterLevel('ALL')
    setSortKey(null)
    setSortOrder(null)
    setCurrentPage(1)
  }

  const columns = useMemo(() => {
    return getVocabularyColumns({
      isVi,
      onEditWord: (wordId) => navigate(`/vocabulary/${wordId}/edit`),
      onDeleteWord: handleDeleteWord,
    })
  }, [isVi, navigate])

  return (
    <div className="space-y-6">
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
            onClick={handleRefresh}
            className="flex items-center gap-2 h-10 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-teal-500' : ''}`} />
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
            {isVi ? `Kho từ vựng (${words.length})` : `Word Bank (${words.length})`}
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
            {isVi ? `Bộ thẻ công khai (${decks.length})` : `Public Decks (${decks.length})`}
          </span>
        </button>
      </div>

      {activeTab === 'words' && (
        <DataTable<LexicalItem>
          columns={columns}
          data={paginatedWords}
          rowKey={(w) => w.id}
          isLoading={isLoading}
          sortKey={sortKey}
          sortOrder={sortOrder}
          onSortChange={(k, o) => {
            setSortKey(k)
            setSortOrder(o)
            setCurrentPage(1)
          }}
          onResetFilters={handleResetFilters}
          filterSlot={
            <VocabularyFilterBar
              searchWord={searchWord}
              onSearchChange={setSearchWord}
              filterLevel={filterLevel}
              onLevelChange={setFilterLevel}
            />
          }
          pagination={{
            currentPage,
            pageSize,
            totalItems: filteredWords.length,
            onPageChange: setCurrentPage,
            onPageSizeChange: (size) => {
              setPageSize(size)
              setCurrentPage(1)
            },
          }}
        />
      )}

      {activeTab === 'topics' && <VocabularyTopicsTab topics={topics} />}

      {activeTab === 'decks' && <VocabularyDecksTab decks={decks} />}
    </div>
  )
}

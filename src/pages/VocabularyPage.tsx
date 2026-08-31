import { useState, useMemo, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { BookOpen, Bookmark, Layers, RotateCcw, FileSpreadsheet, Plus } from 'lucide-react'
import { DataTable } from '@/components/common/DataTable'
import { useAdminStore } from '@/store/admin-store'
import { vocabularyService } from '@/services/vocabulary.service'
import { toast } from '@/store/toast-store'
import type { LexicalItem, Topic, FlashcardDeck } from '@/data/vocabulary-data'
import type {
  LexicalItem as ApiLexicalItem,
  Topic as ApiTopic,
  FlashcardDeck as ApiFlashcardDeck,
} from '@/types/api.types'

import type { VocabularyTabType } from '@/helpers/vocabulary.helper'
import { VocabularyFilterBar } from '@/components/vocabulary/VocabularyFilterBar'
import { getVocabularyColumns } from '@/components/vocabulary/vocabulary-table-columns'
import { VocabularyTopicsTab } from '@/components/vocabulary/VocabularyTopicsTab'
import { VocabularyDecksTab } from '@/components/vocabulary/VocabularyDecksTab'

export function VocabularyPage() {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'
  const setActiveNavItem = useAdminStore((state) => state.setActiveNavItem)

  const [activeTab, setActiveTab] = useState<VocabularyTabType>('words')
  const [words, setWords] = useState<LexicalItem[]>([])
  const [topics, setTopics] = useState<Topic[]>([])
  const [decks, setDecks] = useState<FlashcardDeck[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const [searchWord, setSearchWord] = useState<string>('')
  const [filterLevel, setFilterLevel] = useState<string>('ALL')
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(10)
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null)

  const fetchVocabularyData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [wordsRes, topicsRes, decksRes] = await Promise.allSettled([
        vocabularyService.searchVocabulary(),
        vocabularyService.getAllTopics(),
        vocabularyService.getAllFlashcardDecks(),
      ])

      if (wordsRes.status === 'fulfilled' && wordsRes.value) {
        const mapped: LexicalItem[] = wordsRes.value.map((w: ApiLexicalItem) => ({
          id: w._id,
          word: w.word,
          word_type: w.word_type,
          cefr_level: w.cefr_level,
          pronunciation_us: w.pronunciation_us,
          pronunciation_uk: w.pronunciation_uk,
          audio_url_us: w.audio_url_us,
          created_at: w.created_at,
        }))
        setWords(mapped)
      }

      if (topicsRes.status === 'fulfilled' && topicsRes.value) {
        const mappedTopics: Topic[] = topicsRes.value.map((t: ApiTopic) => ({
          id: t._id,
          name_vi: t.name_vi || t.name,
          name_en: t.name,
          slug: t.slug,
          description: t.description || '',
          icon: t.icon_url,
          is_featured: t.is_featured,
          status: t.status,
          lexical_count: t.words_count || 0,
          created_at: t.created_at || new Date().toISOString(),
        }))
        setTopics(mappedTopics)
      }

      if (decksRes.status === 'fulfilled' && decksRes.value) {
        const mappedDecks: FlashcardDeck[] = decksRes.value.map((d: ApiFlashcardDeck) => ({
          id: d._id,
          creator_name: 'LingoSphere Master',
          name_vi: d.title,
          name_en: d.title,
          description: d.description || '',
          card_count: d.total_cards || 0,
          created_at: d.created_at || new Date().toISOString(),
        }))
        setDecks(mappedDecks)
      }
    } catch {
      toast.error('Lỗi khi tải dữ liệu từ vựng')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchVocabularyData()
  }, [fetchVocabularyData])

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
      if (sortKey === 'cefr') {
        const comp = (a.cefr_level || 'A1').localeCompare(b.cefr_level || 'A1')
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
      await vocabularyService.deleteLexicalItem(wordId)
      setWords((prev) => prev.filter((w) => w.id !== wordId))
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
      onEditWord: (wordId) => setActiveNavItem(`vocab-edit:${wordId}`),
      onDeleteWord: handleDeleteWord,
    })
  }, [isVi, setActiveNavItem])

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
            onClick={fetchVocabularyData}
            className="flex items-center gap-2 h-10 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-teal-500' : ''}`} />
            <span>{isVi ? 'Làm mới' : 'Refresh'}</span>
          </button>
          <button
            onClick={() => setActiveNavItem('vocabulary-import')}
            className="flex items-center gap-2 h-10 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-teal-500" />
            <span>{isVi ? 'Nhập File CSV' : 'Import CSV'}</span>
          </button>
          <button
            onClick={() => setActiveNavItem('vocab-create')}
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

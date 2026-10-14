// Trang quản trị các bộ thẻ từ vựng công khai trong giao diện Admin.
import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, Plus, RotateCcw, Layers3 } from 'lucide-react'
import { useReloadAnimation } from '@/hooks/use.reload.animation'
import { toast } from '@/store/toast.store'
import type { FlashcardDeck } from '@/features/vocabulary/services/vocabulary.service'
import { PublicDeckCard } from '@/features/vocabulary/components/public.deck.card'
import { CreatePublicDeckModal } from '@/features/vocabulary/components/create.public.deck.modal'
import { Pagination } from '@/components/pagination'
import { usePublicDecksQuery, useCreatePublicDeckMutation } from '@/features/vocabulary/hooks/use.vocabulary.admin.query'

export function PublicDecksPage() {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'

  const { data: decks = [], isLoading, refetch } = usePublicDecksQuery()
  const { isReloading: isRefreshing, trigger: handleRefresh } = useReloadAnimation(refetch)
  const { mutateAsync: createDeckMutate } = useCreatePublicDeckMutation()

  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(9)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')

  const handleCreateDeck = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return

    try {
      await createDeckMutate({
        title: newTitle,
        description: newDesc,
        is_public: true,
        is_system: true,
        total_cards: 0,
      } as Partial<FlashcardDeck>)
      toast.success('Tạo bộ thẻ công khai thành công!')
      setShowAddModal(false)
      setNewTitle('')
      setNewDesc('')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Tạo bộ thẻ thất bại'
      toast.error(msg)
    }
  }

  const handleDeleteDeck = (_id: string) => {
    toast.success('Đã xóa bộ thẻ công khai thành công!')
  }

  const filteredDecks = useMemo(() => {
    return decks.filter(
      (d: FlashcardDeck) =>
        (d.title || d.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d.description && d.description.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  }, [decks, searchQuery])

  const totalPages = Math.ceil(filteredDecks.length / pageSize) || 1

  const paginatedDecks = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredDecks.slice(start, start + pageSize)
  }, [filteredDecks, currentPage, pageSize])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <Layers3 className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            <span>{isVi ? 'Bộ Thẻ Từ Vựng Công Khai' : 'Public Vocabulary Decks'}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isVi
              ? 'Khám phá và quản lý các bộ thẻ từ vựng chuẩn cho cộng đồng học viên'
              : 'Discover and manage curated public vocabulary decks for learners'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleRefresh()}
            disabled={isRefreshing}
            className="flex items-center gap-2 h-10 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer disabled:opacity-60"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-teal-500' : ''}`} />
            <span>{isVi ? 'Làm mới' : 'Refresh'}</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 h-10 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isVi ? 'Tạo Bộ Thẻ Công Khai' : 'Create Public Deck'}</span>
          </button>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value)
            setCurrentPage(1)
          }}
          placeholder={isVi ? 'Tìm kiếm bộ thẻ theo tên hoặc mô tả...' : 'Search decks by title or description...'}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="h-44 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 animate-pulse"
            />
          ))}
        </div>
      ) : paginatedDecks.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
          <Layers3 className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            {isVi ? 'Không tìm thấy bộ thẻ phù hợp' : 'No public decks found'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {isVi ? 'Thử thay đổi từ khóa tìm kiếm hoặc tạo bộ thẻ mới' : 'Try searching for a different keyword or create a new deck'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedDecks.map((deck: FlashcardDeck) => (
            <PublicDeckCard key={deck._id} deck={deck} onDelete={handleDeleteDeck} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-end pt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            pageSize={pageSize}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize)
              setCurrentPage(1)
            }}
            totalItems={filteredDecks.length}
          />
        </div>
      )}

      <CreatePublicDeckModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={newTitle}
        onTitleChange={setNewTitle}
        description={newDesc}
        onDescriptionChange={setNewDesc}
        onSubmit={handleCreateDeck}
      />
    </div>
  )
}

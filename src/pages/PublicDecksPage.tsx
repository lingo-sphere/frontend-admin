/**
 * @file PublicDecksPage.tsx
 * @description Trang quản trị PublicDecksPage trong giao diện Admin
 */

import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, Plus, RotateCcw, Layers3 } from 'lucide-react'
import { vocabularyService } from '@/services/vocabulary.service'
import { toast } from '@/store/toast-store'
import type { FlashcardDeck } from '@/types/api.types'
import { PublicDeckCard } from '@/components/vocabulary/PublicDeckCard'
import { CreatePublicDeckModal } from '@/components/vocabulary/CreatePublicDeckModal'
import { Pagination } from '@/components/common/Pagination'

export function PublicDecksPage() {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'

  const [decks, setDecks] = useState<FlashcardDeck[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(9)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')

  const fetchDecks = async () => {
    setIsLoading(true)
    try {
      const realDecks = await vocabularyService.explorePublicDecks()
      if (realDecks) {
        setDecks(realDecks)
      }
    } catch {
      setDecks([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDecks()
  }, [])

  const handleCreateDeck = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return

    try {
      const created = await vocabularyService.createFlashcardDeck({
        title: newTitle,
        description: newDesc,
        is_public: true,
        is_system: true,
        total_cards: 0,
      })
      setDecks([created, ...decks])
      toast.success('Tạo bộ thẻ công khai thành công!')
      setShowAddModal(false)
      setNewTitle('')
      setNewDesc('')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Tạo bộ thẻ thất bại'
      toast.error(msg)
    }
  }

  const handleDeleteDeck = (id: string) => {
    setDecks((prev) => prev.filter((d) => (d._id || '') !== id))
    toast.success('Đã xóa bộ thẻ công khai thành công!')
  }

  const filteredDecks = useMemo(() => {
    return decks.filter(
      (d) =>
        d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
              : 'Explore and manage official public flashcard decks for learners'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchDecks}
            className="flex items-center gap-2 h-10 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
          >
            <RotateCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 h-10 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isVi ? 'Tạo bộ thẻ công khai' : 'Create Public Deck'}</span>
          </button>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={isVi ? 'Tìm kiếm bộ thẻ theo tên, mô tả...' : 'Search decks by name, description...'}
          className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginatedDecks.length === 0 ? (
          <div className="col-span-full p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400">
            {isVi ? 'Không tìm thấy bộ thẻ công khai nào' : 'No public decks found'}
          </div>
        ) : (
          paginatedDecks.map((deck) => (
            <PublicDeckCard
              key={deck._id || ''}
              deck={deck}
              onDelete={handleDeleteDeck}
            />
          ))
        )}
      </div>

      {filteredDecks.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          pageSizeOptions={[6, 9, 18, 36]}
          totalItems={filteredDecks.length}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => {
            setPageSize(size)
            setCurrentPage(1)
          }}
        />
      )}

      <CreatePublicDeckModal
        isOpen={showAddModal}
        title={newTitle}
        description={newDesc}
        onTitleChange={setNewTitle}
        onDescriptionChange={setNewDesc}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleCreateDeck}
      />
    </div>
  )
}

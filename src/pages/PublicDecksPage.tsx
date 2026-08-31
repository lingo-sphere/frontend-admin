import { useState, useEffect } from 'react'
import { Search, Plus, RotateCcw, Layers3 } from 'lucide-react'
import { vocabularyService } from '@/services/vocabulary.service'
import { toast } from '@/store/toast-store'
import type { FlashcardDeck } from '@/types/api.types'
import { PublicDeckCard } from '@/components/vocabulary/PublicDeckCard'
import { CreatePublicDeckModal } from '@/components/vocabulary/CreatePublicDeckModal'

export function PublicDecksPage() {
  const [decks, setDecks] = useState<FlashcardDeck[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
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
    toast.success('Đã xóa bộ thẻ công khai')
  }

  const filteredDecks = decks.filter(
    (d) =>
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.description && d.description.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <Layers3 className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            <span>Bộ Thẻ Từ Vựng Công Khai (Public Decks)</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Quản lý các bộ thẻ từ vựng chuẩn do hệ thống hoặc giáo viên xuất bản cho toàn bộ cộng đồng
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchDecks}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            title="Làm mới"
          >
            <RotateCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 h-10 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo bộ thẻ công khai</span>
          </button>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Tìm kiếm bộ thẻ theo tên, mô tả..."
          className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDecks.length === 0 ? (
          <div className="col-span-full p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400">
            Không tìm thấy bộ thẻ công khai nào
          </div>
        ) : (
          filteredDecks.map((deck) => (
            <PublicDeckCard
              key={deck._id || ''}
              deck={deck}
              onDelete={handleDeleteDeck}
            />
          ))
        )}
      </div>

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

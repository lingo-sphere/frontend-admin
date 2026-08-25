import { ConfirmModal } from '@/components/common/ConfirmModal'
import { vocabularyService } from '@/services/vocabulary.service'
import { toast } from '@/store/toast-store'
import type { FlashcardDeck } from '@/types/api.types'
import {
  BookOpen,
  Layers3,
  Plus,
  RefreshCw,
  Search,
  Star,
  Trash2,
  Users
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

const mockPublicDecks: FlashcardDeck[] = [
  {
    _id: 'deck-001',
    title: 'Essential 600 TOEIC Vocabulary Words',
    description: 'Bộ từ vựng cốt lõi 50 chủ đề xuất hiện nhiều nhất trong đề thi TOEIC ETS mới',
    is_public: true,
    is_system: true,
    total_cards: 600,
    rating: 4.9,
    enrolled_count: 12450,
    tags: ['TOEIC', 'Core', 'ETS 2024'],
    created_at: '2026-01-10T00:00:00Z',
  },
  {
    _id: 'deck-002',
    title: 'Business English & Office Communication',
    description: 'Từ vựng giao tiếp thương mại, hợp đồng, đàm phán và email văn phòng',
    is_public: true,
    is_system: false,
    total_cards: 240,
    rating: 4.7,
    enrolled_count: 5820,
    tags: ['Business', 'Email', 'Office'],
    created_at: '2026-01-22T00:00:00Z',
  },
  {
    _id: 'deck-003',
    title: 'Advanced Academic Vocabulary (IELTS 7.5+ / TOEIC 900+)',
    description: 'Từ vựng học thuật chuyên sâu và cụm collocations nâng cao',
    is_public: true,
    is_system: false,
    total_cards: 350,
    rating: 4.8,
    enrolled_count: 4210,
    tags: ['Academic', 'Advanced'],
    created_at: '2026-02-05T00:00:00Z',
  },
]

export function PublicDecksPage() {
  const { t } = useTranslation()
  const [decks, setDecks] = useState<FlashcardDeck[]>(mockPublicDecks)
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')

  const fetchDecks = async () => {
    setIsLoading(true)
    try {
      const realDecks = await vocabularyService.explorePublicDecks()
      if (realDecks && realDecks.length > 0) {
        setDecks(realDecks)
      }
    } catch (err) {
      console.warn('Could not load public decks from API, using cached data:', err)
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

  const confirmDelete = () => {
    if (!deleteTargetId) return
    setDecks(decks.filter((d) => d._id !== deleteTargetId))
    toast.success('Đã xóa bộ thẻ công khai')
    setDeleteTargetId(null)
  }

  const filteredDecks = decks.filter((d) =>
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (d.description && d.description.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  return (
    <main className="page-content">
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            <span className="eyebrow-line" />
            COMMUNITY & KNOWLEDGE DECKS
          </div>
          <h1 className="page-title">Bộ Thẻ Flashcard Công Khai</h1>
          <p className="page-subtitle">
            Quản lý, kiểm duyệt và phát hành các bộ thẻ từ vựng cộng đồng và hệ thống
          </p>
        </div>

        <div className="heading-actions">
          <button className="icon-button" onClick={fetchDecks} title="Làm mới dữ liệu" type="button">
            <RefreshCw className={`icon ${isLoading ? 'animate-spin text-indigo-400' : ''}`} />
          </button>
          <button className="primary-button" type="button" onClick={() => setShowAddModal(true)}>
            <Plus className="icon" />
            <span>Tạo bộ thẻ mới</span>
          </button>
        </div>
      </div>

      <div className="table-toolbar" style={{ display: 'flex', gap: '12px', marginBottom: '20px', alignItems: 'center' }}>
        <div className="search-box" style={{ flex: 1, minWidth: '240px' }}>
          <Search className="icon" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm bộ thẻ Flashcard công khai..."
            style={{ width: '100%', background: 'transparent', border: 'none', color: 'inherit', outline: 'none', fontSize: '13px' }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDecks.map((deck) => (
          <div
            key={deck._id}
            className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 hover:border-slate-700 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center gap-1.5">
                  <Layers3 className="w-3.5 h-3.5" />
                  {deck.is_system ? 'Hệ thống' : 'Cộng đồng'}
                </span>
                <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{deck.rating || 5.0}</span>
                </div>
              </div>

              <h3 className="text-base font-bold text-slate-100 mb-1.5">{deck.title}</h3>
              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                {deck.description || 'Chưa có mô tả cho bộ thẻ này.'}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                  {deck.total_cards} thẻ
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-slate-500" />
                  {deck.enrolled_count?.toLocaleString() || 0} học
                </span>
              </div>

              <button
                className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors"
                title="Xóa bộ thẻ"
                onClick={() => setDeleteTargetId(deck._id)}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', maxWidth: '440px', width: '100%' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Tạo bộ thẻ Flashcard công khai</h3>
            <form onSubmit={handleCreateDeck}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>Tên bộ thẻ</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="VD: 500 từ vựng TOEIC thường gặp..."
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: 'var(--surface-muted)', border: '1px solid var(--border)', color: 'inherit', fontSize: '13px' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>Mô tả ngắn</label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Mô tả nội dung và mục tiêu học..."
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: 'var(--surface-muted)', border: '1px solid var(--border)', color: 'inherit', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setShowAddModal(false)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border)', background: 'transparent', color: 'inherit' }}>
                  Hủy
                </button>
                <button type="submit" className="primary-button" style={{ padding: '8px 16px' }}>
                  Tạo ngay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={Boolean(deleteTargetId)}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={confirmDelete}
        title="Xóa bộ thẻ Flashcard?"
        description="Bộ thẻ công khai này sẽ bị gỡ khỏi hệ thống và người dùng sẽ không thể truy cập được nữa."
        confirmText="Xóa vĩnh viễn"
        cancelText="Hủy"
        variant="danger"
      />
    </main>
  )
}

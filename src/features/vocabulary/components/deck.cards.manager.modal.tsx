import { useState, useMemo } from 'react'
import {
  X,
  Layers,
  Search,
  Plus,
  Trash2,
  Volume2,
  Loader2,
  BookOpen,
  Folder,
} from 'lucide-react'
import type { FlashcardDeck, LexicalItem } from '@/features/vocabulary/data/vocabulary.data'
import {
  useDeckDetailsQuery,
  useAddCardToDeckMutation,
  useRemoveCardFromDeckMutation,
} from '@/features/vocabulary/hooks/use.vocabulary.admin.query'
import { vocabularyService } from '@/features/vocabulary/services/vocabulary.service'
import { playAudio } from '@/features/vocabulary/helpers/vocabulary.helper'
import { toast } from '@/store/toast.store'
import { Pagination } from '@/components/pagination'

interface DeckCardsManagerModalProps {
  isOpen: boolean
  onClose: () => void
  deck: FlashcardDeck | null
}

export function DeckCardsManagerModal({
  isOpen,
  onClose,
  deck,
}: DeckCardsManagerModalProps) {
  const deckId = deck?.id || deck?._id

  // Fetch full deck data including cards list
  const { data: deckDetail, isLoading: isDeckLoading, refetch } = useDeckDetailsQuery(deckId)
  const addCardMutation = useAddCardToDeckMutation()
  const removeCardMutation = useRemoveCardFromDeckMutation()

  // State for search and add
  const [searchTerm, setSearchTerm] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<LexicalItem[]>([])
  const [hasSearched, setHasSearched] = useState(false)

  // Pagination for existing cards
  const [page, setPage] = useState(1)
  const pageSize = 8

  const cards = useMemo(() => deckDetail?.cards || [], [deckDetail?.cards])
  const totalCards = cards.length

  const paginatedCards = useMemo(() => {
    const start = (page - 1) * pageSize
    return cards.slice(start, start + pageSize)
  }, [cards, page, pageSize])

  const totalPages = Math.ceil(totalCards / pageSize) || 1

  const handleSearchWords = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!searchTerm.trim()) {
      setSearchResults([])
      setHasSearched(false)
      return
    }

    setIsSearching(true)
    setHasSearched(true)
    try {
      const res = await vocabularyService.listVocabulary({
        q: searchTerm.trim(),
        limit: 10,
      })
      const items = Array.isArray(res) ? res : res.items
      // Keep the legacy detail fields; normalize the identifier at the API boundary.
      setSearchResults(items.map(word => ({ ...word, id: word.id || word._id })) as unknown as LexicalItem[])
    } catch {
      toast.error('Lỗi khi tìm kiếm từ vựng')
    } finally {
      setIsSearching(false)
    }
  }

  const handleAddCard = async (word: LexicalItem) => {
    if (!deckId) return
    const cardWord = word.word
    const isAlreadyInDeck = cards.some(
      (c) => c.lexical_item_id === word.id || c.front_text?.toLowerCase() === cardWord.toLowerCase()
    )

    if (isAlreadyInDeck) {
      toast.warning(`Từ "${cardWord}" đã có trong bộ thẻ này`)
      return
    }

    const primaryMeaning = word.meanings?.find((m) => m.is_primary) || word.meanings?.[0]
    const primaryExample = primaryMeaning?.examples?.[0]

    const payload = {
      lexical_item_id: word.id,
      front_text: word.word,
      back_text: word.primary_meaning_vi || primaryMeaning?.definition_vi || word.word,
      ipa: word.pronunciation || '',
      part_of_speech: word.lexical_type || primaryMeaning?.part_of_speech || '',
      audio_url: word.audio_url_us || word.audio_url_uk || '',
      definition: primaryMeaning?.definition_vi || '',
      definition_vi: primaryMeaning?.definition_vi || '',
      example: primaryExample?.sentence_en || '',
      example_vi: primaryExample?.sentence_vi || '',
    }

    try {
      await addCardMutation.mutateAsync({ deckId, payload })
      toast.success(`Đã thêm "${cardWord}" vào bộ thẻ!`)
      await refetch()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Không thể thêm từ vào bộ thẻ'
      toast.error(message)
    }
  }

  const handleRemoveCard = async (cardId: string, wordText?: string) => {
    if (!deckId || !cardId) return
    if (!confirm(`Bạn có chắc chắn muốn xóa thẻ "${wordText || 'này'}" khỏi bộ thẻ?`)) return

    try {
      await removeCardMutation.mutateAsync({ deckId, cardId })
      toast.success('Đã xóa từ khỏi bộ thẻ!')
      await refetch()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Không thể xóa từ khỏi bộ thẻ'
      toast.error(message)
    }
  }

  if (!isOpen || !deck) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-150">
      <div
        className="w-full max-w-4xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl ring-1 ring-black/5 dark:ring-white/10 space-y-5 max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {deckDetail?.name_vi || deckDetail?.name || deck.name_vi || deck.name}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
                  {totalCards} thẻ
                </span>
                {deckDetail?.cefr_level && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    {deckDetail.cefr_level}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                {deckDetail?.topic_name && (
                  <span className="flex items-center gap-1 font-medium text-indigo-600 dark:text-indigo-400">
                    <Folder className="w-3.5 h-3.5" />
                    {deckDetail.topic_name}
                  </span>
                )}
                <span>•</span>
                <span>{deckDetail?.description_vi || deckDetail?.description || 'Bộ thẻ flashcard luyện tập'}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Add bar */}
        <div className="shrink-0 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Thêm từ vựng mới vào bộ thẻ từ kho 102k từ
            </span>
          </div>

          <form onSubmit={handleSearchWords} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nhập từ tiếng Anh hoặc nghĩa tiếng Việt để tìm kiếm..."
                className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="px-4 h-9 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
              <span>Tìm từ</span>
            </button>
          </form>

          {/* Search Results list */}
          {searchResults.length > 0 && (
            <div className="mt-2 max-h-48 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800">
              {searchResults.map((item) => {
                const meaning = item.meanings?.[0]?.definition_vi || item.primary_meaning_vi || ''
                const isInDeck = cards.some(
                  (c) => c.lexical_item_id === item.id || c.front_text?.toLowerCase() === item.word.toLowerCase()
                )
                return (
                  <div key={item.id} className="p-2.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-xs text-slate-900 dark:text-slate-100">{item.word}</span>
                      {item.pronunciation && (
                        <span className="text-[11px] font-mono text-slate-400">/{item.pronunciation}/</span>
                      )}
                      {item.lexical_type && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {item.lexical_type}
                        </span>
                      )}
                      <span className="text-xs text-slate-600 dark:text-slate-300 truncate max-w-xs">{meaning}</span>
                    </div>

                    <button
                      type="button"
                      disabled={isInDeck || addCardMutation.isPending}
                      onClick={() => handleAddCard(item)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                        isInDeck
                          ? 'bg-slate-100 text-slate-400 dark:bg-slate-800 cursor-not-allowed'
                          : 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white cursor-pointer'
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{isInDeck ? 'Đã có' : 'Thêm'}</span>
                    </button>
                  </div>
                )
              })}
            </div>
          )}

          {hasSearched && searchResults.length === 0 && !isSearching && (
            <p className="text-xs text-slate-400 text-center py-2">
              Không tìm thấy từ vựng nào khớp với từ khóa "{searchTerm}".
            </p>
          )}
        </div>

        {/* Existing Cards Section */}
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Danh sách từ trong bộ thẻ ({totalCards})
            </h4>
          </div>

          {isDeckLoading ? (
            <div className="flex-1 flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
          ) : totalCards === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
              <BookOpen className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Bộ thẻ này chưa có thẻ từ vựng nào
              </p>
              <p className="text-[11px] text-slate-400 mt-1 max-w-sm">
                Sử dụng ô tìm kiếm phía trên để thêm các từ vựng từ kho 102k từ vào bộ thẻ này.
              </p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {paginatedCards.map((card, idx) => {
                const cardId = card.id || card._id || ''
                const globalIndex = (page - 1) * pageSize + idx + 1
                return (
                  <div
                    key={cardId || idx}
                    className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-indigo-500/30 flex items-center justify-between gap-3 transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-6 text-center text-xs font-mono text-slate-400 font-bold shrink-0">
                        #{globalIndex}
                      </span>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                            {card.front_text}
                          </span>
                          {card.ipa && (
                            <span className="text-[11px] font-mono text-slate-400">/{card.ipa}/</span>
                          )}
                          {card.part_of_speech && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400">
                              {card.part_of_speech}
                            </span>
                          )}
                          {card.audio_url && (
                            <button
                              type="button"
                              onClick={() => playAudio(card.audio_url || '')}
                              className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                              title="Nghe phát âm"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 truncate">
                          {card.back_text || card.definition || card.definition_vi}
                        </p>
                        {card.example && (
                          <p className="text-[11px] text-slate-400 italic mt-0.5 truncate">
                            Ex: "{card.example}"
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0">
                      <button
                        type="button"
                        disabled={removeCardMutation.isPending}
                        onClick={() => handleRemoveCard(cardId, card.front_text)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                        title="Xóa thẻ khỏi bộ thẻ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="shrink-0 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 shrink-0">
          <span className="text-xs text-slate-400">
            Tổng cộng: <strong className="text-slate-700 dark:text-slate-200">{totalCards}</strong> từ trong bộ thẻ
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  )
}

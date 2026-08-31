import { Layers, Edit2, Plus } from 'lucide-react'
import type { FlashcardDeck } from '@/data/vocabulary-data'
import { toast } from '@/store/toast-store'

interface VocabularyDecksTabProps {
  decks: FlashcardDeck[]
  onEditDeck?: (deckId: string) => void
  onCreateDeck?: () => void
}

export function VocabularyDecksTab({
  decks,
  onEditDeck = () => toast.info('Đang mở form chỉnh sửa bộ thẻ...'),
  onCreateDeck = () => toast.info('Đang mở form tạo bộ thẻ mới...'),
}: VocabularyDecksTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Bộ Thẻ Flashcard Luyện Tập (Decks)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Bộ thẻ tích hợp thuật toán Spaced Repetition (SRS) cho học viên tự ôn tập
          </p>
        </div>
        <button
          onClick={onCreateDeck}
          className="flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo Bộ Thẻ Mới</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {decks.map((deck) => {
          const isPublic = deck.visibility === 'PUBLIC' || deck.visibility === 'public'
          return (
            <div
              key={deck.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-indigo-500/50 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 flex items-center justify-center border border-violet-200/50 dark:border-violet-800/50 font-bold">
                    <Layers className="w-5 h-5" />
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      isPublic
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {isPublic ? 'Công khai' : 'Riêng tư'}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  {deck.name_vi || deck.name_en || 'Bộ thẻ từ vựng'}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-2">
                  {deck.description || 'Bộ từ vựng ôn tập hàng ngày theo kỹ thuật lặp lại ngắt quãng.'}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
                <span className="font-semibold text-slate-600 dark:text-slate-400">
                  {deck.card_count || 0} thẻ ghi nhớ
                </span>
                <button
                  onClick={() => onEditDeck(deck.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Chỉnh sửa bộ thẻ"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

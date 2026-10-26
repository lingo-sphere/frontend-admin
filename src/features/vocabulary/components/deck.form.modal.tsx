import { useState, useEffect } from 'react'
import { X, Layers, Globe, Lock, Sparkles } from 'lucide-react'
import type { FlashcardDeck, Topic } from '@/features/vocabulary/data/vocabulary.data'
import { useCreatePublicDeckMutation, useUpdateDeckMutation } from '@/features/vocabulary/hooks/use.vocabulary.admin.query'
import { toast } from '@/store/toast.store'

interface DeckFormModalProps {
  isOpen: boolean
  onClose: () => void
  deck?: FlashcardDeck | null
  initialTopicId?: string
  topics: Topic[]
  onSuccess?: () => void
}

export function DeckFormModal({
  isOpen,
  onClose,
  deck,
  initialTopicId,
  topics,
  onSuccess,
}: DeckFormModalProps) {
  const isEditing = Boolean(deck?.id || deck?._id)
  const createMutation = useCreatePublicDeckMutation()
  const updateMutation = useUpdateDeckMutation()

  const [nameVi, setNameVi] = useState('')
  const [nameEn, setNameEn] = useState('')
  const [topicId, setTopicId] = useState('')
  const [cefrLevel, setCefrLevel] = useState('B1-B2')
  const [visibility, setVisibility] = useState<'PUBLIC' | 'PRIVATE'>('PUBLIC')
  const [descriptionVi, setDescriptionVi] = useState('')
  const [descriptionEn, setDescriptionEn] = useState('')
  const [isFeatured, setIsFeatured] = useState<boolean>(false)

  useEffect(() => {
    if (deck && isOpen) {
      setNameVi(deck.name_vi || deck.name || '')
      setNameEn(deck.name_en || deck.name || '')
      setTopicId(deck.topic_id || initialTopicId || '')
      setCefrLevel(deck.cefr_level || 'B1-B2')
      setVisibility((deck.visibility?.toUpperCase() === 'PRIVATE' ? 'PRIVATE' : 'PUBLIC'))
      setDescriptionVi(deck.description_vi || deck.description || '')
      setDescriptionEn(deck.description || '')
      setIsFeatured(Boolean(deck.is_featured))
    } else if (isOpen) {
      setNameVi('')
      setNameEn('')
      setTopicId(initialTopicId || (topics[0]?.id || ''))
      setCefrLevel('B1-B2')
      setVisibility('PUBLIC')
      setDescriptionVi('')
      setDescriptionEn('')
      setIsFeatured(false)
    }
  }, [deck, initialTopicId, isOpen, topics])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nameVi.trim() && !nameEn.trim()) {
      toast.error('Vui lòng nhập tên bộ thẻ')
      return
    }

    const selectedTopic = topics.find((t) => t.id === topicId || t._id === topicId)

    const payload = {
      name: nameEn.trim() || nameVi.trim(),
      title: nameEn.trim() || nameVi.trim(),
      name_vi: nameVi.trim(),
      name_en: nameEn.trim() || nameVi.trim(),
      topic_id: topicId || undefined,
      topic_name: selectedTopic?.name_vi || selectedTopic?.name_en || undefined,
      cefr_level: cefrLevel,
      visibility,
      description: descriptionEn.trim() || descriptionVi.trim(),
      description_vi: descriptionVi.trim(),
      is_featured: isFeatured,
    }

    try {
      if (isEditing && (deck?.id || deck?._id)) {
        const id = deck.id || deck._id || ''
        await updateMutation.mutateAsync({ id, payload })
        toast.success('Cập nhật bộ thẻ thành công!')
      } else {
        await createMutation.mutateAsync(payload)
        toast.success('Tạo bộ thẻ mới thành công!')
      }
      onSuccess?.()
      onClose()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Có lỗi xảy ra'
      toast.error(`Thao tác thất bại: ${msg}`)
    }
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl ring-1 ring-black/5 dark:ring-white/10 space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {isEditing ? 'Chỉnh Sửa Bộ Thẻ Flashcard' : 'Tạo Bộ Thẻ Flashcard Mới'}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {isEditing ? `ID: ${deck?.id || deck?._id}` : 'Tạo bộ thẻ luyện tập từ vựng ngắt quãng SRS'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Tên bộ thẻ (Việt) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={nameVi}
                onChange={(e) => setNameVi(e.target.value)}
                placeholder="VD: 50 Từ Vựng Kinh Doanh Trọng Tâm"
                className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Tên tiếng Anh
              </label>
              <input
                type="text"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                placeholder="VD: Core Business Vocabulary"
                className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Chủ đề liên kết (Topic) <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={topicId}
                onChange={(e) => setTopicId(e.target.value)}
                className="w-full h-9 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="">-- Chọn chủ đề --</option>
                {topics.map((t) => (
                  <option key={t.id || t._id} value={t.id || t._id}>
                    {t.name_vi || t.name_en} ({t.lexical_count || 0} từ)
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Khung CEFR
              </label>
              <select
                value={cefrLevel}
                onChange={(e) => setCefrLevel(e.target.value)}
                className="w-full h-9 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="A1">A1 - Sơ cấp</option>
                <option value="A2">A2 - Tiền trung cấp</option>
                <option value="B1">B1 - Trung cấp</option>
                <option value="B1-B2">B1-B2 - Trung & Trên trung cấp</option>
                <option value="B2">B2 - Trên trung cấp</option>
                <option value="C1">C1 - Cao cấp</option>
                <option value="C2">C2 - Thành thạo</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Chế độ hiển thị
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setVisibility('PUBLIC')}
                className={`flex items-center justify-center gap-2 h-9 px-3 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                  visibility === 'PUBLIC'
                    ? 'border-emerald-500 bg-emerald-50/50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 font-bold'
                    : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Công khai (Public)</span>
              </button>
              <button
                type="button"
                onClick={() => setVisibility('PRIVATE')}
                className={`flex items-center justify-center gap-2 h-9 px-3 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                  visibility === 'PRIVATE'
                    ? 'border-amber-500 bg-amber-50/50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 font-bold'
                    : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Nội bộ / Riêng tư</span>
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Mô tả tiếng Việt
            </label>
            <textarea
              rows={2}
              value={descriptionVi}
              onChange={(e) => setDescriptionVi(e.target.value)}
              placeholder="Mô tả mục tiêu của bộ thẻ và gợi ý cách học..."
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <div>
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">Bộ thẻ nổi bật</div>
                <div className="text-[10px] text-slate-400">Được gợi ý trên đầu trang Flashcard của học viên</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              {isSubmitting ? 'Đang lưu...' : isEditing ? 'Cập nhật bộ thẻ' : 'Tạo bộ thẻ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

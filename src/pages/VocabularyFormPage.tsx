/**
 * @file VocabularyFormPage.tsx
 * @description Trang quản trị VocabularyFormPage trong giao diện Admin
 */

import { useState } from 'react'
import { ChevronLeft, Save } from 'lucide-react'
import { useAdminStore } from '@/store/admin-store'
import { toast } from '@/store/toast-store'
import { VocabularyBasicInfoForm } from '@/components/vocabulary/VocabularyBasicInfoForm'
import { VocabularyMeaningsForm, type Meaning } from '@/components/vocabulary/VocabularyMeaningsForm'
import { vocabularyService } from '@/services/vocabulary.service'

export function VocabularyFormPage({
  editWordId,
  editId,
}: {
  editWordId?: string
  editId?: string
}) {
  const setActiveNavItem = useAdminStore((state) => state.setActiveNavItem)
  const currentEditId = editWordId || editId
  const isEditing = !!currentEditId

  const [word, setWord] = useState('')
  const [wordType, setWordType] = useState('NOUN')
  const [cefrLevel, setCefrLevel] = useState('B1')
  const [pronunciationUs, setPronunciationUs] = useState('')
  const [pronunciationUk, setPronunciationUk] = useState('')
  const [audioUrlUs, setAudioUrlUs] = useState('')
  const [meanings, setMeanings] = useState<Meaning[]>([
    {
      id: 'mean-1',
      part_of_speech: 'NOUN',
      definition_en: '',
      definition_vi: '',
      short_meaning_vi: '',
      examples: [''],
    },
  ])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const addMeaning = () => {
    setMeanings([
      ...meanings,
      {
        id: `mean-${Date.now()}`,
        part_of_speech: wordType,
        definition_en: '',
        definition_vi: '',
        short_meaning_vi: '',
        examples: [''],
      },
    ])
  }

  const removeMeaning = (id: string) => {
    setMeanings(meanings.filter((m) => m.id !== id))
  }

  const updateMeaning = (id: string, field: string, value: string) => {
    setMeanings(
      meanings.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    )
  }

  const addExample = (meaningId: string) => {
    setMeanings(
      meanings.map((m) =>
        m.id === meaningId ? { ...m, examples: [...m.examples, ''] } : m
      )
    )
  }

  const updateExample = (meaningId: string, idx: number, value: string) => {
    setMeanings(
      meanings.map((m) => {
        if (m.id !== meaningId) return m
        const newExs = [...m.examples]
        newExs[idx] = value
        return { ...m, examples: newExs }
      })
    )
  }

  const removeExample = (meaningId: string, idx: number) => {
    setMeanings(
      meanings.map((m) => {
        if (m.id !== meaningId) return m
        return { ...m, examples: m.examples.filter((_, i) => i !== idx) }
      })
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!word.trim()) return

    setIsSubmitting(true)
    try {
      const formattedMeanings = meanings.map((m, idx) => ({
        meaning_order: idx + 1,
        part_of_speech: m.part_of_speech || wordType,
        definition_en: m.definition_en,
        definition_vi: m.definition_vi || m.short_meaning_vi || '',
        short_meaning_vi: m.short_meaning_vi,
        examples: m.examples.filter(Boolean),
        is_primary: idx === 0,
      }))

      await vocabularyService.createLexicalItem({
        word: word.trim(),
        word_type: wordType,
        cefr_level: cefrLevel,
        pronunciation_us: pronunciationUs || undefined,
        pronunciation_uk: pronunciationUk || undefined,
        audio_url_us: audioUrlUs || undefined,
        meanings: formattedMeanings,
      })
      toast.success(
        isEditing
          ? 'Cập nhật từ vựng thành công!'
          : 'Thêm từ vựng mới vào từ điển thành công!'
      )
      setActiveNavItem('vocabulary')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Có lỗi xảy ra khi lưu từ vựng'
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveNavItem('vocabulary')}
            className="p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer shadow-xs"
            type="button"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {isEditing ? 'Chỉnh Sửa Từ Vựng' : 'Soạn Thảo Từ Vựng Mới'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isEditing
                ? 'Cập nhật định nghĩa, phiên âm và ví dụ ngữ cảnh'
                : 'Thêm mục từ vựng mới kèm định nghĩa song ngữ và phát âm'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <VocabularyBasicInfoForm
          word={word}
          wordType={wordType}
          cefrLevel={cefrLevel}
          pronunciationUs={pronunciationUs}
          pronunciationUk={pronunciationUk}
          audioUrlUs={audioUrlUs}
          onWordChange={setWord}
          onWordTypeChange={setWordType}
          onCefrLevelChange={setCefrLevel}
          onPronunciationUsChange={setPronunciationUs}
          onPronunciationUkChange={setPronunciationUk}
          onAudioUrlUsChange={setAudioUrlUs}
        />

        <VocabularyMeaningsForm
          meanings={meanings}
          onAddMeaning={addMeaning}
          onRemoveMeaning={removeMeaning}
          onUpdateMeaning={updateMeaning}
          onAddExample={addExample}
          onUpdateExample={updateExample}
          onRemoveExample={removeExample}
        />

        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => setActiveNavItem('vocabulary')}
            className="h-11 px-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 h-11 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? 'Đang lưu...' : isEditing ? 'Cập nhật từ vựng' : 'Lưu từ vựng'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}

/**
 * @file VocabularyBasicInfoForm.tsx
 * @description Component giao diện VocabularyBasicInfoForm phục vụ khu vực Quản trị Admin
 */

import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { BookOpen } from 'lucide-react'
import { CustomSelect } from '@/components/common/CustomSelect'

const WORD_TYPES_MAP = [
  { value: 'NOUN', vi: 'Danh từ', en: 'Noun' },
  { value: 'VERB', vi: 'Động từ', en: 'Verb' },
  { value: 'ADJECTIVE', vi: 'Tính từ', en: 'Adjective' },
  { value: 'ADVERB', vi: 'Trạng từ', en: 'Adverb' },
  { value: 'PREPOSITION', vi: 'Giới từ', en: 'Preposition' },
  { value: 'CONJUNCTION', vi: 'Liên từ', en: 'Conjunction' },
  { value: 'PRONOUN', vi: 'Đại từ', en: 'Pronoun' },
  { value: 'PHRASE', vi: 'Cụm từ', en: 'Phrase' },
]

const CEFR_LEVELS_MAP = [
  { value: 'A1', vi: 'A1 - Sơ cấp cơ bản', en: 'A1 - Beginner' },
  { value: 'A2', vi: 'A2 - Sơ cấp nâng cao', en: 'A2 - Elementary' },
  { value: 'B1', vi: 'B1 - Trung cấp', en: 'B1 - Intermediate' },
  { value: 'B2', vi: 'B2 - Trung cấp cao', en: 'B2 - Upper Intermediate' },
  { value: 'C1', vi: 'C1 - Cao cấp', en: 'C1 - Advanced' },
  { value: 'C2', vi: 'C2 - Thành thạo', en: 'C2 - Mastery' },
]

interface VocabularyBasicInfoFormProps {
  word: string
  wordType: string
  cefrLevel: string
  pronunciationUs: string
  pronunciationUk: string
  audioUrlUs: string
  onWordChange: (val: string) => void
  onWordTypeChange: (val: string) => void
  onCefrLevelChange: (val: string) => void
  onPronunciationUsChange: (val: string) => void
  onPronunciationUkChange: (val: string) => void
  onAudioUrlUsChange: (val: string) => void
}

export function VocabularyBasicInfoForm({
  word,
  wordType,
  cefrLevel,
  pronunciationUs,
  pronunciationUk,
  audioUrlUs,
  onWordChange,
  onWordTypeChange,
  onCefrLevelChange,
  onPronunciationUsChange,
  onPronunciationUkChange,
  onAudioUrlUsChange,
}: VocabularyBasicInfoFormProps) {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'

  const wordTypeOptions = useMemo(() => {
    return WORD_TYPES_MAP.map((item) => ({
      value: item.value,
      label: isVi ? item.vi : item.en,
    }))
  }, [isVi])

  const cefrOptions = useMemo(() => {
    return CEFR_LEVELS_MAP.map((lvl) => ({
      value: lvl.value,
      label: isVi ? lvl.vi : lvl.en,
      badge: lvl.value,
    }))
  }, [isVi])

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
        <BookOpen className="w-4 h-4 text-indigo-500" />
        <span>{isVi ? 'Thông tin từ vựng cơ bản' : 'Basic Vocabulary Info'}</span>
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {isVi ? 'Từ vựng tiếng Anh' : 'English Word'} <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={word}
            onChange={(e) => onWordChange(e.target.value)}
            placeholder="VD: collaborate"
            className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {isVi ? 'Từ loại' : 'Part of Speech'}
          </label>
          <CustomSelect
            value={wordType}
            onChange={onWordTypeChange}
            options={wordTypeOptions}
            className="w-full"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {isVi ? 'Trình độ CEFR' : 'CEFR Level'}
          </label>
          <CustomSelect
            value={cefrLevel}
            onChange={onCefrLevelChange}
            options={cefrOptions}
            className="w-full"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Phiên âm IPA (Mỹ - US)
          </label>
          <input
            type="text"
            value={pronunciationUs}
            onChange={(e) => onPronunciationUsChange(e.target.value)}
            placeholder="kəˈlæb.ə.reɪt"
            className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Phiên âm IPA (Anh - UK)
          </label>
          <input
            type="text"
            value={pronunciationUk}
            onChange={(e) => onPronunciationUkChange(e.target.value)}
            placeholder="kəˈlæb.ə.reɪt"
            className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Audio URL phát âm
          </label>
          <input
            type="text"
            value={audioUrlUs}
            onChange={(e) => onAudioUrlUsChange(e.target.value)}
            placeholder="https://r2.../audio.mp3"
            className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>
    </div>
  )
}

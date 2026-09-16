/**
 * @file vocabulary.basic.info.form.tsx
 * @description Component giao diện VocabularyBasicInfoForm phục vụ khu vực Quản trị Admin
 */

import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BookOpen, Sparkles, Loader2, Volume2, AudioLines, Upload } from 'lucide-react'
import { CustomSelect } from '@/components/custom.select'
import { playAudio } from '@/features/vocabulary/helpers/vocabulary.helper'
import { lexicalTypeLabels } from '@/features/vocabulary/data/vocabulary.data'

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

const LEXICAL_TYPES_MAP = [
  { value: 'word', vi: 'Từ đơn', en: 'Word' },
  { value: 'phrase', vi: 'Cụm từ', en: 'Phrase' },
  { value: 'phrasal_verb', vi: 'Cụm động từ', en: 'Phrasal Verb' },
  { value: 'idiom', vi: 'Thành ngữ', en: 'Idiom' },
  { value: 'collocation', vi: 'Cặp từ', en: 'Collocation' },
]

const SOURCE_TYPES_MAP = [
  { value: 'curated', vi: 'Biên soạn', en: 'Curated' },
  { value: 'ingested', vi: 'AI nhập tự động', en: 'AI Ingested' },
]

export interface BasicInfoFormData {
  word: string
  lexical_type: string
  // word_type được chỉ định ở cấp Meaning (mỗi meaning có loại từ riêng)
  cefr_level: string
  pronunciation: string  // ✅ IPA pronunciation (backend field: p)
  audio_url_us: string
  audio_url_uk: string
  syllables: number
  stress_pattern: string
  frequency_rank: number
  source: string
}

interface VocabularyBasicInfoFormProps {
  data: BasicInfoFormData
  onChange: (data: Partial<BasicInfoFormData>) => void
  onAutoGenerate: () => void
  isGenerating: boolean
  onAudioUpload?: (e: React.ChangeEvent<HTMLInputElement>, type: 'us' | 'uk') => void
  isUploadingAudio?: 'us' | 'uk' | null
}

export function VocabularyBasicInfoForm({
  data,
  onChange,
  onAutoGenerate,
  isGenerating,
  onAudioUpload,
  isUploadingAudio,
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

  const lexicalTypeOptions = useMemo(() => {
    return LEXICAL_TYPES_MAP.map((item) => ({
      value: item.value,
      label: isVi ? item.vi : item.en,
    }))
  }, [isVi])

  const sourceOptions = useMemo(() => {
    return SOURCE_TYPES_MAP.map((item) => ({
      value: item.value,
      label: isVi ? item.vi : item.en,
    }))
  }, [isVi])

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-indigo-500" />
          <span>{isVi ? 'Thông tin từ vựng cơ bản' : 'Basic Vocabulary Info'}</span>
        </h3>

        {/* Nút Tạo Tự Động */}
        <button
          type="button"
          onClick={onAutoGenerate}
          disabled={!data.word.trim() || isGenerating}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed text-xs font-bold text-white shadow-lg shadow-violet-600/30 transition-all cursor-pointer"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{isVi ? 'Đang tạo...' : 'Generating...'}</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>{isVi ? 'Tạo Tự Động bằng AI' : 'Auto Generate with AI'}</span>
            </>
          )}
        </button>
      </div>

      {/* Row 1: Word + Lexical Type + CEFR */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {isVi ? 'Từ vựng tiếng Anh' : 'English Word'} <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={data.word}
            onChange={(e) => onChange({ word: e.target.value })}
            placeholder="VD: collaborate"
            className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100 font-medium placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {isVi ? 'Loại từ' : 'Lexical Type'}
          </label>
          <CustomSelect
            value={data.lexical_type}
            onChange={(val) => onChange({ lexical_type: val })}
            options={lexicalTypeOptions}
            className="w-full"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {isVi ? 'Trình độ CEFR' : 'CEFR Level'}
          </label>
          <CustomSelect
            value={data.cefr_level}
            onChange={(val) => onChange({ cefr_level: val })}
            options={cefrOptions}
            className="w-full"
          />
        </div>
      </div>

      {/* Row 2: IPA Pronunciation + Audio */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {isVi ? 'Phiên âm IPA' : 'IPA Pronunciation'}
          </label>
          <input
            type="text"
            value={data.pronunciation}
            onChange={(e) => onChange({ pronunciation: e.target.value })}
            placeholder="VD: kəˈlæb.ə.reɪt"
            className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 font-mono placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {isVi ? 'Nút phát âm' : 'Audio'}
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => playAudio(data.audio_url_us)}
              disabled={!data.audio_url_us}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium text-indigo-600 dark:text-indigo-400 transition-colors cursor-pointer"
            >
              <Volume2 className="w-4 h-4" />
              <span>US</span>
            </button>
            <button
              type="button"
              onClick={() => playAudio(data.audio_url_uk)}
              disabled={!data.audio_url_uk}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium text-emerald-600 dark:text-emerald-400 transition-colors cursor-pointer"
            >
              <AudioLines className="w-4 h-4" />
              <span>UK</span>
            </button>
          </div>
        </div>
      </div>

      {/* Row 3: Phonetics Info */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {isVi ? 'Số âm tiết' : 'Syllables'}
          </label>
          <input
            type="number"
            min="1"
            value={data.syllables || ''}
            onChange={(e) => onChange({ syllables: parseInt(e.target.value) || 0 })}
            placeholder="VD: 4"
            className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 text-center placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {isVi ? 'Trọng âm' : 'Stress Pattern'}
          </label>
          <input
            type="text"
            value={data.stress_pattern || ''}
            onChange={(e) => onChange({ stress_pattern: e.target.value })}
            placeholder="VD: 2, 1-3"
            className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 text-center placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {isVi ? 'Thứ hạng tần suất' : 'Frequency Rank'}
          </label>
          <input
            type="number"
            min="1"
            value={data.frequency_rank || ''}
            onChange={(e) => onChange({ frequency_rank: parseInt(e.target.value) || 0 })}
            placeholder="VD: 1234"
            className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 text-center placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {isVi ? 'Nguồn từ' : 'Source'}
          </label>
          <CustomSelect
            value={data.source}
            onChange={(val) => onChange({ source: val })}
            options={sourceOptions}
            className="w-full"
          />
        </div>
      </div>

      {/* Row 4: Audio URLs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {isVi ? 'Audio US' : 'Audio (US)'}
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={data.audio_url_us}
              onChange={(e) => onChange({ audio_url_us: e.target.value })}
              placeholder="Audio path..."
              className="flex-1 h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            {data.audio_url_us && (
              <button
                type="button"
                onClick={() => playAudio(data.audio_url_us)}
                className="h-10 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 transition-colors flex items-center justify-center"
                title={isVi ? 'Phát âm' : 'Play'}
              >
                <Volume2 className="w-4 h-4" />
              </button>
            )}
            {onAudioUpload && (
              <label className="h-10 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-colors flex items-center justify-center cursor-pointer">
                {isUploadingAudio === 'us' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                <input
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={(e) => onAudioUpload(e, 'us')}
                  disabled={isUploadingAudio === 'us'}
                />
              </label>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {isVi ? 'Audio UK' : 'Audio (UK)'}
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={data.audio_url_uk}
              onChange={(e) => onChange({ audio_url_uk: e.target.value })}
              placeholder="Audio path..."
              className="flex-1 h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            {data.audio_url_uk && (
              <button
                type="button"
                onClick={() => playAudio(data.audio_url_uk)}
                className="h-10 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-600 dark:text-emerald-400 transition-colors flex items-center justify-center"
                title={isVi ? 'Phát âm UK' : 'Play UK'}
              >
                <AudioLines className="w-4 h-4" />
              </button>
            )}
            {onAudioUpload && (
              <label className="h-10 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-colors flex items-center justify-center cursor-pointer">
                {isUploadingAudio === 'uk' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                <input
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={(e) => onAudioUpload(e, 'uk')}
                  disabled={isUploadingAudio === 'uk'}
                />
              </label>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// NOTE: word_type được chỉ định ở cấp Meaning (mỗi meaning có loại từ riêng)
// VD: "bank" có thể là NOUN (bờ sông) và VERB (gửi tiền ngân hàng)

export const DEFAULT_BASIC_INFO: BasicInfoFormData = {
  word: '',
  lexical_type: 'word',
  cefr_level: 'B1',
  pronunciation: '',  // ✅ IPA pronunciation (backend field: p)
  audio_url_us: '',
  audio_url_uk: '',
  syllables: 0,
  stress_pattern: '',
  frequency_rank: 0,
  source: 'curated',
}

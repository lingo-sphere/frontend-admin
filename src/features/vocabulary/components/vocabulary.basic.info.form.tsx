/**
 * @file vocabulary.basic.info.form.tsx
 * @description Component giao diện VocabularyBasicInfoForm phục vụ khu vực Quản trị Admin
 */

import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BookOpen, Sparkles, Loader2, Volume2, AudioLines, Upload, Folder, Check, X, Search, Star } from 'lucide-react'
import { CustomSelect } from '@/components/custom.select'
import { playAudio } from '@/features/vocabulary/helpers/vocabulary.helper'
import { useVocabularyTopicsQuery } from '@/features/vocabulary/hooks/use.vocabulary.admin.query'

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
  topic_ids?: string[]
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

  const { data: topics = [], isLoading: isLoadingTopics } = useVocabularyTopicsQuery()
  const [topicSearch, setTopicSearch] = useState('')

  const selectedTopicIds = useMemo(() => data.topic_ids || [], [data.topic_ids])

  const selectedTopics = useMemo(() => {
    return selectedTopicIds
      .map((id) => topics.find((t) => t.id === id || t._id === id))
      .filter(Boolean) as typeof topics
  }, [selectedTopicIds, topics])

  const filteredTopics = useMemo(() => {
    const term = topicSearch.trim().toLowerCase()
    if (!term) return topics
    return topics.filter(
      (t) =>
        t.name_vi?.toLowerCase().includes(term) ||
        t.name_en?.toLowerCase().includes(term) ||
        t.slug?.toLowerCase().includes(term)
    )
  }, [topics, topicSearch])

  const handleToggleTopic = (topicId: string) => {
    const exists = selectedTopicIds.includes(topicId)
    const nextIds = exists
      ? selectedTopicIds.filter((id) => id !== topicId)
      : [...selectedTopicIds, topicId]
    onChange({ topic_ids: nextIds })
  }

  const handleSetPrimaryTopic = (topicId: string) => {
    const remaining = selectedTopicIds.filter((id) => id !== topicId)
    onChange({ topic_ids: [topicId, ...remaining] })
  }

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

      {/* Row 4: Gán Chủ đề Từ vựng (Vocabulary Topics) */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Folder className="w-4 h-4 text-indigo-500" />
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {isVi ? 'Chủ đề từ vựng liên kết' : 'Linked Vocabulary Topics'}
            </label>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              {selectedTopicIds.length} {isVi ? 'chủ đề' : 'topics'}
            </span>
          </div>
          {selectedTopicIds.length > 0 && (
            <button
              type="button"
              onClick={() => onChange({ topic_ids: [] })}
              className="text-[11px] font-medium text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
            >
              {isVi ? 'Xóa tất cả' : 'Clear all'}
            </button>
          )}
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          {isVi
            ? 'Chọn các chủ đề phù hợp để phân loại từ vựng vào các bộ flashcard và chủ đề luyện tập. Nhấn vào biểu tượng ngôi sao để chọn Chủ đề chính.'
            : 'Select topics to categorize this word into topic decks and practice sets. Click the star icon to set Primary topic.'}
        </p>

        {/* Selected Topics Badges */}
        {selectedTopics.length > 0 && (
          <div className="flex flex-wrap gap-2 p-3 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40">
            {selectedTopics.map((topic, index) => {
              const topicId = topic.id || topic._id || ''
              const isPrimary = index === 0
              return (
                <div
                  key={topicId}
                  className={`flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-xl text-xs font-medium transition-all ${
                    isPrimary
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleSetPrimaryTopic(topicId)}
                    title={isPrimary ? (isVi ? 'Chủ đề chính' : 'Primary topic') : (isVi ? 'Bấm để đặt làm chủ đề chính' : 'Click to make primary')}
                    className="cursor-pointer hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-3.5 h-3.5 ${
                        isPrimary
                          ? 'fill-amber-300 text-amber-300'
                          : 'text-slate-400 hover:text-amber-400'
                      }`}
                    />
                  </button>
                  <span>
                    {isVi ? topic.name_vi || topic.name_en : topic.name_en || topic.name_vi}
                  </span>
                  {isPrimary && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/20 text-white font-bold ml-0.5">
                      {isVi ? 'Chính' : 'Primary'}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleToggleTopic(topicId)}
                    className={`p-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer ml-1 ${
                      isPrimary ? 'text-white/80 hover:text-white' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )
            })}
          </div>
        )}

        {/* Search & Topic Pill Grid */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              type="text"
              value={topicSearch}
              onChange={(e) => setTopicSearch(e.target.value)}
              placeholder={isVi ? 'Tìm kiếm trong các chủ đề...' : 'Search among topics...'}
              className="w-full bg-transparent border-0 outline-none placeholder:text-slate-400 text-xs"
            />
            {topicSearch && (
              <button
                type="button"
                onClick={() => setTopicSearch('')}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="max-h-44 overflow-y-auto p-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex flex-wrap gap-1.5">
            {isLoadingTopics ? (
              <div className="w-full py-4 flex items-center justify-center text-xs text-slate-400 gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{isVi ? 'Đang tải danh sách chủ đề...' : 'Loading topics...'}</span>
              </div>
            ) : filteredTopics.length === 0 ? (
              <p className="w-full py-3 text-center text-xs text-slate-400">
                {isVi ? 'Không tìm thấy chủ đề phù hợp' : 'No matching topics'}
              </p>
            ) : (
              filteredTopics.map((topic) => {
                const topicId = topic.id || topic._id || ''
                const isSelected = selectedTopicIds.includes(topicId)
                return (
                  <button
                    key={topicId}
                    type="button"
                    onClick={() => handleToggleTopic(topicId)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-medium transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    {isSelected ? (
                      <Check className="w-3 h-3 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 shrink-0" />
                    )}
                    <span>{isVi ? topic.name_vi || topic.name_en : topic.name_en || topic.name_vi}</span>
                    {topic.cefr_level && (
                      <span className="text-[9px] px-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono">
                        {topic.cefr_level}
                      </span>
                    )}
                  </button>
                )
              })
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
  topic_ids: [],
}

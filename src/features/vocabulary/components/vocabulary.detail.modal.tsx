// Modal hiển thị chi tiết từ vựng với đầy đủ phiên âm, nghĩa và ví dụ minh họa.

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { X, Volume2, Loader2, BookOpen, MessageSquare, CheckCircle, Edit2, Folder, Star } from 'lucide-react'
import { playAudio } from '@/features/vocabulary/helpers/vocabulary.helper'
import { vocabularyService } from '@/features/vocabulary/services/vocabulary.service'

interface Meaning {
  meaning_order: number
  part_of_speech: string
  definition_vi: string
  short_meaning_vi?: string
  examples?: Array<{ sentence_en: string; sentence_vi?: string }>
  synonyms?: string[]
  antonyms?: string[]
  is_primary?: boolean
}

interface VocabularyDetail {
  id: string
  word: string
  word_lowercase?: string
  slug?: string
  pronunciation?: string  // IPA pronunciation (schema field: p)
  cefr_level?: string
  lexical_type?: string
  is_root_word?: boolean
  is_verified?: boolean
  is_active?: boolean
  source?: string
  audio_url_us?: string
  audio_url_uk?: string
  meanings?: Meaning[]
  meanings_count?: number
  examples_count?: number
  topic_ids?: string[]
  topics?: Array<{
    id?: string
    _id?: string
    name_en?: string
    name_vi?: string
    slug?: string
    is_primary?: boolean
  }>
  created_at?: string
  updated_at?: string
}

interface VocabularyDetailModalProps {
  isOpen: boolean
  onClose: () => void
  vocabularyId: string | null  // Nhận ID thay vì object
  onEdit?: (id: string) => void
}

const CEFR_COLORS: Record<string, string> = {
  A1: 'bg-green-100 text-green-700 border-green-200',
  A2: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  B1: 'bg-blue-100 text-blue-700 border-blue-200',
  B2: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  C1: 'bg-purple-100 text-purple-700 border-purple-200',
  C2: 'bg-pink-100 text-pink-700 border-pink-200',
}

const POS_LABELS: Record<string, { vi: string; en: string }> = {
  n: { vi: 'Danh từ', en: 'Noun' },
  noun: { vi: 'Danh từ', en: 'Noun' },
  v: { vi: 'Động từ', en: 'Verb' },
  verb: { vi: 'Động từ', en: 'Verb' },
  adj: { vi: 'Tính từ', en: 'Adjective' },
  adjective: { vi: 'Tính từ', en: 'Adjective' },
  adv: { vi: 'Trạng từ', en: 'Adverb' },
  adverb: { vi: 'Trạng từ', en: 'Adverb' },
  prep: { vi: 'Giới từ', en: 'Preposition' },
  preposition: { vi: 'Giới từ', en: 'Preposition' },
  conj: { vi: 'Liên từ', en: 'Conjunction' },
  conjunction: { vi: 'Liên từ', en: 'Conjunction' },
  pron: { vi: 'Đại từ', en: 'Pronoun' },
  pronoun: { vi: 'Đại từ', en: 'Pronoun' },
}

const LEXICAL_TYPE_LABELS: Record<string, { vi: string; en: string }> = {
  word: { vi: 'Từ đơn', en: 'Word' },
  phrase: { vi: 'Cụm từ', en: 'Phrase' },
  phrasal_verb: { vi: 'Cụm động từ', en: 'Phrasal Verb' },
  idiom: { vi: 'Thành ngữ', en: 'Idiom' },
  collocation: { vi: 'Cặp từ', en: 'Collocation' },
}

export function VocabularyDetailModal({
  isOpen,
  onClose,
  vocabularyId,
  onEdit,
}: VocabularyDetailModalProps) {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'

  const [vocabulary, setVocabulary] = useState<VocabularyDetail | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && vocabularyId) {
      fetchVocabularyDetail()
    } else {
      setVocabulary(null)
    }
  }, [isOpen, vocabularyId])

  const fetchVocabularyDetail = async () => {
    if (!vocabularyId) return

    setIsLoading(true)
    setError(null)
    setVocabulary(null)

    try {
      const res = await vocabularyService.getLexicalItemById(vocabularyId)
      const data = res as unknown as VocabularyDetail
      setVocabulary(data)
    } catch (err) {
      console.error('[VocabularyDetailModal] Error:', err)
      setError(isVi ? 'Không thể tải chi tiết từ vựng' : 'Failed to load vocabulary')
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString(isVi ? 'vi-VN' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getPosLabel = (pos: string): string => {
    if (!pos) return ''
    const normalized = pos.toLowerCase().replace(/[^a-z_]/g, '')
    return POS_LABELS[normalized]?.[isVi ? 'vi' : 'en'] || pos.toUpperCase()
  }

  const getLexicalTypeLabel = (type?: string): string => {
    if (!type) return ''
    return LEXICAL_TYPE_LABELS[type]?.[isVi ? 'vi' : 'en'] || type
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      <div className="relative z-10 w-full max-w-3xl max-h-[90vh] overflow-hidden bg-white dark:bg-slate-900 rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/50">
              <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {isVi ? 'Chi tiết từ vựng' : 'Vocabulary Details'}
              </h2>
              {vocabulary && (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {vocabulary.meanings_count || 0} {isVi ? 'nghĩa' : 'meanings'}
                  {(vocabulary.examples_count || 0) > 0 && (
                    <> · {vocabulary.examples_count} {isVi ? 'ví dụ' : 'examples'}</>
                  )}
                </p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
              <p className="text-sm text-slate-500">{isVi ? 'Đang tải chi tiết...' : 'Loading details...'}</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <p className="text-sm text-red-500">{error}</p>
              <button onClick={fetchVocabularyDetail} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg">
                {isVi ? 'Thử lại' : 'Retry'}
              </button>
            </div>
          ) : vocabulary ? (
            <div className="p-6 space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                      {vocabulary.word}
                    </h1>
                    {vocabulary.cefr_level && (
                      <span className={`px-2 py-1 text-xs font-semibold rounded-lg border ${CEFR_COLORS[vocabulary.cefr_level] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                        {vocabulary.cefr_level}
                      </span>
                    )}
                    {vocabulary.is_verified && (
                      <span title={isVi ? 'Đã xác minh' : 'Verified'} className="inline-flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      </span>
                    )}
                    {!vocabulary.is_active && (
                      <span className="px-2 py-1 text-xs font-medium rounded-lg bg-red-100 text-red-700 border border-red-200">
                        {isVi ? 'Không hoạt động' : 'Inactive'}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 mt-2">
                    {vocabulary.pronunciation && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-500 dark:text-slate-400">IPA:</span>
                        <span className="text-sm font-mono text-slate-700 dark:text-slate-300">
                          /{vocabulary.pronunciation}/
                        </span>
                      </div>
                    )}
                    {vocabulary.audio_url_us && (
                      <button
                        onClick={() => playAudio(vocabulary.audio_url_us)}
                        className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 transition-colors"
                        title={isVi ? 'Phát âm' : 'Play audio'}
                      >
                        <Volume2 className="w-4 h-4" />
                        <span className="text-xs">US</span>
                      </button>
                    )}
                    {vocabulary.audio_url_uk && (
                      <button
                        onClick={() => playAudio(vocabulary.audio_url_uk)}
                        className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 transition-colors"
                        title={isVi ? 'Phát âm UK' : 'Play UK audio'}
                      >
                        <Volume2 className="w-4 h-4" />
                        <span className="text-xs">UK</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-3 mt-3 text-xs text-slate-500 dark:text-slate-400">
                    {vocabulary.lexical_type && (
                      <span className="px-2 py-1 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400">
                        {getLexicalTypeLabel(vocabulary.lexical_type)}
                      </span>
                    )}
                    {vocabulary.source && (
                      <span>{isVi ? 'Nguồn:' : 'Source:'} {vocabulary.source}</span>
                    )}
                    {vocabulary.created_at && (
                      <span>{isVi ? 'Tạo:' : 'Created:'} {formatDate(vocabulary.created_at)}</span>
                    )}
                  </div>

                  {vocabulary.topics && vocabulary.topics.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <span className="flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400 mr-1">
                        <Folder className="w-3.5 h-3.5 text-indigo-500" />
                        {isVi ? 'Chủ đề:' : 'Topics:'}
                      </span>
                      {vocabulary.topics.map((t, idx) => {
                        const isPrimary = t.is_primary ?? (idx === 0)
                        return (
                          <span
                            key={t.id || t._id || idx}
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-medium ${
                              isPrimary
                                ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {isPrimary && <Star className="w-3 h-3 fill-amber-400 text-amber-400" />}
                            <span>{isVi ? t.name_vi || t.name_en : t.name_en || t.name_vi}</span>
                          </span>
                        )
                      })}
                    </div>
                  )}
                </div>

                {onEdit && (
                  <button
                    onClick={() => onEdit(vocabulary.id)}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-amber-500 hover:bg-amber-400 text-white transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    {isVi ? 'Chỉnh sửa' : 'Edit'}
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  <MessageSquare className="w-4 h-4" />
                  {isVi ? 'Nghĩa và định nghĩa' : 'Meanings & Definitions'}
                  {(vocabulary.meanings_count || 0) > 0 && (
                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-400">
                      {vocabulary.meanings_count}
                    </span>
                  )}
                </h3>

                {vocabulary.meanings && vocabulary.meanings.length > 0 ? (
                  vocabulary.meanings.map((meaning, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl border ${
                        meaning.is_primary
                          ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800'
                          : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-2 py-1 text-xs font-semibold rounded-lg bg-violet-200 dark:bg-violet-800 text-violet-700 dark:text-violet-300">
                          {getPosLabel(meaning.part_of_speech)}
                        </span>
                        {meaning.is_primary && (
                          <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-indigo-500 text-white">
                            {isVi ? 'Nghĩa chính' : 'Primary'}
                          </span>
                        )}
                      </div>

                      {meaning.definition_vi && (
                        <div className="mb-3">
                          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            🇻🇳 {isVi ? 'Nghĩa tiếng Việt:' : 'Vietnamese:'}
                          </span>
                          <p className="text-sm text-slate-800 dark:text-slate-200 mt-1">
                            {meaning.definition_vi}
                          </p>
                        </div>
                      )}

                      {(() => {
                        const examples = Array.isArray(meaning.examples) ? meaning.examples : []
                        if (examples.length === 0) return null
                        return (
                          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                              📝 {isVi ? 'Ví dụ:' : 'Examples:'}
                            </span>
                            <ul className="mt-2 space-y-2">
                              {examples.map((ex, exIdx) => (
                                <li key={exIdx} className="text-sm">
                                  <p className="text-slate-700 dark:text-slate-300 italic">"{ex.sentence_en}"</p>
                                  {ex.sentence_vi && (
                                    <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">→ {ex.sentence_vi}</p>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )
                      })()}

                      {(Array.isArray(meaning.synonyms) && meaning.synonyms.length > 0) || (Array.isArray(meaning.antonyms) && meaning.antonyms.length > 0) ? (
                        <div className="flex gap-4 mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                          {meaning.synonyms && meaning.synonyms.length > 0 && (
                            <div>
                              <span className="text-xs font-medium text-green-600 dark:text-green-400">
                                🔄 {isVi ? 'Đồng nghĩa:' : 'Synonyms:'}
                              </span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {meaning.synonyms.slice(0, 5).map((syn, i) => (
                                  <span key={i} className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                    {syn}
                                  </span>
                                ))}
                                {meaning.synonyms.length > 5 && (
                                  <span className="px-2 py-0.5 text-xs text-green-600 dark:text-green-400">
                                    +{meaning.synonyms.length - 5}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                          {meaning.antonyms && meaning.antonyms.length > 0 && (
                            <div>
                              <span className="text-xs font-medium text-red-600 dark:text-red-400">
                                ↔️ {isVi ? 'Trái nghĩa:' : 'Antonyms:'}
                              </span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {meaning.antonyms.slice(0, 5).map((ant, i) => (
                                  <span key={i} className="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                    {ant}
                                  </span>
                                ))}
                                {meaning.antonyms.length > 5 && (
                                  <span className="px-2 py-0.5 text-xs text-red-600 dark:text-red-400">
                                    +{meaning.antonyms.length - 5}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : null}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">{isVi ? 'Chưa có nghĩa chi tiết' : 'No detailed meanings'}</p>
                    <p className="text-xs mt-1">{isVi ? 'Nhấn "Chỉnh sửa" để thêm nghĩa' : 'Click "Edit" to add meanings'}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
              <p className="text-sm text-slate-500">{isVi ? 'Đang tải...' : 'Loading...'}</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            {isVi ? 'Đóng' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * @file vocabulary.form.page.tsx
 * @description Trang quản trị VocabularyFormPage trong giao diện Admin
 */

import { useState, useCallback, useEffect, useRef } from 'react'
import { ChevronLeft, Save, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from '@/store/toast.store'
import { VocabularyBasicInfoForm, DEFAULT_BASIC_INFO, type BasicInfoFormData } from '@/features/vocabulary/components/vocabulary.basic.info.form'
import { VocabularyMeaningsForm, type Meaning } from '@/features/vocabulary/components/vocabulary.meanings.form'
import { vocabularyService } from '@/features/vocabulary/services/vocabulary.service'

export function VocabularyFormPage({
  editWordId,
  editId,
}: {
  editWordId?: string
  editId?: string
}) {
  const navigate = useNavigate()
  const currentEditId = editWordId || editId
  const isEditing = !!currentEditId

  // Basic Info State
  const [basicInfo, setBasicInfo] = useState<BasicInfoFormData>(DEFAULT_BASIC_INFO)

  // Meanings State
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

  // Loading states
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isUploadingAudio, setIsUploadingAudio] = useState<'us' | 'uk' | null>(null)

  // Audio upload refs
  const audioUsInputRef = useRef<HTMLInputElement>(null)
  const audioUkInputRef = useRef<HTMLInputElement>(null)

  // Handle audio upload
  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>, audioType: 'us' | 'uk') => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('audio/')) {
      toast.error('Chỉ chấp nhận file audio!')
      return
    }

    // Nếu đang tạo mới (chưa có id), chỉ update state
    if (!currentEditId) {
      const url = URL.createObjectURL(file)
      setBasicInfo(prev => ({
        ...prev,
        audio_url_us: audioType === 'us' ? url : prev.audio_url_us,
        audio_url_uk: audioType === 'uk' ? url : prev.audio_url_uk,
      }))
      toast.success('Đã chọn file audio! Lưu từ vựng để upload lên server.')
      return
    }

    setIsUploadingAudio(audioType)
    try {
      const result = await vocabularyService.uploadLexicalItemAudio(currentEditId, file, audioType)
      setBasicInfo(prev => ({
        ...prev,
        audio_url_us: audioType === 'us' ? result.url : prev.audio_url_us,
        audio_url_uk: audioType === 'uk' ? result.url : prev.audio_url_uk,
      }))
      toast.success('Upload audio thành công!')
    } catch (err) {
      toast.error('Upload audio thất bại')
      console.error(err)
    } finally {
      setIsUploadingAudio(null)
      if (e.target) e.target.value = ''
    }
  }

  // Load existing vocabulary data when editing
  useEffect(() => {
    if (currentEditId) {
      setIsLoading(true)
      vocabularyService.getLexicalItemById(currentEditId)
        .then((data) => {
          fillFormWithData(data as unknown as Record<string, unknown>)
        })
        .catch((err) => {
          console.error('Error loading vocabulary:', err)
          toast.error('Không thể tải thông tin từ vựng')
        })
        .finally(() => {
          setIsLoading(false)
        })
    }
  }, [currentEditId])

  // Handle basic info change
  const handleBasicInfoChange = useCallback((data: Partial<BasicInfoFormData>) => {
    setBasicInfo((prev) => ({ ...prev, ...data }))
  }, [])

  // Handle Auto Generate with AI
  const handleAutoGenerate = async () => {
    if (!basicInfo.word.trim()) {
      toast.error('Vui lòng nhập từ vựng trước khi tạo tự động')
      return
    }

    setIsGenerating(true)
    try {
      toast.info('Đang tạo từ vựng tự động bằng AI...')

      // Call backend ingest API
      const result = await vocabularyService.ingestVocabulary({
        word: basicInfo.word.trim(),
        cefr_level: basicInfo.cefr_level,
        lexical_type: basicInfo.lexical_type,
        // word_type sẽ được chỉ định ở cấp Meaning
        skip_existing: true,
      })

      if (result.success) {
        // Nếu từ đã tồn tại
        if (result.lexical_item_id) {
          // Fetch full lexical item data
          const fullItem = await vocabularyService.getLexicalItemById(result.lexical_item_id)
          fillFormWithData(fullItem)
          toast.success(`Từ "${basicInfo.word}" đã được cập nhật!`)
        } else {
          // Từ mới được tạo - backend sẽ trả về thông tin
          // Fill những gì có được từ API
          const newItem: Record<string, unknown> = {
            word: basicInfo.word,
            cefr_level: basicInfo.cefr_level,
            lexical_type: basicInfo.lexical_type,
            source: 'ingested',
            is_verified: false,
          }

          if (result.dictionary_found !== false) {
            // Dictionary found info - chỉ lấy audio URLs, pronunciation sẽ được nhập thủ công
            newItem.audio_url_us = result.audio_us_url || ''
            newItem.audio_url_uk = result.audio_uk_url || ''
          }

          fillFormWithData(newItem)
          toast.success(`Từ "${basicInfo.word}" đã được tạo tự động! Vui lòng kiểm tra và chỉnh sửa nghĩa.`)
        }
      } else {
        toast.error(result.error || 'Không thể tạo từ vựng tự động')
      }
    } catch (err: unknown) {
      console.error('Ingest error:', err)
      const msg = err instanceof Error ? err.message : 'Có lỗi xảy ra khi tạo từ vựng tự động'
      toast.error(msg)
    } finally {
      setIsGenerating(false)
    }
  }

  // Helper: Extract pronunciation from filename
  const extractPronunciation = (audioUrl: string): string => {
    // Try to extract from URL or return empty
    return ''
  }

  // Fill form with fetched data
  // Backend trả về: w, p, us, uk, m (meanings với cấu trúc o, p, d, sm, ex)
  const fillFormWithData = (item: Record<string, unknown>) => {
    // Update basic info - map từ backend format (w, p, us, uk)
    setBasicInfo({
      word: String(item.w || item.word || basicInfo.word),
      lexical_type: String(item.t || item.lexical_type || 'word'),
      cefr_level: String(item.l || item.cefr_level || 'B1'),
      pronunciation: String(item.p || item.pronunciation || ''),
      audio_url_us: String(item.us || item.audio_url_us || ''),
      audio_url_uk: String(item.uk || item.audio_url_uk || ''),
      syllables: Number(item.syllables || 0),
      stress_pattern: String(item.stress_pattern || ''),
      frequency_rank: Number(item.frequency_rank || 0),
      source: String(item.src || item.source || 'curated'),
    })

    // Update meanings if available - map từ backend format (m với cấu trúc o, p, d, sm, ex)
    const meaningsData = item.m || item.meanings
    if (meaningsData && Array.isArray(meaningsData) && meaningsData.length > 0) {
      const newMeanings: Meaning[] = meaningsData.map((m: Record<string, unknown>, idx: number) => ({
        id: `mean-${Date.now()}-${idx}`,
        part_of_speech: String(m.p || m.part_of_speech || 'NOUN'),
        definition_en: String(m.d || m.definition_en || ''),
        definition_vi: String(m.d || m.definition_vi || ''),
        short_meaning_vi: String(m.sm || m.short_meaning_vi || ''),
        examples: Array.isArray(m.ex) && m.ex.length > 0
          ? m.ex.map((ex: Record<string, unknown>) => String(ex.e || ex.sentence_en || ''))
          : Array.isArray(m.examples) && m.examples.length > 0
          ? m.examples.map(String)
          : [''],
      }))
      setMeanings(newMeanings)
    }
  }

  // Meanings handlers
  const addMeaning = () => {
    setMeanings([
      ...meanings,
      {
        id: `mean-${Date.now()}`,
        part_of_speech: 'NOUN', // Default, user sẽ chọn loại từ cho mỗi meaning
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

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!basicInfo.word.trim()) {
      toast.error('Vui lòng nhập từ vựng')
      return
    }

    setIsSubmitting(true)
    try {
      // Format meanings theo backend schema (o, p, d, sm, ex)
      const formattedMeanings = meanings.map((m, idx) => ({
        o: idx + 1,
        p: m.part_of_speech || 'NOUN',
        d: m.definition_vi || m.short_meaning_vi || '',
        sm: m.short_meaning_vi || m.definition_vi || '',
        ex: m.examples.filter(Boolean).map(ex => ({ e: ex, v: '' })),
      }))

      // Payload theo backend schema (w, p, us, uk)
      const payload = {
        w: basicInfo.word.trim(),
        t: basicInfo.lexical_type,
        l: basicInfo.cefr_level,
        p: basicInfo.pronunciation || undefined,
        us: basicInfo.audio_url_us || undefined,
        uk: basicInfo.audio_url_uk || undefined,
        src: basicInfo.source,
        m: formattedMeanings,
      }

      if (isEditing && currentEditId) {
        // Update existing
        await vocabularyService.updateLexicalItem(currentEditId, payload)
        toast.success('Cập nhật từ vựng thành công!')
      } else {
        // Create new
        await vocabularyService.createLexicalItem(payload)
        toast.success('Thêm từ vựng mới vào từ điển thành công!')
      }

      navigate('/vocabulary')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Có lỗi xảy ra khi lưu từ vựng'
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/vocabulary')}
            className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer shadow-xs"
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
                : 'Nhập từ vựng và nhấn "Tạo Tự Động" để AI tạo nghĩa, ví dụ và phát âm'}
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          {isGenerating && (
            <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 text-xs font-medium">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              AI đang xử lý...
            </span>
          )}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <VocabularyBasicInfoForm
          data={basicInfo}
          onChange={handleBasicInfoChange}
          onAutoGenerate={handleAutoGenerate}
          isGenerating={isGenerating}
          onAudioUpload={handleAudioUpload}
          isUploadingAudio={isUploadingAudio}
        />

        {/* Meanings */}
        <VocabularyMeaningsForm
          meanings={meanings}
          onAddMeaning={addMeaning}
          onRemoveMeaning={removeMeaning}
          onUpdateMeaning={updateMeaning}
          onAddExample={addExample}
          onUpdateExample={updateExample}
          onRemoveExample={removeExample}
        />

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 pb-8">
          <button
            type="button"
            onClick={() => navigate('/vocabulary')}
            className="h-11 px-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            disabled={isSubmitting || isGenerating || !basicInfo.word.trim()}
            className="flex items-center gap-2 h-11 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang lưu...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{isEditing ? 'Cập nhật từ vựng' : 'Lưu từ vựng'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

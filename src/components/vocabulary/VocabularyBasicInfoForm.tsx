import { BookOpen } from 'lucide-react'

const WORD_TYPES = [
  'NOUN',
  'VERB',
  'ADJECTIVE',
  'ADVERB',
  'PREPOSITION',
  'CONJUNCTION',
  'PRONOUN',
  'PHRASE',
]

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

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
  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
        <BookOpen className="w-4 h-4 text-indigo-500" />
        <span>Thông Tin Từ Vựng Cơ Bản</span>
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Từ vựng (English Word) <span className="text-rose-500">*</span>
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
            Từ loại (Part of Speech)
          </label>
          <select
            value={wordType}
            onChange={(e) => onWordTypeChange(e.target.value)}
            className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
          >
            {WORD_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Trình độ CEFR
          </label>
          <select
            value={cefrLevel}
            onChange={(e) => onCefrLevelChange(e.target.value)}
            className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
          >
            {CEFR_LEVELS.map((lvl) => (
              <option key={lvl} value={lvl}>
                {lvl}
              </option>
            ))}
          </select>
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

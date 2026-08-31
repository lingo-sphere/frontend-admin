import { Plus, Trash2 } from 'lucide-react'

export interface Meaning {
  id: string
  part_of_speech: string
  definition_en: string
  definition_vi: string
  short_meaning_vi: string
  examples: string[]
}

interface VocabularyMeaningsFormProps {
  meanings: Meaning[]
  onAddMeaning: () => void
  onRemoveMeaning: (id: string) => void
  onUpdateMeaning: (id: string, field: string, value: string) => void
  onAddExample: (meaningId: string) => void
  onUpdateExample: (meaningId: string, idx: number, value: string) => void
  onRemoveExample: (meaningId: string, idx: number) => void
}

export function VocabularyMeaningsForm({
  meanings,
  onAddMeaning,
  onRemoveMeaning,
  onUpdateMeaning,
  onAddExample,
  onUpdateExample,
  onRemoveExample,
}: VocabularyMeaningsFormProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
          Nghĩa & Ví Dụ Minh Họa ({meanings.length})
        </h3>
        <button
          type="button"
          onClick={onAddMeaning}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:bg-indigo-100 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Nghĩa Mới</span>
        </button>
      </div>

      {meanings.map((meaning, mIdx) => (
        <div
          key={meaning.id}
          className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 relative"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
              Nghĩa #{mIdx + 1} ({meaning.part_of_speech})
            </span>
            {meanings.length > 1 && (
              <button
                type="button"
                onClick={() => onRemoveMeaning(meaning.id)}
                className="text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                title="Xóa nghĩa này"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Nghĩa ngắn tiếng Việt <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={meaning.short_meaning_vi}
                onChange={(e) => onUpdateMeaning(meaning.id, 'short_meaning_vi', e.target.value)}
                placeholder="VD: hợp tác, cộng tác"
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Định nghĩa tiếng Anh (English Definition)
              </label>
              <input
                type="text"
                value={meaning.definition_en}
                onChange={(e) => onUpdateMeaning(meaning.id, 'definition_en', e.target.value)}
                placeholder="to work with another person or group in order to achieve something"
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Ví dụ mẫu câu (Example Sentences)
              </label>
              <button
                type="button"
                onClick={() => onAddExample(meaning.id)}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Thêm câu ví dụ</span>
              </button>
            </div>

            {meaning.examples.map((ex, exIdx) => (
              <div key={exIdx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={ex}
                  onChange={(e) => onUpdateExample(meaning.id, exIdx, e.target.value)}
                  placeholder={`Câu ví dụ #${exIdx + 1}...`}
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                />
                {meaning.examples.length > 1 && (
                  <button
                    type="button"
                    onClick={() => onRemoveExample(meaning.id, exIdx)}
                    className="text-slate-400 hover:text-rose-500 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

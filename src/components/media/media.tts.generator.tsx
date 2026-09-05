/**
 * @file MediaTtsGenerator.tsx
 * @description Component giao diện MediaTtsGenerator phục vụ khu vực Quản trị Admin
 */

import { useTranslation } from 'react-i18next'
import { Volume2, Sparkles, CheckCircle, Play } from 'lucide-react'
import { CustomSelect } from '@/components/common/custom.select'

interface MediaTtsGeneratorProps {
  ttsText: string
  selectedVoice: string
  isGeneratingTts: boolean
  generatedAudioUrl: string | null
  onTtsTextChange: (val: string) => void
  onVoiceChange: (val: string) => void
  onSubmit: (e: React.FormEvent) => void
}

export function MediaTtsGenerator({
  ttsText,
  selectedVoice,
  isGeneratingTts,
  generatedAudioUrl,
  onTtsTextChange,
  onVoiceChange,
  onSubmit,
}: MediaTtsGeneratorProps) {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
      <div className="flex items-center gap-2">
        <Volume2 className="w-5 h-5 text-sky-500" />
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
          {isVi ? 'Tạo âm thanh phát âm (AI Text-to-Speech)' : 'Generate Pronunciation Audio (AI TTS)'}
        </h3>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
            {isVi ? 'Văn bản tiếng Anh cần sinh audio' : 'English text for audio generation'}
          </label>
          <textarea
            rows={3}
            required
            value={ttsText}
            onChange={(e) => onTtsTextChange(e.target.value)}
            placeholder={isVi ? 'Nhập văn bản tiếng Anh cần sinh audio...' : 'Enter English text...'}
            className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              {isVi ? 'Giọng đọc' : 'Voice Persona'}
            </label>
            <CustomSelect
              value={selectedVoice}
              onChange={onVoiceChange}
              options={[
                { value: 'alloy', label: isVi ? 'Alloy (Giọng chuẩn Mỹ)' : 'Alloy (Neutral US)', badge: 'US' },
                { value: 'echo', label: isVi ? 'Echo (Giọng nam trầm ấm)' : 'Echo (Warm Male)', badge: 'Male' },
                { value: 'fable', label: isVi ? 'Fable (Giọng Anh - Anh)' : 'Fable (British RP)', badge: 'UK' },
                { value: 'onyx', label: isVi ? 'Onyx (Giọng nam chuyên nghiệp)' : 'Onyx (Professional Male)', badge: 'Pro' },
                { value: 'nova', label: isVi ? 'Nova (Giọng nữ trẻ trung)' : 'Nova (Energetic Female)', badge: 'Female' },
                { value: 'shimmer', label: isVi ? 'Shimmer (Giọng nữ truyền cảm)' : 'Shimmer (Expressive Female)', badge: 'Female' },
              ]}
              className="w-full"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={isGeneratingTts}
              className="w-full flex items-center justify-center gap-2 h-10 px-6 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-xs font-bold text-white shadow-lg shadow-sky-600/30 transition-all cursor-pointer"
            >
              <Sparkles className={`w-4 h-4 ${isGeneratingTts ? 'animate-spin' : ''}`} />
              <span>{isGeneratingTts ? 'Đang Xử Lý Audio...' : 'Sinh File Audio MP3'}</span>
            </button>
          </div>
        </div>

        {generatedAudioUrl && (
          <div className="p-4 rounded-2xl bg-sky-50/50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-sky-700 dark:text-sky-300">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>Tệp âm thanh đã được tạo và sẵn sàng sử dụng!</span>
            </div>
            <div className="flex items-center gap-3">
              <audio controls className="w-full h-9">
                <source src={generatedAudioUrl} type="audio/mpeg" />
                Trình duyệt của bạn không hỗ trợ phát audio.
              </audio>
            </div>
          </div>
        )}
      </form>
    </div>
  )
}

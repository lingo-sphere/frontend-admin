import { Volume2, Sparkles, CheckCircle, Play } from 'lucide-react'

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
  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
      <div className="flex items-center gap-2">
        <Volume2 className="w-5 h-5 text-sky-500" />
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
          Công Cụ Sinh Giọng Đọc Phát Âm Tự Động (AI Text-to-Speech)
        </h3>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Chuyển đổi văn bản câu hỏi, đoạn văn nghe TOEIC Part 1 - 4 thành file Audio MP3 chuẩn quốc tế và tự động lưu vào Cloudflare R2.
      </p>

      <form onSubmit={onSubmit} className="space-y-4 pt-2">
        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
            Nội dung tiếng Anh cần đọc <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={3}
            required
            value={ttsText}
            onChange={(e) => onTtsTextChange(e.target.value)}
            placeholder="Nhập văn bản tiếng Anh cần sinh audio..."
            className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Giọng đọc (Voice Persona)
            </label>
            <select
              value={selectedVoice}
              onChange={(e) => onVoiceChange(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
            >
              <option value="alloy">Alloy (Trung tính, chuẩn Mỹ - Neutral US)</option>
              <option value="echo">Echo (Nam tính, trầm ấm - Warm Male)</option>
              <option value="fable">Fable (Anh - Anh chuẩn, British RP Accent)</option>
              <option value="onyx">Onyx (Nam phát thanh viên, chuyên nghiệp)</option>
              <option value="nova">Nova (Nữ trẻ trung, năng động)</option>
              <option value="shimmer">Shimmer (Nữ nhẹ nhàng, truyền cảm)</option>
            </select>
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
              <span>Tệp âm thanh đã sẵn sàng trên Cloudflare R2 CDN!</span>
            </div>
            <div className="flex items-center gap-3">
              <audio controls className="w-full h-9">
                <source src={generatedAudioUrl} type="audio/mpeg" />
                Trình duyệt của bạn không hỗ trợ phát audio.
              </audio>
            </div>
            <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 break-all">
              URL: {generatedAudioUrl}
            </p>
          </div>
        )}
      </form>
    </div>
  )
}

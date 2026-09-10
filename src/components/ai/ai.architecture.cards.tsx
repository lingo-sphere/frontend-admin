// Thẻ kiến trúc các mô hình AI hạ tầng phục vụ quản trị.
import { Cpu, Sparkles, CheckCircle2, ArrowRightLeft, Loader2 } from 'lucide-react'

export interface AiArchitectureCardsProps {
  primaryProvider?: 'gemini' | 'groq'
  isSwitching?: boolean
  onSelectProvider?: (provider: 'gemini' | 'groq') => void
}

export function AiArchitectureCards({
  primaryProvider = 'gemini',
  isSwitching = false,
  onSelectProvider,
}: AiArchitectureCardsProps) {
  const isGroqPrimary = primaryProvider === 'groq'
  const isGeminiPrimary = primaryProvider === 'gemini'

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          Kiến Trúc AI Hybrid 2-Tier & Điều Phối Đám Mây Thời Gian Thực
        </span>
        <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <ArrowRightLeft className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
          Nhấn nút để chuyển đổi mô hình phục vụ toàn hệ thống
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div
          className={`relative p-5 rounded-2xl transition-all duration-300 border ${
            isGroqPrimary
              ? 'bg-gradient-to-br from-amber-500/10 via-white to-amber-500/5 dark:from-indigo-950/60 dark:to-slate-900 border-amber-500 shadow-xl shadow-amber-500/10 ring-2 ring-amber-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500/40 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span
              className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                isGroqPrimary
                  ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40'
                  : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
              }`}
            >
              {isGroqPrimary ? '● Mô Hình Chính (Primary Active)' : 'Dự Phòng (Auto Failover)'}
            </span>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {isGroqPrimary ? 'Đang Tiếp Nhận Toàn Bộ Request' : 'Sẵn Sàng Dự Phòng'}
            </span>
          </div>

          <div className="mt-3">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-amber-500 dark:text-amber-400" />
              Groq Cloud LPU (qwen/qwen3.8-27b)
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
              Xử lý hội thoại thời gian thực, chấm lỗi sai phát âm và phản hồi tức thì với tốc độ sinh từ 300+ tokens/giây.
            </p>
          </div>

          <div className="pt-3 flex items-center justify-between text-xs font-mono text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800/80 mt-3">
            <div className="flex items-center gap-3">
              <span>Latency: ~0.4s</span>
              <span>Throughput: Cực cao</span>
            </div>

            {isGroqPrimary ? (
              <span className="flex items-center gap-1 font-sans text-xs font-semibold text-amber-800 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-300 dark:border-amber-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Mô hình hiện tại
              </span>
            ) : (
              <button
                type="button"
                disabled={isSwitching}
                onClick={() => onSelectProvider?.('groq')}
                className="flex items-center gap-1.5 font-sans text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 active:scale-95 transition-all px-3 py-1.5 rounded-lg shadow-md disabled:opacity-50 cursor-pointer"
              >
                {isSwitching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ArrowRightLeft className="w-3.5 h-3.5" />}
                Chuyển sang Groq
              </button>
            )}
          </div>
        </div>

        <div
          className={`relative p-5 rounded-2xl transition-all duration-300 border ${
            isGeminiPrimary
              ? 'bg-gradient-to-br from-purple-500/10 via-white to-purple-500/5 dark:from-purple-950/60 dark:to-slate-900 border-purple-500 shadow-xl shadow-purple-500/10 ring-2 ring-purple-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-purple-400 dark:hover:border-purple-500/40 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span
              className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                isGeminiPrimary
                  ? 'bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-500/40'
                  : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
              }`}
            >
              {isGeminiPrimary ? '● Mô Hình Chính (Primary Active)' : 'Dự Phòng (Auto Failover)'}
            </span>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {isGeminiPrimary ? 'Đang Tiếp Nhận Toàn Bộ Request' : 'Sẵn Sàng Dự Phòng'}
            </span>
          </div>

          <div className="mt-3">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              Google Gemini 3.1 Flash Lite
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
              Tự động failover khi Groq đạt ngưỡng giới hạn, hỗ trợ phân tích ngữ pháp chuyên sâu và sinh đề thi sư phạm chuẩn ETS.
            </p>
          </div>

          <div className="pt-3 flex items-center justify-between text-xs font-mono text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800/80 mt-3">
            <div className="flex items-center gap-3">
              <span>Latency: ~1.8s</span>
              <span>Logic Depth: Rất cao</span>
            </div>

            {isGeminiPrimary ? (
              <span className="flex items-center gap-1 font-sans text-xs font-semibold text-purple-800 dark:text-purple-400 bg-purple-100 dark:bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-300 dark:border-purple-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Mô hình hiện tại
              </span>
            ) : (
              <button
                type="button"
                disabled={isSwitching}
                onClick={() => onSelectProvider?.('gemini')}
                className="flex items-center gap-1.5 font-sans text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 active:scale-95 transition-all px-3 py-1.5 rounded-lg shadow-md disabled:opacity-50 cursor-pointer"
              >
                {isSwitching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ArrowRightLeft className="w-3.5 h-3.5" />}
                Chuyển sang Gemini
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

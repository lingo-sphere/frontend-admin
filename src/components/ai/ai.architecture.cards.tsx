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
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Kiến Trúc AI Hybrid 2-Tier & Điều Phối Đám Mây Thời Gian Thực
        </span>
        <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <ArrowRightLeft className="w-3.5 h-3.5 text-purple-400" />
          Nhấn để chuyển đổi mô hình phục vụ toàn hệ thống
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div
          className={`relative p-5 rounded-2xl transition-all duration-300 bg-gradient-to-br from-indigo-950/60 to-slate-900 border ${
            isGroqPrimary
              ? 'border-amber-500/70 shadow-2xl shadow-amber-500/10 ring-2 ring-amber-500/30'
              : 'border-slate-800 hover:border-amber-500/40 opacity-85 hover:opacity-100'
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                isGroqPrimary
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              {isGroqPrimary ? '● Mô Hình Chính (Primary Active)' : 'Dự Phòng (Auto Failover)'}
            </span>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {isGroqPrimary ? 'Đang Tiếp Nhận Toàn Bộ Request' : 'Sẵn Sàng Dự Phòng'}
            </span>
          </div>

          <div className="mt-3">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-amber-400" />
              Groq Cloud LPU (qwen/qwen3.8-27b)
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Xử lý hội thoại thời gian thực, chấm lỗi sai phát âm và phản hồi tức thì với tốc độ sinh từ 300+ tokens/giây.
            </p>
          </div>

          <div className="pt-3 flex items-center justify-between text-xs font-mono text-slate-400 border-t border-slate-800/80 mt-3">
            <div className="flex items-center gap-3">
              <span>Latency: ~0.4s</span>
              <span>Throughput: Cực cao</span>
            </div>

            {isGroqPrimary ? (
              <span className="flex items-center gap-1 font-sans text-xs font-semibold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
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
          className={`relative p-5 rounded-2xl transition-all duration-300 bg-gradient-to-br from-purple-950/60 to-slate-900 border ${
            isGeminiPrimary
              ? 'border-purple-500/70 shadow-2xl shadow-purple-500/10 ring-2 ring-purple-500/30'
              : 'border-slate-800 hover:border-purple-500/40 opacity-85 hover:opacity-100'
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                isGeminiPrimary
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              {isGeminiPrimary ? '● Mô Hình Chính (Primary Active)' : 'Dự Phòng (Auto Failover)'}
            </span>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {isGeminiPrimary ? 'Đang Tiếp Nhận Toàn Bộ Request' : 'Sẵn Sàng Dự Phòng'}
            </span>
          </div>

          <div className="mt-3">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              Google Gemini 3.1 Flash Lite
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Tự động failover khi Groq đạt ngưỡng giới hạn, hỗ trợ phân tích ngữ pháp chuyên sâu và sinh đề thi sư phạm chuẩn ETS.
            </p>
          </div>

          <div className="pt-3 flex items-center justify-between text-xs font-mono text-slate-400 border-t border-slate-800/80 mt-3">
            <div className="flex items-center gap-3">
              <span>Latency: ~1.8s</span>
              <span>Logic Depth: Rất cao</span>
            </div>

            {isGeminiPrimary ? (
              <span className="flex items-center gap-1 font-sans text-xs font-semibold text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-500/20">
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

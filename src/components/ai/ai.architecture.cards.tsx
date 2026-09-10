// Thẻ kiến trúc các mô hình AI hạ tầng phục vụ quản trị.
import { Cpu, Sparkles, CheckCircle2, ArrowRightLeft, Loader2, Zap, ShieldCheck } from 'lucide-react'

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
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            Kiến Trúc AI Hybrid 2-Tier & Điều Phối Mô Hình Đám Mây
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Lựa chọn mô hình chính xử lý toàn bộ yêu cầu của học viên. Mô hình còn lại tự động dự phòng khi nghẽn mạng hoặc vượt ngưỡng giới hạn (Rate-limit).
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/60 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700/60 self-start sm:self-auto shrink-0">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Auto-Failover kích hoạt</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div
          className={`relative p-6 rounded-3xl transition-all duration-300 flex flex-col justify-between border ${
            isGroqPrimary
              ? 'bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-950/40 dark:via-slate-900 dark:to-slate-950 border-amber-500 shadow-xl shadow-amber-500/10 ring-2 ring-amber-500/20'
              : 'bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 hover:border-amber-400/80 dark:hover:border-amber-500/40 shadow-xs'
          }`}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span
                className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${
                  isGroqPrimary
                    ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40'
                    : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                }`}
              >
                {isGroqPrimary ? '● Mô Hình Chính (Primary Active)' : 'Dự Phòng (Auto Failover)'}
              </span>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {isGroqPrimary ? 'Đang Tiếp Nhận Toàn Bộ Request' : 'Sẵn Sàng Thay Thế'}
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/20">
                  <Cpu className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    Groq Cloud LPU
                  </h4>
                  <span className="text-xs font-mono text-amber-700 dark:text-amber-400 font-semibold">
                    qwen/qwen3.8-27b
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2.5 leading-relaxed">
                Chip tăng tốc LPU chuyên biệt với tốc độ phản hồi cực nhanh, chuyên trách hội thoại thời gian thực, phản xạ giao tiếp và chấm lỗi câu ngay tức thì.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 py-3 px-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 text-center">
              <div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Tốc độ sinh từ</span>
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-0.5 block font-mono">300+ tok/s</span>
              </div>
              <div className="border-x border-slate-200 dark:border-slate-800">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Độ trễ trung bình</span>
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-0.5 block font-mono">~0.38s</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Thế mạnh chính</span>
                <span className="text-xs font-bold text-amber-700 dark:text-amber-400 mt-0.5 block">Siêu Tốc Độ</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                Chat Gia sư 1-1
              </span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                Sửa phát âm tức thì
              </span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                Dịch nhanh thời gian thực
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between mt-5">
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
              Provider: Groq LPU
            </span>

            {isGroqPrimary ? (
              <span className="flex items-center gap-1.5 font-sans text-xs font-bold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-500/20 px-3.5 py-2 rounded-xl border border-amber-300 dark:border-amber-500/30">
                <CheckCircle2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                Mô hình đang hoạt động
              </span>
            ) : (
              <button
                type="button"
                disabled={isSwitching}
                onClick={() => onSelectProvider?.('groq')}
                className="flex items-center gap-2 font-sans text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 active:scale-95 transition-all px-4 py-2 rounded-xl shadow-md shadow-amber-600/20 disabled:opacity-50 cursor-pointer"
              >
                {isSwitching ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRightLeft className="w-4 h-4" />}
                Chuyển sang Groq LPU
              </button>
            )}
          </div>
        </div>

        <div
          className={`relative p-6 rounded-3xl transition-all duration-300 flex flex-col justify-between border ${
            isGeminiPrimary
              ? 'bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent dark:from-purple-950/40 dark:via-slate-900 dark:to-slate-950 border-purple-500 shadow-xl shadow-purple-500/10 ring-2 ring-purple-500/20'
              : 'bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 hover:border-purple-400/80 dark:hover:border-purple-500/40 shadow-xs'
          }`}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span
                className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${
                  isGeminiPrimary
                    ? 'bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-500/40'
                    : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                }`}
              >
                {isGeminiPrimary ? '● Mô Hình Chính (Primary Active)' : 'Dự Phòng (Auto Failover)'}
              </span>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {isGeminiPrimary ? 'Đang Tiếp Nhận Toàn Bộ Request' : 'Sẵn Sàng Thay Thế'}
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-500/10 dark:bg-purple-500/20 border border-purple-500/20">
                  <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    Google Gemini 3.1 Flash Lite
                  </h4>
                  <span className="text-xs font-mono text-purple-700 dark:text-purple-400 font-semibold">
                    gemini-2.5-flash
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2.5 leading-relaxed">
                Mô hình suy luận sư phạm đa năng từ Google DeepMind, vượt trội về khả năng phân tích ngữ pháp chuyên sâu, giải thích chi tiết và chấm bài thi dài.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 py-3 px-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 text-center">
              <div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Context Window</span>
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-0.5 block font-mono">1,000,000</span>
              </div>
              <div className="border-x border-slate-200 dark:border-slate-800">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Độ trễ trung bình</span>
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-0.5 block font-mono">~1.60s</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Thế mạnh chính</span>
                <span className="text-xs font-bold text-purple-700 dark:text-purple-400 mt-0.5 block">Sư Phạm Sâu</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                Chấm bài viết Writing
              </span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                Giải thích câu sai đề thi
              </span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                Phân tích cấu trúc ngữ pháp
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between mt-5">
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
              Provider: Google Gemini
            </span>

            {isGeminiPrimary ? (
              <span className="flex items-center gap-1.5 font-sans text-xs font-bold text-purple-800 dark:text-purple-300 bg-purple-100 dark:bg-purple-500/20 px-3.5 py-2 rounded-xl border border-purple-300 dark:border-purple-500/30">
                <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                Mô hình đang hoạt động
              </span>
            ) : (
              <button
                type="button"
                disabled={isSwitching}
                onClick={() => onSelectProvider?.('gemini')}
                className="flex items-center gap-2 font-sans text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 active:scale-95 transition-all px-4 py-2 rounded-xl shadow-md shadow-purple-600/20 disabled:opacity-50 cursor-pointer"
              >
                {isSwitching ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRightLeft className="w-4 h-4" />}
                Chuyển sang Google Gemini
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

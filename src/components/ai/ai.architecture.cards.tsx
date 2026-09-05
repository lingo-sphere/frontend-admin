/**
 * @file ai.architecture.cards.tsx
 * @description Component giao diện AiArchitectureCards phục vụ khu vực Quản trị Admin
 */

import { Zap, Sparkles } from 'lucide-react'

export function AiArchitectureCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/60 to-slate-900 border border-indigo-500/30 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
            Tier 1 (Ưu Tiên Số 1)
          </span>
          <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Hoạt động · Siêu Tốc
          </span>
        </div>
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400 fill-amber-400" />
            Groq Cloud LPU (qwen/qwen3.8-27b)
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Xử lý hội thoại thời gian thực, chấm lỗi sai phát âm và phản hồi tức thì với tốc độ sinh từ 300+ tokens/giây.
          </p>
        </div>
        <div className="pt-2 flex items-center gap-4 text-xs font-mono text-slate-400">
          <span>Latency: ~0.4s</span>
          <span>Throughput: Cực cao</span>
          <span className="text-indigo-400">Default Primary</span>
        </div>
      </div>

      <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-950/60 to-slate-900 border border-purple-500/30 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-400 px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20">
            Tier 2 (Dự Phòng & Sư Phạm)
          </span>
          <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Sẵn sàng · Dự phòng
          </span>
        </div>
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            Google Gemini 3.1 Flash Lite
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Tự động failover khi Groq đạt ngưỡng giới hạn, hỗ trợ phân tích ngữ pháp chuyên sâu và sinh đề thi sư phạm chuẩn ETS.
          </p>
        </div>
        <div className="pt-2 flex items-center gap-4 text-xs font-mono text-slate-400">
          <span>Latency: ~1.8s</span>
          <span>Logic Depth: Rất cao</span>
          <span className="text-purple-400">Backup Failover</span>
        </div>
      </div>
    </div>
  )
}

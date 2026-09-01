/**
 * @file SettingsAiTab.tsx
 * @description Component giao diện SettingsAiTab phục vụ khu vực Quản trị Admin
 */

import { Sparkles } from 'lucide-react'
import { toast } from '@/store/toast-store'

export function SettingsAiTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-100">
            Cấu Hình Mô Hình Trí Tuệ Nhân Tạo (AI)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Quản lý các kết nối LLM (Gemini 2.5 Pro, Flash, OpenAI GPT-4o, Whisper Audio)
          </p>
        </div>
        <button
          className="flex items-center gap-2 h-10 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          onClick={() => toast.success('Đã đồng bộ kết nối AI thành công!')}
        >
          <Sparkles className="w-4 h-4" />
          <span>Kiểm tra kết nối AI</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                Mặc định chính
              </span>
              <span className="text-xs text-emerald-400 flex items-center gap-1.5 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Online · 240ms
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-100 mb-1">Google Gemini 2.5 Flash</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Dùng cho chấm phát âm, giải thích ngữ pháp tức thì, gợi ý viết câu và sinh câu hỏi trắc nghiệm tốc độ cao.
            </p>
          </div>
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Temperature: 0.7 · Max Tokens: 2048</span>
            <span className="font-mono text-indigo-400">gemini-2.5-flash</span>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                Chuyên sâu
              </span>
              <span className="text-xs text-emerald-400 flex items-center gap-1.5 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Online · 520ms
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-100 mb-1">Google Gemini 2.5 Pro</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Dùng cho chấm bài thi IELTS/TOEIC Writing & Speaking dài, phân tích lỗi sai chi tiết và lộ trình học cá nhân hóa.
            </p>
          </div>
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Temperature: 0.3 · Max Tokens: 4096</span>
            <span className="font-mono text-purple-400">gemini-2.5-pro</span>
          </div>
        </div>
      </div>
    </div>
  )
}

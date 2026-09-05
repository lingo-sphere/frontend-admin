/**
 * @file progress.ai.metrics.tab.tsx
 * @description Component giao diện ProgressAiMetricsTab phục vụ khu vực Quản trị Admin
 */

import { BrainCircuit, Cpu } from 'lucide-react'
import { aiModelUsageList, aiEvaluationCategories } from '@/data/statistics.data'

export function ProgressAiMetricsTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-purple-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Lưu Lượng Sử Dụng Mô Hình AI (Tokens & Requests)
            </h3>
          </div>

          <div className="space-y-4">
            {aiModelUsageList.map((m, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 space-y-2"
              >
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-900 dark:text-slate-100 font-mono">
                    {m.modelName}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400">
                    {m.provider}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Yêu cầu: {m.totalRequests.toLocaleString()}</span>
                  <span>Thời gian TB: {m.avgLatencyMs}ms</span>
                  <span className="text-emerald-600 font-semibold">{m.successRatePercent}% OK</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-indigo-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Hạng Mục Đánh Giá AI Chấm Bài
            </h3>
          </div>

          <div className="space-y-3">
            {aiEvaluationCategories.map((cat, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {cat.labelVi}
                  </span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                    {cat.avgScore}/5 điểm
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full"
                    style={{ width: `${(cat.avgScore / 5) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

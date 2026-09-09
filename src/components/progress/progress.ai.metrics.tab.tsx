// Tab chỉ số sử dụng mô hình AI và đánh giá chất lượng hệ thống.
import { BrainCircuit, Cpu, RefreshCw, Star } from 'lucide-react'
import { usePlatformAnalytics } from '@/hooks/use.platform.analytics'

export function ProgressAiMetricsTab() {
  const { aiData, isLoadingAi, refetchAi } = usePlatformAnalytics()

  if (isLoadingAi && !aiData) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
        <div className="h-80 rounded-3xl bg-slate-100 dark:bg-slate-800/60 p-6" />
        <div className="h-80 rounded-3xl bg-slate-100 dark:bg-slate-800/60 p-6" />
      </div>
    )
  }

  const aiModelUsageList = aiData?.aiModelUsageList || []
  const aiEvaluationCategories = aiData?.aiEvaluationCategories || []

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-purple-500" />
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Lưu Lượng Sử Dụng Mô Hình AI (Tokens & Requests)
              </h3>
            </div>
            <button
              onClick={() => refetchAi()}
              className="p-1.5 rounded-xl text-slate-400 hover:text-purple-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Làm mới chỉ số"
            >
              <RefreshCw size={14} />
            </button>
          </div>

          <div className="space-y-4">
            {aiModelUsageList.map((m, idx) => (
              <div
                key={m.id || idx}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 space-y-2.5 transition-all hover:border-purple-200 dark:hover:border-purple-900/50"
              >
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-slate-100 font-mono">
                      {m.modelName}
                    </span>
                    {m.isPrimary && (
                      <span className="flex items-center gap-0.5 text-[9px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-md">
                        <Star size={10} className="fill-current" />
                        Primary
                      </span>
                    )}
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400">
                    {m.provider}
                  </span>
                </div>

                <div className="flex justify-between text-xs text-slate-500">
                  <span>Yêu cầu: <strong className="text-slate-700 dark:text-slate-300 font-mono">{m.totalRequests.toLocaleString()}</strong></span>
                  <span>Độ trễ: <strong className="text-slate-700 dark:text-slate-300 font-mono">{m.avgLatencyMs}ms</strong></span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{m.successRatePercent}% OK</span>
                </div>

                {(m.inputTokens > 0 || m.outputTokens > 0) && (
                  <div className="flex justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-200/50 dark:border-slate-800/60">
                    <span>In: {(m.inputTokens / 1_000_000).toFixed(1)}M tok</span>
                    <span>Out: {(m.outputTokens / 1_000_000).toFixed(1)}M tok</span>
                    <span>Chi phí: ${m.costUSD.toFixed(2)}</span>
                  </div>
                )}
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
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400">
                      ({cat.totalEvaluations.toLocaleString()} lượt)
                    </span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                      {cat.avgScore}/5 điểm
                    </span>
                  </div>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(0, (cat.avgScore / 5) * 100))}%` }}
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

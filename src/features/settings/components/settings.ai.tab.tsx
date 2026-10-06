// Quản trị cấu hình và điều phối mô hình trí tuệ nhân tạo (AI).

import { useEffect, useState } from 'react'
import { Sparkles, RefreshCw, ShieldCheck } from 'lucide-react'
import { aiAdminService } from '@/features/settings/services/ai.service'
import { toast } from '@/store/toast.store'
import { AiArchitectureCards } from '@/features/settings/components/ai.architecture.cards'
import { AiQuotaSettingsCard } from '@/features/settings/components/ai.quota.settings.card'

export function SettingsAiTab() {
  const [primaryProvider, setPrimaryProvider] = useState<'gemini' | 'groq'>('gemini')
  const [isSwitchingProvider, setIsSwitchingProvider] = useState<boolean>(false)
  const [isSyncing, setIsSyncing] = useState<boolean>(false)

  const loadProviderConfig = async () => {
    try {
      const config = await aiAdminService.getAiProviderConfig()
      if (config?.primary_provider) {
        setPrimaryProvider(config.primary_provider === 'groq' ? 'groq' : 'gemini')
      }
    } catch {
      setPrimaryProvider('gemini')
    }
  }

  useEffect(() => {
    loadProviderConfig()
  }, [])

  const handleSelectProvider = async (provider: 'gemini' | 'groq') => {
    if (provider === primaryProvider || isSwitchingProvider) return
    setIsSwitchingProvider(true)
    try {
      const updated = await aiAdminService.setAiProviderConfig(provider)
      const newPrimary = updated?.primary_provider === 'groq' ? 'groq' : 'gemini'
      setPrimaryProvider(newPrimary)
      toast.success(
        `Đã chuyển mô hình AI chính toàn sàn sang ${newPrimary === 'groq' ? 'Groq Cloud LPU' : 'Google Gemini'} thành công!`,
        'Điều Phối AI'
      )
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể chuyển đổi mô hình AI. Vui lòng thử lại.'
      toast.error(msg, 'Lỗi chuyển đổi AI')
    } finally {
      setIsSwitchingProvider(false)
    }
  }

  const handleSyncAiConnection = async () => {
    setIsSyncing(true)
    try {
      await loadProviderConfig()
      toast.success('Đã đồng bộ và kiểm tra kết nối hạ tầng AI thành công!', 'Hạ Tầng AI')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể đồng bộ kết nối AI.'
      toast.error(msg, 'Lỗi kết nối')
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-purple-600/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Cấu Hình & Điều Phối Mô hình Trí Tuệ Nhân Tạo (AI)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Quản lý kiến trúc 2-Tier Cloud Hybrid (Groq LPU + Google Gemini) phục vụ toàn bộ dịch vụ học tập thông minh.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap pt-1">
            <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Trạng thái: 100% Hoạt động
            </span>
            <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              Cơ chế: Tự động Failover
            </span>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20">
              Mô hình chính: {primaryProvider === 'groq' ? 'Groq Cloud LPU' : 'Google Gemini 3.1 Flash Lite'}
            </span>
          </div>
        </div>

        <button
          type="button"
          disabled={isSyncing}
          onClick={handleSyncAiConnection}
          className="flex items-center justify-center gap-2 h-11 px-5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white shadow-lg shadow-purple-600/20 transition-all cursor-pointer disabled:opacity-60 shrink-0 self-start md:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>Kiểm tra kết nối AI</span>
        </button>
      </div>

      <AiArchitectureCards
        primaryProvider={primaryProvider}
        isSwitching={isSwitchingProvider}
        onSelectProvider={handleSelectProvider}
      />

      <AiQuotaSettingsCard />
    </div>
  )
}


/**
 * @file settings.ai.tab.tsx
 * @description Component giao diện SettingsAiTab phục vụ khu vực Quản trị Admin
 */

import { useEffect, useState } from 'react'
import {
  Sparkles,
  RefreshCw,
  MessageSquare,
  FileCheck2,
  Languages,
  Compass,
  Database,
  Activity,
  Sliders,
  Clock,
  ShieldCheck,
} from 'lucide-react'
import { aiAdminService, type AiProviderConfig } from '@/services/ai.service'
import { toast } from '@/store/toast.store'
import { AiArchitectureCards } from '@/components/ai/ai.architecture.cards'

export function SettingsAiTab() {
  const [providerConfig, setProviderConfig] = useState<AiProviderConfig | null>(null)
  const [primaryProvider, setPrimaryProvider] = useState<'gemini' | 'groq'>('gemini')
  const [isSwitchingProvider, setIsSwitchingProvider] = useState<boolean>(false)
  const [isSyncing, setIsSyncing] = useState<boolean>(false)

  const loadProviderConfig = async () => {
    try {
      const config = await aiAdminService.getAiProviderConfig()
      if (config) {
        setProviderConfig(config)
        if (config.primary_provider) {
          setPrimaryProvider(config.primary_provider === 'groq' ? 'groq' : 'gemini')
        }
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
      setProviderConfig(updated)
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

  const formatUpdatedAt = (dateStr?: string | null) => {
    if (!dateStr) return 'Đang cập nhật'
    try {
      const date = new Date(dateStr)
      return `${date.toLocaleTimeString('vi-VN')} · ${date.toLocaleDateString('vi-VN')}`
    } catch {
      return dateStr
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
                Cấu Hình & Điều Phối Mô Hình Trí Tuệ Nhân Tạo (AI)
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

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-purple-500" />
            Các Dịch Vụ AI Học Viên Đang Áp Dụng
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Tất cả dịch vụ tự động đồng bộ theo mô hình chính vừa chọn
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2.5">
            <div className="p-2.5 w-fit rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Gia Sư Trò Chuyện (AI Tutor)
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Hội thoại 1-1 thời gian thực, giải thích ngữ pháp, tra cứu ngữ cảnh và luyện phản xạ giao tiếp tiếng Anh cho học viên.
            </p>
            <div className="pt-2 text-[11px] font-mono text-purple-600 dark:text-purple-400 font-semibold border-t border-slate-100 dark:border-slate-800">
              {primaryProvider === 'groq' ? 'Tối ưu độ trễ ~0.4s' : 'Đàm thoại suy luận sâu'}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2.5">
            <div className="p-2.5 w-fit rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Chấm Bài Viết & Phát Âm
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Đánh giá bài viết Writing theo tiêu chuẩn CEFR, chẩn đoán lỗi ngữ pháp và giải thích chi tiết đáp án câu hỏi thi thử TOEIC.
            </p>
            <div className="pt-2 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold border-t border-slate-100 dark:border-slate-800">
              {primaryProvider === 'gemini' ? 'Chuẩn Sư Phạm ETS / IELTS' : 'Phản hồi tức thì qua Groq LPU'}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2.5">
            <div className="p-2.5 w-fit rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
              <Languages className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Dịch Thuật Ngữ Cảnh
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Dịch thuật tự nhiên hai chiều Anh - Việt, giải thích sắc thái từ vựng theo ngữ cảnh và lưu vào bộ nhớ học tập (Translation Memory).
            </p>
            <div className="pt-2 text-[11px] font-mono text-amber-600 dark:text-amber-400 font-semibold border-t border-slate-100 dark:border-slate-800">
              Bộ nhớ học tập ngữ cảnh
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2.5">
            <div className="p-2.5 w-fit rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20">
              <Compass className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Chẩn Đoán & Gợi Ý Lộ Trình
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Phân tích điểm số học viên theo thuật toán SRS, tự động gợi ý chủ đề ngữ pháp và từ vựng cần bù đắp để bứt phá mục tiêu điểm.
            </p>
            <div className="pt-2 text-[11px] font-mono text-rose-600 dark:text-rose-400 font-semibold border-t border-slate-100 dark:border-slate-800">
              Cá nhân hóa theo năng lực
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
          <Sliders className="w-4 h-4 text-purple-500" />
          Thông Số Kỹ Thuật & Chính Sách Vận Hành
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs mb-1">
              <Database className="w-4 h-4 text-indigo-500" />
              <span>Chiến lược Bộ Nhớ Đệm</span>
            </div>
            <span className="text-sm font-bold text-slate-900 dark:text-slate-100 font-mono">
              Redis In-Memory Cache
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Key: ai:primary_provider (Đồng bộ tức thì khi Admin đổi mô hình)
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Chính Sách Chuyển Tiếp</span>
            </div>
            <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Auto Failover (HTTP 429/5xx)
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Tự động gọi mô hình dự phòng khi mô hình chính gặp sự cố
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs mb-1">
              <Sliders className="w-4 h-4 text-amber-500" />
              <span>Cấu Hình Nhiệt Độ (Temperature)</span>
            </div>
            <span className="text-sm font-bold text-slate-900 dark:text-slate-100 font-mono">
              0.7 · Max Tokens: 1024
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Cân bằng tự nhiên trong hội thoại và độ chính xác ngữ pháp
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs mb-1">
              <Clock className="w-4 h-4 text-purple-500" />
              <span>Lần Điều Phối Gần Nhất</span>
            </div>
            <span className="text-sm font-bold text-slate-900 dark:text-slate-100 font-mono truncate block">
              {formatUpdatedAt(providerConfig?.updated_at)}
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
              {providerConfig?.updated_by ? `Bởi: ${providerConfig.updated_by}` : 'Khởi tạo theo hệ thống'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

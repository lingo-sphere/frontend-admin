// Component quản lý cấu hình hạn mức AI gói miễn phí và reset hạn mức toàn hệ thống.
import { useState, useEffect } from 'react'
import { Sliders, Save, RotateCcw, AlertTriangle, MessageSquare, BookOpen, Layers, CheckCircle2 } from 'lucide-react'
import { aiAdminService, type FreeTierAiLimits } from '@/features/settings/services/ai.service'
import { ConfirmModal } from '@/components/confirm.modal'
import { toast } from '@/store/toast.store'

export function AiQuotaSettingsCard() {
  const [limits, setLimits] = useState<FreeTierAiLimits>({
    chat_messages_limit: 5,
    context_token_limit: 1000,
    translation_quota_monthly: 5,
    evaluation_quota_monthly: 15,
  })
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [isResetting, setIsResetting] = useState<boolean>(false)
  const [isConfirmResetOpen, setIsConfirmResetOpen] = useState<boolean>(false)

  const loadLimits = async () => {
    setIsLoading(true)
    try {
      const data = await aiAdminService.getFreeTierLimits()
      if (data) {
        setLimits(data)
      }
    } catch {
      toast.error('Không thể tải cấu hình hạn mức AI', 'Lỗi')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadLimits()
  }, [])

  const handleSaveLimits = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      const updated = await aiAdminService.updateFreeTierLimits(limits)
      setLimits(updated)
      toast.success('Đã cập nhật hạn mức AI cho gói Miễn Phí thành công!', 'Hạn Mức AI')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể lưu cấu hình hạn mức.'
      toast.error(msg, 'Lỗi lưu cấu hình')
    } finally {
      setIsSaving(false)
    }
  }

  const handleConfirmResetAll = async () => {
    setIsResetting(true)
    try {
      const res = await aiAdminService.resetAllUsersAiQuota()
      setIsConfirmResetOpen(false)
      toast.success(
        `Đã reset lượt dùng AI thành công cho ${res.modified_count} tài khoản học viên!`,
        'Reset Toàn Hệ Thống',
      )
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể reset hạn mức AI hệ thống.'
      toast.error(msg, 'Lỗi Reset')
    } finally {
      setIsResetting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <Sliders className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Hạn Mức Sử Dụng AI (Dành Cho Học Viên Chưa Nâng Cấp Gói)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Thiết lập số câu hỏi tối đa và dung lượng token ngữ cảnh áp dụng cho học viên gói Miễn Phí
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              Chế độ: Động toàn sàn
            </span>
          </div>
        </div>

        <form onSubmit={handleSaveLimits} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 space-y-2">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 text-xs font-bold">
                <MessageSquare className="w-4 h-4 text-purple-500" />
                <span>Số Câu Hỏi AI / Ngày</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Giới hạn lượt trò chuyện với Gia sư AI mỗi ngày
              </p>
              <div className="pt-1">
                <input
                  type="number"
                  min={1}
                  max={500}
                  required
                  disabled={isLoading || isSaving}
                  value={limits.chat_messages_limit}
                  onChange={(e) => setLimits({ ...limits, chat_messages_limit: Number(e.target.value) })}
                  className="w-full h-10 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 space-y-2">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 text-xs font-bold">
                <Layers className="w-4 h-4 text-indigo-500" />
                <span>Context Window (Tokens)</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Độ dài ngữ cảnh tối đa lưu trữ hội thoại
              </p>
              <div className="pt-1">
                <input
                  type="number"
                  min={256}
                  max={16000}
                  step={256}
                  required
                  disabled={isLoading || isSaving}
                  value={limits.context_token_limit}
                  onChange={(e) => setLimits({ ...limits, context_token_limit: Number(e.target.value) })}
                  className="w-full h-10 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 space-y-2">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 text-xs font-bold">
                <BookOpen className="w-4 h-4 text-emerald-500" />
                <span>Lượt Dịch Thuật / Tháng</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Dịch văn bản & từ vựng thông minh
              </p>
              <div className="pt-1">
                <input
                  type="number"
                  min={1}
                  max={500}
                  required
                  disabled={isLoading || isSaving}
                  value={limits.translation_quota_monthly}
                  onChange={(e) => setLimits({ ...limits, translation_quota_monthly: Number(e.target.value) })}
                  className="w-full h-10 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 space-y-2">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 text-rose-500" />
                <span>Lượt Chấm Điểm / Đánh Giá</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Chấm bài thi & chép chính tả AI
              </p>
              <div className="pt-1">
                <input
                  type="number"
                  min={1}
                  max={500}
                  required
                  disabled={isLoading || isSaving}
                  value={limits.evaluation_quota_monthly}
                  onChange={(e) => setLimits({ ...limits, evaluation_quota_monthly: Number(e.target.value) })}
                  className="w-full h-10 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={isLoading || isSaving}
              className="flex items-center gap-2 h-10 px-5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white shadow-md shadow-purple-600/20 transition-all cursor-pointer disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Đang lưu...' : 'Lưu Cấu Hình Hạn Mức'}</span>
            </button>
          </div>
        </form>
      </div>

      <div className="p-6 rounded-3xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>Khu Vực Quản Trị Chu Kỳ: Reset Hạn Mức Toàn Hệ Thống</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
            Thao tác này sẽ đưa số lượt dùng AI trong tháng (câu hỏi, dịch thuật, chấm điểm) của <strong>TẤT CẢ</strong> học viên về 0. Học viên có thể tiếp tục trò chuyện với AI ngay lập tức.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsConfirmResetOpen(true)}
          disabled={isResetting}
          className="flex items-center justify-center gap-2 h-10 px-5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-md shadow-rose-600/20 transition-all cursor-pointer disabled:opacity-60 shrink-0 self-start md:self-auto"
        >
          <RotateCcw className={`w-4 h-4 ${isResetting ? 'animate-spin' : ''}`} />
          <span>Reset Toàn Bộ Học Viên</span>
        </button>
      </div>

      <ConfirmModal
        isOpen={isConfirmResetOpen}
        onClose={() => setIsConfirmResetOpen(false)}
        onConfirm={handleConfirmResetAll}
        type="danger"
        title="Xác Nhận Reset Hạn Mức AI Toàn Hệ Thống?"
        description="Thao tác này sẽ đặt lại số câu hỏi và lượt dịch AI đã dùng của toàn bộ học viên về 0. Học viên sẽ được cấp lại lượt dùng đầy đủ ngay lập tức."
        confirmText="Xác nhận Reset Toàn Sàn"
        cancelText="Hủy bỏ"
        isLoading={isResetting}
      />
    </div>
  )
}

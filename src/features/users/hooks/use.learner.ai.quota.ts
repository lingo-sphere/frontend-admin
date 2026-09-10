// Hook quản lý truy xuất, làm mới và tùy chỉnh hạn mức AI cho từng học viên.

import { useState, useEffect, useCallback } from 'react'
import { aiAdminService, type UserAiQuotaStatus } from '@/features/settings/services/ai.service'
import { toast } from '@/store/toast.store'
import type { User } from '@/features/users/types/learner.types'

interface UseLearnerAiQuotaOptions {
  user: User | null
  isOpen: boolean
  onSuccess?: () => void
}

export function useLearnerAiQuota({ user, isOpen, onSuccess }: UseLearnerAiQuotaOptions) {
  const [quotaStatus, setQuotaStatus] = useState<UserAiQuotaStatus | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isResetting, setIsResetting] = useState<boolean>(false)
  const [isSavingCustom, setIsSavingCustom] = useState<boolean>(false)

  const [customChatLimit, setCustomChatLimit] = useState<number>(5)
  const [customContextTokens, setCustomContextTokens] = useState<number>(1000)

  const loadUserQuota = useCallback(async () => {
    if (!user?.id) return
    setIsLoading(true)
    try {
      const res = await aiAdminService.getUserAiQuota(user.id)
      if (res?.status) {
        setQuotaStatus(res.status)
        setCustomChatLimit(res.status.chat.limit || 5)
        setCustomContextTokens(res.status.context_token_limit || 1000)
      }
    } catch {
      toast.error('Không thể tải dữ liệu hạn mức AI của học viên', 'Lỗi')
    } finally {
      setIsLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    if (isOpen && user) {
      loadUserQuota()
    }
  }, [isOpen, user, loadUserQuota])

  const handleResetQuota = async () => {
    if (!user?.id) return
    setIsResetting(true)
    try {
      const res = await aiAdminService.resetUserAiQuota(user.id)
      if (res?.quota) {
        setQuotaStatus(res.quota)
      }
      toast.success(`Đã reset lượt dùng AI cho học viên ${user.full_name} về 0 thành công!`, 'Reset Thành Công')
      if (onSuccess) onSuccess()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể reset hạn mức AI.'
      toast.error(msg, 'Lỗi Reset')
    } finally {
      setIsResetting(false)
    }
  }

  const handleSaveCustomLimits = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id) return
    setIsSavingCustom(true)
    try {
      const res = await aiAdminService.updateUserAiQuota(user.id, {
        chat_messages_limit: Number(customChatLimit),
        context_token_limit: Number(customContextTokens),
      })
      if (res?.status) {
        setQuotaStatus(res.status)
      }
      toast.success(`Đã cập nhật hạn mức AI riêng cho học viên ${user.full_name}!`, 'Thành Công')
      if (onSuccess) onSuccess()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể cập nhật hạn mức.'
      toast.error(msg, 'Lỗi cập nhật')
    } finally {
      setIsSavingCustom(false)
    }
  }

  const isUnlimited = Boolean(quotaStatus?.chat?.is_unlimited || user?.is_premium)
  const chatUsed = quotaStatus?.chat?.used || 0
  const chatLimit = quotaStatus?.chat?.limit || customChatLimit
  const chatPercent = isUnlimited ? 0 : Math.min(100, Math.round((chatUsed / (chatLimit || 1)) * 100))

  return {
    quotaStatus,
    isLoading,
    isResetting,
    isSavingCustom,
    customChatLimit,
    setCustomChatLimit,
    customContextTokens,
    setCustomContextTokens,
    isUnlimited,
    chatUsed,
    chatLimit,
    chatPercent,
    loadUserQuota,
    handleResetQuota,
    handleSaveCustomLimits,
  }
}

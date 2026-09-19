// Hook quản lý trạng thái form, tải danh sách học viên và gửi thông báo theo nhóm đối tượng.

import { useState, useEffect, useMemo, useCallback } from 'react'
import { notificationService, type CreateNotificationPayload } from '@/features/notifications/services/notification.service'
import { userService } from '@/features/users/services/user.service'
import type { UserProfile } from '@/features/users/schemas/user.schema'
import { toast } from '@/store/toast.store'
import { queryClient } from '@/config/query.config'
import { notificationsAdminKeys } from '@/features/notifications/keys/notifications.admin.keys'

export type TargetAudience = 'ALL_USERS' | 'PREMIUM_USERS' | 'FREE_USERS' | 'SPECIFIC_USER'

interface UseCreateNotificationFormOptions {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function useCreateNotificationForm({ isOpen, onClose, onSuccess }: UseCreateNotificationFormOptions) {
  const [targetAudience, setTargetAudience] = useState<TargetAudience>('ALL_USERS')
  const [selectedLearnerIds, setSelectedLearnerIds] = useState<string[]>([])
  const [learners, setLearners] = useState<UserProfile[]>([])
  const [isLoadingLearners, setIsLoadingLearners] = useState<boolean>(false)
  const [learnerSearchTerm, setLearnerSearchTerm] = useState<string>('')

  const [category, setCategory] = useState<string>('SYSTEM')
  const [priority, setPriority] = useState<string>('NORMAL')

  const [titleVi, setTitleVi] = useState<string>('')
  const [titleEn, setTitleEn] = useState<string>('')
  const [contentVi, setContentVi] = useState<string>('')
  const [contentEn, setContentEn] = useState<string>('')
  const [actionUrl, setActionUrl] = useState<string>('')

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const loadLearners = useCallback(async () => {
    setIsLoadingLearners(true)
    try {
      const res = await userService.getAllUsers({ role: 'STUDENT', limit: 200 })
      const items: UserProfile[] = Array.isArray(res) ? res : (res?.result || [])
      setLearners(items)
    } catch {
      toast.error('Không thể tải danh sách học viên')
    } finally {
      setIsLoadingLearners(false)
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      if (learners.length === 0) {
        loadLearners()
      }
    }
  }, [isOpen, learners.length, loadLearners])

  const filteredLearners = useMemo(() => {
    if (!learnerSearchTerm.trim()) return learners
    const query = learnerSearchTerm.toLowerCase()
    return learners.filter((u) => {
      const name = (u.full_name || '').toLowerCase()
      const email = (u.email || '').toLowerCase()
      const id = (u.user_id || '').toLowerCase()
      return name.includes(query) || email.includes(query) || id.includes(query)
    })
  }, [learners, learnerSearchTerm])

  const isAllFilteredSelected =
    filteredLearners.length > 0 &&
    filteredLearners.every((l) => selectedLearnerIds.includes(l.user_id))

  const handleToggleSelectAll = () => {
    const filteredIds = filteredLearners
      .map((l) => l.user_id)
      .filter((id) => Boolean(id))

    if (isAllFilteredSelected) {
      setSelectedLearnerIds((prev) => prev.filter((id) => !filteredIds.includes(id)))
    } else {
      setSelectedLearnerIds((prev) => Array.from(new Set([...prev, ...filteredIds])))
    }
  }

  const handleToggleSelectLearner = (uid: string) => {
    setSelectedLearnerIds((prev) =>
      prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid]
    )
  }

  const resetForm = () => {
    setTitleVi('')
    setTitleEn('')
    setContentVi('')
    setContentEn('')
    setActionUrl('')
    setSelectedLearnerIds([])
    setTargetAudience('ALL_USERS')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!titleVi.trim() || !contentVi.trim()) {
      toast.error('Vui lòng nhập đầy đủ tiêu đề và nội dung thông báo')
      return
    }

    if (targetAudience === 'SPECIFIC_USER' && selectedLearnerIds.length === 0) {
      toast.error('Vui lòng tích chọn ít nhất một học viên nhận thông báo')
      return
    }

    setIsSubmitting(true)
    try {
      if (targetAudience === 'SPECIFIC_USER') {
        await Promise.all(
          selectedLearnerIds.map((userId) =>
            notificationService.createNotification({
              recipient_id: userId,
              recipient_type: 'USER',
              title: titleEn.trim() || titleVi.trim(),
              title_vi: titleVi.trim(),
              content: contentEn.trim() || contentVi.trim(),
              content_vi: contentVi.trim(),
              notification_category: category,
              priority,
              action_url: actionUrl.trim() || undefined,
            })
          )
        )
        toast.success(
          `Đã phát thông báo thành công đến ${selectedLearnerIds.length} học viên được chọn!`,
          'Phát Thông Báo'
        )
      } else {
        const payload: CreateNotificationPayload = {
          recipient_id: targetAudience,
          recipient_type: 'BROADCAST',
          title: titleEn.trim() || titleVi.trim(),
          title_vi: titleVi.trim(),
          content: contentEn.trim() || contentVi.trim(),
          content_vi: contentVi.trim(),
          notification_category: category,
          priority,
          action_url: actionUrl.trim() || undefined,
        }
        await notificationService.createNotification(payload)
        toast.success('Đã phát thông báo thành công đến học viên!', 'Phát Thông Báo')
      }

      resetForm()
      await queryClient.invalidateQueries({ queryKey: notificationsAdminKeys.list() })
      if (onSuccess) onSuccess()
      onClose()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể gửi thông báo.'
      toast.error(msg, 'Lỗi gửi thông báo')
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    targetAudience,
    setTargetAudience,
    selectedLearnerIds,
    setSelectedLearnerIds,
    learners,
    isLoadingLearners,
    learnerSearchTerm,
    setLearnerSearchTerm,
    filteredLearners,
    isAllFilteredSelected,
    handleToggleSelectAll,
    handleToggleSelectLearner,
    category,
    setCategory,
    priority,
    setPriority,
    titleVi,
    setTitleVi,
    titleEn,
    setTitleEn,
    contentVi,
    setContentVi,
    contentEn,
    setContentEn,
    actionUrl,
    setActionUrl,
    isSubmitting,
    handleSubmit,
  }
}

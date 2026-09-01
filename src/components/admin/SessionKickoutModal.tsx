/**
 * @file SessionKickoutModal.tsx
 * @description Component giao diện SessionKickoutModal phục vụ khu vực Quản trị Admin
 */

import { ConfirmModal } from '@/components/common/ConfirmModal'
import { useSessionSync } from '@/hooks/use-session-sync'

export function SessionKickoutModal() {
  const { kickoutMessage, dismissKickout } = useSessionSync()

  return (
    <ConfirmModal
      isOpen={Boolean(kickoutMessage)}
      onClose={dismissKickout}
      onConfirm={dismissKickout}
      title="Đăng Nhập Từ Thiết Bị Khác"
      message={kickoutMessage || ''}
      confirmText="Đăng nhập lại"
      cancelText="Đóng"
      variant="warning"
      icon="warning"
    />
  )
}

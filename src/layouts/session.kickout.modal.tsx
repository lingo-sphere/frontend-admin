// Modal thông báo và xử lý sự kiện phiên đăng nhập bị hủy do đăng nhập nơi khác.
import { useTranslation } from 'react-i18next'
import { ConfirmModal } from '@/components/confirm.modal'
import { useSessionSync } from '@/hooks/use.session.sync'

export function SessionKickoutModal() {
  const { t } = useTranslation()
  const { kickoutMessage, dismissKickout } = useSessionSync()

  return (
    <ConfirmModal
      isOpen={Boolean(kickoutMessage)}
      onClose={dismissKickout}
      onConfirm={dismissKickout}
      title={t('common.sessionTerminatedTitle')}
      message={kickoutMessage || ''}
      confirmText={t('common.reLogin')}
      cancelText={t('common.close')}
      variant="warning"
      icon="warning"
    />
  )
}

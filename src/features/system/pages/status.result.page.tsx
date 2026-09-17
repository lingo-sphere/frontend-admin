// Trang giao diện thông báo trạng thái 403, 404 và 500 sử dụng Ant Design Result hỗ trợ đa ngôn ngữ
import { Result, Button } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

interface StatusResultPageProps {
  status: '403' | '404' | '500'
  title?: string
  subTitle?: string
  backUrl?: string
  backText?: string
}

export function StatusResultPage({
  status,
  title,
  subTitle,
  backUrl = '/dashboard',
  backText,
}: StatusResultPageProps) {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const defaultTitle = status === '403' ? t('errors.forbidden') : status === '404' ? t('errors.notFound') : t('errors.serverError')
  const defaultSubTitle =
    status === '403'
      ? t('errors.forbiddenDesc')
      : status === '404'
        ? t('errors.notFoundDesc')
        : t('errors.serverErrorDesc')

  return (
    <div className="flex min-h-[70vh] w-full items-center justify-center p-4">
      <Result
        status={status}
        title={title || defaultTitle}
        subTitle={subTitle || defaultSubTitle}
        extra={
          <Button
            type="primary"
            size="large"
            className="font-semibold cursor-pointer"
            onClick={() => navigate(backUrl)}
          >
            {backText || t('common.back')}
          </Button>
        }
      />
    </div>
  )
}

export function ForbiddenPage() {
  return <StatusResultPage status="403" />
}

export function NotFoundPage() {
  return <StatusResultPage status="404" />
}

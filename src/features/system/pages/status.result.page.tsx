// Trang giao diện thông báo trạng thái 403 và 404 sử dụng Ant Design Result cho hệ thống Quản trị.

import { Result, Button } from 'antd'
import { useNavigate } from 'react-router-dom'

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
  backText = 'Quay lại Trang chủ',
}: StatusResultPageProps) {
  const navigate = useNavigate()

  const defaultTitle = status === '403' ? '403' : status === '404' ? '404' : '500'
  const defaultSubTitle =
    status === '403'
      ? 'Xin lỗi, bạn không có quyền truy cập vào trang này.'
      : status === '404'
        ? 'Xin lỗi, trang bạn truy cập không tồn tại hoặc đã bị gỡ bỏ.'
        : 'Đã xảy ra sự cố hệ thống khi xử lý yêu cầu.'

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
            className="font-semibold"
            onClick={() => navigate(backUrl)}
          >
            {backText}
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

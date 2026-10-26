// Thành phần các nút thao tác icon thu gọn (Xem, Sửa, Xóa/Khôi phục) cho bảng dữ liệu Luyện tập.

import { Button, Popconfirm, Space, Tooltip } from 'antd'
import { Edit2, Eye, RotateCcw, Trash2 } from 'lucide-react'

interface IpaRowActionsProps {
  onView: () => void
  onEdit?: () => void
  onDeleteOrRestore?: () => void
  trash?: boolean
  loading?: boolean
  disabled?: boolean
  isVi?: boolean
  deleteTitle?: string
  deleteDescription?: string
}

export function IpaRowActions({
  onView,
  onEdit,
  onDeleteOrRestore,
  trash = false,
  loading = false,
  disabled = false,
  isVi = true,
  deleteTitle,
  deleteDescription,
}: IpaRowActionsProps) {
  const defaultTitle = trash
    ? (isVi ? 'Khôi phục bài về nháp?' : 'Restore exercise to draft?')
    : (isVi ? 'Chuyển bài vào thùng rác?' : 'Move exercise to trash?')
  const defaultDesc = isVi ? 'Giữ lại lịch sử làm bài và media.' : 'Preserves attempt history and media.'

  return (
    <Space size={4}>
      <Tooltip title={isVi ? 'Xem' : 'View'}>
        <Button
          size="small"
          icon={<Eye size={14} />}
          onClick={onView}
          className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
        />
      </Tooltip>
      {!trash && onEdit && (
        <Tooltip title={isVi ? 'Sửa' : 'Edit'}>
          <Button
            size="small"
            type="primary"
            ghost
            icon={<Edit2 size={14} />}
            onClick={onEdit}
          />
        </Tooltip>
      )}
      {onDeleteOrRestore && (
        <Popconfirm
          title={deleteTitle || defaultTitle}
          description={deleteDescription || defaultDesc}
          okText={trash ? (isVi ? 'Khôi phục' : 'Restore') : (isVi ? 'Xóa' : 'Delete')}
          cancelText={isVi ? 'Hủy' : 'Cancel'}
          onConfirm={onDeleteOrRestore}
        >
          <Tooltip title={trash ? (isVi ? 'Khôi phục' : 'Restore') : (isVi ? 'Xóa' : 'Delete')}>
            <Button
              size="small"
              danger={!trash}
              icon={trash ? <RotateCcw size={14} /> : <Trash2 size={14} />}
              disabled={disabled}
              loading={loading}
              className={trash ? 'text-emerald-600 hover:text-emerald-700 dark:text-emerald-400' : undefined}
            />
          </Tooltip>
        </Popconfirm>
      )}
    </Space>
  )
}

// Thành phần các nút thao tác icon thu gọn (Xem, Sửa, Xóa/Khôi phục) cho bảng dữ liệu Luyện tập.

import { useState } from 'react'
import { Button, Space, Tooltip } from 'antd'
import { Edit2, Eye, RotateCcw, Trash2 } from 'lucide-react'
import { ActionPopconfirmButton } from '@/components/table.row.actions'

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
  const [popOpen, setPopOpen] = useState(false)
  const defaultTitle = trash
    ? (isVi ? 'Khôi phục bài về nháp?' : 'Restore exercise to draft?')
    : (isVi ? 'Chuyển bài vào thùng rác?' : 'Move exercise to trash?')
  const defaultDesc = isVi ? 'Giữ lại lịch sử làm bài và media.' : 'Preserves attempt history and media.'

  return (
    <Space size={4} onClick={(e: React.MouseEvent) => e.stopPropagation()}>
      <Tooltip title={popOpen ? '' : (isVi ? 'Xem' : 'View')} open={popOpen ? false : undefined}>
        <Button
          size="small"
          icon={<Eye size={14} />}
          onClick={(e) => {
            e.stopPropagation()
            onView()
          }}
          className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
        />
      </Tooltip>
      {!trash && onEdit && (
        <Tooltip title={popOpen ? '' : (isVi ? 'Sửa' : 'Edit')} open={popOpen ? false : undefined}>
          <Button
            size="small"
            type="primary"
            ghost
            icon={<Edit2 size={14} />}
            onClick={(e) => {
              e.stopPropagation()
              onEdit()
            }}
          />
        </Tooltip>
      )}
      {onDeleteOrRestore && (
        <ActionPopconfirmButton
          title={deleteTitle || defaultTitle}
          description={deleteDescription || defaultDesc}
          tooltipTitle={trash ? (isVi ? 'Khôi phục' : 'Restore') : (isVi ? 'Xóa' : 'Delete')}
          okText={trash ? (isVi ? 'Khôi phục' : 'Restore') : (isVi ? 'Xóa' : 'Delete')}
          cancelText={isVi ? 'Hủy' : 'Cancel'}
          okType={trash ? 'primary' : 'danger'}
          danger={!trash}
          icon={trash ? <RotateCcw size={14} /> : <Trash2 size={14} />}
          disabled={disabled}
          loading={loading}
          className={trash ? 'text-emerald-600 hover:text-emerald-700 dark:text-emerald-400' : undefined}
          open={popOpen}
          onOpenChange={setPopOpen}
          onConfirm={onDeleteOrRestore}
        />
      )}
    </Space>
  )
}

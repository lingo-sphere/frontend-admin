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
          className="!text-indigo-600 !border-indigo-200/80 !bg-indigo-50/80 hover:!bg-indigo-100 hover:!border-indigo-300 dark:!bg-indigo-950/60 dark:!border-indigo-800 dark:!text-indigo-400 dark:hover:!bg-indigo-900/60 shadow-2xs"
        />
      </Tooltip>
      {!trash && onEdit && (
        <Tooltip title={popOpen ? '' : (isVi ? 'Sửa' : 'Edit')} open={popOpen ? false : undefined}>
          <Button
            size="small"
            icon={<Edit2 size={14} />}
            onClick={(e) => {
              e.stopPropagation()
              onEdit()
            }}
            className="!text-sky-600 !border-sky-200/80 !bg-sky-50/80 hover:!bg-sky-100 hover:!border-sky-300 dark:!bg-sky-950/60 dark:!border-sky-800 dark:!text-sky-400 dark:hover:!bg-sky-900/60 shadow-2xs"
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
          className={
            trash
              ? '!text-emerald-600 !border-emerald-200/80 !bg-emerald-50/80 hover:!bg-emerald-100 hover:!border-emerald-300 dark:!bg-emerald-950/60 dark:!border-emerald-800 dark:!text-emerald-400 dark:hover:!bg-emerald-900/60 shadow-2xs'
              : '!text-rose-600 !border-rose-200/80 !bg-rose-50/80 hover:!bg-rose-100 hover:!border-rose-300 dark:!bg-rose-950/60 dark:!border-rose-800 dark:!text-rose-400 dark:hover:!bg-rose-900/60 shadow-2xs'
          }
          open={popOpen}
          onOpenChange={setPopOpen}
          onConfirm={onDeleteOrRestore}
        />
      )}
    </Space>
  )
}

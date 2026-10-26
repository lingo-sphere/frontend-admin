// Component các nút thao tác chuẩn hóa (Xem, Sửa, Xóa) cho cột Thao tác của bảng dữ liệu Admin.

import React, { useState } from 'react'
import { Button, Popconfirm, Space, Tooltip } from 'antd'
import { Eye, Edit2, Trash2, RotateCcw } from 'lucide-react'
import dayjs from 'dayjs'

export function renderTableDate(value?: string | number | Date | null) {
  if (!value) return <span className="text-slate-400">—</span>
  const d = dayjs(value)
  if (!d.isValid()) return <span className="text-slate-400">—</span>
  return (
    <div className="font-mono text-xs leading-tight text-center text-slate-600 dark:text-slate-400">
      <div className="whitespace-nowrap font-medium">{d.format('DD/MM/YYYY')}</div>
      <div className="text-[10px] text-slate-400 dark:text-slate-500 whitespace-nowrap">{d.format('HH:mm')}</div>
    </div>
  )
}

export interface ActionPopconfirmButtonProps {
  title: string
  description?: string
  tooltipTitle: string
  okText: string
  cancelText: string
  okType?: 'danger' | 'primary'
  icon: React.ReactNode
  placement?: 'top' | 'topRight' | 'topLeft' | 'bottom' | 'bottomRight' | 'bottomLeft'
  disabled?: boolean
  loading?: boolean
  danger?: boolean
  className?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onConfirm: () => void | Promise<void>
}

export function ActionPopconfirmButton({
  title,
  description,
  tooltipTitle,
  okText,
  cancelText,
  okType = 'danger',
  icon,
  placement = 'topRight',
  disabled = false,
  loading = false,
  danger = false,
  className,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  onConfirm,
}: ActionPopconfirmButtonProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = controlledOpen !== undefined
  const isOpen = isControlled ? controlledOpen : internalOpen

  const handleOpenChange = (nextOpen: boolean) => {
    if (!isControlled) {
      setInternalOpen(nextOpen)
    }
    controlledOnOpenChange?.(nextOpen)
  }

  const handleConfirm = async () => {
    try {
      await onConfirm()
    } finally {
      handleOpenChange(false)
    }
  }

  return (
    <Popconfirm
      open={isOpen}
      onOpenChange={handleOpenChange}
      placement={placement}
      zIndex={1100}
      title={title}
      description={description}
      okText={okText}
      cancelText={cancelText}
      okType={okType}
      onConfirm={handleConfirm}
      onCancel={() => handleOpenChange(false)}
    >
      <Tooltip title={isOpen ? '' : tooltipTitle} open={isOpen ? false : undefined}>
        <Button
          size="small"
          danger={danger}
          icon={icon}
          disabled={disabled}
          loading={loading}
          className={className}
        />
      </Tooltip>
    </Popconfirm>
  )
}

export interface TableRowActionsProps {
  onView?: () => void
  onEdit?: () => void
  onDelete?: () => void | Promise<void>
  onRestore?: () => void | Promise<void>
  isTrash?: boolean
  isVi?: boolean
  disabled?: boolean
  loading?: boolean
  viewTooltip?: string
  editTooltip?: string
  viewTitle?: string
  editTitle?: string
  deleteTitle?: string
  deleteDescription?: string
  extraActions?: React.ReactNode
}

export function TableRowActions({
  onView,
  onEdit,
  onDelete,
  onRestore,
  isTrash = false,
  isVi = true,
  disabled = false,
  loading = false,
  viewTooltip,
  editTooltip,
  viewTitle,
  editTitle,
  deleteTitle,
  deleteDescription,
  extraActions,
}: TableRowActionsProps) {
  const [deletePopOpen, setDeletePopOpen] = useState(false)
  const [restorePopOpen, setRestorePopOpen] = useState(false)
  const isAnyPopOpen = deletePopOpen || restorePopOpen

  const defaultDeleteTitle = isTrash
    ? (isVi ? 'Khôi phục mục này?' : 'Restore this item?')
    : (isVi ? 'Xóa mục này?' : 'Delete this item?')

  const defaultDeleteDesc = isTrash
    ? (isVi ? 'Dữ liệu sẽ được chuyển về trạng thái hoạt động.' : 'Item will be restored to active status.')
    : (isVi ? 'Hành động này có thể ảnh hưởng đến các dữ liệu liên quan.' : 'This action might affect related data.')

  return (
    <Space size={4} className="justify-center">
      {extraActions && (
        <span className={isAnyPopOpen ? 'pointer-events-none' : undefined}>
          {extraActions}
        </span>
      )}

      {onView && (
        <Tooltip
          title={isAnyPopOpen ? '' : (viewTitle || viewTooltip || (isVi ? 'Xem chi tiết' : 'View details'))}
          open={isAnyPopOpen ? false : undefined}
        >
          <Button
            size="small"
            icon={<Eye size={14} />}
            onClick={onView}
            className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
          />
        </Tooltip>
      )}

      {!isTrash && onEdit && (
        <Tooltip
          title={isAnyPopOpen ? '' : (editTitle || editTooltip || (isVi ? 'Chỉnh sửa' : 'Edit'))}
          open={isAnyPopOpen ? false : undefined}
        >
          <Button
            size="small"
            type="primary"
            ghost
            icon={<Edit2 size={14} />}
            onClick={onEdit}
          />
        </Tooltip>
      )}

      {isTrash && onRestore && (
        <ActionPopconfirmButton
          title={deleteTitle || defaultDeleteTitle}
          description={deleteDescription || defaultDeleteDesc}
          tooltipTitle={isVi ? 'Khôi phục' : 'Restore'}
          okText={isVi ? 'Khôi phục' : 'Restore'}
          cancelText={isVi ? 'Hủy' : 'Cancel'}
          okType="primary"
          icon={<RotateCcw size={14} />}
          disabled={disabled}
          loading={loading}
          className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
          open={restorePopOpen}
          onOpenChange={setRestorePopOpen}
          onConfirm={onRestore}
        />
      )}

      {!isTrash && onDelete && (
        <ActionPopconfirmButton
          title={deleteTitle || defaultDeleteTitle}
          description={deleteDescription || defaultDeleteDesc}
          tooltipTitle={isVi ? 'Xóa' : 'Delete'}
          okText={isVi ? 'Xóa' : 'Delete'}
          cancelText={isVi ? 'Hủy' : 'Cancel'}
          okType="danger"
          danger
          icon={<Trash2 size={14} />}
          disabled={disabled}
          loading={loading}
          open={deletePopOpen}
          onOpenChange={setDeletePopOpen}
          onConfirm={onDelete}
        />
      )}
    </Space>
  )
}

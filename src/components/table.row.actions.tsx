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
          onClick={(e) => e.stopPropagation()}
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
    <Space
      size={4}
      wrap={false}
      className="justify-center flex-nowrap whitespace-nowrap"
      onClick={(e: React.MouseEvent) => e.stopPropagation()}
    >
      {extraActions && (
        <span className={`inline-flex items-center gap-1 flex-nowrap whitespace-nowrap ${isAnyPopOpen ? 'pointer-events-none' : ''}`}>
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
            onClick={(e) => {
              e.stopPropagation()
              onView()
            }}
            className="!text-indigo-600 !border-indigo-200/80 !bg-indigo-50/80 hover:!bg-indigo-100 hover:!border-indigo-300 dark:!bg-indigo-950/60 dark:!border-indigo-800 dark:!text-indigo-400 dark:hover:!bg-indigo-900/60 shadow-2xs"
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
            icon={<Edit2 size={14} />}
            onClick={(e) => {
              e.stopPropagation()
              onEdit()
            }}
            className="!text-sky-600 !border-sky-200/80 !bg-sky-50/80 hover:!bg-sky-100 hover:!border-sky-300 dark:!bg-sky-950/60 dark:!border-sky-800 dark:!text-sky-400 dark:hover:!bg-sky-900/60 shadow-2xs"
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
          className="!text-emerald-600 !border-emerald-200/80 !bg-emerald-50/80 hover:!bg-emerald-100 hover:!border-emerald-300 dark:!bg-emerald-950/60 dark:!border-emerald-800 dark:!text-emerald-400 dark:hover:!bg-emerald-900/60 shadow-2xs"
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
          className="!text-rose-600 !border-rose-200/80 !bg-rose-50/80 hover:!bg-rose-100 hover:!border-rose-300 dark:!bg-rose-950/60 dark:!border-rose-800 dark:!text-rose-400 dark:hover:!bg-rose-900/60 shadow-2xs"
          open={deletePopOpen}
          onOpenChange={setDeletePopOpen}
          onConfirm={onDelete}
        />
      )}
    </Space>
  )
}

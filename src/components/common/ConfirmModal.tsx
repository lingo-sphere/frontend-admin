import { useEffect } from 'react'
import { AlertTriangle, Ban, CheckCircle, Trash2 } from 'lucide-react'

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  type?: 'danger' | 'warning' | 'success'
  icon?: 'ban' | 'delete' | 'warning'
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  isLoading?: boolean
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  type = 'danger',
  icon = 'warning',
  title,
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  isLoading = false,
}: ConfirmModalProps) {
  
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const getIcon = () => {
    switch (icon) {
      case 'ban':
        return <Ban className="modal-icon" />
      case 'delete':
        return <Trash2 className="modal-icon" />
      default:
        return <AlertTriangle className="modal-icon" />
    }
  }

  const getIconClass = () => {
    switch (type) {
      case 'danger':
        return 'modal-icon-danger'
      case 'warning':
        return 'modal-icon-warning'
      case 'success':
        return 'modal-icon-success'
      default:
        return 'modal-icon-danger'
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-icon-wrapper">
          <div className={`modal-icon-box ${getIconClass()}`}>
            {getIcon()}
          </div>
        </div>

        <h2 className="modal-title">{title}</h2>
        <p className="modal-message">{message}</p>

        <div className="modal-actions">
          <button
            className="modal-btn modal-btn-cancel"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </button>
          <button
            className={`modal-btn modal-btn-confirm ${type}`}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="modal-spinner" />
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

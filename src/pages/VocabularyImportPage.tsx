import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ChevronLeft,
  Upload,
  FileText,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
} from 'lucide-react'
import { useAdminStore } from '@/store/admin-store'

interface ImportBatch {
  id: string
  name: string
  source_type: 'CSV' | 'JSON' | 'EXCEL' | 'DOCX'
  total_items: number
  items_success: number
  items_failed: number
  items_duplicate: number
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
  created_at: string
}

export function VocabularyImportPage() {
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'
  const setActiveNavItem = useAdminStore((state) => state.setActiveNavItem)
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [importType, setImportType] = useState<'CSV' | 'JSON' | 'EXCEL'>('CSV')

  const importHistory: ImportBatch[] = [
    {
      id: 'imp-001',
      name: 'Business Vocabulary Batch 1',
      source_type: 'CSV',
      total_items: 500,
      items_success: 485,
      items_failed: 10,
      items_duplicate: 5,
      status: 'COMPLETED',
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'imp-002',
      name: 'Tech Terms August',
      source_type: 'EXCEL',
      total_items: 200,
      items_success: 200,
      items_failed: 0,
      items_duplicate: 0,
      status: 'COMPLETED',
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'imp-003',
      name: 'Medical Vocabulary',
      source_type: 'JSON',
      total_items: 150,
      items_success: 0,
      items_failed: 0,
      items_duplicate: 0,
      status: 'PROCESSING',
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ]

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleImport = () => {
    if (!selectedFile) return
    alert(isVietnamese ? 'Đang import...' : 'Importing...')
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <main className="page-content">
      
      <div className="form-header">
        <button className="back-button" onClick={() => setActiveNavItem('vocabulary')}>
          <ChevronLeft />
          {isVietnamese ? 'Quay lại' : 'Back'}
        </button>
        <h1 className="form-title">{isVietnamese ? 'Import từ vựng' : 'Import Vocabulary'}</h1>
      </div>

      <div className="import-content">
        
        <div className="import-upload-section">
          <h2 className="section-title">{isVietnamese ? 'Tải lên file' : 'Upload File'}</h2>

          <div className="file-type-selection">
            <span className="file-type-label">{isVietnamese ? 'Định dạng:' : 'Format:'}</span>
            <div className="file-type-options">
              {(['CSV', 'JSON', 'EXCEL'] as const).map(type => (
                <button
                  key={type}
                  className={`file-type-btn${importType === type ? ' active' : ''}`}
                  onClick={() => setImportType(type)}
                >
                  {type === 'CSV' && <FileText />}
                  {type === 'JSON' && <FileText />}
                  {type === 'EXCEL' && <FileText />}
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div
            className={`drop-zone${dragActive ? ' drag-active' : ''}${selectedFile ? ' has-file' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {selectedFile ? (
              <div className="selected-file">
                <FileText className="file-icon" />
                <div className="file-info">
                  <span className="file-name">{selectedFile.name}</span>
                  <span className="file-size">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </span>
                </div>
                <button
                  className="remove-file"
                  onClick={() => setSelectedFile(null)}
                >
                  <XCircle />
                </button>
              </div>
            ) : (
              <>
                <Upload className="upload-icon" />
                <p className="upload-text">
                  {isVietnamese ? 'Kéo thả file vào đây' : 'Drag and drop file here'}
                </p>
                <p className="upload-subtext">
                  {isVietnamese ? 'hoặc' : 'or'} &nbsp;
                  <label className="upload-link">
                    <input
                      type="file"
                      accept=".csv,.json,.xlsx,.xls"
                      onChange={handleFileSelect}
                      style={{ display: 'none' }}
                    />
                    {isVietnamese ? 'chọn file' : 'select file'}
                  </label>
                </p>
              </>
            )}
          </div>

          <div className="import-options">
            <h3>{isVietnamese ? 'Tùy chọn import' : 'Import Options'}</h3>
            <div className="option-row">
              <label className="option-checkbox">
                <input type="checkbox" defaultChecked />
                <span>{isVietnamese ? 'Bỏ qua từ trùng lặp' : 'Skip duplicate words'}</span>
              </label>
            </div>
            <div className="option-row">
              <label className="option-checkbox">
                <input type="checkbox" defaultChecked />
                <span>{isVietnamese ? 'Tự động gán CEFR level' : 'Auto-assign CEFR level'}</span>
              </label>
            </div>
            <div className="option-row">
              <label className="option-checkbox">
                <input type="checkbox" />
                <span>{isVietnamese ? 'Tạo chủ đề mới nếu chưa có' : 'Create new topic if not exists'}</span>
              </label>
            </div>
          </div>

          <button
            className="primary-button import-btn"
            onClick={handleImport}
            disabled={!selectedFile}
          >
            <Upload />
            {isVietnamese ? 'Bắt đầu Import' : 'Start Import'}
          </button>
        </div>

        <div className="import-history-section">
          <h2 className="section-title">{isVietnamese ? 'Lịch sử import' : 'Import History'}</h2>

          <div className="import-history-list">
            {importHistory.map(batch => (
              <div key={batch.id} className="import-batch-card">
                <div className="batch-header">
                  <div className="batch-info">
                    <span className="batch-name">{batch.name}</span>
                    <span className="batch-date">{formatDate(batch.created_at)}</span>
                  </div>
                  <span className={`batch-status ${batch.status.toLowerCase()}`}>
                    {batch.status === 'COMPLETED' && <CheckCircle />}
                    {batch.status === 'PROCESSING' && <Clock />}
                    {batch.status === 'FAILED' && <XCircle />}
                    {batch.status === 'PENDING' && <Clock />}
                    {batch.status}
                  </span>
                </div>

                <div className="batch-stats">
                  <div className="batch-stat">
                    <span className="stat-value">{batch.total_items}</span>
                    <span className="stat-label">{isVietnamese ? 'Tổng' : 'Total'}</span>
                  </div>
                  <div className="batch-stat success">
                    <span className="stat-value">{batch.items_success}</span>
                    <span className="stat-label">{isVietnamese ? 'Thành công' : 'Success'}</span>
                  </div>
                  <div className="batch-stat error">
                    <span className="stat-value">{batch.items_failed}</span>
                    <span className="stat-label">{isVietnamese ? 'Thất bại' : 'Failed'}</span>
                  </div>
                  <div className="batch-stat duplicate">
                    <span className="stat-value">{batch.items_duplicate}</span>
                    <span className="stat-label">{isVietnamese ? 'Trùng lặp' : 'Duplicate'}</span>
                  </div>
                </div>

                <div className="batch-actions">
                  <span className="file-type-badge">{batch.source_type}</span>
                  {batch.status === 'COMPLETED' && (
                    <button className="batch-action-btn">
                      <Download />
                      {isVietnamese ? 'Tải log' : 'Download log'}
                    </button>
                  )}
                  {batch.items_failed > 0 && (
                    <button className="batch-action-btn">
                      <AlertCircle />
                      {isVietnamese ? 'Xem lỗi' : 'View errors'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}

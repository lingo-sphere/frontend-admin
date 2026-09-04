/**
 * @file VocabularyImportPage.tsx
 * @description Trang quản trị VocabularyImportPage trong giao diện Admin
 */

import { useState } from 'react'
import { ChevronLeft, Download } from 'lucide-react'
import { useAdminStore } from '@/store/admin-store'
import { toast } from '@/store/toast-store'
import { VocabularyImportDropzone } from '@/components/vocabulary/VocabularyImportDropzone'
import {
  VocabularyImportHistoryTable,
  type ImportBatch,
} from '@/components/vocabulary/VocabularyImportHistoryTable'

export function VocabularyImportPage() {
  const setActiveNavItem = useAdminStore((state) => state.setActiveNavItem)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [importType, setImportType] = useState<'CSV' | 'JSON' | 'EXCEL'>('CSV')
  const [isImporting, setIsImporting] = useState(false)
  const [history, setHistory] = useState<ImportBatch[]>([])

  const handleStartImport = async () => {
    if (!selectedFile) {
      toast.error('Vui lòng chọn một tệp dữ liệu trước khi tiếp tục')
      return
    }

    setIsImporting(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 800))
      const newBatch: ImportBatch = {
        id: `imp-${Date.now()}`,
        name: selectedFile.name,
        source_type: importType,
        total_items: 120,
        items_success: 120,
        items_failed: 0,
        items_duplicate: 0,
        status: 'COMPLETED',
        created_at: 'Vừa xong',
      }
      setHistory([newBatch, ...history])
      setSelectedFile(null)
      toast.success('Đã nhập thành công 120 từ vựng vào kho dữ liệu!')
    } catch {
      toast.error('Có lỗi xảy ra khi nhập tệp từ vựng')
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveNavItem('vocabulary')}
            className="p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer shadow-xs"
            type="button"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Nhập Từ Vựng Hàng Loạt (Bulk Import)
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Tải lên danh sách hàng nghìn từ vựng từ tệp Excel / CSV kèm định nghĩa và ví dụ
            </p>
          </div>
        </div>

        <button
          onClick={() => toast.info('Đang tải file Excel mẫu...')}
          className="flex items-center gap-1.5 h-10 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Tải file Excel mẫu</span>
        </button>
      </div>

      <VocabularyImportDropzone
        selectedFile={selectedFile}
        importType={importType}
        isImporting={isImporting}
        onFileSelect={setSelectedFile}
        onImportTypeChange={setImportType}
        onStartImport={handleStartImport}
      />

      <VocabularyImportHistoryTable batches={history} />
    </div>
  )
}

/**
 * @file vocabulary.import.page.tsx
 * @description Trang quản trị VocabularyImportPage trong giao diện Admin
 */

import { useState } from 'react'
import { ChevronLeft, Download } from 'lucide-react'
import * as XLSX from 'xlsx'
import { useAdminStore } from '@/store/admin.store'
import { toast } from '@/store/toast.store'
import { vocabularyService } from '@/features/vocabulary/services/vocabulary.service'
import { VocabularyImportDropzone } from '@/features/vocabulary/components/vocabulary.import.dropzone'
import {
  VocabularyImportHistoryTable,
  type ImportBatch,
} from '@/features/vocabulary/components/vocabulary.import.history.table'

export function VocabularyImportPage() {
  const setActiveNavItem = useAdminStore((state) => state.setActiveNavItem)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [importType, setImportType] = useState<'CSV' | 'JSON' | 'EXCEL'>('EXCEL')
  const [isImporting, setIsImporting] = useState(false)
  const [history, setHistory] = useState<ImportBatch[]>([])

  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'Từ vựng': 'resilient',
        'Từ loại': 'ADJECTIVE',
        'Trình độ': 'B2',
        'Định nghĩa (EN)': 'Able to withstand or recover quickly from difficult conditions.',
        'Định nghĩa (VI)': 'Kiên cường, có khả năng phục hồi nhanh chóng.',
        'Ví dụ': 'The local economy is remarkably resilient.',
      },
      {
        'Từ vựng': 'collaborate',
        'Từ loại': 'VERB',
        'Trình độ': 'B1',
        'Định nghĩa (EN)': 'Work jointly on an activity or project.',
        'Định nghĩa (VI)': 'Hợp tác, cùng làm việc.',
        'Ví dụ': 'We have collaborated on several projects.',
      },
    ]

    const ws = XLSX.utils.json_to_sheet(templateData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'VocabTemplate')
    XLSX.writeFile(wb, 'LingoSphere_Vocabulary_Template.xlsx')
  }

  const handleStartImport = async () => {
    if (!selectedFile) {
      toast.error('Vui lòng chọn một tệp dữ liệu trước khi tiếp tục')
      return
    }

    setIsImporting(true)
    try {
      const buffer = await selectedFile.arrayBuffer()
      const wb = XLSX.read(buffer, { type: 'array' })
      const sheetName = wb.SheetNames[0]
      const ws = wb.Sheets[sheetName]
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws)

      if (!rows || rows.length === 0) {
        toast.error('File dữ liệu không có dòng từ vựng nào hợp lệ')
        return
      }

      let successCount = 0
      let failedCount = 0

      for (const row of rows) {
        const wordText = String(row['Từ vựng'] || row['word'] || row['Word'] || '').trim()
        const definition = String(row['Định nghĩa (EN)'] || row['definition'] || row['Definition'] || '').trim()
        const definitionVi = String(row['Định nghĩa (VI)'] || row['definition_vi'] || row['Nghĩa tiếng Việt'] || '').trim()
        const pos = String(row['Từ loại'] || row['part_of_speech'] || row['pos'] || 'NOUN').trim()
        const cefr = String(row['Trình độ'] || row['cefr_level'] || row['level'] || 'B1').trim()
        const example = String(row['Ví dụ'] || row['example'] || row['Example'] || '').trim()

        if (wordText) {
          try {
            await vocabularyService.createLexicalItem({
              word: wordText,
              word_type: pos || 'NOUN',
              cefr_level: cefr || 'B1',
              meanings: [
                {
                  meaning_order: 1,
                  part_of_speech: pos || 'NOUN',
                  definition_en: definition,
                  definition_vi: definitionVi,
                  examples: example ? [example] : [],
                  is_primary: true,
                },
              ],
            })
            successCount++
          } catch {
            failedCount++
          }
        }
      }

      const newBatch: ImportBatch = {
        id: `imp-${Date.now()}`,
        name: selectedFile.name,
        source_type: importType,
        total_items: rows.length,
        items_success: successCount,
        items_failed: failedCount,
        items_duplicate: 0,
        status: failedCount === rows.length ? 'FAILED' : 'COMPLETED',
        created_at: 'Vừa xong',
      }
      setHistory((prev) => [newBatch, ...prev])
      setSelectedFile(null)
      toast.success(`Đã nạp thành công ${successCount}/${rows.length} từ vựng vào hệ thống!`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Có lỗi xảy ra khi nhập tệp từ vựng'
      toast.error(msg)
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
          onClick={handleDownloadTemplate}
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

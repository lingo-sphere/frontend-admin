/**
 * @file VocabularyImportDropzone.tsx
 * @description Component giao diện VocabularyImportDropzone phục vụ khu vực Quản trị Admin
 */

import { Upload, FileText } from 'lucide-react'

interface VocabularyImportDropzoneProps {
  selectedFile: File | null
  importType: 'CSV' | 'JSON' | 'EXCEL'
  isImporting: boolean
  onFileSelect: (file: File | null) => void
  onImportTypeChange: (type: 'CSV' | 'JSON' | 'EXCEL') => void
  onStartImport: () => void
}

export function VocabularyImportDropzone({
  selectedFile,
  importType,
  isImporting,
  onFileSelect,
  onImportTypeChange,
  onStartImport,
}: VocabularyImportDropzoneProps) {
  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Upload className="w-4 h-4 text-indigo-500" />
          <span>Tải Lên Tệp Dữ Liệu Từ Vựng</span>
        </h3>

        <div className="flex gap-2">
          {(['CSV', 'EXCEL', 'JSON'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => onImportTypeChange(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                importType === t
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <label className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center gap-3 hover:border-indigo-500/50 cursor-pointer transition-all bg-slate-50/50 dark:bg-slate-950/40">
        <input
          type="file"
          accept=".csv,.xlsx,.xls,.json"
          className="hidden"
          onChange={(e) => onFileSelect(e.target.files?.[0] || null)}
        />
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
          <FileText className="w-6 h-6" />
        </div>
        <div className="text-center">
          <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
            {selectedFile ? selectedFile.name : 'Kéo thả tệp hoặc bấm để chọn tệp từ máy tính'}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Hỗ trợ định dạng CSV, Microsoft Excel (.xlsx) hoặc JSON chuẩn schema LingoSphere
          </p>
        </div>
      </label>

      <div className="flex justify-end pt-2">
        <button
          type="button"
          disabled={!selectedFile || isImporting}
          onClick={onStartImport}
          className="flex items-center gap-2 h-10 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
        >
          <Upload className="w-4 h-4" />
          <span>{isImporting ? 'Đang Xử Lý Dữ Liệu...' : 'Bắt Đầu Nhập Dữ Liệu'}</span>
        </button>
      </div>
    </div>
  )
}

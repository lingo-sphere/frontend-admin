import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ChevronLeft,
  Upload,
  FileText,
  Download,
  CheckCircle,
  Clock,
} from 'lucide-react'
import { useAdminStore } from '@/store/admin-store'
import { toast } from '@/store/toast-store'

interface ImportBatch {
  id: string
  name: string
  source_type: 'CSV' | 'JSON' | 'EXCEL'
  total_items: number
  items_success: number
  items_failed: number
  items_duplicate: number
  status: 'COMPLETED' | 'FAILED'
  created_at: string
}

export function VocabularyImportPage() {
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'
  const setActiveNavItem = useAdminStore((state) => state.setActiveNavItem)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [importType, setImportType] = useState<'CSV' | 'JSON' | 'EXCEL'>('CSV')
  const [isImporting, setIsImporting] = useState(false)

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
      created_at: '22/08/2026',
    },
    {
      id: 'imp-002',
      name: 'TOEIC Essential 600 Words',
      source_type: 'EXCEL',
      total_items: 600,
      items_success: 600,
      items_failed: 0,
      items_duplicate: 0,
      status: 'COMPLETED',
      created_at: '19/08/2026',
    },
  ]

  const handleStartImport = async () => {
    if (!selectedFile) {
      toast.error('Vui lòng chọn file dữ liệu để import')
      return
    }
    setIsImporting(true)
    try {
      await new Promise((r) => setTimeout(r, 1200))
      toast.success(`Đã nạp thành công dữ liệu từ file ${selectedFile.name}!`)
      setSelectedFile(null)
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      <div className="flex items-center gap-3">
        <button
          onClick={() => setActiveNavItem('vocabulary')}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition-colors cursor-pointer"
          type="button"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
            Nhập Dữ Liệu Từ Vựng Hàng Loạt
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Hỗ trợ nhập kho từ vựng từ tệp CSV, Excel (XLSX) hoặc JSON có sẵn phiên âm và ví dụ
          </p>
        </div>
      </div>

      <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-300">Định dạng tệp:</span>
            {(['CSV', 'EXCEL', 'JSON'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setImportType(type)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  importType === type
                    ? 'bg-teal-500 text-slate-950'
                    : 'bg-slate-950/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => toast.info('Đang tải file mẫu...')}
            className="flex items-center gap-1.5 text-xs text-teal-400 hover:text-teal-300 font-semibold cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Tải template mẫu (.csv)</span>
          </button>
        </div>

        <label className="flex flex-col items-center justify-center p-10 border-2 border-dashed border-slate-800 hover:border-teal-500/50 rounded-2xl bg-slate-950/50 cursor-pointer transition-colors group">
          <div className="w-14 h-14 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Upload className="w-7 h-7" />
          </div>
          <p className="text-sm font-semibold text-slate-200">
            {selectedFile ? selectedFile.name : 'Kéo thả file từ vựng vào đây hoặc bấm để chọn'}
          </p>
          <p className="text-xs text-slate-500 mt-1">Hỗ trợ .csv, .xlsx, .json (Dung lượng tối đa 20MB)</p>
          <input
            type="file"
            accept=".csv,.xlsx,.json"
            onChange={(e) => e.target.files?.[0] && setSelectedFile(e.target.files[0])}
            className="hidden"
          />
        </label>

        {selectedFile && (
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-teal-400" />
              <div>
                <p className="text-xs font-semibold text-slate-200">{selectedFile.name}</p>
                <p className="text-[10px] text-slate-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
              </div>
            </div>
            <button
              onClick={handleStartImport}
              disabled={isImporting}
              className="h-10 px-5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isImporting ? 'Đang import...' : 'Bắt đầu Import'}
            </button>
          </div>
        )}
      </div>

      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-400" />
          <span>Lịch sử các đợt nạp từ vựng</span>
        </h3>

        <div className="divide-y divide-slate-800/60">
          {importHistory.map((item) => (
            <div key={item.id} className="py-3 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-slate-200">{item.name}</p>
                <p className="text-[11px] text-slate-500">
                  {item.source_type} · {item.created_at}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-teal-400 font-bold">
                  {item.items_success} / {item.total_items} từ
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

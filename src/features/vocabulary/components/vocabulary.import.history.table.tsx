// Bảng hiển thị lịch sử các đợt nhập dữ liệu từ vựng gần đây trong trang quản trị.

import { useTranslation } from 'react-i18next'
import { CheckCircle, Clock } from 'lucide-react'

export interface ImportBatch {
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

interface VocabularyImportHistoryTableProps {
  batches: ImportBatch[]
}

export function VocabularyImportHistoryTable({
  batches,
}: VocabularyImportHistoryTableProps) {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-1">
        <Clock className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
          {isVi ? 'Lịch Sử Nhập Dữ Liệu Gần Đây' : 'Recent Import History'}
        </h3>
      </div>

      <div className="rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 text-slate-700 dark:text-slate-200 font-bold text-[13px] tracking-wide">
                <th className="py-3 px-3.5 text-center">{isVi ? 'Tên đợt nhập' : 'Batch Name'}</th>
                <th className="py-3 px-3.5 text-center">{isVi ? 'Định dạng' : 'Format'}</th>
                <th className="py-3 px-3.5 text-center">{isVi ? 'Tổng số từ' : 'Total Words'}</th>
                <th className="py-3 px-3.5 text-center">{isVi ? 'Thành công' : 'Success'}</th>
                <th className="py-3 px-3.5 text-center">{isVi ? 'Lỗi / Trùng lặp' : 'Errors / Duplicates'}</th>
                <th className="py-3 px-3.5 text-center">{isVi ? 'Trạng thái' : 'Status'}</th>
                <th className="py-3 px-3.5 text-center">{isVi ? 'Thời gian' : 'Time'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-200">
              {batches.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    {isVi ? 'Chưa có đợt nhập nào gần đây' : 'No recent import batches found'}
                  </td>
                </tr>
              ) : (
                batches.map((batch) => (
                  <tr key={batch.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3.5 font-semibold text-slate-900 dark:text-slate-100">
                      {batch.name}
                    </td>
                    <td className="py-3 px-3.5 text-center">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {batch.source_type}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-center font-bold">{batch.total_items}</td>
                    <td className="py-3 px-3.5 text-center text-emerald-600 dark:text-emerald-400 font-semibold">
                      {batch.items_success}
                    </td>
                    <td className="py-3 px-3.5 text-center text-slate-400">
                      {batch.items_failed} {isVi ? 'lỗi' : 'err'} / {batch.items_duplicate} {isVi ? 'trùng' : 'dup'}
                    </td>
                    <td className="py-3 px-3.5 text-center">
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                        <CheckCircle className="w-3.5 h-3.5" />
                        {isVi ? 'Hoàn tất' : 'Completed'}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-center text-slate-400">{batch.created_at}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}


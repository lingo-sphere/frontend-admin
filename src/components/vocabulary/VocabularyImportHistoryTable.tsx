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
  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4 text-indigo-500" />
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
          Lịch Sử Nhập Dữ Liệu Gần Đây
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-500 font-semibold">
              <th className="pb-3 px-3">Tên đợt nhập</th>
              <th className="pb-3 px-3">Định dạng</th>
              <th className="pb-3 px-3">Tổng số từ</th>
              <th className="pb-3 px-3">Thành công</th>
              <th className="pb-3 px-3">Lỗi / Trùng lặp</th>
              <th className="pb-3 px-3">Trạng thái</th>
              <th className="pb-3 px-3">Thời gian</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
            {batches.map((batch) => (
              <tr key={batch.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                <td className="py-3 px-3 font-semibold text-slate-900 dark:text-slate-100">
                  {batch.name}
                </td>
                <td className="py-3 px-3">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {batch.source_type}
                  </span>
                </td>
                <td className="py-3 px-3 font-bold">{batch.total_items}</td>
                <td className="py-3 px-3 text-emerald-600 dark:text-emerald-400 font-semibold">
                  {batch.items_success}
                </td>
                <td className="py-3 px-3 text-slate-400">
                  {batch.items_failed} lỗi / {batch.items_duplicate} trùng
                </td>
                <td className="py-3 px-3">
                  <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Hoàn tất
                  </span>
                </td>
                <td className="py-3 px-3 text-slate-400">{batch.created_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

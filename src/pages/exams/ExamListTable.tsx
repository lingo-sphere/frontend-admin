import {
  FileText,
  Search,
  CheckCircle,
  Clock,
  HelpCircle,
  Trash2,
  Edit,
  Award,
} from 'lucide-react'
import type { ToeicExamItem } from '@/services/exam.service'

interface ExamListTableProps {
  exams: ToeicExamItem[]
  searchQuery: string
  onSearchChange: (val: string) => void
  selectedType: string
  onTypeChange: (val: string) => void
  onTogglePublish: (id: string, current: boolean) => void
  onDeleteExam: (id: string) => void
}

export function ExamListTable({
  exams,
  searchQuery,
  onSearchChange,
  selectedType,
  onTypeChange,
  onTogglePublish,
  onDeleteExam,
}: ExamListTableProps) {
  const filteredExams = exams.filter((exam) => {
    const matchesSearch = exam.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
    const matchesType =
      selectedType === 'ALL' || exam.type === selectedType
    return matchesSearch && matchesType
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            size={16}
          />
          <input
            type="text"
            placeholder="Tìm kiếm đề thi theo tên..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
          {['ALL', 'FULL_TEST', 'MINI_TEST', 'PRE_TEST', 'POST_MINI_TEST'].map(
            (type) => (
              <button
                key={type}
                onClick={() => onTypeChange(type)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedType === type
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300'
                }`}
              >
                {type === 'ALL'
                  ? 'Tất cả'
                  : type === 'FULL_TEST'
                    ? 'Full Test (200c)'
                    : type === 'MINI_TEST'
                      ? 'Mini Test'
                      : type === 'PRE_TEST'
                        ? 'Pre-Test'
                        : 'Post-Mini Test'}
              </button>
            )
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-400">
                <th className="py-3.5 px-4">Tên đề thi</th>
                <th className="py-3.5 px-4">Loại đề</th>
                <th className="py-3.5 px-4">Thời lượng</th>
                <th className="py-3.5 px-4">Số câu</th>
                <th className="py-3.5 px-4">Lượt thi</th>
                <th className="py-3.5 px-4">Điểm TB</th>
                <th className="py-3.5 px-4">Trạng thái</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 dark:divide-slate-800/60 dark:text-slate-200">
              {filteredExams.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Không tìm thấy đề thi nào phù hợp
                  </td>
                </tr>
              ) : (
                filteredExams.map((exam) => (
                  <tr
                    key={exam.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-slate-100">
                      <div className="flex items-center gap-2.5">
                        <FileText size={16} className="text-indigo-500 shrink-0" />
                        <span>{exam.title}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20">
                        {exam.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="flex items-center gap-1">
                        <Clock size={13} className="text-slate-400" />
                        {exam.duration_minutes} phút
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="flex items-center gap-1">
                        <HelpCircle size={13} className="text-slate-400" />
                        {exam.total_questions} câu
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">
                      {(exam.total_attempts || 0).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-teal-600 dark:text-teal-400">
                      {exam.avg_score || 0} pts
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() =>
                          onTogglePublish(exam.id, exam.is_published)
                        }
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-colors cursor-pointer ${
                          exam.is_published
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                            : 'bg-slate-100 text-slate-500 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                        }`}
                      >
                        {exam.is_published ? 'Xuất bản' : 'Bản nháp'}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onDeleteExam(exam.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Xóa đề thi"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
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

/**
 * @file course.student.scores.modal.tsx
 * @description Modal xem bảng điểm kiểm tra chi tiết từng chương và tiến độ học tập của toàn bộ học viên trong khóa học
 */

import {
  X,
  Search,
  Users,
  GraduationCap,
  CheckCircle2,
  BookOpen,
  RefreshCw,
} from 'lucide-react'
import { useCourseStudentScores } from '@/hooks/use.course.student.scores'
import { StudentScoresTableRow } from './student.scores.table.row'

interface CourseStudentScoresModalProps {
  isOpen: boolean
  onClose: () => void
  courseId: string
  courseTitle: string
}

export function CourseStudentScoresModal({
  isOpen,
  onClose,
  courseId,
  courseTitle,
}: CourseStudentScoresModalProps) {
  const {
    data,
    usersMap,
    isLoading,
    searchTerm,
    setSearchTerm,
    filteredStudents,
    fetchData,
  } = useCourseStudentScores(courseId, isOpen)

  if (!isOpen) return null

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/25 dark:bg-black/35 backdrop-blur-[2px] animate-in fade-in duration-150"
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl w-full max-w-5xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden ring-1 ring-black/5 dark:ring-white/10 animate-in zoom-in-95 duration-150">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 truncate">
                  Bảng Điểm & Tiến Độ Học Viên
                </h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                  {data?.total_students || 0} học viên
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                Khóa học:{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {courseTitle}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchData}
              disabled={isLoading}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              title="Làm mới dữ liệu"
              type="button"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
              title="Đóng"
              type="button"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên hoặc email học viên..."
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end flex-wrap text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-medium">
              <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
              <span>
                Tiến độ TB: <strong>{data?.average_progress_percentage || 0}%</strong>
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>
                Đã hoàn thành: <strong>{data?.completed_students || 0}</strong>
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
              <RefreshCw className="w-7 h-7 animate-spin text-indigo-500" />
              <p className="text-xs font-medium">Đang tải bảng điểm học viên...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
              <Users className="w-10 h-10 stroke-1" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                {searchTerm
                  ? 'Không tìm thấy học viên phù hợp'
                  : 'Chưa có học viên nào ghi danh khóa học'}
              </p>
              <p className="text-xs text-slate-500">
                Dữ liệu tiến độ và điểm thi sẽ hiển thị tại đây khi học viên tham gia học.
              </p>
            </div>
          ) : (
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                      <th className="py-3 px-4">Học viên</th>
                      <th className="py-3 px-4">Tiến độ bài học</th>
                      <th className="py-3 px-4 min-w-[280px]">Điểm kiểm tra từng chương</th>
                      <th className="py-3 px-4 text-center">Thi tốt nghiệp</th>
                      <th className="py-3 px-4 text-center">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {filteredStudents.map((st) => (
                      <StudentScoresTableRow
                        key={st.user_id}
                        student={st}
                        userProfile={
                          usersMap.get(st.user_id) || usersMap.get(String(st.user_id))
                        }
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Hiển thị <strong>{filteredStudents.length}</strong> /{' '}
            <strong>{data?.total_students || 0}</strong> học viên
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer"
          >
            Đóng bảng điểm
          </button>
        </div>
      </div>
    </div>
  )
}

// Trang quản trị hiển thị bảng điểm chi tiết và tiến độ học viên của khóa học.

import {
  GraduationCap,
  ArrowLeft,
  Search,
  RefreshCw,
  TrendingUp,
  Award,
  Users,
  CheckCircle2,
  FileCheck2,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAdminCourseDetailQuery } from '@/features/courses/hooks/use.courses.admin.query'
import { useCourseStudentScores } from '@/features/courses/hooks/use.course.student.scores'
import { StudentScoresTableRow } from '@/features/courses/components/student.scores.table.row'

interface CourseScoresPageProps {
  courseId: string
}

export function CourseScoresPage({ courseId }: CourseScoresPageProps) {
  const navigate = useNavigate()
  const { data: courseInfo = null } = useAdminCourseDetailQuery(courseId)

  const {
    data,
    usersMap,
    isLoading,
    searchTerm,
    setSearchTerm,
    filteredStudents,
    fetchData,
  } = useCourseStudentScores(courseId, true)

  const totalStudents = data?.total_students || 0
  const avgProgress = data?.average_progress_percentage || 0
  const completedStudents = data?.completed_students || 0
  const studentsList = filteredStudents || []

  const courseTitle = courseInfo?.title || 'Khóa học'

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/courses')}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-all cursor-pointer shadow-2xs shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại khóa học</span>
          </button>

          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-black text-slate-900 dark:text-slate-100 truncate">
                  Bảng Điểm & Tiến Độ Học Viên
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                  {totalStudents} học viên
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                Khóa học: <span className="font-semibold text-slate-700 dark:text-slate-300">{courseTitle}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => navigate(`/courses/${courseId}/submissions`)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 text-xs font-bold text-indigo-700 dark:text-indigo-300 transition-all cursor-pointer shadow-2xs"
          >
            <FileCheck2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Chấm bài Nói & Viết</span>
          </button>

          <button
            type="button"
            onClick={fetchData}
            disabled={isLoading}
            className="inline-flex items-center gap-2 p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-indigo-500' : ''}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Tổng ghi danh</div>
            <div className="text-lg font-black text-slate-900 dark:text-slate-100">{totalStudents}</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Đã hoàn thành</div>
            <div className="text-lg font-black text-slate-900 dark:text-slate-100">{completedStudents}</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Tiến độ trung bình</div>
            <div className="text-lg font-black text-slate-900 dark:text-slate-100">{avgProgress}%</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Mục tiêu đầu ra</div>
            <div className="text-lg font-black text-slate-900 dark:text-slate-100">
              {courseInfo?.target_score ? `${courseInfo.target_score}+ TOEIC` : '-'}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên học viên, email hoặc ID..."
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 self-end sm:self-auto">
            Hiển thị {studentsList.length} / {totalStudents} học viên
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/75 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 font-bold">
                <th className="py-3 px-4">Học viên</th>
                <th className="py-3 px-4">Tiến độ bài học</th>
                <th className="py-3 px-4">Điểm đầu vào</th>
                <th className="py-3 px-4">Bài kiểm tra các chương</th>
                <th className="py-3 px-4">Điểm tốt nghiệp</th>
                <th className="py-3 px-4">Tăng trưởng</th>
                <th className="py-3 px-4">Ghi danh lúc</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-indigo-500 mb-2" />
                    <span>Đang nạp bảng điểm học viên...</span>
                  </td>
                </tr>
              ) : studentsList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                    <p className="font-semibold">Chưa có học viên nào phù hợp với bộ lọc tìm kiếm.</p>
                  </td>
                </tr>
              ) : (
                studentsList.map((student) => (
                  <StudentScoresTableRow
                    key={student.user_id}
                    student={student}
                    userProfile={usersMap.get(student.user_id)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

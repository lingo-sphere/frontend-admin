/**
 * @file course.student.scores.modal.tsx
 * @description Modal quản trị cho giảng viên và admin xem bảng điểm kiểm tra chi tiết từng chương và tiến độ học tập của toàn bộ học viên trong khóa học
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  X,
  Search,
  Users,
  GraduationCap,
  Trophy,
  CheckCircle2,
  Clock,
  Zap,
  FileCheck2,
  BookOpen,
  Award,
  RefreshCw,
} from 'lucide-react'
import { progressService, type CourseStudentsProgressResponse, type StudentProgressItem } from '@/services/progress.service'
import { userService } from '@/services/user.service'
import type { UserProfile } from '@/types/api.types'
import { toast } from '@/store/toast.store'

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
  const [data, setData] = useState<CourseStudentsProgressResponse | null>(null)
  const [usersMap, setUsersMap] = useState<Map<string, UserProfile>>(new Map())
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [searchTerm, setSearchTerm] = useState<string>('')

  const fetchData = useCallback(async () => {
    if (!courseId) return
    setIsLoading(true)
    try {
      const [progressRes, usersRes] = await Promise.all([
        progressService.getCourseStudentsProgress(courseId),
        userService.getAllUsers({ limit: 100 }).catch(() => null),
      ])

      setData(progressRes)

      if (usersRes) {
        const uList = Array.isArray(usersRes)
          ? usersRes
          : Array.isArray((usersRes as any).result)
          ? (usersRes as any).result
          : Array.isArray((usersRes as any).data)
          ? (usersRes as any).data
          : []
        const map = new Map<string, UserProfile>()
        uList.forEach((u: any) => {
          if (u.user_id) map.set(String(u.user_id), u)
          if (u._id) map.set(String(u._id), u)
          if (u.id) map.set(String(u.id), u)
        })
        setUsersMap(map)
      }
    } catch {
      toast.error('Không thể tải dữ liệu bảng điểm học viên.')
    } finally {
      setIsLoading(false)
    }
  }, [courseId])

  useEffect(() => {
    if (isOpen) {
      fetchData()
    } else {
      setData(null)
      setSearchTerm('')
    }
  }, [isOpen, fetchData])

  useEffect(() => {
    if (!data?.students || data.students.length === 0) return

    const missingIds = data.students
      .map((s) => s.user_id)
      .filter((uid) => uid && !usersMap.has(uid) && !usersMap.has(String(uid)))

    if (missingIds.length === 0) return

    Promise.all(
      missingIds.map((uid) =>
        userService.getProfileById(uid).catch(() => null)
      )
    ).then((profiles) => {
      setUsersMap((prev) => {
        const next = new Map(prev)
        profiles.forEach((p: any, idx) => {
          const fallbackUid = missingIds[idx]
          if (p) {
            const actualProfile = p.profile || p.data || p
            next.set(fallbackUid, actualProfile)
            if (actualProfile.user_id) next.set(String(actualProfile.user_id), actualProfile)
            if (actualProfile._id) next.set(String(actualProfile._id), actualProfile)
            if (actualProfile.id) next.set(String(actualProfile.id), actualProfile)
          }
        })
        return next
      })
    })
  }, [data?.students, usersMap])

  const filteredStudents = useMemo(() => {
    if (!data?.students) return []
    if (!searchTerm.trim()) return data.students

    const term = searchTerm.toLowerCase()
    return data.students.filter((st) => {
      const u = usersMap.get(st.user_id) || usersMap.get(String(st.user_id))
      const name = (u?.full_name || (u as any)?.fullName || st.full_name || '').toLowerCase()
      const email = (u?.email || st.email || '').toLowerCase()
      return name.includes(term) || email.includes(term) || st.user_id.toLowerCase().includes(term)
    })
  }, [data?.students, searchTerm, usersMap])

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
                Khóa học: <span className="font-semibold text-slate-700 dark:text-slate-300">{courseTitle}</span>
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
              <span>Tiến độ TB: <strong>{data?.average_progress_percentage || 0}%</strong></span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Đã hoàn thành: <strong>{data?.completed_students || 0}</strong></span>
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
                {searchTerm ? 'Không tìm thấy học viên phù hợp' : 'Chưa có học viên nào ghi danh khóa học'}
              </p>
              <p className="text-xs text-slate-500">Dữ liệu tiến độ và điểm thi sẽ hiển thị tại đây khi học viên tham gia học.</p>
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
                    {filteredStudents.map((st) => {
                      const user = usersMap.get(st.user_id) || usersMap.get(String(st.user_id))
                      const displayName: string = String(user?.full_name || (user as any)?.fullName || (user as any)?.name || st.full_name || `Học viên #${st.user_id.slice(-6)}`)
                      const displayEmail: string = String(user?.email || st.email || 'Học viên đã đăng ký')
                      const avatarUrl: string | undefined = user?.avatar_url || (user as any)?.avatar || st.avatar_url
                      const initials = displayName
                        .split(' ')
                        .map((n: string) => n[0])
                        .slice(-2)
                        .join('')
                        .toUpperCase()

                      const modules = st.modules_progress || []

                      return (
                        <tr key={st.user_id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden shadow-xs">
                                {avatarUrl ? (
                                  <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <span>{initials}</span>
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-slate-900 dark:text-slate-100 truncate max-w-[180px]">
                                  {displayName}
                                </div>
                                <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[180px]">
                                  {displayEmail}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="space-y-1.5 min-w-[130px]">
                              <div className="flex items-center justify-between text-[11px] font-bold">
                                <span className="text-indigo-600 dark:text-indigo-400">{st.progress_percentage}%</span>
                                <span className="text-slate-500 dark:text-slate-400 font-medium">
                                  {st.completed_lessons}/{st.total_lessons} bài
                                </span>
                              </div>
                              <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-300"
                                  style={{ width: `${Math.min(100, Math.max(0, st.progress_percentage))}%` }}
                                />
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            {modules.length === 0 ? (
                              <span className="text-[11px] text-slate-400 italic">Chưa thực hiện kiểm tra</span>
                            ) : (
                              <div className="flex flex-wrap gap-1.5">
                                {modules.map((m, mIdx) => {
                                  const chNum = m.order_index || mIdx + 1
                                  const hasChallenge = (m.challenge_score || 0) > 0 || m.is_passed_by_challenge
                                  const hasPostMini = (m.post_mini_score || 0) > 0

                                  return (
                                    <div
                                      key={m.module_id || mIdx}
                                      className="px-2 py-1 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-1.5 text-[11px] shadow-2xs"
                                    >
                                      <span className="font-extrabold text-slate-700 dark:text-slate-200">
                                        C{chNum}:
                                      </span>

                                      {hasChallenge && (
                                        <span
                                          className={`inline-flex items-center gap-0.5 font-bold px-1 rounded ${
                                            m.is_passed_by_challenge
                                              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                                              : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                                          }`}
                                          title={`Thử thách đầu chương: ${m.challenge_score || 0}%`}
                                        >
                                          <Zap className="w-2.5 h-2.5" />
                                          <span>{m.challenge_score || 0}%</span>
                                        </span>
                                      )}

                                      {hasPostMini ? (
                                        <span
                                          className={`inline-flex items-center gap-0.5 font-bold px-1 rounded ${
                                            (m.post_mini_score || 0) >= 70
                                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                                              : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                                          }`}
                                          title={`Kiểm tra cuối chương: ${m.post_mini_score}%`}
                                        >
                                          <FileCheck2 className="w-2.5 h-2.5" />
                                          <span>{m.post_mini_score}%</span>
                                        </span>
                                      ) : !hasChallenge ? (
                                        <span className="text-slate-400 text-[10px]">Chưa thi</span>
                                      ) : null}
                                    </div>
                                  )
                                })}
                              </div>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            {typeof st.final_test_score === 'number' && st.final_test_score > 0 ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-extrabold text-[11px] border border-emerald-200 dark:border-emerald-800 shadow-2xs">
                                <Award className="w-3.5 h-3.5 text-emerald-500" />
                                <span>{st.final_test_score}%</span>
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[11px] font-medium">—</span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            {st.progress_percentage >= 100 || st.status === 'COMPLETED' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                <span>Hoàn thành</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                                <Clock className="w-3 h-3 text-indigo-500" />
                                <span>Đang học</span>
                              </span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Hiển thị <strong>{filteredStudents.length}</strong> / <strong>{data?.total_students || 0}</strong> học viên
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

// Trang quản trị hiển thị bảng điểm chi tiết và tiến độ học viên của khóa học chuẩn hóa DataTable.

import { useState, useMemo } from "react";
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
  Target,
  Clock,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAdminCourseDetailQuery } from "@/features/courses/hooks/use.courses.admin.query";
import { useCourseStudentScores } from "@/features/courses/hooks/use.course.student.scores";
import { DataTable, type DataTableColumn } from "@/components/data.table";
import { StatCard } from "@/components/stat.card";
import type { StudentProgressItem } from "@/features/progress/services/progress.service";

interface CourseScoresPageProps {
  courseId: string;
}

export function CourseScoresPage({ courseId }: CourseScoresPageProps) {
  const navigate = useNavigate();
  const { data: courseInfo = null } = useAdminCourseDetailQuery(courseId);

  const {
    data,
    usersMap,
    isLoading,
    searchTerm,
    setSearchTerm,
    filteredStudents,
    fetchData,
  } = useCourseStudentScores(courseId, true);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const totalStudents = data?.total_students || 0;
  const avgProgress = data?.average_progress_percentage || 0;
  const completedStudents = data?.completed_students || 0;
  const studentsList = filteredStudents || [];

  const courseTitle = courseInfo?.title || "Khóa học";

  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return studentsList.slice(start, start + pageSize);
  }, [studentsList, currentPage, pageSize]);

  const columns: DataTableColumn<StudentProgressItem>[] = useMemo(
    () => [
      {
        key: "learner",
        dataIndex: "full_name",
        title: "Học viên",
        align: "left",
        render: (student) => {
          const userProfile = usersMap.get(student.user_id);
          const displayName: string = String(
            userProfile?.full_name || student.full_name || ""
          );
          const displayEmail: string = String(
            userProfile?.email || student.email || ""
          );
          const avatarUrl: string | undefined =
            userProfile?.avatar_url || student.avatar_url;
          const initials = displayName
            .split(" ")
            .map((n: string) => n[0])
            .slice(-2)
            .join("")
            .toUpperCase();

          return (
            <div className="flex items-center gap-3 min-w-0 w-full">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden shadow-xs">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{initials}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div
                  className="font-bold text-slate-900 dark:text-slate-100 truncate"
                  title={displayName}
                >
                  {displayName}
                </div>
                <div
                  className="text-[11px] text-slate-500 dark:text-slate-400 truncate"
                  title={displayEmail}
                >
                  {displayEmail}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        key: "progress",
        dataIndex: "progress_percentage",
        title: "Tiến độ bài học",
        width: 180,
        align: "center",
        render: (student) => (
          <div className="space-y-1.5 min-w-[140px]">
            <div className="flex items-center justify-between text-[11px] font-bold">
              <span className="text-indigo-600 dark:text-indigo-400">
                {student.progress_percentage}%
              </span>
              <span className="text-slate-500 dark:text-slate-400 font-medium">
                {student.completed_lessons}/{student.total_lessons} bài
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(
                    100,
                    Math.max(0, student.progress_percentage)
                  )}%`,
                }}
              />
            </div>
          </div>
        ),
      },
      {
        key: "modules",
        title: "Bài kiểm tra các chương",
        align: "center",
        render: (student) => {
          const modules = student.modules_progress || [];
          if (modules.length === 0) {
            return (
              <span className="text-[11px] text-slate-400 italic">
                Chưa thực hiện kiểm tra
              </span>
            );
          }

          return (
            <div className="flex flex-wrap justify-center gap-1.5 max-w-[320px] mx-auto">
              {modules.map((m, mIdx) => {
                const chNum = m.order_index || mIdx + 1;
                const hasChallenge =
                  (m.challenge_score || 0) > 0 || m.is_passed_by_challenge;
                const hasPostMini = (m.post_mini_score || 0) > 0;

                return (
                  <div
                    key={m.module_id || mIdx}
                    className="px-2 py-0.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-1.5 text-[11px] shadow-2xs"
                  >
                    <span className="font-extrabold text-slate-700 dark:text-slate-200">
                      C{chNum}:
                    </span>

                    {hasChallenge && (
                      <span
                        className={`inline-flex items-center gap-0.5 font-bold px-1 rounded ${
                          m.is_passed_by_challenge
                            ? "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300"
                            : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                        }`}
                        title={`Thử thách đầu chương: ${
                          m.challenge_score || 0
                        }%`}
                      >
                        <Target className="w-2.5 h-2.5" />
                        <span>{m.challenge_score || 0}%</span>
                      </span>
                    )}

                    {hasPostMini ? (
                      <span
                        className={`inline-flex items-center gap-0.5 font-bold px-1 rounded ${
                          (m.post_mini_score || 0) >= 70
                            ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"
                            : "bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300"
                        }`}
                        title={`Kiểm tra cuối chương: ${m.post_mini_score}%`}
                      >
                        <FileCheck2 className="w-2.5 h-2.5" />
                        <span>{m.post_mini_score}%</span>
                      </span>
                    ) : !hasChallenge ? (
                      <span className="text-slate-400 text-[10px]">
                        Chưa thi
                      </span>
                    ) : null}
                  </div>
                );
              })}
            </div>
          );
        },
      },
      {
        key: "final_score",
        dataIndex: "final_test_score",
        title: "Điểm tốt nghiệp",
        width: 150,
        align: "center",
        render: (student) =>
          typeof student.final_test_score === "number" &&
          student.final_test_score > 0 ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-extrabold text-[11px] border border-emerald-200 dark:border-emerald-800 shadow-2xs font-mono">
              <Award className="w-3.5 h-3.5 text-emerald-500" />
              <span>{student.final_test_score}%</span>
            </span>
          ) : (
            <span className="text-slate-400 text-[11px] font-medium">—</span>
          ),
      },
      {
        key: "status",
        title: "Trạng thái",
        width: 140,
        align: "center",
        render: (student) =>
          student.progress_percentage >= 100 ||
          student.status === "COMPLETED" ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Hoàn thành</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              <Clock className="w-3.5 h-3.5 text-indigo-500" />
              <span>Đang học</span>
            </span>
          ),
      },
    ],
    [usersMap]
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/courses")}
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
                Khóa học:{" "}
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {courseTitle}
                </span>
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
            <RefreshCw
              className={`w-4 h-4 ${
                isLoading ? "animate-spin text-indigo-500" : ""
              }`}
            />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Tổng Học Viên"
          value={totalStudents.toLocaleString("vi-VN")}
          subtitle="Học viên ghi danh khóa học"
          icon={Users}
          color="indigo"
          trend={totalStudents > 0 ? `${totalStudents}` : undefined}
          trendType="neutral"
          loading={isLoading}
        />

        <StatCard
          title="Tiến Độ TB"
          value={`${avgProgress}%`}
          subtitle="Tỷ lệ hoàn thành nội dung"
          icon={TrendingUp}
          color="emerald"
          trend={`${avgProgress}%`}
          trendType={avgProgress >= 50 ? "up" : "neutral"}
          loading={isLoading}
        />

        <StatCard
          title="Đã Tốt Nghiệp"
          value={completedStudents.toLocaleString("vi-VN")}
          subtitle="Đã hoàn thành toàn bộ khóa"
          icon={CheckCircle2}
          color="teal"
          trend={
            totalStudents > 0
              ? `${Math.round((completedStudents / totalStudents) * 100)}%`
              : undefined
          }
          trendType="up"
          loading={isLoading}
        />

        <StatCard
          title="Mục Tiêu Đầu Ra"
          value={
            courseInfo?.target_score ? `${courseInfo.target_score}+ TOEIC` : "-"
          }
          subtitle="Dải điểm cam kết khóa học"
          icon={Award}
          color="purple"
          trend={
            courseInfo?.target_score ? `${courseInfo.target_score}+` : undefined
          }
          trendType="neutral"
          loading={isLoading}
        />
      </div>

      <DataTable<StudentProgressItem>
        columns={columns}
        data={paginatedStudents}
        rowKey={(s) => s.user_id}
        isLoading={isLoading}
        onResetFilters={() => {
          setSearchTerm("");
          setCurrentPage(1);
        }}
        filterSlot={
          <div className="flex items-center gap-2 w-full sm:w-80 h-10 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Tìm theo tên học viên, email hoặc ID..."
              className="w-full bg-transparent border-0 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 p-0 text-xs focus:ring-0"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setCurrentPage(1);
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        }
        pagination={{
          currentPage,
          pageSize,
          totalItems: studentsList.length,
          onPageChange: setCurrentPage,
          onPageSizeChange: (limit) => {
            setPageSize(limit);
            setCurrentPage(1);
          },
        }}
      />
    </div>
  );
}

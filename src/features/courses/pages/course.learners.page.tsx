// Trang quản trị bảng điểm và tiến độ học tập của học viên theo khóa học.
import { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { CourseLearnersStatsBar } from "@/features/courses/components/course.learners.stats.bar";
import { CourseProgressTableTab } from "@/features/courses/components/course.progress.table.tab";
import { createCourseProgressColumns } from "@/features/courses/components/course.progress.columns";
import { useNavigate } from "react-router-dom";
import { useCourseLearnersData } from "@/features/courses/hooks/use.course.learners.data";
import type { StudentProgressItem } from "@/features/progress/services/progress.service";
import { storage, STORAGE_KEYS } from "@/lib/storage";
import { toast } from "@/store/toast.store";

export function CourseLearnersPage() {
  const { i18n } = useTranslation();
  const isVi = i18n.language === "vi";
  const navigate = useNavigate();

  const {
    courses,
    selectedCourseId,
    setSelectedCourseId,
    allStudentsProgress,
    usersMap,
    isLoadingProgress,
    fetchProgress,
    stats,
  } = useCourseLearnersData();

  const [progressSearch, setProgressSearch] = useState<string>("");
  const [progressStatusFilter, setProgressStatusFilter] = useState<
    "ALL" | "COMPLETED" | "IN_PROGRESS" | "STARTED"
  >("ALL");
  const [progressCurrentPage, setProgressCurrentPage] = useState<number>(1);
  const [progressPageSize, setProgressPageSize] = useState<number>(10);
  const [progressSortKey, setProgressSortKey] = useState<string | null>(null);
  const [progressSortOrder, setProgressSortOrder] = useState<
    "asc" | "desc" | null
  >(null);

  const filteredStudents = useMemo(() => {
    let list = allStudentsProgress;

    if (progressSearch.trim()) {
      const q = progressSearch.toLowerCase();
      list = list.filter((st) => {
        const u = usersMap.get(st.user_id) || usersMap.get(String(st.user_id));
        const name = (u?.full_name || st.full_name || "").toLowerCase();
        const email = (u?.email || st.email || "").toLowerCase();
        const course = (st.course_title || "").toLowerCase();
        return (
          name.includes(q) ||
          email.includes(q) ||
          st.user_id.toLowerCase().includes(q) ||
          course.includes(q)
        );
      });
    }

    if (progressStatusFilter === "COMPLETED") {
      list = list.filter((st) => (st.progress_percentage || 0) >= 100);
    } else if (progressStatusFilter === "IN_PROGRESS") {
      list = list.filter(
        (st) =>
          (st.progress_percentage || 0) > 0 &&
          (st.progress_percentage || 0) < 100
      );
    } else if (progressStatusFilter === "STARTED") {
      list = list.filter((st) => (st.progress_percentage || 0) <= 20);
    }

    if (!progressSortKey || !progressSortOrder) return list;

    return [...list].sort((a, b) => {
      if (progressSortKey === "learner") {
        const uA = usersMap.get(a.user_id);
        const uB = usersMap.get(b.user_id);
        const nameA = (uA?.full_name || a.full_name || "").toLowerCase();
        const nameB = (uB?.full_name || b.full_name || "").toLowerCase();
        const comp = nameA.localeCompare(nameB);
        return progressSortOrder === "asc" ? comp : -comp;
      }
      if (progressSortKey === "course") {
        const comp = (a.course_title || "").localeCompare(b.course_title || "");
        return progressSortOrder === "asc" ? comp : -comp;
      }
      if (progressSortKey === "progress") {
        const diff =
          (a.progress_percentage || 0) - (b.progress_percentage || 0);
        return progressSortOrder === "asc" ? diff : -diff;
      }
      if (progressSortKey === "pre_test") {
        const diff = (a.baseline_score || 0) - (b.baseline_score || 0);
        return progressSortOrder === "asc" ? diff : -diff;
      }
      if (progressSortKey === "final_test") {
        const diff = (a.final_test_score || 0) - (b.final_test_score || 0);
        return progressSortOrder === "asc" ? diff : -diff;
      }
      if (progressSortKey === "growth") {
        const growthA = a.measurement_summary?.internal_delta ?? -Infinity;
        const growthB = b.measurement_summary?.internal_delta ?? -Infinity;
        const diff = growthA - growthB;
        return progressSortOrder === "asc" ? diff : -diff;
      }
      if (progressSortKey === "schedule") {
        const missedA = a.schedule?.consecutive_missed_sessions || 0;
        const missedB = b.schedule?.consecutive_missed_sessions || 0;
        const diff = missedA - missedB;
        return progressSortOrder === "asc" ? diff : -diff;
      }
      return 0;
    });
  }, [
    allStudentsProgress,
    progressSearch,
    progressStatusFilter,
    usersMap,
    progressSortKey,
    progressSortOrder,
  ]);

  const paginatedStudents = useMemo(() => {
    const start = (progressCurrentPage - 1) * progressPageSize;
    return filteredStudents.slice(start, start + progressPageSize);
  }, [filteredStudents, progressCurrentPage, progressPageSize]);

  const handleResetProgressFilters = async () => {
    setProgressSearch("");
    setSelectedCourseId("ALL");
    setProgressStatusFilter("ALL");
    setProgressSortKey(null);
    setProgressSortOrder(null);
    setProgressCurrentPage(1);
    await fetchProgress();
    toast.success(
      isVi
        ? "Đã đặt lại bộ lọc tiến độ học viên"
        : "Learner progress filters reset"
    );
  };

  const handleSort = (key: string, order: "asc" | "desc" | null) => {
    setProgressSortKey(order ? key : null);
    setProgressSortOrder(order);
  };

  const handleSelectStudentDetail = useCallback(
    (st: StudentProgressItem) => {
      const targetCourseId =
        st.course_id || (selectedCourseId !== "ALL" ? selectedCourseId : "all");
      storage.session.set(STORAGE_KEYS.ACTIVE_STUDENT_PROGRESS, st);
      navigate(`/course-learners/${targetCourseId}/students/${st.user_id}`);
    },
    [selectedCourseId, navigate]
  );

  const handleSelectReminderHistory = useCallback(
    (st: StudentProgressItem) => {
      const targetCourseId =
        st.course_id || (selectedCourseId !== "ALL" ? selectedCourseId : "all");
      storage.session.set(STORAGE_KEYS.ACTIVE_STUDENT_PROGRESS, st);
      navigate(`/course-learners/${targetCourseId}/reminders/${st.user_id}`);
    },
    [selectedCourseId, navigate]
  );

  const progressColumns = useMemo(
    () =>
      createCourseProgressColumns({
        isVi,
        usersMap,
        onSelectStudentDetail: handleSelectStudentDetail,
        onSelectReminderHistory: handleSelectReminderHistory,
      }),
    [isVi, usersMap, handleSelectStudentDetail, handleSelectReminderHistory]
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <CourseLearnersStatsBar
        isVi={isVi}
        totalStudents={stats.totalStudents}
        avgProgress={stats.avgProgress}
        isLoading={isLoadingProgress}
      />

      <CourseProgressTableTab
        isVi={isVi}
        courses={courses}
        selectedCourseId={selectedCourseId}
        onSelectCourseId={setSelectedCourseId}
        progressSearch={progressSearch}
        onProgressSearchChange={setProgressSearch}
        progressStatusFilter={progressStatusFilter}
        onProgressStatusFilterChange={setProgressStatusFilter}
        onResetFilters={handleResetProgressFilters}
        onRefresh={fetchProgress}
        isLoadingProgress={isLoadingProgress}
        filteredStudents={filteredStudents}
        paginatedStudents={paginatedStudents}
        progressColumns={progressColumns}
        progressCurrentPage={progressCurrentPage}
        progressPageSize={progressPageSize}
        onPageChange={setProgressCurrentPage}
        onPageSizeChange={setProgressPageSize}
        progressSortKey={progressSortKey}
        progressSortOrder={progressSortOrder}
        onSort={handleSort}
      />
    </div>
  );
}

import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Search,
  CheckCircle,
  Crown,
  Flame,
  Star,
  Target,
  X,
  Eye,
  RotateCcw,
  Users,
  Ban,
} from "lucide-react";
import { Pagination } from "@/components/common/Pagination";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { TableControls, type TableDensity, type ColumnOption } from "@/components/common/TableControls";
import { useAdminStore } from "@/store/admin-store";
import { userService } from "@/services/user.service";
import { toast } from "@/store/toast-store";
import { mockUsers, type User } from "@/data/users-data";

type FilterStatus = "ALL" | "ACTIVE" | "INACTIVE" | "BANNED";
type FilterPlan = "ALL" | "free" | "premium";

export function LearnersPage() {
  const { t } = useTranslation();
  const setActiveNavItem = useAdminStore((state) => state.setActiveNavItem);

  const [users, setUsers] = useState<User[]>(mockUsers);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<FilterStatus>("ALL");
  const [selectedPlan, setSelectedPlan] = useState<FilterPlan>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [density, setDensity] = useState<TableDensity>("middle");

  // Column Visibility Controls
  const [columns, setColumns] = useState<ColumnOption[]>([
    { key: "user", label: "Học viên", visible: true },
    { key: "status", label: "Trạng thái", visible: true },
    { key: "plan", label: "Gói học", visible: true },
    { key: "gamification", label: "Level & Streak", visible: true },
    { key: "xp", label: "Tổng XP", visible: true },
    { key: "toeic", label: "Mục tiêu TOEIC", visible: true },
    { key: "actions", label: "Thao tác", visible: true },
  ]);

  const isColVisible = (key: string) => columns.find((c) => c.key === key)?.visible ?? true;

  // Modal State
  const [modalUser, setModalUser] = useState<User | null>(null);
  const [modalAction, setModalAction] = useState<"ban" | "unban" | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Fetch real users from backend
  const fetchLearners = async () => {
    setIsLoading(true);
    try {
      const res = await userService.getAllUsers({
        role: "LEARNER",
        limit: 100,
        search: searchTerm || undefined,
      });

      const items = res?.items || (res as any)?.users || [];
      if (items.length > 0) {
        const mappedUsers: User[] = items.map((u: any) => ({
          id: u._id,
          email: u.email,
          full_name: u.full_name || u.email.split("@")[0],
          avatar_url: u.avatar_url,
          gender: u.gender || "OTHER",
          target_toeic_score: u.target_toeic_score || 650,
          current_estimated_score: u.current_estimated_score || 500,
          learning_goal_minutes_per_day: u.learning_goal_minutes_per_day || 20,
          status: (u.status as "ACTIVE" | "INACTIVE" | "BANNED") || (u.is_active ? "ACTIVE" : "INACTIVE"),
          is_premium: u.subscription_tier === "premium" || u.plan_type === "PREMIUM",
          current_plan_slug: u.subscription_tier || "free",
          created_at: u.created_at || new Date().toISOString(),
          total_xp: u.gamification?.total_xp || 0,
          level: u.gamification?.current_level || 1,
          current_streak: u.gamification?.streak_days || 0,
          longest_streak: 10,
          gems: 50,
          lessons_completed: 12,
          vocabulary_reviewed: 120,
          practice_sessions: 15,
          exams_completed: 2,
        }));
        setUsers(mappedUsers);
      }
    } catch (err) {
      console.warn("Using local mock users:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLearners();
  }, [searchTerm, selectedStatus]);

  // Filtered & Paginated Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = selectedStatus === "ALL" || u.status === selectedStatus;
      const matchPlan =
        selectedPlan === "ALL" ||
        (selectedPlan === "premium" && u.is_premium) ||
        (selectedPlan === "free" && !u.is_premium);

      return matchSearch && matchStatus && matchPlan;
    });
  }, [users, searchTerm, selectedStatus, selectedPlan]);

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  // Stats Counters
  const stats = useMemo(() => {
    return {
      total: users.length,
      active: users.filter((u) => u.status === "ACTIVE").length,
      premium: users.filter((u) => u.is_premium).length,
      banned: users.filter((u) => u.status === "BANNED").length,
    };
  }, [users]);

  // Handle Ban / Unban
  const handleConfirmStatusChange = async () => {
    if (!modalUser || !modalAction) return;

    setIsUpdatingStatus(true);
    const newStatus = modalAction === "ban" ? "BLOCKED" : "ACTIVE";

    try {
      await userService.updateUserStatus(modalUser.id, newStatus);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === modalUser.id
            ? { ...u, status: modalAction === "ban" ? "BANNED" : "ACTIVE" }
            : u
        )
      );
      toast.success(
        modalAction === "ban"
          ? `Đã khóa tài khoản ${modalUser.email}`
          : `Đã mở khóa tài khoản ${modalUser.email}`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Cập nhật trạng thái thất bại";
      toast.error(msg);
    } finally {
      setIsUpdatingStatus(false);
      setModalUser(null);
      setModalAction(null);
    }
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedStatus("ALL");
    setSelectedPlan("ALL");
    setCurrentPage(1);
  };

  // Row padding by density
  const getCellPadding = () => {
    if (density === "compact") return "py-2 px-4";
    if (density === "comfortable") return "py-5 px-4";
    return "py-3.5 px-4";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            {t("page.users.title") || "Quản Lý Học Viên"}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Danh sách toàn bộ người học, theo dõi điểm TOEIC, streak ngày học và quản lý tài khoản
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchLearners}
            className="flex items-center gap-2 h-10 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-teal-500" : ""}`} />
            <span>Làm mới</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-center gap-3.5 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Tổng học viên</p>
            <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{stats.total}</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-center gap-3.5 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Đang hoạt động</p>
            <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{stats.active}</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-center gap-3.5 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Crown className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Gói Premium</p>
            <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{stats.premium}</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-center gap-3.5 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <Ban className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Tài khoản bị khóa</p>
            <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{stats.banned}</p>
          </div>
        </div>
      </div>

      {/* Filter & Table Controls Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          {/* Search Box */}
          <div className="flex items-center gap-2 w-full sm:w-72 h-10 px-3.5 rounded-xl bg-slate-100 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 focus-within:border-indigo-500 transition-all">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên hoặc email..."
              className="w-full bg-transparent border-0 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 p-0 text-xs focus:ring-0"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm("")} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as FilterStatus)}
            className="h-10 px-3 rounded-xl bg-slate-100 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="ACTIVE">Hoạt động (ACTIVE)</option>
            <option value="INACTIVE">Chưa kích hoạt (INACTIVE)</option>
            <option value="BANNED">Bị khóa (BANNED)</option>
          </select>

          {/* Plan Filter */}
          <select
            value={selectedPlan}
            onChange={(e) => setSelectedPlan(e.target.value as FilterPlan)}
            className="h-10 px-3 rounded-xl bg-slate-100 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="ALL">Tất cả gói cước</option>
            <option value="free">Gói Miễn phí (Free)</option>
            <option value="premium">Gói Premium</option>
          </select>
        </div>

        {/* Table Controls (Density, Columns, Reset) */}
        <TableControls
          density={density}
          onDensityChange={setDensity}
          columns={columns}
          onColumnsChange={setColumns}
          onResetFilters={handleResetFilters}
          totalCount={filteredUsers.length}
        />
      </div>

      {/* Learners Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/40 text-slate-500 dark:text-slate-400 font-semibold">
                {isColVisible("user") && <th className="py-3.5 px-4">Học viên</th>}
                {isColVisible("status") && <th className="py-3.5 px-4">Trạng thái</th>}
                {isColVisible("plan") && <th className="py-3.5 px-4">Gói dịch vụ</th>}
                {isColVisible("gamification") && <th className="py-3.5 px-4">Level & Streak</th>}
                {isColVisible("xp") && <th className="py-3.5 px-4">Tổng XP</th>}
                {isColVisible("toeic") && <th className="py-3.5 px-4">Mục tiêu TOEIC</th>}
                {isColVisible("actions") && <th className="py-3.5 px-4 text-right">Thao tác</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-200">
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={columns.filter((c) => c.visible).length} className="py-12 text-center text-slate-400">
                    Không tìm thấy học viên nào phù hợp với bộ lọc
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    {/* User info */}
                    {isColVisible("user") && (
                      <td className={getCellPadding()}>
                        <div
                          className="flex items-center gap-3 cursor-pointer"
                          onClick={() => setActiveNavItem(`user-profile:${user.id}`)}
                        >
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-indigo-600 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-white text-xs shrink-0">
                            {user.avatar_url ? (
                              <img
                                src={user.avatar_url}
                                alt={user.full_name}
                                className="w-full h-full rounded-xl object-cover"
                              />
                            ) : (
                              user.full_name.slice(0, 2).toUpperCase()
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                              {user.full_name}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">{user.email}</p>
                          </div>
                        </div>
                      </td>
                    )}

                    {/* Status */}
                    {isColVisible("status") && (
                      <td className={getCellPadding()}>
                        {user.status === "ACTIVE" && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            Hoạt động
                          </span>
                        )}
                        {user.status === "INACTIVE" && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-500/10 text-slate-500 dark:text-slate-400 border border-slate-500/20">
                            Chưa kích hoạt
                          </span>
                        )}
                        {user.status === "BANNED" && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                            Bị khóa
                          </span>
                        )}
                      </td>
                    )}

                    {/* Plan */}
                    {isColVisible("plan") && (
                      <td className={getCellPadding()}>
                        {user.is_premium ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            <Crown className="w-3 h-3" />
                            <span>Premium</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            Free
                          </span>
                        )}
                      </td>
                    )}

                    {/* Gamification Level & Streak */}
                    {isColVisible("gamification") && (
                      <td className={getCellPadding()}>
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400">
                            <Star className="w-3.5 h-3.5" />
                            <span>Lv.{user.level}</span>
                          </span>
                          <span className="flex items-center gap-1 font-semibold text-orange-500 dark:text-orange-400">
                            <Flame className="w-3.5 h-3.5" />
                            <span>{user.current_streak} ngày</span>
                          </span>
                        </div>
                      </td>
                    )}

                    {/* Total XP */}
                    {isColVisible("xp") && (
                      <td className={`${getCellPadding()} font-bold text-teal-600 dark:text-teal-400`}>
                        {user.total_xp.toLocaleString("vi-VN")} XP
                      </td>
                    )}

                    {/* Target TOEIC */}
                    {isColVisible("toeic") && (
                      <td className={getCellPadding()}>
                        <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                          <Target className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
                          <span>{user.target_toeic_score} TOEIC</span>
                        </span>
                      </td>
                    )}

                    {/* Actions */}
                    {isColVisible("actions") && (
                      <td className={`${getCellPadding()} text-right`}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setActiveNavItem(`user-profile:${user.id}`)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                            title="Xem hồ sơ chi tiết"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {user.status === "BANNED" ? (
                            <button
                              onClick={() => {
                                setModalUser(user);
                                setModalAction("unban");
                              }}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-emerald-500/20 dark:bg-slate-800 text-slate-600 hover:text-emerald-600 transition-colors cursor-pointer"
                              title="Mở khóa tài khoản"
                            >
                              <CheckCircle className="w-4 h-4 text-emerald-500" />
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setModalUser(user);
                                setModalAction("ban");
                              }}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-500/20 dark:bg-slate-800 text-slate-500 hover:text-rose-500 transition-colors cursor-pointer"
                              title="Khóa tài khoản"
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={Math.ceil(filteredUsers.length / pageSize) || 1}
        totalItems={filteredUsers.length}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={(limit: number) => {
          setPageSize(limit);
          setCurrentPage(1);
        }}
      />

      {/* Ban / Unban Modal */}
      <ConfirmModal
        isOpen={Boolean(modalUser && modalAction)}
        onClose={() => {
          setModalUser(null);
          setModalAction(null);
        }}
        onConfirm={handleConfirmStatusChange}
        title={modalAction === "ban" ? "Khóa tài khoản học viên?" : "Mở khóa tài khoản?"}
        description={
          modalAction === "ban"
            ? `Học viên ${modalUser?.email} sẽ tạm thời không thể đăng nhập hoặc làm bài tập trên hệ thống.`
            : `Học viên ${modalUser?.email} sẽ được khôi phục toàn bộ quyền truy cập bài học.`
        }
        confirmText={modalAction === "ban" ? "Xác nhận khóa" : "Mở khóa ngay"}
        cancelText="Hủy bỏ"
        variant={modalAction === "ban" ? "danger" : undefined}
        isLoading={isUpdatingStatus}
      />
    </div>
  );
}

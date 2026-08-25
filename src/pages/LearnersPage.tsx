import { useState, useMemo, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Search,
  Filter,
  Download,
  ChevronDown,
  Calendar,
  Ban,
  CheckCircle,
  Crown,
  Flame,
  Star,
  Trophy,
  X,
  Eye,
  RotateCcw,
  Settings2,
  ChevronUp,
  ChevronsUpDown,
} from "lucide-react";
import { Pagination } from "@/components/common/Pagination";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { useAdminStore } from "@/store/admin-store";
import { userService } from "@/services/user.service";
import { toast } from "@/store/toast-store";
import {
  mockUsers,
  getUserStats,
  formatNumber,
  statusColors,
  planColors,
  planLabels,
  type User,
} from "@/data/users-data";

function DensityIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      
      <path d="M8 1L5.5 3.5H10.5L8 1Z" fill="currentColor" />
      
      <rect
        x="2"
        y="4.5"
        width="12"
        height="1.5"
        rx="0.75"
        fill="currentColor"
      />
      
      <rect
        x="2"
        y="7.25"
        width="12"
        height="1.5"
        rx="0.75"
        fill="currentColor"
        opacity="0.5"
      />
      
      <rect
        x="2"
        y="10"
        width="12"
        height="1.5"
        rx="0.75"
        fill="currentColor"
      />
      
      <path d="M8 15L5.5 12.5H10.5L8 15Z" fill="currentColor" />
    </svg>
  );
}

type FilterStatus = "ALL" | "ACTIVE" | "INACTIVE" | "BANNED";
type FilterPlan = "ALL" | "free" | "premium";
type FilterJoin = "ALL" | string;
type Density = "compact" | "middle" | "comfortable";
type SortKey = "name" | "xp" | "streak" | "level" | "toeic" | "joined" | null;
type SortDir = "asc" | "desc";

interface ColumnConfig {
  key: string;
  labelVi: string;
  labelEn: string;
  visible: boolean;
}

const DEFAULT_COLUMNS: ColumnConfig[] = [
  { key: "user", labelVi: "Người dùng", labelEn: "User", visible: true },
  { key: "status", labelVi: "Trạng thái", labelEn: "Status", visible: true },
  { key: "plan", labelVi: "Gói", labelEn: "Plan", visible: true },
  { key: "streak", labelVi: "Streak", labelEn: "Streak", visible: true },
  { key: "xp", labelVi: "XP", labelEn: "XP", visible: true },
  { key: "level", labelVi: "Level", labelEn: "Level", visible: true },
  { key: "toeic", labelVi: "TOEIC", labelEn: "TOEIC", visible: true },
  { key: "joined", labelVi: "Tham gia", labelEn: "Joined", visible: true },
];

function formatDate(dateStr: string, isVietnamese: boolean): string {
  return new Date(dateStr).toLocaleDateString(
    isVietnamese ? "vi-VN" : "en-US",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }
  );
}

function formatTimeAgo(dateStr: string): string {
  const diffDays = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / 86400000
  );
  const diffMonths = Math.floor(diffDays / 30);
  if (diffDays < 30) return `${diffDays}d`;
  if (diffMonths < 12) return `${diffMonths}mo`;
  return `${Math.floor(diffMonths / 12)}y`;
}

function SortableHeader({
  label,
  colKey,
  sortKey,
  sortDir,
  onSort,
}: {
  label: string;
  colKey: SortKey;
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (key: SortKey) => void;
}) {
  const active = sortKey === colKey;
  return (
    <button
      type="button"
      className={`th-sort-btn${active ? " active" : ""}`}
      onClick={() => onSort(colKey)}
    >
      {label}
      {active ? (
        <ChevronUp
          className="th-sort-icon"
          style={{
            transform: sortDir === "desc" ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      ) : (
        <ChevronsUpDown className="th-sort-icon muted" />
      )}
    </button>
  );
}

function StatusFilterHeader({
  isVi,
  filterStatus,
  setFilterStatus,
  setCurrentPage,
}: {
  isVi: boolean;
  filterStatus: FilterStatus;
  setFilterStatus: (v: FilterStatus) => void;
  setCurrentPage: (n: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const OPTIONS: { value: FilterStatus; labelVi: string; labelEn: string }[] = [
    { value: "ALL", labelVi: "Tất cả", labelEn: "All" },
    { value: "ACTIVE", labelVi: "Hoạt động", labelEn: "Active" },
    { value: "INACTIVE", labelVi: "Không hoạt động", labelEn: "Inactive" },
    { value: "BANNED", labelVi: "Banned", labelEn: "Banned" },
  ];

  const current = OPTIONS.find((o) => o.value === filterStatus);

  return (
    <div className="th-filter-wrapper" ref={ref}>
      <button
        type="button"
        className={`th-filter-btn${filterStatus !== "ALL" ? " active" : ""}${
          open ? " open" : ""
        }`}
        onClick={() => setOpen(!open)}
      >
        {isVi ? current?.labelVi : current?.labelEn}
        <Filter className="th-filter-icon" />
      </button>
      {open && (
        <div className="th-filter-dropdown">
          {OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`th-filter-option${
                filterStatus === opt.value ? " active" : ""
              }`}
              onClick={() => {
                setFilterStatus(opt.value);
                setCurrentPage(1);
                setOpen(false);
              }}
            >
              {filterStatus === opt.value && (
                <CheckCircle className="th-filter-check" />
              )}
              {isVi ? opt.labelVi : opt.labelEn}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function PlanFilterHeader({
  isVi,
  filterPlan,
  setFilterPlan,
  setCurrentPage,
}: {
  isVi: boolean;
  filterPlan: FilterPlan;
  setFilterPlan: (v: FilterPlan) => void;
  setCurrentPage: (n: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const OPTIONS: { value: FilterPlan; labelVi: string; labelEn: string }[] = [
    { value: "ALL", labelVi: "Tất cả gói", labelEn: "All Plans" },
    { value: "free", labelVi: "Miễn phí", labelEn: "Free" },
    { value: "premium", labelVi: "Premium", labelEn: "Premium" },
  ];

  const current = OPTIONS.find((o) => o.value === filterPlan);

  return (
    <div className="th-filter-wrapper" ref={ref}>
      <button
        type="button"
        className={`th-filter-btn${filterPlan !== "ALL" ? " active" : ""}${
          open ? " open" : ""
        }`}
        onClick={() => setOpen(!open)}
      >
        {isVi
          ? current?.value === "ALL"
            ? "Gói"
            : current?.labelVi
          : current?.value === "ALL"
          ? "Plan"
          : current?.labelEn}
        <Filter className="th-filter-icon" />
      </button>
      {open && (
        <div className="th-filter-dropdown">
          {OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`th-filter-option${
                filterPlan === opt.value ? " active" : ""
              }`}
              onClick={() => {
                setFilterPlan(opt.value);
                setCurrentPage(1);
                setOpen(false);
              }}
            >
              {filterPlan === opt.value && (
                <CheckCircle className="th-filter-check" />
              )}
              {isVi ? opt.labelVi : opt.labelEn}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function LearnersPage() {
  const { i18n } = useTranslation();
  const isVi = i18n.language === "vi";
  const setActiveNavItem = useAdminStore((s) => s.setActiveNavItem);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("ALL");
  const [filterPlan, setFilterPlan] = useState<FilterPlan>("ALL");
  const [filterJoin, setFilterJoin] = useState<FilterJoin>("ALL");
  const [sortKey, setSortKey] = useState<SortKey>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [banModalUser, setBanModalUser] = useState<User | null>(null);

  const [density, setDensity] = useState<Density>("middle");
  const [showDensityMenu, setShowDensityMenu] = useState(false);
  const [columns, setColumns] = useState<ColumnConfig[]>(DEFAULT_COLUMNS);
  const [showColSettings, setShowColSettings] = useState(false);
  const densityRef = useRef<HTMLDivElement>(null);
  const colRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (densityRef.current && !densityRef.current.contains(e.target as Node))
        setShowDensityMenu(false);
      if (colRef.current && !colRef.current.contains(e.target as Node))
        setShowColSettings(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  const fetchLearners = async () => {
    setIsLoadingUsers(true);
    try {
      const res = await userService.getAllUsers({
        role: "LEARNER",
        search: searchQuery || undefined,
        status: filterStatus !== "ALL" ? filterStatus : undefined,
        plan: filterPlan !== "ALL" ? filterPlan : undefined,
      });

      if (res?.items && res.items.length > 0) {
        const mappedUsers: User[] = res.items.map((p) => ({
          id: p.user_id || p._id || "",
          email: p.email,
          full_name: p.full_name,
          avatar_url: p.avatar_url,
          phone_number: p.phone_number,
          gender: (p.gender as "MALE" | "FEMALE" | "OTHER") || "OTHER",
          target_toeic_score: p.target_toeic_score || 650,
          current_estimated_score: p.current_estimated_score || 0,
          learning_goal_minutes_per_day: p.learning_goal_minutes_per_day || 20,
          status:
            p.status === "BLOCKED" || p.status === "SUSPENDED"
              ? "BANNED"
              : (p.status as "ACTIVE" | "INACTIVE" | "BANNED") || "ACTIVE",
          is_premium: Boolean(p.is_premium),
          current_plan_slug: p.current_plan_slug || (p.is_premium ? "premium" : "free"),
          created_at: p.created_at || new Date().toISOString(),
          total_xp: p.total_xp || 0,
          level: p.level || 1,
          current_streak: p.current_streak || 0,
          longest_streak: 0,
          gems: p.gems || 0,
          lessons_completed: 0,
          vocabulary_reviewed: 0,
          practice_sessions: 0,
          exams_completed: 0,
        }));
        setUsers(mappedUsers);
      }
    } catch (err) {
      console.warn("Could not fetch real users, using cached data:", err);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchLearners();
  }, []);

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };
  const handleBanUser = (user: User) => setBanModalUser(user);
  const confirmBanUser = async () => {
    if (!banModalUser) return;
    const nextStatus = banModalUser.status === "BANNED" ? "ACTIVE" : "BLOCKED";
    
    try {
      await userService.updateUserStatus(banModalUser.id, nextStatus as any);
      toast.success(
        `Đã ${nextStatus === "ACTIVE" ? "kích hoạt lại" : "khóa"} tài khoản ${banModalUser.full_name} thành công!`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Cập nhật trạng thái thất bại";
      toast.error(msg);
    }

    setUsers((prev) =>
      prev.map((u) =>
        u.id === banModalUser.id
          ? {
              ...u,
              status:
                banModalUser.status === "BANNED" ? "ACTIVE" : ("BANNED" as any),
            }
          : u
      )
    );
    setBanModalUser(null);
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setCurrentPage(1);
  };

  const handleReset = () => {
    setSearchQuery("");
    setFilterStatus("ALL");
    setFilterPlan("ALL");
    setFilterJoin("ALL");
    setSortKey(null);
    setSortDir("asc");
    setCurrentPage(1);
    setColumns(DEFAULT_COLUMNS);
    setDensity("middle");
  };

  const toggleColumn = (key: string) => {
    setColumns((prev) =>
      prev.map((c) => (c.key === key ? { ...c, visible: !c.visible } : c))
    );
  };

  const isColVisible = (key: string) =>
    columns.find((c) => c.key === key)?.visible ?? true;

  const stats = useMemo(() => getUserStats(users), [users]);

  const filteredUsers = useMemo(() => {
    let result = [...users];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (u) =>
          u.full_name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q)
      );
    }
    if (filterStatus !== "ALL")
      result = result.filter((u) => u.status === filterStatus);
    if (filterJoin !== "ALL" && filterJoin.includes("_")) {
      const [fromStr, toStr] = filterJoin.split("_");
      const from =
        fromStr && fromStr.trim() ? new Date(fromStr + "T00:00:00") : null;
      const to = toStr && toStr.trim() ? new Date(toStr + "T23:59:59") : null;
      result = result.filter((u) => {
        const d = new Date(u.created_at);
        if (from && !isNaN(from.getTime()) && d < from) return false;
        if (to && !isNaN(to.getTime()) && d > to) return false;
        return true;
      });
    }
    if (filterPlan !== "ALL") {
      result = result.filter((u) => {
        const slug = u.current_plan_slug || (u.is_premium ? "premium" : "free");
        return slug === filterPlan;
      });
    }
    
    if (sortKey) {
      const dir = sortDir === "asc" ? 1 : -1;
      switch (sortKey) {
        case "name":
          result.sort((a, b) => dir * a.full_name.localeCompare(b.full_name));
          break;
        case "xp":
          result.sort((a, b) => dir * (a.total_xp - b.total_xp));
          break;
        case "streak":
          result.sort((a, b) => dir * (a.current_streak - b.current_streak));
          break;
        case "level":
          result.sort((a, b) => dir * (a.level - b.level));
          break;
        case "toeic":
          result.sort(
            (a, b) =>
              dir * (a.current_estimated_score - b.current_estimated_score)
          );
          break;
        case "joined":
          result.sort(
            (a, b) =>
              dir *
              (new Date(a.created_at).getTime() -
                new Date(b.created_at).getTime())
          );
          break;
      }
    } else {
      result.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }
    return result;
  }, [
    users,
    searchQuery,
    filterStatus,
    filterPlan,
    filterJoin,
    sortKey,
    sortDir,
  ]);

  const hasActiveFilters =
    filterStatus !== "ALL" ||
    filterPlan !== "ALL" ||
    filterJoin !== "ALL" ||
    !!searchQuery;

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  const handleViewLogs = () => {
    console.table(
      filteredUsers.map((u) => ({
        id: u.id,
        full_name: u.full_name,
        email: u.email,
        status: u.status,
        is_premium: u.is_premium,
        total_xp: u.total_xp,
        level: u.level,
      }))
    );
  };

  const handleExportCsv = () => {
    const headers = [
      "id",
      "full_name",
      "email",
      "status",
      "plan",
      "xp",
      "level",
      "joined_at",
    ];
    const rows = filteredUsers.map((u) => [
      String(u.id),
      u.full_name,
      u.email,
      u.status,
      u.is_premium ? (u.current_plan_slug || "premium").toUpperCase() : "FREE",
      String(u.total_xp),
      String(u.level),
      u.created_at,
    ]);
    const csv = [headers, ...rows]
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `users-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const densityLabel: Record<Density, { vi: string; en: string }> = {
    compact: { vi: "Nhỏ gọn", en: "Compact" },
    middle: { vi: "Vừa", en: "Middle" },
    comfortable: { vi: "Thoải mái", en: "Comfortable" },
  };

  const visibleColCount = columns.filter((c) => c.visible).length;

  return (
    <main className="page-content">
      
      <div className="page-heading">
        <div>
          <h1 className="page-title">{isVi ? "Người dùng" : "Users"}</h1>
          <p className="page-subtitle">
            {isVi ? "Quản lý tài khoản người dùng" : "Manage user accounts"}
          </p>
        </div>
      </div>

      <div className="users-stats-grid">
        <div className="users-stat-card">
          <div className="stat-icon users">
            <Star />
          </div>
          <div className="stat-content">
            <span className="stat-value">{formatNumber(stats.total)}</span>
            <span className="stat-label">
              {isVi ? "Tổng người dùng" : "Total Users"}
            </span>
          </div>
        </div>
        <div className="users-stat-card">
          <div className="stat-icon active">
            <CheckCircle />
          </div>
          <div className="stat-content">
            <span className="stat-value">{formatNumber(stats.active)}</span>
            <span className="stat-label">
              {isVi ? "Đang hoạt động" : "Active"}
            </span>
          </div>
        </div>
        <div className="users-stat-card">
          <div className="stat-icon premium">
            <Crown />
          </div>
          <div className="stat-content">
            <span className="stat-value">{formatNumber(stats.premium)}</span>
            <span className="stat-label">Premium</span>
          </div>
        </div>
        <div className="users-stat-card">
          <div className="stat-icon streak">
            <Flame />
          </div>
          <div className="stat-content">
            <span className="stat-value">{formatNumber(stats.avgStreak)}</span>
            <span className="stat-label">
              {isVi ? "Streak TB" : "Avg Streak"}
            </span>
          </div>
        </div>
        <div className="users-stat-card">
          <div className="stat-icon level">
            <Trophy />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.avgLevel}</span>
            <span className="stat-label">
              {isVi ? "Level TB" : "Avg Level"}
            </span>
          </div>
        </div>
      </div>

      <div className="users-toolbar">
        <div className="users-search">
          <Search className="search-icon" />
          <input
            type="text"
            className="users-search-input"
            placeholder={isVi ? "Tìm kiếm người dùng..." : "Search users..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="search-clear" onClick={() => setSearchQuery("")}>
              <X />
            </button>
          )}
        </div>

        <div className="toolbar-date-range">
          <span className="date-range-label">
            {isVi ? "Tham gia:" : "Joined:"}
          </span>
          <div className="toolbar-date-inputs">
            <input
              type="date"
              className="toolbar-date-input"
              value={
                filterJoin && filterJoin !== "ALL"
                  ? filterJoin.split("_")[0] || ""
                  : ""
              }
              onChange={(e) => {
                const to =
                  filterJoin && filterJoin !== "ALL"
                    ? filterJoin.split("_")[1] || ""
                    : "";
                const from = e.target.value;
                setFilterJoin(from || to ? `${from}_${to}` : "ALL");
                setCurrentPage(1);
              }}
            />
            <span className="date-range-sep">~</span>
            <input
              type="date"
              className="toolbar-date-input"
              value={
                filterJoin && filterJoin !== "ALL"
                  ? filterJoin.split("_")[1] || ""
                  : ""
              }
              onChange={(e) => {
                const from =
                  filterJoin && filterJoin !== "ALL"
                    ? filterJoin.split("_")[0] || ""
                    : "";
                const to = e.target.value;
                setFilterJoin(from || to ? `${from}_${to}` : "ALL");
                setCurrentPage(1);
              }}
            />
          </div>
        </div>
      </div>

      <div className="admin-table-actions">
        <h2 className="admin-table-title">
          {isVi ? "Danh sách người dùng" : "Users List"}
          <span className="admin-table-count">{filteredUsers.length}</span>
        </h2>
        <div className="admin-table-action-buttons">
          
          <button
            type="button"
            className="table-ghost-btn"
            onClick={handleExportCsv}
          >
            <Download />
            {isVi ? "Xuất CSV" : "Export"}
            <ChevronDown />
          </button>

          <button
            type="button"
            className="table-ghost-btn"
            onClick={handleReset}
            title={isVi ? "Đặt lại tất cả" : "Reset all"}
          >
            <RotateCcw />
            {isVi ? "Đặt lại" : "Reset"}
          </button>

          <div className="protable-tool-wrapper" ref={densityRef}>
            <button
              type="button"
              className={`table-ghost-btn${showDensityMenu ? " active" : ""}`}
              onClick={() => setShowDensityMenu(!showDensityMenu)}
              title={isVi ? "Tỉ trọng hàng" : "Row density"}
            >
              <DensityIcon />
              {isVi ? densityLabel[density].vi : densityLabel[density].en}
            </button>
            {showDensityMenu && (
              <div className="protable-dropdown">
                <div className="protable-dropdown-title">
                  {isVi ? "Tỉ trọng hàng" : "Row Density"}
                </div>
                {(["compact", "middle", "comfortable"] as Density[]).map(
                  (d) => (
                    <button
                      key={d}
                      className={`protable-dropdown-item${
                        density === d ? " active" : ""
                      }`}
                      onClick={() => {
                        setDensity(d);
                        setShowDensityMenu(false);
                      }}
                    >
                      {isVi ? densityLabel[d].vi : densityLabel[d].en}
                      {density === d && (
                        <CheckCircle className="dropdown-check" />
                      )}
                    </button>
                  )
                )}
              </div>
            )}
          </div>

          <div className="protable-tool-wrapper" ref={colRef}>
            <button
              type="button"
              className={`table-ghost-btn${showColSettings ? " active" : ""}`}
              onClick={() => setShowColSettings(!showColSettings)}
              title={isVi ? "Cài đặt cột" : "Column settings"}
            >
              <Settings2 />
              {isVi ? "Cột" : "Columns"}
              {visibleColCount < columns.length && (
                <span className="col-badge">
                  {visibleColCount}/{columns.length}
                </span>
              )}
            </button>
            {showColSettings && (
              <div className="protable-dropdown col-settings-dropdown">
                <div className="protable-dropdown-title">
                  {isVi ? "Cài đặt cột" : "Column Settings"}
                </div>
                {columns.map((col) => (
                  <label key={col.key} className="col-settings-item">
                    <input
                      type="checkbox"
                      checked={col.visible}
                      onChange={() => toggleColumn(col.key)}
                    />
                    <span>{isVi ? col.labelVi : col.labelEn}</span>
                  </label>
                ))}
                <div className="protable-dropdown-footer">
                  <button
                    className="col-reset-btn"
                    onClick={() => setColumns(DEFAULT_COLUMNS)}
                  >
                    {isVi ? "Đặt lại mặc định" : "Reset to default"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="users-table-wrapper">
        <table className={`users-table density-${density}`}>
          <thead>
            <tr>
              {isColVisible("user") && (
                <th>
                  <SortableHeader
                    label={isVi ? "Người dùng" : "User"}
                    colKey="name"
                    sortKey={sortKey}
                    sortDir={sortDir}
                    onSort={handleSort}
                  />
                </th>
              )}
              {isColVisible("status") && (
                <th className="th-with-filter">
                  <StatusFilterHeader
                    isVi={isVi}
                    filterStatus={filterStatus}
                    setFilterStatus={setFilterStatus}
                    setCurrentPage={setCurrentPage}
                  />
                </th>
              )}
              {isColVisible("plan") && (
                <th className="th-with-filter">
                  <PlanFilterHeader
                    isVi={isVi}
                    filterPlan={filterPlan}
                    setFilterPlan={setFilterPlan}
                    setCurrentPage={setCurrentPage}
                  />
                </th>
              )}
              {isColVisible("streak") && (
                <th>
                  <SortableHeader
                    label="Streak"
                    colKey="streak"
                    sortKey={sortKey}
                    sortDir={sortDir}
                    onSort={handleSort}
                  />
                </th>
              )}
              {isColVisible("xp") && (
                <th>
                  <SortableHeader
                    label="XP"
                    colKey="xp"
                    sortKey={sortKey}
                    sortDir={sortDir}
                    onSort={handleSort}
                  />
                </th>
              )}
              {isColVisible("level") && (
                <th>
                  <SortableHeader
                    label="Level"
                    colKey="level"
                    sortKey={sortKey}
                    sortDir={sortDir}
                    onSort={handleSort}
                  />
                </th>
              )}
              {isColVisible("toeic") && (
                <th>
                  <SortableHeader
                    label="TOEIC"
                    colKey="toeic"
                    sortKey={sortKey}
                    sortDir={sortDir}
                    onSort={handleSort}
                  />
                </th>
              )}
              {isColVisible("joined") && (
                <th>
                  <SortableHeader
                    label={isVi ? "Tham gia" : "Joined"}
                    colKey="joined"
                    sortKey={sortKey}
                    sortDir={sortDir}
                    onSort={handleSort}
                  />
                </th>
              )}
              <th />
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.map((user) => (
              <tr
                key={user.id}
                className={user.status === "BANNED" ? "banned-row" : ""}
              >
                {isColVisible("user") && (
                  <td>
                    <div className="user-cell">
                      <div className="user-avatar">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt={user.full_name} />
                        ) : (
                          <span>{user.full_name.charAt(0)}</span>
                        )}
                      </div>
                      <div className="user-info">
                        <span className="user-name">{user.full_name}</span>
                        <span className="user-email">{user.email}</span>
                      </div>
                    </div>
                  </td>
                )}
                {isColVisible("status") && (
                  <td>
                    <span
                      className="status-badge"
                      style={{
                        background: statusColors[user.status]?.bg,
                        color: statusColors[user.status]?.text,
                      }}
                    >
                      {user.status === "ACTIVE" && (
                        <CheckCircle className="badge-icon" />
                      )}
                      {user.status === "INACTIVE" && (
                        <Flame className="badge-icon" />
                      )}
                      {user.status === "BANNED" && (
                        <Ban className="badge-icon" />
                      )}
                      {isVi
                        ? user.status === "ACTIVE"
                          ? "Hoạt động"
                          : user.status === "INACTIVE"
                          ? "Không hoạt động"
                          : "Banned"
                        : user.status}
                    </span>
                  </td>
                )}
                {isColVisible("plan") && (
                  <td>
                    {user.is_premium ? (
                      <span className="plan-badge premium">
                        <Crown className="badge-icon" />
                        {isVi
                          ? planLabels[user.current_plan_slug || "premium"]?.vi
                          : planLabels[user.current_plan_slug || "premium"]?.en}
                      </span>
                    ) : (
                      <span className="plan-badge free">
                        {isVi ? "Miễn phí" : "Free"}
                      </span>
                    )}
                  </td>
                )}
                {isColVisible("streak") && (
                  <td>
                    <div className="streak-cell">
                      <Flame className="streak-icon" />
                      <span className="streak-value">
                        {user.current_streak}
                      </span>
                    </div>
                  </td>
                )}
                {isColVisible("xp") && (
                  <td>
                    <span className="xp-value">
                      {formatNumber(user.total_xp)}
                    </span>
                  </td>
                )}
                {isColVisible("level") && (
                  <td>
                    <span className="level-badge">
                      <Trophy className="level-icon" />
                      {user.level}
                    </span>
                  </td>
                )}
                {isColVisible("toeic") && (
                  <td>
                    <div className="toeic-cell">
                      <span className="toeic-current">
                        {user.current_estimated_score}
                      </span>
                      <span className="toeic-target">
                        / {user.target_toeic_score}
                      </span>
                    </div>
                  </td>
                )}
                {isColVisible("joined") && (
                  <td className="join-date">
                    <span className="date-value">
                      {formatDate(user.created_at, isVi)}
                    </span>
                    <span className="date-relative">
                      {formatTimeAgo(user.created_at)}
                    </span>
                  </td>
                )}
                <td>
                  <div className="row-actions">
                    <button
                      className="row-action-btn"
                      title={isVi ? "Xem chi tiết" : "View Details"}
                      onClick={() =>
                        setActiveNavItem(`user-profile:${user.id}`)
                      }
                    >
                      <Eye />
                    </button>
                    <button
                      className={`row-action-btn ${
                        user.status === "BANNED" ? "success" : "danger"
                      }`}
                      title={
                        user.status === "BANNED"
                          ? isVi
                            ? "Mở khóa"
                            : "Unlock"
                          : isVi
                          ? "Khóa tài khoản"
                          : "Ban Account"
                      }
                      onClick={() => handleBanUser(user)}
                    >
                      {user.status === "BANNED" ? <CheckCircle /> : <Ban />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div className="users-empty">
            <Search className="empty-icon" />
            <p className="empty-title">
              {hasActiveFilters
                ? isVi
                  ? "Không tìm thấy người dùng"
                  : "No users found"
                : isVi
                ? "Chưa có người dùng"
                : "No users"}
            </p>
            {hasActiveFilters && (
              <button
                className="empty-action"
                onClick={() => {
                  setFilterStatus("ALL");
                  setFilterPlan("ALL");
                  setFilterJoin("ALL");
                  setSearchQuery("");
                }}
              >
                {isVi ? "Xóa bộ lọc" : "Clear filters"}
              </button>
            )}
          </div>
        )}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={Math.ceil(filteredUsers.length / pageSize)}
        pageSize={pageSize}
        onPageSizeChange={handlePageSizeChange}
        totalItems={filteredUsers.length}
        onPageChange={setCurrentPage}
      />

      <ConfirmModal
        isOpen={!!banModalUser}
        onClose={() => setBanModalUser(null)}
        onConfirm={confirmBanUser}
        type={banModalUser?.status === "BANNED" ? "success" : "danger"}
        icon={banModalUser?.status === "BANNED" ? "warning" : "ban"}
        title={
          banModalUser?.status === "BANNED"
            ? isVi
              ? "Mở khóa tài khoản"
              : "Unlock Account"
            : isVi
            ? "Khóa tài khoản"
            : "Ban Account"
        }
        message={
          banModalUser?.status === "BANNED"
            ? `${
                isVi
                  ? "Bạn có chắc muốn mở khóa tài khoản"
                  : "Are you sure you want to unlock"
              } "${banModalUser?.full_name}"?`
            : `${
                isVi
                  ? "Bạn có chắc muốn khóa tài khoản"
                  : "Are you sure you want to ban"
              } "${banModalUser?.full_name}"? ${
                isVi
                  ? "Người dùng sẽ không thể đăng nhập cho đến khi được mở khóa."
                  : "The user will not be able to log in until unlocked."
              }`
        }
        confirmText={
          banModalUser?.status === "BANNED"
            ? isVi
              ? "Mở khóa"
              : "Unlock"
            : isVi
            ? "Khóa tài khoản"
            : "Ban Account"
        }
        cancelText={isVi ? "Hủy" : "Cancel"}
      />
    </main>
  );
}

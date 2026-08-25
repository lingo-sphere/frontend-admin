// Updated: 2026-08-22
// Admin Users page - Quản lý tài khoản quản trị viên và giáo viên (Modern ProTable UI)

import { useState, useMemo, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Shield,
  GraduationCap,
  Plus,
  Edit2,
  CheckCircle,
  Download,
  Search,
  Eye,
  Ban,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Filter,
  RotateCcw,
  Settings2,
  X,
} from "lucide-react";
import {
  adminUsers,
  roleLabels,
  roleColors,
  type AdminUser,
} from "@/data/settings-data";
import { useAdminStore } from "@/store/admin-store";
import { Pagination } from "@/components/common/Pagination";
import { ConfirmModal } from "@/components/common/ConfirmModal";

function DensityIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d="M8 1L5.5 3.5H10.5L8 1Z" fill="currentColor" />
      <rect x="2" y="4.5" width="12" height="1.5" rx="0.75" fill="currentColor" />
      <rect x="2" y="7.25" width="12" height="1.5" rx="0.75" fill="currentColor" opacity="0.5" />
      <rect x="2" y="10" width="12" height="1.5" rx="0.75" fill="currentColor" />
      <path d="M8 15L5.5 12.5H10.5L8 15Z" fill="currentColor" />
    </svg>
  );
}

type FilterStatus = "ALL" | "ACTIVE" | "INACTIVE";
type FilterRole = "ALL" | "ADMIN" | "TEACHER";
type Density = "compact" | "middle" | "comfortable";
type SortKey = "name" | "last_active" | null;
type SortDir = "asc" | "desc";

interface ColumnConfig {
  key: string;
  labelVi: string;
  labelEn: string;
  visible: boolean;
}

const DEFAULT_COLUMNS: ColumnConfig[] = [
  { key: "user",        labelVi: "Người dùng",     labelEn: "User",        visible: true },
  { key: "role",        labelVi: "Vai trò",         labelEn: "Role",        visible: true },
  { key: "last_active", labelVi: "Hoạt động cuối", labelEn: "Last Active", visible: true },
  { key: "status",      labelVi: "Trạng thái",     labelEn: "Status",      visible: true },
];

function formatTimeAgo(dateStr: string, isVietnamese: boolean): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return isVietnamese ? "Vừa xong" : "Just now";
  if (diffMins < 60)
    return isVietnamese ? `${diffMins} phút trước` : `${diffMins}m ago`;
  if (diffHours < 24)
    return isVietnamese ? `${diffHours} giờ trước` : `${diffHours}h ago`;
  if (diffDays < 7)
    return isVietnamese ? `${diffDays} ngày trước` : `${diffDays}d ago`;
  return date.toLocaleDateString(isVietnamese ? "vi-VN" : "en-US");
}

// Sortable header component
function SortableHeader({
  label, colKey, sortKey, sortDir, onSort,
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
          style={{ transform: sortDir === "desc" ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      ) : (
        <ChevronsUpDown className="th-sort-icon muted" />
      )}
    </button>
  );
}

// Role filter header
function RoleFilterHeader({
  isVi, filterRole, setFilterRole, setCurrentPage,
}: {
  isVi: boolean;
  filterRole: FilterRole;
  setFilterRole: (v: FilterRole) => void;
  setCurrentPage: (n: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const OPTIONS: { value: FilterRole; labelVi: string; labelEn: string }[] = [
    { value: "ALL",     labelVi: "Tất cả vai trò", labelEn: "All Roles" },
    { value: "ADMIN",   labelVi: "Quản trị viên",  labelEn: "Admin"     },
    { value: "TEACHER", labelVi: "Giáo viên",      labelEn: "Teacher"   },
  ];

  const current = OPTIONS.find((o) => o.value === filterRole);

  return (
    <div className="th-filter-wrapper" ref={ref}>
      <button
        type="button"
        className={`th-filter-btn${filterRole !== "ALL" ? " active" : ""}${open ? " open" : ""}`}
        onClick={() => setOpen(!open)}
      >
        {isVi ? (current?.value === "ALL" ? "Vai trò" : current?.labelVi) : (current?.value === "ALL" ? "Role" : current?.labelEn)}
        <Filter className="th-filter-icon" />
      </button>
      {open && (
        <div className="th-filter-dropdown">
          {OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`th-filter-option${filterRole === opt.value ? " active" : ""}`}
              onClick={() => {
                setFilterRole(opt.value);
                setCurrentPage(1);
                setOpen(false);
              }}
            >
              {filterRole === opt.value && <CheckCircle className="th-filter-check" />}
              {isVi ? opt.labelVi : opt.labelEn}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Status filter header
function StatusFilterHeader({
  isVi, filterStatus, setFilterStatus, setCurrentPage,
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
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const OPTIONS: { value: FilterStatus; labelVi: string; labelEn: string }[] = [
    { value: "ALL",      labelVi: "Tất cả trạng thái", labelEn: "All Status" },
    { value: "ACTIVE",   labelVi: "Hoạt động",         labelEn: "Active"     },
    { value: "INACTIVE", labelVi: "Không hoạt động",   labelEn: "Inactive"   },
  ];

  const current = OPTIONS.find((o) => o.value === filterStatus);

  return (
    <div className="th-filter-wrapper" ref={ref}>
      <button
        type="button"
        className={`th-filter-btn${filterStatus !== "ALL" ? " active" : ""}${open ? " open" : ""}`}
        onClick={() => setOpen(!open)}
      >
        {isVi ? (current?.value === "ALL" ? "Trạng thái" : current?.labelVi) : (current?.value === "ALL" ? "Status" : current?.labelEn)}
        <Filter className="th-filter-icon" />
      </button>
      {open && (
        <div className="th-filter-dropdown">
          {OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`th-filter-option${filterStatus === opt.value ? " active" : ""}`}
              onClick={() => {
                setFilterStatus(opt.value);
                setCurrentPage(1);
                setOpen(false);
              }}
            >
              {filterStatus === opt.value && <CheckCircle className="th-filter-check" />}
              {isVi ? opt.labelVi : opt.labelEn}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Inline editable role dropdown cell
function RoleCellDropdown({
  admin,
  isVi,
  onRoleChangeRequest,
}: {
  admin: AdminUser;
  isVi: boolean;
  onRoleChangeRequest: (admin: AdminUser, newRole: "ADMIN" | "TEACHER") => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const RoleIcon = admin.role === "TEACHER" ? GraduationCap : Shield;

  const ROLES: { value: "ADMIN" | "TEACHER"; labelVi: string; labelEn: string; icon: any; color: string }[] = [
    { value: "ADMIN",   labelVi: "Quản trị viên", labelEn: "Admin",   icon: Shield,        color: roleColors["ADMIN"] },
    { value: "TEACHER", labelVi: "Giáo viên",      labelEn: "Teacher", icon: GraduationCap, color: roleColors["TEACHER"] },
  ];

  return (
    <div className="th-filter-wrapper role-cell-wrapper" ref={ref}>
      <button
        type="button"
        className="role-badge role-badge-dropdown"
        style={{
          background: roleColors[admin.role] + "20",
          color: roleColors[admin.role],
          cursor: "pointer",
          border: "none",
        }}
        onClick={() => setOpen(!open)}
        title={isVi ? "Bấm để đổi vai trò" : "Click to change role"}
      >
        <RoleIcon className="role-icon" />
        {roleLabels[admin.role]?.[isVi ? "vi" : "en"] || admin.role}
        <ChevronDown style={{ width: 12, height: 12, marginLeft: 4, opacity: 0.7 }} />
      </button>

      {open && (
        <div className="th-filter-dropdown role-cell-menu" style={{ minWidth: 160, right: "auto", left: 0 }}>
          {ROLES.map((r) => {
            const Icon = r.icon;
            const isCurrent = admin.role === r.value;
            return (
              <button
                key={r.value}
                type="button"
                className={`th-filter-option${isCurrent ? " active" : ""}`}
                onClick={() => {
                  setOpen(false);
                  if (!isCurrent) {
                    onRoleChangeRequest(admin, r.value);
                  }
                }}
              >
                <Icon style={{ width: 14, height: 14, color: r.color, marginRight: 6 }} />
                <span>{isVi ? r.labelVi : r.labelEn}</span>
                {isCurrent && <CheckCircle className="th-filter-check" style={{ marginLeft: "auto" }} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function AdminUsersPage() {
  const { i18n } = useTranslation();
  const isVietnamese = i18n.language === "vi";
  const isVi = isVietnamese;
  const setActiveNavItem = useAdminStore((state) => state.setActiveNavItem);
  const [admins, setAdmins] = useState<AdminUser[]>(adminUsers);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState<FilterRole>("ALL");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("ALL");
  const [filterJoin, setFilterJoin] = useState<string>("ALL");

  // Sorting
  const [sortKey, setSortKey] = useState<SortKey>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  // ProTable Tools State
  const [density, setDensity] = useState<Density>("middle");
  const [showDensityMenu, setShowDensityMenu] = useState(false);
  const [columns, setColumns] = useState<ColumnConfig[]>(DEFAULT_COLUMNS);
  const [showColSettings, setShowColSettings] = useState(false);

  // Pagination & Modals
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [banModalAdmin, setBanModalAdmin] = useState<AdminUser | null>(null);
  const [roleChangeTarget, setRoleChangeTarget] = useState<{
    admin: AdminUser;
    newRole: "ADMIN" | "TEACHER";
  } | null>(null);

  const handleRoleChangeRequest = (admin: AdminUser, newRole: "ADMIN" | "TEACHER") => {
    if (newRole === "ADMIN") {
      setRoleChangeTarget({ admin, newRole });
    } else {
      setAdmins((prev) =>
        prev.map((a) => (a.id === admin.id ? { ...a, role: newRole } : a))
      );
    }
  };

  const confirmRoleChange = () => {
    if (roleChangeTarget) {
      setAdmins((prev) =>
        prev.map((a) => (a.id === roleChangeTarget.admin.id ? { ...a, role: roleChangeTarget.newRole } : a))
      );
      setRoleChangeTarget(null);
    }
  };

  const densityRef = useRef<HTMLDivElement>(null);
  const colRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (densityRef.current && !densityRef.current.contains(e.target as Node)) setShowDensityMenu(false);
      if (colRef.current && !colRef.current.contains(e.target as Node)) setShowColSettings(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      if (sortDir === "asc") setSortDir("desc");
      else { setSortKey(null); setSortDir("asc"); }
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setCurrentPage(1);
  };

  const handleReset = () => {
    setSearchQuery("");
    setFilterRole("ALL");
    setFilterStatus("ALL");
    setFilterJoin("ALL");
    setSortKey(null);
    setSortDir("asc");
    setCurrentPage(1);
  };

  const hasActiveFilters =
    searchQuery !== "" || filterRole !== "ALL" || filterStatus !== "ALL" || filterJoin !== "ALL" || sortKey !== null;

  const filteredAdmins = useMemo(() => {
    let result = [...admins];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (admin) => admin.name.toLowerCase().includes(q) || admin.email.toLowerCase().includes(q)
      );
    }

    // Role filter
    if (filterRole !== "ALL") {
      result = result.filter((admin) => admin.role === filterRole);
    }

    // Status filter
    if (filterStatus !== "ALL") {
      result = result.filter((admin) => (filterStatus === "ACTIVE" ? admin.is_active : !admin.is_active));
    }

    // Date range filter
    if (filterJoin !== "ALL" && filterJoin.includes("_")) {
      const [fromStr, toStr] = filterJoin.split("_");
      const from = fromStr && fromStr.trim() ? new Date(fromStr + "T00:00:00") : null;
      const to = toStr && toStr.trim() ? new Date(toStr + "T23:59:59") : null;
      result = result.filter((admin) => {
        const d = new Date(admin.last_active);
        if (from && !isNaN(from.getTime()) && d < from) return false;
        if (to && !isNaN(to.getTime()) && d > to) return false;
        return true;
      });
    }

    // Sorting
    if (sortKey) {
      const dir = sortDir === "asc" ? 1 : -1;
      switch (sortKey) {
        case "name":
          result.sort((a, b) => dir * a.name.localeCompare(b.name));
          break;
        case "last_active":
          result.sort((a, b) => dir * (new Date(a.last_active).getTime() - new Date(b.last_active).getTime()));
          break;
      }
    } else {
      result.sort((a, b) => new Date(b.last_active).getTime() - new Date(a.last_active).getTime());
    }

    return result;
  }, [admins, searchQuery, filterRole, filterStatus, filterJoin, sortKey, sortDir]);

  const paginatedAdmins = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAdmins.slice(start, start + pageSize);
  }, [filteredAdmins, currentPage, pageSize]);

  const isColVisible = (key: string) => columns.find((c) => c.key === key)?.visible ?? true;
  const toggleColumn = (key: string) => {
    setColumns((prev) => prev.map((c) => (c.key === key ? { ...c, visible: !c.visible } : c)));
  };
  const visibleColCount = columns.filter((c) => c.visible).length;

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const handleBanAdmin = (admin: AdminUser) => {
    setBanModalAdmin(admin);
  };

  const confirmBanAdmin = () => {
    if (banModalAdmin) {
      setAdmins((prev) =>
        prev.map((a) => (a.id === banModalAdmin.id ? { ...a, is_active: !a.is_active } : a))
      );
      setBanModalAdmin(null);
    }
  };

  const getRoleIcon = (role: string) => {
    if (role === "TEACHER") return GraduationCap;
    return Shield;
  };

  const handleExportCsv = () => {
    const headers = ["id", "name", "email", "role", "last_active", "status"];
    const rows = filteredAdmins.map((admin) => [
      String(admin.id),
      admin.name,
      admin.email,
      admin.role,
      admin.last_active,
      admin.is_active ? "ACTIVE" : "INACTIVE",
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `admin-users-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const densityLabel: Record<Density, { vi: string; en: string }> = {
    compact:     { vi: "Nén", en: "Compact" },
    middle:      { vi: "Vừa", en: "Middle" },
    comfortable: { vi: "Thoải mái", en: "Comfortable" },
  };

  return (
    <main className="page-content">
      {/* Page Heading */}
      <div className="page-heading">
        <div>
          <h1 className="page-title">
            {isVi ? "Quản trị viên" : "Admin Users"}
          </h1>
          <p className="page-subtitle">
            {isVi
              ? "Quản lý tài khoản quản trị viên và giáo viên"
              : "Manage admin and teacher accounts"}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <span className="admin-stat-value">{admins.length}</span>
          <span className="admin-stat-label">
            {isVi ? "Tổng số" : "Total"}
          </span>
        </div>
        <div className="admin-stat-card active">
          <span className="admin-stat-value">
            {admins.filter((a) => a.is_active).length}
          </span>
          <span className="admin-stat-label">
            {isVi ? "Đang hoạt động" : "Active"}
          </span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-value">
            {admins.filter((a) => !a.is_active).length}
          </span>
          <span className="admin-stat-label">
            {isVi ? "Không hoạt động" : "Inactive"}
          </span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="users-toolbar">
        <div className="users-search">
          <Search className="search-icon" />
          <input
            type="text"
            className="users-search-input"
            placeholder={isVi ? "Tìm kiếm..." : "Search..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="search-clear" onClick={() => setSearchQuery("")}><X /></button>
          )}
        </div>

        {/* Date Range Filter next to Search */}
        <div className="toolbar-date-range">
          <span className="date-range-label">{isVi ? "Hoạt động:" : "Active:"}</span>
          <div className="toolbar-date-inputs">
            <input
              type="date"
              className="toolbar-date-input"
              value={filterJoin && filterJoin !== "ALL" ? filterJoin.split("_")[0] || "" : ""}
              onChange={(e) => {
                const to = filterJoin && filterJoin !== "ALL" ? filterJoin.split("_")[1] || "" : "";
                const from = e.target.value;
                setFilterJoin(from || to ? `${from}_${to}` : "ALL");
                setCurrentPage(1);
              }}
            />
            <span className="date-range-sep">~</span>
            <input
              type="date"
              className="toolbar-date-input"
              value={filterJoin && filterJoin !== "ALL" ? filterJoin.split("_")[1] || "" : ""}
              onChange={(e) => {
                const from = filterJoin && filterJoin !== "ALL" ? filterJoin.split("_")[0] || "" : "";
                const to = e.target.value;
                setFilterJoin(from || to ? `${from}_${to}` : "ALL");
                setCurrentPage(1);
              }}
            />
          </div>
        </div>
      </div>

      {/* Table Actions (ProTable-style) */}
      <div className="admin-table-actions">
        <h2 className="admin-table-title">
          {isVi ? "Danh sách quản trị viên" : "Admin Users List"}
          <span className="admin-table-count">{filteredAdmins.length}</span>
        </h2>
        <div className="admin-table-action-buttons">
          {/* Export */}
          <button type="button" className="table-ghost-btn" onClick={handleExportCsv}>
            <Download />
            {isVi ? "Xuất CSV" : "Export"}
            <ChevronDown />
          </button>

          {/* Reset */}
          <button
            type="button"
            className="table-ghost-btn"
            onClick={handleReset}
            title={isVi ? "Đặt lại tất cả" : "Reset all"}
          >
            <RotateCcw />
            {isVi ? "Đặt lại" : "Reset"}
          </button>

          {/* Density */}
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
                <div className="protable-dropdown-title">{isVi ? "Tỉ trọng hàng" : "Row Density"}</div>
                {(["compact", "middle", "comfortable"] as Density[]).map((d) => (
                  <button
                    key={d}
                    className={`protable-dropdown-item${density === d ? " active" : ""}`}
                    onClick={() => { setDensity(d); setShowDensityMenu(false); }}
                  >
                    {isVi ? densityLabel[d].vi : densityLabel[d].en}
                    {density === d && <CheckCircle className="dropdown-check" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Column Settings */}
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
                <span className="col-badge">{visibleColCount}/{columns.length}</span>
              )}
            </button>
            {showColSettings && (
              <div className="protable-dropdown col-settings-dropdown">
                <div className="protable-dropdown-title">{isVi ? "Cài đặt cột" : "Column Settings"}</div>
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

          {/* Add Admin */}
          <button
            type="button"
            className="primary-button"
            onClick={() => setActiveNavItem("admin-user-form")}
          >
            <Plus />
            {isVi ? "Thêm quản trị viên" : "Add Admin User"}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="users-table-wrapper">
        <table className={`users-table density-${density}`}>
          <thead>
            <tr>
              {isColVisible("user") && (
                <th>
                  <SortableHeader
                    label={isVi ? "Người dùng" : "User"}
                    colKey="name" sortKey={sortKey} sortDir={sortDir} onSort={handleSort}
                  />
                </th>
              )}
              {isColVisible("role") && (
                <th className="th-with-filter">
                  <RoleFilterHeader
                    isVi={isVi}
                    filterRole={filterRole}
                    setFilterRole={setFilterRole}
                    setCurrentPage={setCurrentPage}
                  />
                </th>
              )}
              {isColVisible("last_active") && (
                <th>
                  <SortableHeader
                    label={isVi ? "Hoạt động cuối" : "Last Active"}
                    colKey="last_active" sortKey={sortKey} sortDir={sortDir} onSort={handleSort}
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
              <th />
            </tr>
          </thead>
          <tbody>
            {paginatedAdmins.map((admin) => {
              const RoleIcon = getRoleIcon(admin.role);
              return (
                <tr
                  key={admin.id}
                  className={!admin.is_active ? "banned-row" : ""}
                >
                  {isColVisible("user") && (
                    <td>
                      <div className="admin-user-cell">
                        <div
                          className="admin-avatar"
                          style={{
                            background: roleColors[admin.role] + "20",
                            color: roleColors[admin.role],
                          }}
                        >
                          <RoleIcon className="avatar-icon" />
                        </div>
                        <div className="admin-user-info">
                          <span className="admin-name">{admin.name}</span>
                          <span className="admin-email">{admin.email}</span>
                        </div>
                      </div>
                    </td>
                  )}
                  {isColVisible("role") && (
                    <td>
                      <RoleCellDropdown
                        admin={admin}
                        isVi={isVi}
                        onRoleChangeRequest={handleRoleChangeRequest}
                      />
                    </td>
                  )}
                  {isColVisible("last_active") && (
                    <td className="last-active">
                      {formatTimeAgo(admin.last_active, isVi)}
                    </td>
                  )}
                  {isColVisible("status") && (
                    <td>
                      <span
                        className={`status-pill ${
                          admin.is_active ? "success" : "inactive"
                        }`}
                      >
                        {admin.is_active
                          ? isVi ? "Hoạt động" : "Active"
                          : isVi ? "Không hoạt động" : "Inactive"}
                      </span>
                    </td>
                  )}
                  <td>
                    <div className="row-actions">
                      <button
                        className="row-action-btn"
                        title={isVi ? "Xem chi tiết" : "View Details"}
                        onClick={() =>
                          setActiveNavItem(`admin-profile:${admin.id}`)
                        }
                      >
                        <Eye />
                      </button>
                      <button
                        className="row-action-btn"
                        title={isVi ? "Sửa" : "Edit"}
                        onClick={() =>
                          setActiveNavItem(`admin-user-form:${admin.id}`)
                        }
                      >
                        <Edit2 />
                      </button>
                      <button
                        className={`row-action-btn ${
                          admin.is_active ? "danger" : "success"
                        }`}
                        onClick={() => handleBanAdmin(admin)}
                        title={
                          admin.is_active
                            ? isVi ? "Khóa tài khoản" : "Deactivate"
                            : isVi ? "Mở khóa" : "Activate"
                        }
                      >
                        {admin.is_active ? <Ban /> : <CheckCircle />}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredAdmins.length === 0 && (
          <div className="users-empty">
            <Search className="empty-icon" />
            <p className="empty-title">
              {hasActiveFilters
                ? isVi ? "Không tìm thấy quản trị viên" : "No admin users found"
                : isVi ? "Chưa có quản trị viên" : "No admin users"}
            </p>
            {hasActiveFilters && (
              <button className="empty-action" onClick={handleReset}>
                {isVi ? "Xóa bộ lọc" : "Clear filters"}
              </button>
            )}
          </div>
        )}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={Math.ceil(filteredAdmins.length / pageSize)}
        pageSize={pageSize}
        onPageSizeChange={handlePageSizeChange}
        totalItems={filteredAdmins.length}
        onPageChange={setCurrentPage}
      />

      {/* Ban Admin Modal */}
      <ConfirmModal
        isOpen={!!banModalAdmin}
        onClose={() => setBanModalAdmin(null)}
        onConfirm={confirmBanAdmin}
        type={banModalAdmin?.is_active ? "danger" : "success"}
        icon={banModalAdmin?.is_active ? "ban" : "warning"}
        title={
          banModalAdmin?.is_active
            ? isVi ? "Khóa tài khoản" : "Deactivate Account"
            : isVi ? "Mở khóa tài khoản" : "Activate Account"
        }
        message={
          banModalAdmin?.is_active
            ? `${
                isVi
                  ? "Bạn có chắc muốn khóa tài khoản"
                  : "Are you sure you want to deactivate"
              } "${banModalAdmin?.name}"? ${
                isVi
                  ? "Người dùng sẽ không thể đăng nhập cho đến khi được mở khóa."
                  : "The user will not be able to log in until reactivated."
              }`
            : `${
                isVi
                  ? "Bạn có chắc muốn mở khóa tài khoản"
                  : "Are you sure you want to activate"
              } "${banModalAdmin?.name}"?`
        }
        confirmText={
          banModalAdmin?.is_active
            ? isVi ? "Khóa tài khoản" : "Deactivate"
            : isVi ? "Mở khóa" : "Activate"
        }
        cancelText={isVi ? "Hủy" : "Cancel"}
      />

      {/* Confirm Change Role Modal when promoting to Admin */}
      <ConfirmModal
        isOpen={!!roleChangeTarget}
        onClose={() => setRoleChangeTarget(null)}
        onConfirm={confirmRoleChange}
        type="warning"
        icon="warning"
        title={isVi ? "Xác nhận nâng quyền Quản trị viên" : "Confirm Admin Promotion"}
        message={
          roleChangeTarget
            ? isVi
              ? `Bạn có chắc chắn muốn nâng quyền tài khoản "${roleChangeTarget.admin.name}" thành Quản trị viên không?`
              : `Are you sure you want to promote account "${roleChangeTarget.admin.name}" to Admin?`
            : ""
        }
        confirmText={isVi ? "Xác nhận" : "Confirm"}
        cancelText={isVi ? "Hủy" : "Cancel"}
      />
    </main>
  );
}

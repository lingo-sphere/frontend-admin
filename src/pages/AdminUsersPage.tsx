import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Shield,
  GraduationCap,
  RotateCcw,
  CheckCircle,
  X,
  Lock,
  Ban,
} from "lucide-react";
import { Pagination } from "@/components/common/Pagination";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { TableControls, type TableDensity, type ColumnOption } from "@/components/common/TableControls";
import { useAdminStore } from "@/store/admin-store";
import { userService } from "@/services/user.service";
import { toast } from "@/store/toast-store";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "TEACHER";
  is_active: boolean;
  avatar?: string;
  created_at: string;
  last_active: string;
  phone?: string;
}

const defaultAdmins: AdminUser[] = [
  {
    id: "usr_admin_001",
    name: "LingoSphere Super Admin",
    email: "admin@lingosphere.local",
    role: "ADMIN",
    is_active: true,
    created_at: "2026-01-01T00:00:00.000Z",
    last_active: "Vừa xong",
    phone: "0901234567",
  },
  {
    id: "usr_instructor_001",
    name: "LingoSphere Master Teacher",
    email: "teacher@lingosphere.local",
    role: "TEACHER",
    is_active: true,
    created_at: "2026-01-05T00:00:00.000Z",
    last_active: "10 phút trước",
    phone: "0909876543",
  },
];

type FilterRole = "ALL" | "ADMIN" | "TEACHER";
type FilterStatus = "ALL" | "ACTIVE" | "INACTIVE";

export function AdminUsersPage() {
  const { t } = useTranslation();
  const setActiveNavItem = useAdminStore((state) => state.setActiveNavItem);

  const [admins, setAdmins] = useState<AdminUser[]>(defaultAdmins);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<FilterRole>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<FilterStatus>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [density, setDensity] = useState<TableDensity>("middle");

  // Column Visibility Controls
  const [columns, setColumns] = useState<ColumnOption[]>([
    { key: "admin", label: "Quản trị viên", visible: true },
    { key: "role", label: "Vai trò (Role)", visible: true },
    { key: "status", label: "Trạng thái", visible: true },
    { key: "last_active", label: "Hoạt động gần nhất", visible: true },
    { key: "actions", label: "Thao tác", visible: true },
  ]);

  const isColVisible = (key: string) => columns.find((c) => c.key === key)?.visible ?? true;

  // Modal State
  const [modalUser, setModalUser] = useState<AdminUser | null>(null);
  const [modalAction, setModalAction] = useState<"ban" | "unban" | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const fetchAdmins = async () => {
    setIsLoading(true);
    try {
      const [adminRes, teacherRes] = await Promise.allSettled([
        userService.getAllUsers({ role: "ADMIN", limit: 50 }),
        userService.getAllUsers({ role: "INSTRUCTOR", limit: 50 }),
      ]);

      const items: any[] = [];
      if (adminRes.status === "fulfilled" && adminRes.value?.items) {
        items.push(...adminRes.value.items);
      }
      if (teacherRes.status === "fulfilled" && teacherRes.value?.items) {
        items.push(...teacherRes.value.items);
      }

      if (items.length > 0) {
        const mapped: AdminUser[] = items.map((u: any) => ({
          id: u._id,
          name: u.full_name || u.email.split("@")[0],
          email: u.email,
          role: u.role === "INSTRUCTOR" ? "TEACHER" : "ADMIN",
          is_active: u.status === "ACTIVE" || u.is_active,
          avatar: u.avatar_url,
          created_at: u.created_at || new Date().toISOString(),
          last_active: "Vừa xong",
          phone: u.phone_number || "Chưa cập nhật",
        }));
        setAdmins(mapped);
      }
    } catch (err) {
      console.warn("Using local mock admin data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const filteredAdmins = useMemo(() => {
    return admins.filter((admin) => {
      const matchSearch =
        admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchRole = selectedRole === "ALL" || admin.role === selectedRole;
      const matchStatus =
        selectedStatus === "ALL" ||
        (selectedStatus === "ACTIVE" && admin.is_active) ||
        (selectedStatus === "INACTIVE" && !admin.is_active);

      return matchSearch && matchRole && matchStatus;
    });
  }, [admins, searchTerm, selectedRole, selectedStatus]);

  const totalPages = Math.ceil(filteredAdmins.length / pageSize) || 1;

  const paginatedAdmins = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAdmins.slice(start, start + pageSize);
  }, [filteredAdmins, currentPage, pageSize]);

  const handleConfirmStatusChange = async () => {
    if (!modalUser || !modalAction) return;
    setIsUpdatingStatus(true);
    const newStatus = modalAction === "ban" ? "BLOCKED" : "ACTIVE";

    try {
      await userService.updateUserStatus(modalUser.id, newStatus);
      setAdmins((prev) =>
        prev.map((u) =>
          u.id === modalUser.id ? { ...u, is_active: modalAction !== "ban" } : u
        )
      );
      toast.success(
        modalAction === "ban"
          ? `Đã khóa quyền quản trị của ${modalUser.email}`
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
    setSelectedRole("ALL");
    setSelectedStatus("ALL");
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
            Ban Quản Trị & Giảng Viên
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Quản lý đội ngũ giảng viên biên soạn khóa học và phân quyền quản trị hệ thống
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchAdmins}
            className="flex items-center gap-2 h-10 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-teal-500" : ""}`} />
            <span>Làm mới</span>
          </button>
          <button
            onClick={() => setActiveNavItem("admin-user-create")}
            className="flex items-center gap-2 h-10 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Quản Trị Viên</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-center gap-3.5 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Tổng ban quản trị</p>
            <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{admins.length} nhân sự</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-center gap-3.5 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Quyền tối cao (ADMIN)</p>
            <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {admins.filter((a) => a.role === "ADMIN").length} tài khoản
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-center gap-3.5 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Giảng viên (TEACHER)</p>
            <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {admins.filter((a) => a.role === "TEACHER").length} tài khoản
            </p>
          </div>
        </div>
      </div>

      {/* Filter & Table Controls Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          <div className="flex items-center gap-2 w-full sm:w-72 h-10 px-3.5 rounded-xl bg-slate-100 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 focus-within:border-indigo-500 transition-all">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên hoặc email admin..."
              className="w-full bg-transparent border-0 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 p-0 text-xs focus:ring-0"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm("")} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value as FilterRole)}
            className="h-10 px-3 rounded-xl bg-slate-100 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="ALL">Tất cả vai trò</option>
            <option value="ADMIN">Quản trị viên tối cao (ADMIN)</option>
            <option value="TEACHER">Giảng viên (TEACHER)</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as FilterStatus)}
            className="h-10 px-3 rounded-xl bg-slate-100 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="ACTIVE">Đang hoạt động</option>
            <option value="INACTIVE">Đã khóa / Tạm dừng</option>
          </select>
        </div>

        {/* Table Controls (Density, Columns, Reset) */}
        <TableControls
          density={density}
          onDensityChange={setDensity}
          columns={columns}
          onColumnsChange={setColumns}
          onResetFilters={handleResetFilters}
          totalCount={filteredAdmins.length}
        />
      </div>

      {/* Admin Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/40 text-slate-500 dark:text-slate-400 font-semibold">
                {isColVisible("admin") && <th className="py-3.5 px-4">Quản trị viên</th>}
                {isColVisible("role") && <th className="py-3.5 px-4">Vai trò (Role)</th>}
                {isColVisible("status") && <th className="py-3.5 px-4">Trạng thái</th>}
                {isColVisible("last_active") && <th className="py-3.5 px-4">Hoạt động gần nhất</th>}
                {isColVisible("actions") && <th className="py-3.5 px-4 text-right">Thao tác</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-200">
              {paginatedAdmins.length === 0 ? (
                <tr>
                  <td colSpan={columns.filter((c) => c.visible).length} className="py-12 text-center text-slate-400">
                    Không tìm thấy quản trị viên nào
                  </td>
                </tr>
              ) : (
                paginatedAdmins.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    {isColVisible("admin") && (
                      <td className={getCellPadding()}>
                        <div
                          className="flex items-center gap-3 cursor-pointer"
                          onClick={() => setActiveNavItem(`admin-profile:${user.id}`)}
                        >
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-teal-500 text-white font-bold text-xs flex items-center justify-center shrink-0">
                            {user.avatar ? (
                              <img
                                src={user.avatar}
                                alt={user.name}
                                className="w-full h-full rounded-xl object-cover"
                              />
                            ) : (
                              user.name.slice(0, 2).toUpperCase()
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                              {user.name}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">{user.email}</p>
                          </div>
                        </div>
                      </td>
                    )}

                    {isColVisible("role") && (
                      <td className={getCellPadding()}>
                        {user.role === "ADMIN" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                            <Shield className="w-3 h-3" />
                            <span>ADMIN</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                            <GraduationCap className="w-3 h-3" />
                            <span>TEACHER</span>
                          </span>
                        )}
                      </td>
                    )}

                    {isColVisible("status") && (
                      <td className={getCellPadding()}>
                        {user.is_active ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            Hoạt động
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                            Bị khóa
                          </span>
                        )}
                      </td>
                    )}

                    {isColVisible("last_active") && (
                      <td className={`${getCellPadding()} text-slate-500 dark:text-slate-400`}>{user.last_active}</td>
                    )}

                    {isColVisible("actions") && (
                      <td className={`${getCellPadding()} text-right`}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setActiveNavItem(`admin-user-edit:${user.id}`)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                            title="Chỉnh sửa"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setModalUser(user);
                              setModalAction(user.is_active ? "ban" : "unban");
                            }}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              user.is_active
                                ? "bg-slate-100 hover:bg-rose-500/20 dark:bg-slate-800 text-slate-500 hover:text-rose-500"
                                : "bg-slate-100 hover:bg-emerald-500/20 dark:bg-slate-800 text-slate-500 hover:text-emerald-600"
                            }`}
                            title={user.is_active ? "Khóa tài khoản" : "Mở khóa"}
                          >
                            {user.is_active ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4 text-emerald-500" />}
                          </button>
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
        totalPages={totalPages}
        totalItems={filteredAdmins.length}
        onPageChange={setCurrentPage}
        pageSize={pageSize}
        onPageSizeChange={(size) => {
          setPageSize(size);
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
        title={modalAction === "ban" ? "Khóa tài khoản quản trị?" : "Mở khóa tài khoản?"}
        description={
          modalAction === "ban"
            ? `Tài khoản ${modalUser?.email} sẽ tạm thời mất quyền truy cập Admin Console.`
            : `Tài khoản ${modalUser?.email} sẽ được khôi phục quyền quản trị.`
        }
        confirmText={modalAction === "ban" ? "Xác nhận khóa" : "Mở khóa"}
        cancelText="Hủy bỏ"
        variant={modalAction === "ban" ? "danger" : undefined}
        isLoading={isUpdatingStatus}
      />
    </div>
  );
}

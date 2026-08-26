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
import { DataTable, type DataTableColumn } from "@/components/common/DataTable";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { useAdminStore } from "@/store/admin-store";
import { userService } from "@/services/user.service";
import { toast } from "@/store/toast-store";
import type { UserProfile } from "@/types/api.types";

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

type FilterRole = "ALL" | "ADMIN" | "TEACHER";
type FilterStatus = "ALL" | "ACTIVE" | "INACTIVE";

export function AdminUsersPage() {
  const { t } = useTranslation();
  const setActiveNavItem = useAdminStore((state) => state.setActiveNavItem);

  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<FilterRole>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<FilterStatus>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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

      const items: UserProfile[] = [];
      if (adminRes.status === "fulfilled" && adminRes.value?.items) {
        items.push(...adminRes.value.items);
      }
      if (teacherRes.status === "fulfilled" && teacherRes.value?.items) {
        items.push(...teacherRes.value.items);
      }

      const mapped: AdminUser[] = items.map((u: UserProfile) => ({
        id: u._id || u.user_id,
        name: u.full_name || u.email.split("@")[0],
        email: u.email,
        role: u.role === "INSTRUCTOR" ? "TEACHER" : "ADMIN",
        is_active: u.status === "ACTIVE",
        avatar: u.avatar_url,
        created_at: u.created_at || new Date().toISOString(),
        last_active: "Vừa xong",
        phone: u.phone_number || "Chưa cập nhật",
      }));
      setAdmins(mapped);
    } catch (err) {
      console.warn("Error fetching admin data from backend:", err);
      setAdmins([]);
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

  const columns: DataTableColumn<AdminUser>[] = [
    {
      key: "admin",
      title: "Quản trị viên",
      render: (user) => (
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
      ),
    },
    {
      key: "role",
      title: "Vai trò (Role)",
      render: (user) => (
        <>
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
        </>
      ),
    },
    {
      key: "status",
      title: "Trạng thái",
      render: (user) => (
        <>
          {user.is_active ? (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Hoạt động
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
              Bị khóa
            </span>
          )}
        </>
      ),
    },
    {
      key: "last_active",
      title: "Hoạt động gần nhất",
      dataIndex: "last_active",
    },
    {
      key: "actions",
      title: "Thao tác",
      align: "right",
      render: (user) => (
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
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header & KPI Stats */}
      <div className="space-y-4">
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
      </div>

      {/* Reusable Generic DataTable */}
      <DataTable<AdminUser>
        columns={columns}
        data={paginatedAdmins}
        rowKey={(a) => a.id}
        isLoading={isLoading}
        onResetFilters={handleResetFilters}
        filterSlot={
          <>
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
          </>
        }
        pagination={{
          currentPage,
          pageSize,
          totalItems: filteredAdmins.length,
          onPageChange: setCurrentPage,
          onPageSizeChange: (size) => {
            setPageSize(size);
            setCurrentPage(1);
          },
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

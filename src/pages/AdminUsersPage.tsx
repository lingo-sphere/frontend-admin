import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Shield,
  GraduationCap,
  Plus,
  Edit2,
  CheckCircle,
  Search,
  Eye,
  Ban,
  RotateCcw,
  X,
  Lock,
} from "lucide-react";
import {
  adminUsers,
  type AdminUser,
} from "@/data/settings-data";
import { useAdminStore } from "@/store/admin-store";
import { userService } from "@/services/user.service";
import { toast } from "@/store/toast-store";
import { Pagination } from "@/components/common/Pagination";
import { ConfirmModal } from "@/components/common/ConfirmModal";

type FilterStatus = "ALL" | "ACTIVE" | "INACTIVE";
type FilterRole = "ALL" | "ADMIN" | "TEACHER";

export function AdminUsersPage() {
  const { t, i18n } = useTranslation();
  const isVietnamese = i18n.language === "vi";
  const setActiveNavItem = useAdminStore((state) => state.setActiveNavItem);

  const [admins, setAdmins] = useState<AdminUser[]>(adminUsers);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<FilterRole>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<FilterStatus>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Ban/Unban Modal
  const [modalUser, setModalUser] = useState<AdminUser | null>(null);
  const [modalAction, setModalAction] = useState<"ban" | "unban" | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const fetchAdmins = async () => {
    setIsLoading(true);
    try {
      const res = await userService.getAllUsers({
        role: "ADMIN",
        limit: 50,
      });

      const items = res?.items || (res as any)?.users || []
      if (items.length > 0) {
        const mapped: AdminUser[] = items.map((u: any) => ({
          id: u._id,
          name: u.full_name || u.email.split("@")[0],
          email: u.email,
          role: u.role === "INSTRUCTOR" ? "TEACHER" : "ADMIN",
          avatar: u.avatar_url,
          is_active: u.is_active !== false,
          last_active: u.updated_at ? new Date(u.updated_at).toLocaleDateString("vi-VN") : "Hôm nay",
          created_at: u.created_at || new Date().toISOString(),
        }));
        setAdmins(mapped);
      }
    } catch (err) {
      console.warn("Using local admin users:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const filteredAdmins = useMemo(() => {
    return admins.filter((a) => {
      const matchSearch =
        a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchRole = selectedRole === "ALL" || a.role === selectedRole;
      const matchStatus =
        selectedStatus === "ALL" ||
        (selectedStatus === "ACTIVE" ? a.is_active : !a.is_active);
      return matchSearch && matchRole && matchStatus;
    });
  }, [admins, searchTerm, selectedRole, selectedStatus]);

  const paginatedAdmins = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAdmins.slice(start, start + pageSize);
  }, [filteredAdmins, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredAdmins.length / pageSize);

  const handleStatusChangeConfirm = async () => {
    if (!modalUser || !modalAction) return;
    setIsUpdatingStatus(true);
    const newStatus = modalAction === "ban" ? "BLOCKED" : "ACTIVE";

    try {
      await userService.updateUserStatus(modalUser.id, newStatus);
      setAdmins((prev) =>
        prev.map((a) =>
          a.id === modalUser.id ? { ...a, is_active: modalAction !== "ban" } : a
        )
      );
      toast.success(
        modalAction === "ban"
          ? `Đã vô hiệu hóa quản trị viên ${modalUser.email}`
          : `Đã kích hoạt lại quản trị viên ${modalUser.email}`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Cập nhật thất bại";
      toast.error(msg);
    } finally {
      setIsUpdatingStatus(false);
      setModalUser(null);
      setModalAction(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
            Quản Trị Viên & Giảng Viên
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Quản lý tài khoản quản trị viên tối cao và giáo viên soạn thảo khóa học
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchAdmins}
            className="flex items-center gap-2 h-10 px-4 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-teal-400" : ""}`} />
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
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-medium">Tổng ban quản trị</p>
            <p className="text-lg font-bold text-slate-100">{admins.length} nhân sự</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-medium">Quyền tối cao (ADMIN)</p>
            <p className="text-lg font-bold text-slate-100">
              {admins.filter((a) => a.role === "ADMIN").length} tài khoản
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-medium">Giảng viên (TEACHER)</p>
            <p className="text-lg font-bold text-slate-100">
              {admins.filter((a) => a.role === "TEACHER").length} tài khoản
            </p>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          <div className="flex items-center gap-2 w-full sm:w-72 h-10 px-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-200 focus-within:border-indigo-500/80 transition-all">
            <Search className="w-4 h-4 text-slate-500 shrink-0" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên hoặc email admin..."
              className="w-full bg-transparent border-0 outline-none placeholder:text-slate-500 p-0 text-xs focus:ring-0"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm("")} className="text-slate-500 hover:text-slate-300">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value as FilterRole)}
            className="h-10 px-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="ALL">Tất cả vai trò</option>
            <option value="ADMIN">Quản trị viên tối cao (ADMIN)</option>
            <option value="TEACHER">Giáo viên (TEACHER)</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as FilterStatus)}
            className="h-10 px-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="ACTIVE">Đang hoạt động</option>
            <option value="INACTIVE">Đã khóa / Tạm dừng</option>
          </select>
        </div>
      </div>

      {/* Admin Table */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 font-semibold">
                <th className="py-3.5 px-4">Quản trị viên</th>
                <th className="py-3.5 px-4">Vai trò (Role)</th>
                <th className="py-3.5 px-4">Trạng thái</th>
                <th className="py-3.5 px-4">Hoạt động gần nhất</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-slate-200">
              {paginatedAdmins.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    Không tìm thấy quản trị viên nào
                  </td>
                </tr>
              ) : (
                paginatedAdmins.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <div
                        className="flex items-center gap-3 cursor-pointer"
                        onClick={() => setActiveNavItem(`admin-profile:${user.id}`)}
                      >
                        <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 font-bold text-xs flex items-center justify-center shrink-0">
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
                          <p className="font-semibold text-slate-100 hover:text-indigo-400 transition-colors">
                            {user.name}
                          </p>
                          <p className="text-[11px] text-slate-400">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {user.role === "ADMIN" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          <Shield className="w-3 h-3" />
                          <span>ADMIN</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-500/10 text-teal-400 border border-teal-500/20">
                          <GraduationCap className="w-3 h-3" />
                          <span>TEACHER</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {user.is_active ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Hoạt động
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          Bị khóa
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-slate-400">{user.last_active}</td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setActiveNavItem(`admin-user-edit:${user.id}`)}
                          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
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
                              ? "hover:bg-rose-500/10 text-slate-400 hover:text-rose-400"
                              : "hover:bg-emerald-500/10 text-slate-400 hover:text-emerald-400"
                          }`}
                          title={user.is_active ? "Khóa tài khoản" : "Mở khóa"}
                        >
                          {user.is_active ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-800 p-2">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            pageSize={pageSize}
            onPageSizeChange={setPageSize}
            totalItems={filteredAdmins.length}
          />
        </div>
      </div>

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={Boolean(modalUser && modalAction)}
        onClose={() => {
          setModalUser(null);
          setModalAction(null);
        }}
        onConfirm={handleStatusChangeConfirm}
        title={
          modalAction === "ban"
            ? `Vô hiệu hóa quyền của ${modalUser?.name}?`
            : `Kích hoạt lại tài khoản ${modalUser?.name}?`
        }
        description={
          modalAction === "ban"
            ? "Tài khoản quản trị này sẽ bị tước quyền đăng nhập vào hệ thống Admin Console."
            : "Tài khoản sẽ được khôi phục quyền quản trị theo vai trò tương ứng."
        }
        confirmText={modalAction === "ban" ? "Vô hiệu hóa" : "Kích hoạt"}
        cancelText="Hủy bỏ"
        variant={modalAction === "ban" ? "danger" : "success"}
        isLoading={isUpdatingStatus}
      />
    </div>
  );
}

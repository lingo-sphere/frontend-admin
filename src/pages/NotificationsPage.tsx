import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Bell,
  Pin,
  PinOff,
  Check,
  CheckCheck,
  Trash2,
  Search,
  X,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { notificationService } from "@/services/notification.service";
import { toast } from "@/store/toast-store";
import {
  mockNotifications,
  categoryLabels,
  type Notification,
} from "@/data/notifications-data";
import type { AppNotification } from "@/types/api.types";
import { Pagination } from "@/components/common/Pagination";

type FilterCategory = "ALL" | "AUTH" | "USER" | "SUBSCRIPTION" | "VOCABULARY" | "PRACTICE" | "EXAM" | "COURSE" | "AI" | "SYSTEM";
type FilterPriority = "ALL" | "LOW" | "NORMAL" | "HIGH" | "URGENT" | "CRITICAL";
type FilterStatus = "ALL" | "UNREAD" | "READ" | "PINNED";

function formatTimeAgo(dateStr: string, isVietnamese: boolean): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return isVietnamese ? "Vừa xong" : "Just now";
  if (diffMins < 60) return isVietnamese ? `${diffMins} phút trước` : `${diffMins}m ago`;
  if (diffHours < 24) return isVietnamese ? `${diffHours} giờ trước` : `${diffHours}h ago`;
  if (diffDays < 7) return isVietnamese ? `${diffDays} ngày trước` : `${diffDays}d ago`;
  return date.toLocaleDateString(isVietnamese ? "vi-VN" : "en-US");
}

export function NotificationsPage() {
  const { i18n } = useTranslation();
  const isVietnamese = i18n.language === "vi";

  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>("ALL");
  const [selectedPriority, setSelectedPriority] = useState<FilterPriority>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<FilterStatus>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const list = await notificationService.getMyNotifications();
      if (list && list.length > 0) {
        const mapped: Notification[] = list.map((n: AppNotification) => ({
          id: n._id || '',
          recipient_id: 'admin',
          recipient_type: 'ADMIN',
          notification_type: 'SYSTEM_ALERT',
          notification_category: (n.category as Notification['notification_category']) || 'SYSTEM',
          channels: ['IN_APP'],
          title: n.title,
          title_vi: n.title_vi || n.title,
          content: n.content || '',
          content_vi: n.content_vi || n.content || '',
          priority: (n.priority as Notification['priority']) || 'NORMAL',
          is_read: Boolean(n.is_read),
          is_pinned: Boolean(n.is_pinned),
          created_at: n.created_at || new Date().toISOString(),
          read_at: undefined,
          action_url: n.action_url,
        }));
        setNotifications(mapped);
      }
    } catch (err) {
      console.warn("Could not fetch real notifications:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      const matchSearch =
        n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.content.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory =
        selectedCategory === "ALL" || n.notification_category === selectedCategory;
      const matchPriority =
        selectedPriority === "ALL" || n.priority === selectedPriority;
      const matchStatus =
        selectedStatus === "ALL" ||
        (selectedStatus === "UNREAD" && !n.is_read) ||
        (selectedStatus === "READ" && n.is_read) ||
        (selectedStatus === "PINNED" && n.is_pinned);

      return matchSearch && matchCategory && matchPriority && matchStatus;
    });
  }, [notifications, searchTerm, selectedCategory, selectedPriority, selectedStatus]);

  const paginatedNotifications = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredNotifications.slice(start, start + pageSize);
  }, [filteredNotifications, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredNotifications.length / pageSize);

  const togglePin = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_pinned: !n.is_pinned } : n))
    );
  };

  const markAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    try {
      await notificationService.markAsRead(id);
    } catch {
      // silent
    }
  };

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    try {
      await notificationService.markAllAsRead();
      toast.success("Đã đánh dấu tất cả là đã đọc");
    } catch {
      // silent
    }
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    toast.success("Đã xóa thông báo");
  };

  const handleTriggerDaily = async () => {
    try {
      await notificationService.triggerDailyReminders();
      toast.success("Đã kích hoạt gửi lời nhắc học tập hàng ngày tới học viên!");
    } catch {
      toast.error("Kích hoạt lời nhắc thất bại");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
            Trung Tâm Thông Báo & Cảnh Báo
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Quản lý thông báo hệ thống, nhắc nhở học viên hàng ngày và các chiến dịch marketing
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchNotifications}
            className="flex items-center gap-2 h-10 px-4 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-teal-400" : ""}`} />
            <span>Làm mới</span>
          </button>
          <button
            onClick={handleTriggerDaily}
            className="flex items-center gap-2 h-10 px-4 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Kích hoạt nhắc học</span>
          </button>
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-2 h-10 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Đọc tất cả</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          <div className="flex items-center gap-2 w-full sm:w-72 h-10 px-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-200 focus-within:border-indigo-500 transition-all">
            <Search className="w-4 h-4 text-slate-500 shrink-0" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm thông báo..."
              className="w-full bg-transparent border-0 outline-none placeholder:text-slate-500 p-0 text-xs focus:ring-0"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm("")} className="text-slate-500 hover:text-slate-300">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as FilterCategory)}
            className="h-10 px-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="ALL">Tất cả phân loại</option>
            <option value="SYSTEM">Hệ thống (SYSTEM)</option>
            <option value="COURSE">Khóa học (COURSE)</option>
            <option value="VOCABULARY">Từ vựng (VOCABULARY)</option>
            <option value="EXAM">Thi cử (EXAM)</option>
            <option value="AI">Trí tuệ nhân tạo (AI)</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as FilterStatus)}
            className="h-10 px-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="UNREAD">Chưa đọc (Unread)</option>
            <option value="READ">Đã đọc (Read)</option>
            <option value="PINNED">Đã ghim (Pinned)</option>
          </select>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {paginatedNotifications.length === 0 ? (
          <div className="py-16 text-center rounded-3xl bg-slate-900/60 border border-slate-800 text-slate-500 text-xs">
            <Bell className="w-8 h-8 mx-auto mb-2 text-slate-600" />
            <p>Không có thông báo nào phù hợp với bộ lọc</p>
          </div>
        ) : (
          paginatedNotifications.map((notif) => {
            const title = isVietnamese && notif.title_vi ? notif.title_vi : notif.title;
            const content = isVietnamese && notif.content_vi ? notif.content_vi : notif.content;

            return (
              <div
                key={notif.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4 ${
                  !notif.is_read
                    ? "bg-slate-900/90 border-indigo-500/40 shadow-sm shadow-indigo-500/10"
                    : "bg-slate-900/50 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                      {categoryLabels[notif.notification_category]?.[isVietnamese ? "vi" : "en"] || notif.notification_category}
                    </span>

                    {notif.priority === "HIGH" || notif.priority === "URGENT" ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        {notif.priority}
                      </span>
                    ) : null}

                    {notif.is_pinned && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20 flex items-center gap-1">
                        <Pin className="w-2.5 h-2.5" />
                        <span>Đã ghim</span>
                      </span>
                    )}

                    {!notif.is_read && (
                      <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                    )}

                    <span className="text-[11px] text-slate-500 ml-auto sm:ml-0">
                      {formatTimeAgo(notif.created_at, isVietnamese)}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-100">{title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{content}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                  <button
                    onClick={() => togglePin(notif.id)}
                    className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
                    title={notif.is_pinned ? "Bỏ ghim" : "Ghim thông báo"}
                  >
                    {notif.is_pinned ? <PinOff className="w-4 h-4 text-amber-400" /> : <Pin className="w-4 h-4" />}
                  </button>

                  {!notif.is_read && (
                    <button
                      onClick={() => markAsRead(notif.id)}
                      className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-teal-400 transition-colors cursor-pointer"
                      title="Đánh dấu đã đọc"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={() => deleteNotification(notif.id)}
                    className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                    title="Xóa thông báo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        totalItems={filteredNotifications.length}
      />
    </div>
  );
}

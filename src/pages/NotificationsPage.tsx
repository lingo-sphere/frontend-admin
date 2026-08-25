// Updated: 2026-08-22
// Notifications page - Quản lý thông báo cho admin (Modern ProTable UI & Filter Sync)

import { useState, useMemo } from "react";
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
  ExternalLink,
  RotateCcw,
  Download,
  Plus,
} from "lucide-react";
import {
  mockNotifications,
  getNotificationStats,
  categoryColors,
  priorityColors,
  categoryLabels,
  type Notification,
} from "@/data/notifications-data";

type FilterCategory =
  | "ALL"
  | "AUTH"
  | "USER"
  | "SUBSCRIPTION"
  | "VOCABULARY"
  | "PRACTICE"
  | "EXAM"
  | "COURSE"
  | "AI"
  | "GAMIFICATION"
  | "MARKETING"
  | "SYSTEM";

type FilterPriority = "ALL" | "LOW" | "NORMAL" | "HIGH" | "URGENT" | "CRITICAL";
type FilterStatus = "ALL" | "UNREAD" | "READ" | "PINNED";
type SortOption = "latest" | "oldest" | "priority_desc";

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

export function NotificationsPage() {
  const { t, i18n } = useTranslation();
  const isVietnamese = i18n.language === "vi";

  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<FilterCategory>("ALL");
  const [filterPriority, setFilterPriority] = useState<FilterPriority>("ALL");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("ALL");
  const [filterJoin, setFilterJoin] = useState<string>("ALL");
  const [sortOption, setSortOption] = useState<SortOption>("latest");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const stats = useMemo(
    () => getNotificationStats(notifications),
    [notifications]
  );

  const handleReset = () => {
    setSearchQuery("");
    setFilterCategory("ALL");
    setFilterPriority("ALL");
    setFilterStatus("ALL");
    setFilterJoin("ALL");
    setSortOption("latest");
  };

  const priorityWeight: Record<string, number> = {
    CRITICAL: 5,
    URGENT: 4,
    HIGH: 3,
    NORMAL: 2,
    LOW: 1,
  };

  const filteredNotifications = useMemo(() => {
    let result = notifications.filter((n) => {
      // Search
      if (searchQuery) {
        const query = searchQuery.toLowerCase().trim();
        const title = isVietnamese && n.title_vi ? n.title_vi : n.title;
        const content = isVietnamese && n.content_vi ? n.content_vi : n.content;
        if (
          !title.toLowerCase().includes(query) &&
          !content.toLowerCase().includes(query)
        ) {
          return false;
        }
      }
      // Category filter
      if (
        filterCategory !== "ALL" &&
        n.notification_category !== filterCategory
      )
        return false;
      // Priority filter
      if (filterPriority !== "ALL" && n.priority !== filterPriority)
        return false;
      // Status filter
      if (filterStatus === "UNREAD" && n.is_read) return false;
      if (filterStatus === "READ" && !n.is_read) return false;
      if (filterStatus === "PINNED" && !n.is_pinned) return false;

      // Date range filter
      if (filterJoin !== "ALL" && filterJoin.includes("_")) {
        const [fromStr, toStr] = filterJoin.split("_");
        const from = fromStr && fromStr.trim() ? new Date(fromStr + "T00:00:00") : null;
        const to = toStr && toStr.trim() ? new Date(toStr + "T23:59:59") : null;
        const d = new Date(n.created_at);
        if (from && !isNaN(from.getTime()) && d < from) return false;
        if (to && !isNaN(to.getTime()) && d > to) return false;
      }

      return true;
    });

    // Sorting
    switch (sortOption) {
      case "latest":
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case "oldest":
        result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case "priority_desc":
        result.sort((a, b) => (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0));
        break;
    }

    return result;
  }, [
    notifications,
    searchQuery,
    filterCategory,
    filterPriority,
    filterStatus,
    filterJoin,
    sortOption,
    isVietnamese,
  ]);

  const hasActiveFilters =
    filterCategory !== "ALL" ||
    filterPriority !== "ALL" ||
    filterStatus !== "ALL" ||
    filterJoin !== "ALL" ||
    searchQuery !== "" ||
    sortOption !== "latest";

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === filteredNotifications.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredNotifications.map((n) => n.id)));
    }
  };

  const markAsRead = () => {
    setNotifications((prev) =>
      prev.map((n) =>
        selectedIds.has(n.id)
          ? { ...n, is_read: true, read_at: new Date().toISOString() }
          : n
      )
    );
    setSelectedIds(new Set());
  };

  const markSingleAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id
          ? { ...n, is_read: true, read_at: new Date().toISOString() }
          : n
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((n) => ({
        ...n,
        is_read: true,
        read_at: new Date().toISOString(),
      }))
    );
  };

  const togglePin = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_pinned: !n.is_pinned } : n))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const deleteSelected = () => {
    setNotifications((prev) => prev.filter((n) => !selectedIds.has(n.id)));
    setSelectedIds(new Set());
  };

  // Export CSV
  const handleExportCsv = () => {
    const headers = ["id", "category", "priority", "title", "is_read", "is_pinned", "created_at"];
    const rows = filteredNotifications.map((n) => [
      String(n.id),
      n.notification_category,
      n.priority,
      isVietnamese && n.title_vi ? n.title_vi : n.title,
      String(n.is_read),
      String(n.is_pinned),
      n.created_at,
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `notifications-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const categories: { id: FilterCategory; label: string }[] = [
    { id: "ALL", label: isVietnamese ? "Tất cả danh mục" : "All Categories" },
    { id: "USER", label: isVietnamese ? "Người dùng" : "User" },
    { id: "SYSTEM", label: isVietnamese ? "Hệ thống" : "System" },
    { id: "SUBSCRIPTION", label: isVietnamese ? "Đăng ký" : "Subscription" },
    { id: "COURSE", label: isVietnamese ? "Khóa học" : "Course" },
    { id: "AI", label: "AI" },
    { id: "GAMIFICATION", label: "Gamification" },
    { id: "AUTH", label: isVietnamese ? "Xác thực" : "Auth" },
    { id: "VOCABULARY", label: isVietnamese ? "Từ vựng" : "Vocabulary" },
    { id: "PRACTICE", label: isVietnamese ? "Luyện tập" : "Practice" },
    { id: "EXAM", label: isVietnamese ? "Thi thử" : "Exam" },
    { id: "MARKETING", label: "Marketing" },
  ];

  return (
    <main className="page-content">
      {/* Page Heading */}
      <div className="page-heading">
        <div>
          <h1 className="page-title">{t("page.notifications.title")}</h1>
          <p className="page-subtitle">{t("page.notifications.subtitle")}</p>
        </div>
        <div className="heading-actions">
          <button className="primary-button" type="button">
            <Plus />
            {isVietnamese ? "Tạo thông báo" : "Create Notification"}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="notif-stats-grid">
        <div className="notif-stat-card">
          <span className="notif-stat-value">{stats.total}</span>
          <span className="notif-stat-label">
            {isVietnamese ? "Tổng số thông báo" : "Total Notifications"}
          </span>
        </div>
        <div className="notif-stat-card unread">
          <span className="notif-stat-value">{stats.unread}</span>
          <span className="notif-stat-label">
            {isVietnamese ? "Chưa đọc" : "Unread"}
          </span>
        </div>
        <div className="notif-stat-card pinned">
          <span className="notif-stat-value">{stats.pinned}</span>
          <span className="notif-stat-label">
            {isVietnamese ? "Đã ghim" : "Pinned"}
          </span>
        </div>
      </div>

      {/* Synchronized Toolbar */}
      <div className="users-toolbar">
        <div className="users-search">
          <Search className="search-icon" />
          <input
            type="text"
            className="users-search-input"
            placeholder={
              isVietnamese ? "Tìm kiếm thông báo..." : "Search notifications..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="search-clear" onClick={() => setSearchQuery("")}>
              <X />
            </button>
          )}
        </div>

        {/* Date Range Filter beside Search */}
        <div className="toolbar-date-range">
          <span className="date-range-label">{isVietnamese ? "Thời gian:" : "Date:"}</span>
          <div className="toolbar-date-inputs">
            <input
              type="date"
              className="toolbar-date-input"
              value={filterJoin && filterJoin !== "ALL" ? filterJoin.split("_")[0] || "" : ""}
              onChange={(e) => {
                const to = filterJoin && filterJoin !== "ALL" ? filterJoin.split("_")[1] || "" : "";
                const from = e.target.value;
                setFilterJoin(from || to ? `${from}_${to}` : "ALL");
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
              }}
            />
          </div>
        </div>
      </div>

      {/* ProTable-style Actions Bar */}
      <div className="admin-table-actions">
        <h2 className="admin-table-title">
          {isVietnamese ? "Danh sách thông báo" : "Notification List"}
          <span className="admin-table-count">{filteredNotifications.length}</span>
        </h2>
        <div className="admin-table-action-buttons">
          {/* Category Filter */}
          <select
            className="admin-select"
            value={filterCategory}
            onChange={(e) =>
              setFilterCategory(e.target.value as FilterCategory)
            }
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            className="admin-select"
            value={filterPriority}
            onChange={(e) =>
              setFilterPriority(e.target.value as FilterPriority)
            }
          >
            <option value="ALL">
              {isVietnamese ? "Mọi mức ưu tiên" : "All Priorities"}
            </option>
            <option value="CRITICAL">⚠️ Critical</option>
            <option value="URGENT">🔶 Urgent</option>
            <option value="HIGH">⚡ High</option>
            <option value="NORMAL">📋 Normal</option>
            <option value="LOW">📄 Low</option>
          </select>

          {/* Status Filter */}
          <select
            className="admin-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
          >
            <option value="ALL">
              {isVietnamese ? "Mọi trạng thái" : "All Status"}
            </option>
            <option value="UNREAD">
              {isVietnamese ? "Chưa đọc" : "Unread"}
            </option>
            <option value="READ">{isVietnamese ? "Đã đọc" : "Read"}</option>
            <option value="PINNED">
              {isVietnamese ? "Đã ghim" : "Pinned"}
            </option>
          </select>

          {/* Sort Selector */}
          <select
            className="admin-select"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as SortOption)}
          >
            <option value="latest">{isVietnamese ? "Mới nhất" : "Latest"}</option>
            <option value="oldest">{isVietnamese ? "Cũ nhất" : "Oldest"}</option>
            <option value="priority_desc">{isVietnamese ? "Ưu tiên cao nhất" : "Highest Priority"}</option>
          </select>

          {/* Export CSV */}
          <button type="button" className="table-ghost-btn" onClick={handleExportCsv}>
            <Download />
            {isVietnamese ? "Xuất CSV" : "Export"}
          </button>

          {/* Reset button */}
          <button
            type="button"
            className="table-ghost-btn"
            onClick={handleReset}
            title={isVietnamese ? "Đặt lại tất cả" : "Reset all"}
          >
            <RotateCcw />
            {isVietnamese ? "Đặt lại" : "Reset"}
          </button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <div className="bulk-actions-bar" style={{ marginBottom: 16 }}>
          <span className="bulk-count">
            {isVietnamese ? "Đã chọn" : "Selected"}: {selectedIds.size}
          </span>
          <button className="secondary-button" onClick={markAsRead}>
            <CheckCheck />
            {isVietnamese ? "Đánh dấu đã đọc" : "Mark as read"}
          </button>
          <button className="danger-button" onClick={deleteSelected}>
            <Trash2 />
            {isVietnamese ? "Xóa" : "Delete"}
          </button>
          <button
            className="secondary-button"
            onClick={() => setSelectedIds(new Set())}
          >
            {isVietnamese ? "Hủy" : "Cancel"}
          </button>
        </div>
      )}

      {/* Notification List */}
      <div className="notif-list">
        {filteredNotifications.length === 0 ? (
          <div className="notif-empty">
            <Bell className="empty-icon" />
            <p className="empty-title">
              {hasActiveFilters
                ? isVietnamese
                  ? "Không có kết quả khớp với bộ lọc"
                  : "No results matching filters"
                : isVietnamese
                ? "Chưa có thông báo"
                : "No notifications"}
            </p>
            {hasActiveFilters && (
              <button className="empty-action" onClick={handleReset}>
                {isVietnamese ? "Xóa bộ lọc" : "Clear filters"}
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="notif-list-header">
              <label className="notif-checkbox-wrapper">
                <input
                  type="checkbox"
                  className="notif-checkbox"
                  checked={
                    selectedIds.size === filteredNotifications.length &&
                    filteredNotifications.length > 0
                  }
                  onChange={selectAll}
                />
              </label>
              <button className="mark-all-read-btn" onClick={markAllAsRead}>
                <CheckCheck />
                {isVietnamese ? "Đọc tất cả" : "Mark all read"}
              </button>
            </div>

            {/* Items */}
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`notif-item${
                  !notification.is_read ? " unread" : ""
                }${selectedIds.has(notification.id) ? " selected" : ""}`}
              >
                <label className="notif-checkbox-wrapper">
                  <input
                    type="checkbox"
                    className="notif-checkbox"
                    checked={selectedIds.has(notification.id)}
                    onChange={() => toggleSelect(notification.id)}
                  />
                </label>

                <div
                  className="notif-priority-indicator"
                  style={{ background: priorityColors[notification.priority] }}
                />

                <div className="notif-content">
                  <div className="notif-header">
                    <span
                      className="notif-category-badge"
                      style={{
                        background:
                          categoryColors[notification.notification_category]
                            ?.bg,
                        color:
                          categoryColors[notification.notification_category]
                            ?.text,
                        borderColor:
                          categoryColors[notification.notification_category]
                            ?.border,
                      }}
                    >
                      {isVietnamese
                        ? categoryLabels[notification.notification_category]
                            ?.vi || notification.notification_category
                        : categoryLabels[notification.notification_category]
                            ?.en || notification.notification_category}
                    </span>
                    {notification.is_pinned && <Pin className="pin-icon" />}
                    {!notification.is_read && <span className="unread-dot" />}
                  </div>
                  <h3 className="notif-title">
                    {isVietnamese && notification.title_vi
                      ? notification.title_vi
                      : notification.title}
                  </h3>
                  <p className="notif-body">
                    {isVietnamese && notification.content_vi
                      ? notification.content_vi
                      : notification.content}
                  </p>
                  <div className="notif-meta">
                    <span className="notif-time">
                      {formatTimeAgo(notification.created_at, isVietnamese)}
                    </span>
                    {notification.action_url && (
                      <a
                        href={notification.action_url}
                        className="notif-action-link"
                      >
                        {notification.action_label ||
                          (isVietnamese ? "Xem chi tiết" : "View details")}
                        <ExternalLink />
                      </a>
                    )}
                  </div>
                </div>

                <div className="notif-actions">
                  <button
                    className="notif-action-btn"
                    onClick={() => togglePin(notification.id)}
                    title={
                      notification.is_pinned
                        ? isVietnamese
                          ? "Bỏ ghim"
                          : "Unpin"
                        : isVietnamese
                        ? "Ghim"
                        : "Pin"
                    }
                  >
                    {notification.is_pinned ? <PinOff /> : <Pin />}
                  </button>
                  <button
                    className="notif-action-btn"
                    onClick={() => markSingleAsRead(notification.id)}
                    title={isVietnamese ? "Đánh dấu đã đọc" : "Mark as read"}
                  >
                    <Check />
                  </button>
                  <button
                    className="notif-action-btn danger"
                    onClick={() => deleteNotification(notification.id)}
                    title={isVietnamese ? "Xóa" : "Delete"}
                  >
                    <Trash2 />
                  </button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </main>
  );
}

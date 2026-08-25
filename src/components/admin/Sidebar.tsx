import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Library,
  BookOpen,
  Activity,
  MessageCircle,
  Layers3,
  BarChart3,
  Bell,
  Settings2,
  PanelLeftClose,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

import { useAdminStore } from "@/store/admin-store";
import { useTranslation } from "react-i18next";

interface NavSubItem {
  id: string;
  label: string;
}

interface NavItem {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  kicker?: string;
  children?: NavSubItem[];
}

interface NavGroup {
  id: string;
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    id: "home",
    label: "HOME",
    items: [{ id: "dashboard", icon: LayoutDashboard, label: "Tổng quan" }],
  },
  {
    id: "learning",
    label: "LEARNING",
    items: [
      {
        id: "users",
        icon: Users,
        label: "Người dùng",
        children: [
          { id: "users-list", label: "Người dùng" },
          { id: "admins", label: "Quản trị viên" },
        ],
      },
      { id: "courses", icon: Library, label: "Khóa học" },
      { id: "vocabulary", icon: BookOpen, label: "Từ vựng" },
      {
        id: "practice",
        icon: Activity,
        label: "Luyện tập & TOEIC",
        children: [
          { id: "practice-exercises", label: "Bài luyện tập" },
          { id: "practice-listening", label: "Luyện nghe" },
          { id: "practice-speaking", label: "Luyện nói" },
          { id: "practice-writing", label: "Luyện viết" },
          { id: "toeic-tests", label: "Đề thi TOEIC" },
        ],
      },
    ],
  },
  {
    id: "community",
    label: "COMMUNITY",
    items: [
      { id: "community", icon: MessageCircle, label: "Cộng đồng" },
      { id: "public-decks", icon: Layers3, label: "Bộ thẻ công khai" },
    ],
  },
  {
    id: "insights",
    label: "INSIGHTS",
    items: [{ id: "progress", icon: BarChart3, label: "Thống kê dữ liệu" }],
  },
  {
    id: "system",
    label: "SYSTEM",
    items: [
      { id: "notifications", icon: Bell, label: "Thông báo", kicker: "8" },
      { id: "settings", icon: Settings2, label: "Cài đặt" },
    ],
  },
];

interface SidebarProps {
  mobile?: boolean;
}

export function Sidebar({ mobile = false }: SidebarProps) {
  const { t, i18n } = useTranslation();
  const isVietnamese = i18n.language === "vi";
  const activeNavItem = useAdminStore((state) => state.activeNavItem);
  const setActiveNavItem = useAdminStore((state) => state.setActiveNavItem);
  const sidebarCollapsed = useAdminStore((state) => state.sidebarCollapsed);
  const toggleSidebarCollapsed = useAdminStore(
    (state) => state.toggleSidebarCollapsed
  );
  const setMobileSidebarOpen = useAdminStore(
    (state) => state.setMobileSidebarOpen
  );

  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const handleNavigate = (id: string) => {
    setActiveNavItem(id);
    setMobileSidebarOpen(false);
  };

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toCamelCase = (str: string) =>
    str.replace(/-([a-z])/g, (_, c) => c.toUpperCase());

  const localizedGroups: NavGroup[] = navGroups.map((group) => ({
    ...group,
    label: t(`nav.${toCamelCase(group.id)}`),
    items: group.items.map((item) => ({
      ...item,
      label: t(`nav.${toCamelCase(item.id)}`),
      children: item.children?.map((child) => ({
        ...child,
        label: t(`nav.${toCamelCase(child.id)}`) || child.label,
      })),
    })),
  }));

  const sidebarClass = `sidebar${sidebarCollapsed ? " collapsed" : ""}`;

  const content = (
    <>
      
      <div className="brand-lockup">
        <img
          alt="LingoSphere logo"
          className="brand-logo"
          height="36"
          src="/assets/lingosphere-logo.png"
          width="36"
        />
        <div>
          <p className="brand-name">{t("common.appName")}</p>
          <p className="brand-meta">
            {t("common.adminConsole")} · Học tiếng Anh
          </p>
        </div>
      </div>

      <nav className="sidebar-nav">
        {localizedGroups.map((group, groupIdx) => (
          <div key={group.id} className="nav-group">
            {groupIdx > 0 && <div className="nav-divider" />}
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeNavItem === item.id;
              const hasChildren = item.children && item.children.length > 0;
              const isExpanded = expandedItems.includes(item.id);

              if (sidebarCollapsed) {
                return (
                  <button
                    key={item.id}
                    className={`nav-item${isActive ? " active" : ""}`}
                    onClick={
                      hasChildren
                        ? () => toggleExpand(item.id)
                        : () => handleNavigate(item.id)
                    }
                    type="button"
                    title={item.label}
                  >
                    <Icon className="icon" />
                  </button>
                );
              }

              return (
                <div key={item.id}>
                  <button
                    className={`nav-item${isActive ? " active" : ""}${
                      hasChildren ? " has-children" : ""
                    }`}
                    onClick={
                      hasChildren
                        ? () => toggleExpand(item.id)
                        : () => handleNavigate(item.id)
                    }
                    type="button"
                  >
                    <Icon className="icon" />
                    <span className="nav-item-label">{item.label}</span>
                    {item.kicker && (
                      <span className="nav-item-kicker">{item.kicker}</span>
                    )}
                    {hasChildren &&
                      (isExpanded ? (
                        <ChevronDown className="nav-chevron" />
                      ) : (
                        <ChevronRight className="nav-chevron" />
                      ))}
                  </button>
                  {hasChildren && isExpanded && (
                    <div className="nav-children">
                      {item.children!.map((child) => (
                        <button
                          key={child.id}
                          className={`nav-child-item${
                            activeNavItem === child.id ? " active" : ""
                          }`}
                          onClick={() => handleNavigate(child.id)}
                          type="button"
                        >
                          <ChevronRight className="nav-child-icon" />
                          <span>{child.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </nav>

      <button
        className="admin-profile"
        onClick={() => handleNavigate("admin-profile:admin-001")}
        type="button"
      >
        <span className="avatar">VA</span>
        <span className="profile-copy">
          <span className="profile-name">Vân Anh</span>
          <span className="profile-role">Quản trị viên</span>
        </span>
        <ChevronDown className="profile-chevron" />
      </button>

      {!mobile && (
        <button
          className="sidebar-collapse"
          onClick={toggleSidebarCollapsed}
          type="button"
          aria-label={sidebarCollapsed ? "Mở rộng menu" : "Thu gọn menu"}
        >
          <PanelLeftClose className="icon" />
          <span>{isVietnamese ? "Thu gọn menu" : "Collapse menu"}</span>
        </button>
      )}
    </>
  );

  if (mobile) {
    return (
      <div className="flex h-full w-full flex-col bg-surface px-4 py-5">
        {content}
      </div>
    );
  }

  return <aside className={sidebarClass}>{content}</aside>;
}

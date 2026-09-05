/**
 * @file sidebar.tsx
 * @description Component giao diện Sidebar phục vụ khu vực Quản trị Admin
 */

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  LayoutDashboard,
  Users,
  Library,
  BookOpen,
  Activity,
  MessageCircle,
  Layers3,
  BarChart3,
  BarChart2,
  Globe,
  Server,
  Bell,
  Settings2,
  PanelLeftClose,
  ChevronDown,
  ChevronRight,
  Shield,
  KeyRound,
  Sparkles,
} from "lucide-react";

import { useAdminStore } from "@/store/admin.store";
import { useAuthStore } from "@/store/auth.store";
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
    id: "users_management",
    label: "USERS",
    items: [
      {
        id: "users",
        icon: Users,
        label: "Người dùng",
        children: [
          { id: "users-list", label: "Học viên" },
          { id: "admins", label: "Quản trị viên" },
        ],
      },
    ],
  },
  {
    id: "access_control",
    label: "ACCESS CONTROL",
    items: [
      { id: "roles", icon: Shield, label: "Vai trò (Role)" },
      { id: "permissions", icon: KeyRound, label: "Quyền hạn (Permission)" },
    ],
  },
  {
    id: "learning",
    label: "LEARNING",
    items: [
      {
        id: "courses",
        icon: Library,
        label: "Khóa học",
        children: [
          { id: "courses-list", label: "Quản lý khóa học" },
          { id: "course-learners", label: "Quản lý học viên" },
          { id: "course-exams", label: "Quản lý bài thi" },
          { id: "roadmaps", label: "Quản lý lộ trình" },
        ],
      },
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
      { id: "ai-management", icon: Sparkles, label: "Quản Trị AI & Soạn Đề" },
      { id: "media-storage", icon: Layers3, label: "Kho Media" },
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
    items: [
      {
        id: "progress",
        icon: BarChart3,
        label: "Thống kê dữ liệu",
        children: [
          { id: "progress", label: "Phân tích LingoSphere" },
          { id: "analytics-posthog", label: "Frontend Web (PostHog)" },
          { id: "monitoring-betterstack", label: "Backend 13 Services (BetterStack)" },
        ],
      },
    ],
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
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);

  const [expandedItem, setExpandedItem] = useState<string | null>(() => {
    for (const group of navGroups) {
      for (const item of group.items) {
        if (item.children && (item.id === activeNavItem || item.children.some((c) => c.id === activeNavItem))) {
          return item.id;
        }
      }
    }
    return null;
  });

  const handleNavigate = (id: string) => {
    setActiveNavItem(id);
    setMobileSidebarOpen(false);
  };

  const toggleExpand = (id: string) => {
    setExpandedItem((prev) => (prev === id ? null : id));
  };

  useEffect(() => {
    for (const group of navGroups) {
      for (const item of group.items) {
        if (item.children && (item.id === activeNavItem || item.children.some((c) => c.id === activeNavItem))) {
          setExpandedItem(item.id);
          return;
        }
      }
    }
  }, [activeNavItem]);

  const currentRole = (user?.role || profile?.role || '').toUpperCase();
  const isAdmin = currentRole === 'ADMIN';
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const hasModulePermission = useAuthStore((state) => state.hasModulePermission);
  const permissions = useAuthStore((state) => state.permissions);

  const isNavAllowed = useCallback((id: string): boolean => {
    if (isAdmin) return true;

    switch (id) {
      case 'dashboard':
        return true;
      case 'users':
      case 'users-list':
        return hasModulePermission('USERS') || hasPermission('GET', '/users/admin/users');
      case 'admins':
        return false;
      case 'access_control':
      case 'roles':
        return hasPermission('GET', '/roles') || hasModulePermission('ROLES');
      case 'permissions':
        return hasPermission('GET', '/permissions') || hasModulePermission('PERMISSIONS');
      case 'courses':
      case 'courses-list':
      case 'course-learners':
      case 'course-exams':
      case 'roadmaps':
        return hasPermission('GET', '/courses') || hasModulePermission('COURSES');
      case 'vocabulary':
      case 'public-decks':
        return hasModulePermission('VOCABULARY');
      case 'practice':
      case 'practice-exercises':
      case 'practice-listening':
      case 'practice-speaking':
      case 'practice-writing':
        return hasModulePermission('PRACTICE');
      case 'toeic-tests':
        return hasPermission('GET', '/exams') || hasModulePermission('EXAMS');
      case 'ai-management':
        return hasModulePermission('AI');
      case 'media-storage':
        return hasModulePermission('MEDIA');
      case 'community':
        return hasModulePermission('COMMUNITY');
      case 'progress':
      case 'analytics-posthog':
      case 'monitoring-betterstack':
        return hasModulePermission('PROGRESS');
      case 'notifications':
        return hasModulePermission('NOTIFICATIONS');
      case 'settings':
        return false;
      default:
        return true;
    }
  }, [isAdmin, hasPermission, hasModulePermission]);

  const visibleNavGroups = useMemo(() => {
    return navGroups
      .map((group) => {
        if (!isAdmin && group.id === 'access_control' && !hasModulePermission('ROLES') && !hasModulePermission('PERMISSIONS')) {
          return null;
        }

        const filteredItems = group.items
          .map((item) => {
            if (item.children && item.children.length > 0) {
              const filteredChildren = item.children.filter((c) => isNavAllowed(c.id));
              if (filteredChildren.length === 0) return null;
              return { ...item, children: filteredChildren };
            }
            if (!isNavAllowed(item.id)) return null;
            return item;
          })
          .filter(Boolean) as NavItem[];

        if (filteredItems.length === 0) return null;
        return { ...group, items: filteredItems };
      })
      .filter(Boolean) as NavGroup[];
  }, [isAdmin, isNavAllowed, permissions]);

  const toCamelCase = (str: string) =>
    str.toLowerCase().replace(/[-_]([a-z0-9])/g, (_, c) => c.toUpperCase());

  const localizedGroups: NavGroup[] = visibleNavGroups.map((group) => {
    const groupKey = `nav.${toCamelCase(group.id)}`;
    const groupTranslated = t(groupKey);
    const groupLabel =
      groupTranslated && groupTranslated !== groupKey ? groupTranslated : group.label;

    return {
      ...group,
      label: groupLabel,
      items: group.items.map((item) => {
        const itemKey = `nav.${toCamelCase(item.id)}`;
        const itemTranslated = t(itemKey);
        const itemLabel =
          itemTranslated && itemTranslated !== itemKey ? itemTranslated : item.label;

        return {
          ...item,
          label: itemLabel,
          children: item.children?.map((child) => {
            const childKey = `nav.${toCamelCase(child.id)}`;
            const childTranslated = t(childKey);
            const childLabel =
              childTranslated && childTranslated !== childKey
                ? childTranslated
                : child.label;

            return {
              ...child,
              label: childLabel,
            };
          }),
        };
      }),
    };
  });

  const content = (
    <div className="flex flex-col h-full select-none justify-between overflow-hidden">
      <div className="flex flex-col flex-1 min-h-0">
        <button
          onClick={() => handleNavigate("dashboard")}
          type="button"
          title={isVietnamese ? "Về trang Tổng quan (Dashboard)" : "Go to Dashboard"}
          className={`w-full shrink-0 flex items-center gap-3 pb-3 border-b border-slate-200/80 dark:border-slate-800/80 text-left cursor-pointer group transition-all ${
            sidebarCollapsed && !mobile ? "justify-center" : ""
          }`}
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-400 via-teal-500 to-indigo-600 flex items-center justify-center shadow-md shadow-teal-500/25 shrink-0 ring-1 ring-black/5 dark:ring-white/20 group-hover:scale-105 group-hover:shadow-teal-500/40 transition-all duration-200">
            <Shield className="w-4.5 h-4.5 text-white group-hover:rotate-6 transition-transform duration-200" />
          </div>
          {(!sidebarCollapsed || mobile) && (
            <div className="min-w-0 flex-1">
              <p className="font-extrabold text-sm text-slate-900 dark:text-white truncate tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                LingoSphere
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                <p className="text-[10px] text-teal-600 dark:text-teal-400 font-bold uppercase tracking-wider">
                  Admin Console
                </p>
              </div>
            </div>
          )}
        </button>

        <nav className="my-2 flex-1 sidebar-scroll space-y-2 pr-0.5 overflow-y-auto">
          {localizedGroups.map((group, groupIdx) => (
            <div key={group.id} className="space-y-1">
              {groupIdx > 0 && (
                <div className="pt-1.5 my-1 border-t border-slate-200/70 dark:border-slate-800/70" />
              )}
              {(!sidebarCollapsed || mobile) && groupIdx > 0 && (
                <div className="pt-0.5 pb-1 px-3 text-[10.5px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {group.label}
                </div>
              )}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    activeNavItem === item.id ||
                    (item.children &&
                      item.children.some((c) => activeNavItem === c.id));
                  const isExactActive = activeNavItem === item.id;
                  const hasChildren = item.children && item.children.length > 0;
                  const isExpanded = expandedItem === item.id;

                  if (sidebarCollapsed && !mobile) {
                    return (
                      <button
                        key={item.id}
                        className={`w-full flex items-center justify-center p-2.5 rounded-xl transition-all cursor-pointer ${
                          isActive
                            ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                            : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
                        }`}
                        onClick={
                          hasChildren
                            ? () => toggleExpand(item.id)
                            : () => handleNavigate(item.id)
                        }
                        type="button"
                        title={item.label}
                      >
                        <Icon className="w-4.5 h-4.5" />
                      </button>
                    );
                  }

                  return (
                    <div key={item.id} className="space-y-0.5">
                      <button
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-[13px] font-semibold transition-all cursor-pointer ${
                          isExactActive && !hasChildren
                            ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25"
                            : isActive && hasChildren
                            ? "text-indigo-600 dark:text-indigo-300 bg-indigo-50/70 dark:bg-indigo-500/10 font-bold"
                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-slate-800/60"
                        }`}
                        onClick={
                          hasChildren
                            ? () => toggleExpand(item.id)
                            : () => handleNavigate(item.id)
                        }
                        type="button"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon
                            className={`w-4.5 h-4.5 shrink-0 ${
                              isExactActive && !hasChildren
                                ? "text-white"
                                : isActive && hasChildren
                                ? "text-indigo-600 dark:text-indigo-400"
                                : "text-slate-400 dark:text-slate-500"
                            }`}
                          />
                          <span className="truncate">{item.label}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {item.kicker && (
                            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/20">
                              {item.kicker}
                            </span>
                          )}
                          {hasChildren && (
                            <ChevronDown
                              className={`w-3.5 h-3.5 opacity-60 transition-transform duration-300 ease-out ${
                                isExpanded ? "rotate-0 text-indigo-600 dark:text-indigo-400 opacity-100" : "-rotate-90"
                              }`}
                            />
                          )}
                        </div>
                      </button>

                      {hasChildren && (
                        <div
                          className={`grid transition-all duration-300 ease-in-out ${
                            isExpanded
                              ? "grid-rows-[1fr] opacity-100 mt-1 mb-1"
                              : "grid-rows-[0fr] opacity-0 pointer-events-none"
                          }`}
                        >
                          <div className="overflow-hidden">
                            <div className="ml-4 pl-3 border-l-2 border-slate-200 dark:border-slate-800 space-y-0.5 py-0.5">
                              {item.children!.map((child) => {
                                const isChildActive = activeNavItem === child.id;

                                return (
                                  <button
                                    key={child.id}
                                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-all duration-200 text-left cursor-pointer ${
                                      isChildActive
                                        ? "bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 font-bold shadow-xs ring-1 ring-indigo-500/20"
                                        : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-800/40"
                                    }`}
                                    onClick={() => handleNavigate(child.id)}
                                    type="button"
                                  >
                                    <span
                                      className={`w-1.5 h-1.5 rounded-full shrink-0 transition-all duration-200 ${
                                        isChildActive
                                          ? "bg-indigo-600 dark:bg-indigo-400 ring-2 ring-indigo-400/30 scale-125"
                                          : "bg-slate-300 dark:bg-slate-600"
                                      }`}
                                    />
                                    <span className="truncate">{child.label}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      <div className="pt-2 shrink-0 border-t border-slate-200/80 dark:border-slate-800/80">
        {!mobile && (
          <button
            className={`w-full flex items-center justify-center gap-2 py-2 px-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all cursor-pointer ${
              sidebarCollapsed ? "px-0" : ""
            }`}
            onClick={toggleSidebarCollapsed}
            type="button"
          >
            <PanelLeftClose className="w-4 h-4 shrink-0" />
            {!sidebarCollapsed && (
              <span>{isVietnamese ? "Thu gọn menu" : "Collapse"}</span>
            )}
          </button>
        )}
      </div>
    </div>
  );

  if (mobile) {
    return (
      <div className="flex h-full w-full flex-col bg-white dark:bg-slate-900 px-4 py-5 border-r border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-slate-100 transition-colors">
        {content}
      </div>
    );
  }

  return (
    <aside
      className={`hidden md:flex fixed inset-y-0 left-0 z-30 flex-col bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 p-4 transition-all duration-300 shadow-sm dark:shadow-none ${
        sidebarCollapsed ? "w-[72px] p-2.5" : "w-64 p-4"
      }`}
    >
      {content}
    </aside>
  );
}

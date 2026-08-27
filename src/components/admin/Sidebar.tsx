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
  Shield,
  Sparkles,
} from "lucide-react";

import { useAdminStore } from "@/store/admin-store";
import { useAuthStore } from "@/store/auth-store";
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
          { id: "users-list", label: "Học viên" },
          { id: "admins", label: "Quản trị viên" },
          { id: "roles", label: "Phân quyền (RBAC)" },
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
      { id: "ai-management", icon: Sparkles, label: "Quản Trị AI & Soạn Đề" },
      { id: "media-storage", icon: Layers3, label: "Kho Media Cloudflare R2" },
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
      { id: "roles", icon: Shield, label: "Phân quyền (RBAC)" },
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

  const [expandedItems, setExpandedItems] = useState<string[]>([
    "users",
    "practice",
  ]);

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

  const content = (
    <div className="flex flex-col h-full justify-between select-none">
      <div>
        {/* Brand Lockup */}
        <div
          className={`flex items-center gap-3 pb-4 border-b border-slate-200/80 dark:border-slate-800/80 ${
            sidebarCollapsed && !mobile ? "justify-center" : ""
          }`}
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-400 via-teal-500 to-indigo-600 flex items-center justify-center shadow-md shadow-teal-500/25 shrink-0 ring-1 ring-black/5 dark:ring-white/20">
            <Shield className="w-5 h-5 text-white" />
          </div>
          {(!sidebarCollapsed || mobile) && (
            <div className="min-w-0 flex-1">
              <p className="font-extrabold text-sm text-slate-900 dark:text-white truncate tracking-tight">
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
        </div>

        {/* Navigation Groups */}
        <nav className="mt-3 space-y-3 overflow-y-auto max-h-[calc(100vh-230px)] pr-1">
          {localizedGroups.map((group, groupIdx) => (
            <div key={group.id} className="space-y-0.5">
              {(!sidebarCollapsed || mobile) && groupIdx > 0 && (
                <div className="pt-2.5 pb-1 px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {group.label}
                </div>
              )}
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  activeNavItem === item.id ||
                  (item.children &&
                    item.children.some((c) => activeNavItem === c.id));
                const isExactActive = activeNavItem === item.id;
                const hasChildren = item.children && item.children.length > 0;
                const isExpanded = expandedItems.includes(item.id);

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
                      <Icon className="w-5 h-5" />
                    </button>
                  );
                }

                return (
                  <div key={item.id} className="space-y-0.5">
                    <button
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
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
                          className={`w-4 h-4 shrink-0 ${
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
                        {hasChildren &&
                          (isExpanded ? (
                            <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                          ))}
                      </div>
                    </button>

                    {/* Tree View Submenu */}
                    {hasChildren && isExpanded && (
                      <div className="ml-4 pl-3.5 border-l-2 border-slate-200 dark:border-slate-800 space-y-0.5 mt-1 mb-1">
                        {item.children!.map((child) => {
                          const isChildActive = activeNavItem === child.id;

                          return (
                            <button
                              key={child.id}
                              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-all text-left cursor-pointer ${
                                isChildActive
                                  ? "bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 font-bold shadow-xs ring-1 ring-indigo-500/20"
                                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-800/40"
                              }`}
                              onClick={() => handleNavigate(child.id)}
                              type="button"
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full shrink-0 transition-all ${
                                  isChildActive
                                    ? "bg-indigo-600 dark:bg-indigo-400 ring-2 ring-indigo-400/30"
                                    : "bg-slate-300 dark:bg-slate-600"
                                }`}
                              />
                              <span className="truncate">{child.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* User Profile Card & Collapse Toggle */}
      <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800/80 space-y-2">
        <button
          className={`w-full flex items-center gap-2.5 p-2 rounded-2xl bg-slate-50 hover:bg-slate-100/90 dark:bg-slate-800/40 dark:hover:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 transition-all text-left cursor-pointer group ${
            sidebarCollapsed && !mobile ? "justify-center p-1.5" : ""
          }`}
          onClick={() =>
            handleNavigate(`admin-profile:${user?.user_id || "me"}`)
          }
          type="button"
          title="Xem hồ sơ cá nhân"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
            {profile?.full_name
              ? profile.full_name
                  .split(" ")
                  .map((n) => n[0])
                  .slice(-2)
                  .join("")
                  .toUpperCase()
              : user?.email
              ? user.email.substring(0, 2).toUpperCase()
              : "AD"}
          </div>
          {(!sidebarCollapsed || mobile) && (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {profile?.full_name ||
                  user?.email?.split("@")[0] ||
                  "Quản trị viên"}
              </p>
              <p className="text-[10px] font-semibold text-teal-600 dark:text-teal-400 truncate">
                {user?.role === "ADMIN"
                  ? "Quản trị viên"
                  : user?.role || "Admin"}
              </p>
            </div>
          )}
        </button>

        {!mobile && (
          <button
            className={`w-full flex items-center justify-center gap-2 p-2 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all cursor-pointer ${
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

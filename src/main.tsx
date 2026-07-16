/**
 * Main Entry Point - Admin Panel Only
 *
 * This is a pure admin panel for managing users, books, and orders.
 * No client-facing pages.
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
    createBrowserRouter,
    RouterProvider,
    Navigate,
} from "react-router-dom";
import { App, ConfigProvider, theme } from "antd";
import viVN from "antd/locale/vi_VN";
import enGB from "antd/locale/en_GB";
import { GoogleOAuthProvider } from "@react-oauth/google";

import { AppProvider } from "@/components/context/app.context";
import { I18nProvider, useI18n } from "@/context/i18n.context";
import LayoutAdmin from "@/components/layout/layout.admin";
import ProtectedRoute from "@/components/auth";

// Dark mode styles
import "@/styles/dark-mode.css";
// Light mode styles (enhanced hover effects)
import "@/styles/light-mode.css";

// Pages
import DashBoardPage from "@/pages/admin/dashboard";
import ManageBookPage from "@/pages/admin/manage.course";
import ManageOrderPage from "@/pages/admin/manage.order";
import ManageUserPage from "@/pages/admin/manage.user";
import ManageRolePage from "@/pages/admin/manage.role";
import ManagePermissionPage from "@/pages/admin/manage.permission";
import ProfilePage from "@/pages/admin/profile";
import SettingsPage from "@/pages/admin/settings";
import LoginPage from "@/pages/auth/login";
import RegisterPage from "@/pages/auth/register";
import ActivationPage from "@/pages/auth/activation";
import ForgotPasswordPage from "@/pages/auth/forgot-password";
import ResetPasswordPage from "@/pages/auth/reset-password";
import AppInitializer from "./AppInitializer";

// Ant Design theme config
const AntDesignThemeProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const { isDarkMode } = useI18n();

    return (
        <ConfigProvider
            locale={viVN}
            theme={{
                algorithm: isDarkMode
                    ? theme.darkAlgorithm
                    : theme.defaultAlgorithm,
                token: {
                    colorPrimary: "#1890ff",
                    borderRadius: 6,
                    // Light mode tokens
                    colorBgContainer: isDarkMode ? "#1f1f1f" : "#ffffff",
                    colorBgElevated: isDarkMode ? "#2a2a2a" : "#ffffff",
                    colorBgLayout: isDarkMode ? "#141414" : "#f5f5f5",
                    colorText: isDarkMode ? "#e8e8e8" : "rgba(0,0,0,0.88)",
                    colorTextSecondary: isDarkMode
                        ? "#a6a6a6"
                        : "rgba(0,0,0,0.65)",
                    colorBorder: isDarkMode ? "#434343" : "#d9d9d9",
                    colorBorderSecondary: isDarkMode ? "#303030" : "#f0f0f0",
                },
                components: {
                    Layout: {
                        siderBg: isDarkMode ? "#141414" : "#ffffff",
                        headerBg: isDarkMode ? "#1f1f1f" : "#ffffff",
                        bodyBg: isDarkMode ? "#141414" : "#f5f5f5",
                        triggerBg: isDarkMode ? "#2a2a2a" : "#fff",
                    },
                    Menu: {
                        darkItemBg: "#1f1f1f",
                        darkSubMenuItemBg: "#141414",
                        darkItemSelectedBg: "#2a2a2a",
                        darkItemHoverBg: "#2a2a2a",
                        itemBg: isDarkMode ? "#1f1f1f" : "#ffffff",
                        itemSelectedBg: isDarkMode ? "#2a2a2a" : "#e6f4ff",
                    },
                    Card: {
                        colorBgContainer: isDarkMode ? "#1f1f1f" : "#ffffff",
                    },
                    Table: {
                        colorBgContainer: isDarkMode ? "#1f1f1f" : "#ffffff",
                        headerBg: isDarkMode ? "#2a2a2a" : "#fafafa",
                        rowHoverBg: isDarkMode ? "#2a2a2a" : "#fafafa",
                    },
                    Modal: {
                        contentBg: isDarkMode ? "#1f1f1f" : "#ffffff",
                        headerBg: isDarkMode ? "#1f1f1f" : "#ffffff",
                    },
                    Select: {
                        optionSelectedBg: isDarkMode ? "#2a2a2a" : "#e6f4ff",
                    },
                    Dropdown: {
                        colorBgElevated: isDarkMode ? "#1f1f1f" : "#ffffff",
                    },
                    Popover: {
                        colorBgElevated: isDarkMode ? "#1f1f1f" : "#ffffff",
                    },
                    Tooltip: {
                        colorBgSpotlight: isDarkMode ? "#2a2a2a" : "#ffffff",
                    },
                    Input: {
                        colorBgContainer: isDarkMode ? "#262626" : "#ffffff",
                    },
                    DatePicker: {
                        colorBgContainer: isDarkMode ? "#262626" : "#ffffff",
                    },
                    Tabs: {
                        itemColor: isDarkMode ? "#a6a6a6" : "rgba(0,0,0,0.85)",
                        itemHoverColor: isDarkMode ? "#e8e8e8" : "#1890ff",
                        itemSelectedColor: "#1890ff",
                        inkBarColor: "#1890ff",
                    },
                },
            }}
        >
            {children}
        </ConfigProvider>
    );
};

const router = createBrowserRouter([
    {
        element: <AppInitializer />,
        children: [
            // Auth pages (no layout)
            {
                path: "/login",
                element: <LoginPage />,
            },
            {
                path: "/register",
                element: <RegisterPage />,
            },
            {
                path: "/activate",
                element: <ActivationPage />,
            },
            {
                path: "/forgot-password",
                element: <ForgotPasswordPage />,
            },
            {
                path: "/reset-password",
                element: <ResetPasswordPage />,
            },

            // Admin pages (with admin layout)
            {
                path: "/",
                element: <LayoutAdmin />,
                children: [
                    {
                        index: true,
                        element: (
                            <ProtectedRoute
                                requiredRoles={["ADMIN", "SUPER_ADMIN"]}
                            >
                                <DashBoardPage />
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: "user",
                        element: (
                            <ProtectedRoute
                                requiredRoles={["ADMIN", "SUPER_ADMIN"]}
                            >
                                <ManageUserPage />
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: "book",
                        element: (
                            <ProtectedRoute
                                requiredRoles={["ADMIN", "SUPER_ADMIN"]}
                            >
                                <ManageBookPage />
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: "order",
                        element: (
                            <ProtectedRoute
                                requiredRoles={["ADMIN", "SUPER_ADMIN"]}
                            >
                                <ManageOrderPage />
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: "role",
                        element: (
                            <ProtectedRoute
                                requiredRoles={["ADMIN", "SUPER_ADMIN"]}
                            >
                                <ManageRolePage />
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: "permission",
                        element: (
                            <ProtectedRoute
                                requiredRoles={["ADMIN", "SUPER_ADMIN"]}
                            >
                                <ManagePermissionPage />
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: "profile",
                        element: (
                            <ProtectedRoute>
                                <ProfilePage />
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: "settings",
                        element: (
                            <ProtectedRoute requiredRoles={["SUPER_ADMIN"]}>
                                <SettingsPage />
                            </ProtectedRoute>
                        ),
                    },
                ],
            },

            // Catch /admin and redirect to /
            {
                path: "/admin/*",
                element: <Navigate to="/" replace />,
            },
            // Redirect root to dashboard
            {
                path: "*",
                element: <Navigate to="/" replace />,
            },
        ],
    },
]);

// Root render
createRoot(document.getElementById("root")!).render(
    // <StrictMode>
        <App>
            <GoogleOAuthProvider
                clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}
            >
                <I18nProvider>
                    <AntDesignThemeProvider>
                        <AppProvider>
                            <RouterProvider router={router} />
                        </AppProvider>
                    </AntDesignThemeProvider>
                </I18nProvider>
            </GoogleOAuthProvider>
        </App>
    // </StrictMode>,
);

/**
 * Main Entry Point - Admin Panel Only
 *
 * This is a pure admin panel for managing users, books, and orders.
 * English only, Light theme only.
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
    createBrowserRouter,
    RouterProvider,
    Navigate,
} from "react-router-dom";
import { App } from "antd";

import { AppProvider } from "@/components/context/app.context";
import LayoutAdmin from "@/components/layout/layout.admin";
import ProtectedRoute from "@/components/auth";

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
                            <ProtectedRoute requiredRole="ADMIN">
                                <DashBoardPage />
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: "user",
                        element: (
                            <ProtectedRoute requiredRole="ADMIN">
                                <ManageUserPage />
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: "book",
                        element: (
                            <ProtectedRoute requiredRole="ADMIN">
                                <ManageBookPage />
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: "order",
                        element: (
                            <ProtectedRoute requiredRole="ADMIN">
                                <ManageOrderPage />
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: "role",
                        element: (
                            <ProtectedRoute requiredRole="ADMIN">
                                <ManageRolePage />
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: "permission",
                        element: (
                            <ProtectedRoute requiredRole="ADMIN">
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
                            <ProtectedRoute requiredRole="SUPER_ADMIN">
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
    <StrictMode>
        <App>
            <AppProvider>
                <RouterProvider router={router} />
            </AppProvider>
        </App>
    </StrictMode>,
);

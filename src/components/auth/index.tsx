/**
 * Protected Route Component
 *
 * Checks authentication and role-based access control (RBAC)
 * Updated to support single role from backend
 *
 * Props:
 * - requiredRole: Single role required to access (e.g., 'ADMIN', 'SUPER_ADMIN')
 *                 If empty or '*', any authenticated user can access
 *                 If user doesn't have the required role, shows 403 Forbidden
 * - requiredPermissions: Array of permissions required to access (optional)
 */

import { Button, Result } from "antd";
import { useCurrentApp } from "components/context/app.context";
import { Link, useLocation } from "react-router-dom";

interface IProtectedRoute {
    children: React.ReactNode;
    requiredRole?: string;
    requiredPermissions?: string[];
}

const ProtectedRoute = ({
    children,
    requiredRole = '',
    requiredPermissions = []
}: IProtectedRoute) => {
    const { isAuthenticated, user, hasRole, hasAnyPermission } = useCurrentApp();
    const location = useLocation();

    // Check authentication
    if (!isAuthenticated) {
        return (
            <Result
                status="404"
                title="Chưa Đăng Nhập"
                subTitle="Bạn cần đăng nhập để truy cập trang này."
                extra={
                    <Button type="primary">
                        <Link to="/login">Đăng Nhập</Link>
                    </Button>
                }
            />
        );
    }

    // Check if admin route
    const isAdminRoute = location.pathname.startsWith('/admin');

    if (isAdminRoute) {
        // Admin routes require role check

        // If no specific role required, allow any authenticated user
        if (!requiredRole || requiredRole === '*') {
            return <>{children}</>;
        }

        // Check if user has the required role
        const hasRoleAccess = hasRole(requiredRole);

        if (!hasRoleAccess) {
            return (
                <Result
                    status="403"
                    title="403 - Không Có Quyền Truy Cập"
                    subTitle={
                        <div>
                            <p>Bạn không có quyền truy cập trang này.</p>
                            <p style={{ fontSize: '12px', color: '#999' }}>
                                Yêu cầu: {requiredRole}
                                <br />
                                Hiện tại: {user?.role || 'Không có'}
                            </p>
                        </div>
                    }
                    extra={
                        <Button type="primary">
                            <Link to="/">Về Trang Chủ</Link>
                        </Button>
                    }
                />
            );
        }
    }

    // Check permissions if specified
    if (requiredPermissions.length > 0) {
        const hasPermissionAccess = hasAnyPermission(requiredPermissions);

        if (!hasPermissionAccess) {
            return (
                <Result
                    status="403"
                    title="403 - Thiếu Quyền Hạn"
                    subTitle={
                        <div>
                            <p>Bạn không có quyền thực hiện thao tác này.</p>
                            <p style={{ fontSize: '12px', color: '#999' }}>
                                Yêu cầu: {requiredPermissions.join(' hoặc ')}
                                <br />
                                Hiện tại: {user?.permissions?.slice(0, 5).join(', ')}
                                {(user?.permissions?.length || 0) > 5 && '...'}
                            </p>
                        </div>
                    }
                    extra={
                        <Button type="primary">
                            <Link to="/">Về Trang Chủ</Link>
                        </Button>
                    }
                />
            );
        }
    }

    // Render children if all checks pass
    return <>{children}</>;
};

export default ProtectedRoute;

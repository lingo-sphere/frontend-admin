import { useCallback, useMemo } from 'react';
import { useCurrentApp } from '@/components/context/app.context';

export interface UsePermissionReturn {
    hasPermission: (requiredPermissions: string[]) => boolean;
    hasAnyPermission: (requiredPermissions: string[]) => boolean;
    hasRole: (requiredRole: string) => boolean;
    isSuperAdmin: () => boolean;
    isAdmin: () => boolean;
    can: (module: string, ...actions: string[]) => boolean;
    permissions: string[];
    role: string;
    isAuthenticated: boolean;
}

export const usePermission = (): UsePermissionReturn => {
    const { user, isAuthenticated, hasPermission, hasAnyPermission, hasRole, isAdmin } = useCurrentApp();
    const isSuperAdmin = useCallback((): boolean => {
        const result = user?.role === 'SUPER_ADMIN';
        return result;
    }, [user?.role]);
    const can = useCallback((module: string, ...actions: string[]): boolean => {
        if (user?.role === 'SUPER_ADMIN') return true;
        if (!user?.permissions?.length) return false;
        const permissionCodes = actions.map(action =>
            `${module.toLowerCase()}.${action.toLowerCase()}`
        );

        return hasAnyPermission(permissionCodes);
    }, [user, hasAnyPermission]);

    const permissions = useMemo(() => user?.permissions || [], [user?.permissions]);
    const role = useMemo(() => user?.role || '', [user?.role]);
    return {
        hasPermission,
        hasAnyPermission,
        hasRole,
        isSuperAdmin,
        isAdmin,
        can,
        permissions,
        role,
        isAuthenticated
    };
};

export interface PermissionGateProps {
    permissions?: string[];
    role?: string;
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export const PermissionGate: React.FC<PermissionGateProps> = ({
    permissions,
    role,
    children,
    fallback = null,
}) => {
    const { hasAnyPermission, hasRole, isAuthenticated } = usePermission();
    if (!isAuthenticated) {
        return <>{fallback}</>;
    }

    if (permissions?.length) {
        if (!hasAnyPermission(permissions)) return <>{fallback}</>;
    }

    if (role) {
        if (!hasRole(role)) return <>{fallback}</>;
    }

    return <>{children}</>;
};

export interface UseUserPermissionsReturn {
    canViewUsers: boolean;
    canCreateUser: boolean;
    canUpdateUser: boolean;
    canDeleteUser: boolean;
    canManageUserRoles: boolean;
}

export const useUserPermissions = (): UseUserPermissionsReturn => {
    const { can } = usePermission();

    return useMemo(() => ({
        canViewUsers: can('users', 'read'),
        canCreateUser: can('users', 'create'),
        canUpdateUser: can('users', 'update'),
        canDeleteUser: can('users', 'delete'),
        canManageUserRoles: can('users', 'assign-roles')
    }), [can]);
};

export interface UseRolePermissionsReturn {
    canViewRoles: boolean;
    canCreateRole: boolean;
    canUpdateRole: boolean;
    canDeleteRole: boolean;
    canManageRolePermissions: boolean;
}

export const useRolePermissions = (): UseRolePermissionsReturn => {
    const { can } = usePermission();

    return useMemo(() => ({
        canViewRoles: can('roles', 'read'),
        canCreateRole: can('roles', 'create'),
        canUpdateRole: can('roles', 'update'),
        canDeleteRole: can('roles', 'delete'),
        canManageRolePermissions: can('roles', 'manage-permissions')
    }), [can]);
};

export interface UsePermissionPermissionsReturn {
    canViewPermissions: boolean;
    canCreatePermission: boolean;
    canUpdatePermission: boolean;
    canDeletePermission: boolean;
}

export const usePermissionPermissions = (): UsePermissionPermissionsReturn => {
    const { can } = usePermission();

    return useMemo(() => ({
        canViewPermissions: can('permissions', 'read'),
        canCreatePermission: can('permissions', 'create'),
        canUpdatePermission: can('permissions', 'update'),
        canDeletePermission: can('permissions', 'delete')
    }), [can]);
};

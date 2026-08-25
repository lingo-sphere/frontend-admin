import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { loginAPI, logoutAPI, refreshTokenAPI } from "@/services";
import PacmanLoader from "react-spinners/PacmanLoader";

interface IUser {
    _id: string;
    email: string;
    name: string;
    role: string;
    permissions: string[];
    image?: string;
}

interface IAppContext {
    isAuthenticated: boolean;
    setIsAuthenticated: (v: boolean) => void;
    user: IUser | null;
    setUser: (v: IUser | null) => void;
    isAppLoading: boolean;
    setIsAppLoading: (v: boolean) => void;
    handleLogin: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
    handleLogout: () => Promise<void>;
    handleRefreshToken: () => Promise<boolean>;
    hasRole: (requiredRole: string) => boolean;
    hasPermission: (requiredPermissions: string[]) => boolean;
    hasAnyPermission: (requiredPermissions: string[]) => boolean;
    isAdmin: () => boolean;
    isSuperAdmin: () => boolean;
}

interface IAppProvider {
    children: React.ReactNode;
}

const CurrentAppContext = createContext<IAppContext | null>(null);

const STORAGE_KEYS = {
    ACCESS_TOKEN: 'access_token',
    USER: 'user',
} as const;

export const AppProvider = ({ children }: IAppProvider) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [user, setUser] = useState<IUser | null>(null);
    const [isAppLoading, setIsAppLoading] = useState<boolean>(true);

    const hasRole = useCallback((requiredRole: string): boolean => {
        if (!user?.role) return false;
        if (requiredRole === '*') return true;
        if (user.role === 'SUPER_ADMIN') return true;
        return user.role === requiredRole;
    }, [user]);

    const hasPermission = useCallback((requiredPermissions: string[]): boolean => {
        if (!user?.permissions?.length) return false;
        if (requiredPermissions.includes('*')) return true;
        if (user.role === 'SUPER_ADMIN') return true;
        return requiredPermissions.every(perm => user.permissions.includes(perm));
    }, [user]);

    const hasAnyPermission = useCallback((requiredPermissions: string[]): boolean => {
        if (!user?.permissions?.length) return false;
        if (requiredPermissions.includes('*')) return true;
        if (user.role === 'SUPER_ADMIN') return true;
        return requiredPermissions.some(perm => user.permissions.includes(perm));
    }, [user]);

    const isAdmin = useCallback((): boolean => {
        if (!user?.role) return false;
        return user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
    }, [user]);

    const isSuperAdmin = useCallback((): boolean => {
        if (!user?.role) return false;
        return user.role === 'SUPER_ADMIN';
    }, [user]);

    const handleLogin = useCallback(async (
        username: string,
        password: string
    ): Promise<{ success: boolean; message?: string }> => {
        try {
            const res: any = await loginAPI(username, password);
            const data = res?.data;
            const backendUser = data?.user;
            const accessToken = data?.accessToken;

            if (backendUser && accessToken) {
                setUser(backendUser);
                setIsAuthenticated(true);
                localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
                localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(backendUser));
                return { success: true };
            }
            return {
                success: false,
                message: res?.message || "Đăng nhập thất bại - response không đúng định dạng"
            };
        } catch (error: any) {
            return {
                success: false,
                message: error?.response?.data?.message || error?.message || "Có lỗi xảy ra khi đăng nhập"
            };
        }
    }, []);

    const handleLogout = useCallback(async (): Promise<void> => {
        try {
            await logoutAPI();
        } catch (error) {
        } finally {
            setUser(null);
            setIsAuthenticated(false);
            localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
            localStorage.removeItem(STORAGE_KEYS.USER);
        }
    }, []);

    const handleRefreshToken = useCallback(async (): Promise<boolean> => {
        try {
            const res: any = await refreshTokenAPI();
            const newToken = res?.accessToken || res?.data?.accessToken;
            const newUser = res?.user || res?.data?.user;

            if (newToken) {
                localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, newToken);
                if (newUser) {
                    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
                    setUser(newUser);
                }
                return true;
            }
            return false;
        } catch (error) {
            setUser(null);
            setIsAuthenticated(false);
            localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
            localStorage.removeItem(STORAGE_KEYS.USER);
            return false;
        }
    }, []);

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
                const storedUser = localStorage.getItem(STORAGE_KEYS.USER);

                if (token && storedUser) {
                    const parsedUser = JSON.parse(storedUser);
                    if (typeof parsedUser.role !== 'string' || !Array.isArray(parsedUser.permissions)) {
                        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
                        localStorage.removeItem(STORAGE_KEYS.USER);
                    } else {
                        setUser(parsedUser);
                        setIsAuthenticated(true);
                    }
                }
            } catch (error) {
                localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
                localStorage.removeItem(STORAGE_KEYS.USER);
            } finally {
                setIsAppLoading(false);
            }
        };

        initializeAuth();
    }, []); 

    if (isAppLoading) {
        return (
            <div style={{
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)"
            }}>
                <PacmanLoader size={30} color="#36d6b4" />
            </div>
        );
    }

    return (
        <CurrentAppContext.Provider value={{
            isAuthenticated,
            setIsAuthenticated,
            user,
            setUser,
            isAppLoading,
            setIsAppLoading,
            handleLogin,
            handleLogout,
            handleRefreshToken,
            hasRole,
            hasPermission,
            hasAnyPermission,
            isAdmin,
            isSuperAdmin
        }}>
            {children}
        </CurrentAppContext.Provider>
    );
};

export const useCurrentApp = (): IAppContext => {
    const context = useContext(CurrentAppContext);

    if (!context) {
        throw new Error(
            "useCurrentApp must be used within <AppProvider>"
        );
    }

    return context;
};

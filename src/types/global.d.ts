export { };

declare global {
    interface IBackendRes<T> {
        error?: string | string[];
        message: string;
        statusCode: number | string;
        data?: T;
    }

    interface IModelPaginate<T> {
        meta: {
            current: number;
            pageSize: number;
            pages: number;
            total: number;
        },
        results: T[]
    }

    interface ILogin {
        accessToken: string;
        user: IAuthUser;
    }

    interface IAuthUser {
        _id: string;
        email: string;
        name: string;
        roles: string[];
        permissions: string[];
        image?: string;
    }

    interface IRefreshTokenResponse {
        statusCode: number;
        message: string;
        user: IAuthUser;
        data: {
            accessToken: string;
            user: IAuthUser;
        };
    }

    interface ILogoutResponse {
        statusCode: number;
        message: string;
    }

    interface IRegisterResponse {
        statusCode: number;
        message: string;
        _id: string;
    }

    interface ICheckCodeResponse {
        statusCode: number;
        message: string;
        isBeforeCheck: boolean;
    }

    interface IRetryActiveResponse {
        statusCode: number;
        message: string;
        _id: string;
    }

    interface IRetryPasswordResponse {
        statusCode: number;
        message: string;
        _id: string;
    }

    interface IChangePasswordResponse {
        statusCode: number;
        message: string;
        isBeforeCheck: boolean;
    }

    interface IUser {
        _id: string;
        email: string;
        name: string;
        phone?: string;
        address?: string;
        image?: string;
        roles: string[];
        accountType: string;
        isActive: boolean;
        deletedAt?: Date | null;
        createdAt?: Date;
        updatedAt?: Date;
    }

    interface IUserTable {
        _id: string;
        name: string;
        email: string;
        phone?: string;
        address?: string;
        image?: string;
        role: IRoleTable;
        accountType: string;
        isActive: boolean;
        deletedAt?: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }

    interface ICreateUser {
        name: string;
        email: string;
        password: string;
        phone?: string;
        address?: string;
        image?: string;
    }

    interface IUpdateUser {
        _id: string;
        name?: string;
        phone?: string;
        address?: string;
        image?: string;
    }

    interface IPermissionTable {
        _id: string;
        code: string;
        module: string;
        action: string;
        description: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }

    interface IRoleTable {
        _id: string;
        name: string;
        description?: string;
        permissions: IPermissionTable[];
        priority: number;
        isActive: boolean;
        isSystem: boolean;
        createdAt: Date;
        updatedAt: Date;
    }

    interface ICreateRole {
        name: string;
        description?: string;
        permissions?: string[];
        priority?: number;
    }

    interface IUpdateRole {
        _id: string;
        name?: string;
        description?: string;
        permissions?: string[];
        priority?: number;
        isActive?: boolean;
    }

    interface IAssignRoles {
        roleIds: string[];
    }

    interface ILoginForm {
        username: string;
        password: string;
    }

    interface IRegisterForm {
        email: string;
        password: string;
        name?: string;
    }

    interface IChangePasswordForm {
        email: string;
        code: string;
        password: string;
        confirmPassword: string;
    }

    interface ICheckCodeForm {
        _id: string;
        code: string;
    }

    interface IRetryActiveForm {
        email: string;
    }

    interface IRetryPasswordForm {
        email: string;
    }

    interface IDashboardStats {
        totalUsers: number;
        activeUsers: number;
        inactiveUsers: number;
        totalRoles: number;
        totalPermissions: number;
    }

}
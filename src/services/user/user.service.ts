import createInstanceAxios from '../axios.customize';

const axios = createInstanceAxios(import.meta.env.VITE_BACKEND_URL);

// User CRUD
export const getUsersAPI = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<IUserTable>>>(
        `/api/v1/users?${query}`
    );
};

export const getUserByIdAPI = (id: string) => {
    return axios.get<IBackendRes<IUserTable>>(`/api/v1/users/${id}`);
};

export const createUserAPI = (
    name: string,
    email: string,
    password: string,
    phone?: string,
    address?: string,
    image?: string
) => {
    return axios.post<IBackendRes<IRegisterResponse>>(
        '/api/v1/users',
        { name, email, password, phone, address, image }
    );
};

export const updateUserAPI = (
    _id: string,
    name?: string,
    phone?: string,
    address?: string,
    image?: string
) => {
    return axios.patch<
        IBackendRes<{ matchedCount: number; modifiedCount: number }>
    >('/api/v1/users', {
        _id,
        name,
        phone,
        address,
        image,
    });
};

export const deleteUserAPI = (_id: string) => {
    return axios.delete<IBackendRes<{ deletedCount: number }>>(
        `/api/v1/users/${_id}`
    );
};

export const updateUserInfoAPI = (
    _id: string,
    image: string,
    name: string,
    phone: string
) => {
    return updateUserAPI(_id, name, phone, undefined, image);
};

// Role
export const getRolesAPI = (query?: string) => {
    return axios.get<IBackendRes<IModelPaginate<IRoleTable>>>(
        `/api/v1/roles${query ? `?${query}` : ''}`
    );
};

export const getRoleByIdAPI = (id: string) => {
    return axios.get<IBackendRes<IRoleTable>>(`/api/v1/roles/${id}`);
};

export const createRoleAPI = (role: ICreateRole) => {
    return axios.post<IBackendRes<IRoleTable>>('/api/v1/roles', role);
};

export const updateRoleAPI = (id: string, role: IUpdateRole) => {
    return axios.patch<
        IBackendRes<{ matchedCount: number; modifiedCount: number }>
    >(`/api/v1/roles/${id}`, role);
};

export const deleteRoleAPI = (id: string) => {
    return axios.delete<IBackendRes<{ deletedCount: number }>>(
        `/api/v1/roles/${id}`
    );
};

// Permission
export const getPermissionsAPI = (query?: string) => {
    return axios.get<IBackendRes<IModelPaginate<IPermissionTable>>>(
        `/api/v1/permissions${query ? `?${query}` : ''}`
    );
};

export const getPermissionByIdAPI = (id: string) => {
    return axios.get<IBackendRes<IPermissionTable>>(
        `/api/v1/permissions/${id}`
    );
};

export const createPermissionAPI = (permission: {
    code: string;
    module: string;
    action: string;
    description?: string;
}) => {
    return axios.post<IBackendRes<IPermissionTable>>(
        '/api/v1/permissions',
        permission
    );
};

export const updatePermissionAPI = (
    id: string,
    permission: {
        code?: string;
        module?: string;
        action?: string;
        description?: string;
        isActive?: boolean;
    }
) => {
    return axios.patch<
        IBackendRes<{ matchedCount: number; modifiedCount: number }>
    >(`/api/v1/permissions/${id}`, permission);
};

export const deletePermissionAPI = (id: string) => {
    return axios.delete<IBackendRes<{ deletedCount: number }>>(
        `/api/v1/permissions/${id}`
    );
};

// User - Role (Single role per user)
export const assignRoleToUserAPI = (
    userId: string,
    roleId: string
) => {
    return axios.post(
        `/api/v1/users/${userId}/role`,
        { roleId }
    );
};

// Role - Permission
export const addPermissionsToRoleAPI = (
    roleId: string,
    permissionIds: string[]
) => {
    return axios.post(
        `/api/v1/roles/${roleId}/permissions`,
        { permissionIds }
    );
};

export const removePermissionsFromRoleAPI = (
    roleId: string,
    permissionIds: string[]
) => {
    return axios.delete(
        `/api/v1/roles/${roleId}/permissions`,
        {
            data: { permissionIds },
        }
    );
};
const MOCK_ROLE:IRoleTable = {
    _id: '1',
    name: 'ADMIN',
    description: 'Administrator role with full access',
    permissions: [],
    priority: 1,
    isActive: true,
    isSystem: true,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01')
};
export const MOCK_USERS: IUserTable[] = [
    {
        _id: '1',
        name: 'Nguyễn Văn Admin',
        email: 'admin@lingosphere.com',
        phone: '0901234567',
        address: '123 Đường ABC, Quận 1, TP.HCM',
        image: 'https://i.pravatar.cc/150?img=1',
        role: MOCK_ROLE,
        accountType: 'LOCAL',
        isActive: true,
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01')
    },
    {
        _id: '2',
        name: 'Trần Thị Teacher',
        email: 'teacher@lingosphere.com',
        phone: '0902345678',
        address: '456 Đường XYZ, Quận 2, TP.HCM',
        image: 'https://i.pravatar.cc/150?img=2',
        role: {
            ...MOCK_ROLE,
            _id: '2',
            name: 'TEACHER',
            description: 'Teacher role with teaching permissions',
        },
        accountType: 'LOCAL',
        isActive: true,
        createdAt: new Date('2026-02-15'),
        updatedAt: new Date('2026-02-15')
    },
    {
        _id: '3',
        name: 'Lê Minh Student',
        email: 'student@lingosphere.com',
        phone: '0903456789',
        address: '789 Đường DEF, Quận 3, TP.HCM',
        image: 'https://i.pravatar.cc/150?img=3',
        role: {
            ...MOCK_ROLE,
            _id: '3',
            name: 'STUDENT',
            description: 'Student role with learning permissions',
        },
        accountType: 'LOCAL',
        isActive: true,
        createdAt: new Date('2026-03-01'),
        updatedAt: new Date('2026-03-01')
    },
    {
        _id: '4',
        name: 'Phạm Thị User',
        email: 'user@lingosphere.com',
        phone: '0904567890',
        address: '101 Đường GHI, Quận 4, TP.HCM',
        image: 'https://i.pravatar.cc/150?img=4',
        role: {
            ...MOCK_ROLE,
            _id: '4',
            name: 'USER',
            description: 'User role with basic permissions',
        },
        accountType: 'LOCAL',
        isActive: false,
        createdAt: new Date('2026-04-01'),
        updatedAt: new Date('2026-04-01')
    }
];


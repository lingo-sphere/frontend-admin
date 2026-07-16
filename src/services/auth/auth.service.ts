import createInstanceAxios from '../axios.customize';

const axios = createInstanceAxios(import.meta.env.VITE_BACKEND_URL);

export const loginAPI = (username: string, password: string) => {
    return axios.post<IBackendRes<ILogin>>(
        '/api/v1/auth/login',
        { username, password }
    );
};

export const refreshTokenAPI = () => {
    return axios.post<IBackendRes<IRefreshTokenResponse>>(
        '/api/v1/auth/refresh-token'
    );
};

export const logoutAPI = () => {
    return axios.post<IBackendRes<ILogoutResponse>>(
        '/api/v1/auth/logout'
    );
};

export const registerAPI = (
    email: string,
    password: string,
    name?: string
) => {
    return axios.post<IBackendRes<IRegisterResponse>>(
        '/api/v1/auth/register',
        { email, password, name }
    );
};

export const checkCodeAPI = (_id: string, code: string) => {
    return axios.post<IBackendRes<ICheckCodeResponse>>(
        '/api/v1/auth/check-code',
        { _id, code }
    );
};

export const retryActiveAPI = (email: string) => {
    return axios.post<IBackendRes<IRetryActiveResponse>>(
        '/api/v1/auth/retry-active',
        { email }
    );
};

export const retryPasswordAPI = (email: string) => {
    return axios.post<IBackendRes<IRetryPasswordResponse>>(
        '/api/v1/auth/retry-password',
        { email }
    );
};

export const changePasswordAPI = (
    email: string,
    code: string,
    password: string,
    confirmPassword: string
) => {
    return axios.post<IBackendRes<IChangePasswordResponse>>(
        '/api/v1/auth/change-password',
        { email, code, password, confirmPassword }
    );
};
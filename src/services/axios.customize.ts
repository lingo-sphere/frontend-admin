import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { Mutex } from "async-mutex";

const mutex = new Mutex();

const createInstanceAxios = (baseURL: string) => {
    const instance = axios.create({
        baseURL: baseURL,
        withCredentials: true
    });

    const handleRefreshToken = async (): Promise<string | null> => {
        return await mutex.runExclusive(async () => {
            try {
                const res = await instance.post<IBackendRes<IRefreshTokenResponse>>('/api/v1/auth/refresh-token');
                if (res.data?.data?.accessToken) {
                    return res.data.data.accessToken;
                }
                return null;
            } catch (error) {
                return null;
            }
        });
    };

    instance.interceptors.request.use(
        function (config: InternalAxiosRequestConfig) {
            const token = localStorage.getItem("access_token");
            if (token) {
                config.headers["Authorization"] = `Bearer ${token}`;
            } else {
            }
            return config;
        },
        function (error: AxiosError) {
            return Promise.reject(error);
        }
    );

    instance.interceptors.response.use(
        function (response) {
            if (response && response.data) {
                return response.data;
            }
            return response;
        },
        async function (error: AxiosError<IBackendRes<any>>) {
            const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

            if (
                originalRequest &&
                error.response?.status === 401 &&
                !originalRequest._retry
            ) {
                originalRequest._retry = true;

                try {
                    const newToken = await handleRefreshToken();
                    if (newToken) {
                        localStorage.setItem('access_token', newToken);
                        originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
                        return instance(originalRequest);
                    }
                } catch (refreshError) {
                    localStorage.removeItem('access_token');
                    window.location.href = '/login';
                    return Promise.reject(refreshError);
                }
            }

            if (error.response?.data) {
                const errorData = error.response.data as IBackendRes<any>;
                const errorMsg = errorData?.message as string | string[] | undefined;

                let errorMessage = 'An error occurred';

                if (typeof errorMsg === 'string') {
                    errorMessage = errorMsg;
                } else if (Array.isArray(errorMsg)) {
                    errorMessage = errorMsg.join(', ');
                } else if (errorData?.error) {
                    errorMessage = String(errorData.error);
                }

                const enhancedError = new Error(errorMessage) as AxiosError<IBackendRes<any>>;
                enhancedError.response = error.response;
                enhancedError.status = error.response.status;

                return Promise.reject(enhancedError);
            }

            return Promise.reject(error);
        }
    );

    return instance;
};

export default createInstanceAxios;
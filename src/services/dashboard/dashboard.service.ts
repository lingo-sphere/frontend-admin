import createInstanceAxios from '../axios.customize';

const axios = createInstanceAxios(import.meta.env.VITE_BACKEND_URL);

export const getDashboardAPI = () => {
    return axios.get<IBackendRes<IDashboardStats>>(
        '/api/v1/database/dashboard'
    );
};
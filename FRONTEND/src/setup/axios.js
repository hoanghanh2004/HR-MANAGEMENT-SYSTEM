import axios from 'axios';
import { toast } from 'react-toastify';
// Set config defaults when creating the instance
const instance = axios.create({
    baseURL: 'http://localhost:6969',
});
instance.defaults.withCredentials = true;
// // Alter defaults after instance has been created
instance.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('jwt')}`;
// Add a request interceptor
instance.interceptors.request.use(
    function (config) {
        // Do something before request is sent
        return config;
    },
    function (error) {
        // Do something with request error
        return Promise.reject(error);
    },
);

// Add a response interceptor
instance.interceptors.response.use(
    function (response) {
        // Any status code that lie within the range of 2xx cause this function to trigger
        // Do something with response data
        return response.data;
    },
    function (error) {
        // Any status codes that falls outside the range of 2xx cause this function to trigger
        // Do something with response error
        const status = (error && error.response && error.response.status) || 500;
        switch (status) {
            // xác thực (token related issues)
            case 401: {
                if (
                    window.location.pathname !== '/' &&
                    window.location.pathname !== '/login' &&
                    window.location.pathname !== '/register'
                ) {
                    toast.error('Unauthorized users. Please log in ...');
                }
                return error.response.data;
            }

            // bị cấm (vấn đề liên quan đến quyền)
            case 403: {
                toast.error(`You don't have permisssion access this resource...`);
                return Promise.reject(error);
            }

            // bad request
            case 400: {
                return Promise.reject(error);
            }

            // k tìm thấy
            case 404: {
                return Promise.reject(error);
            }

            // xung đột
            case 409: {
                return Promise.reject(error);
            }

            // không thể xử lý được
            case 422: {
                return Promise.reject(error);
            }

            // lỗi api chung (liên quan đến máy chủ) không mong muốn
            default: {
                return Promise.reject(error);
            }
        }
    },
);
export default instance;

import { useAuthStore } from '@/stores/useAuthStore';
import axios from 'axios';

// Tạo một instance axios để dùng chung trong toàn bộ project
// baseURL sẽ thay đổi tùy theo môi trường (development hoặc production)
const api = axios.create({
    // Nếu đang chạy môi trường dev (npm run dev)
    // thì gọi API ở backend local (port 5001)
    // Nếu đã build production thì gọi API cùng domain (/api)
    baseURL: import.meta.env.MODE === 'development' ? "http://localhost:5001/api" : "/api",
    withCredentials: true, // cookie sẽ được gửi lên sevrer để tránh người dùng bị logout 
});

// gắn accessToken vào req header
api.interceptors.request.use((config) => {
    const { accessToken } = useAuthStore.getState();
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
});

// tự động gọi refresh api khi accessToken hết hạn
api.interceptors.response.use(
    (res) => res,
    async (error) => {
        const originalRequest = error.config;

        // những api không cần check
        if (
            originalRequest.url.includes("/auth/signin") ||
            originalRequest.url.includes("/auth/signup") ||
            originalRequest.url.includes("/auth/refresh")
        ) {
            return Promise.reject(error);
        }

        originalRequest._retryCount = originalRequest._retryCount || 0;

        if (error.response?.status === 403 && originalRequest._retryCount < 4) {
            originalRequest._retryCount += 1;

            try {
                const res = await api.post("/auth/refresh", { withCredentials: true });
                const newAccessToken = res.data.accessToken;

                useAuthStore.getState().setAccessToken(newAccessToken);

                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                useAuthStore.getState().clearState();
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);
export default api;
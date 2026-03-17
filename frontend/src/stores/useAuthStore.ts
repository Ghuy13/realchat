import { create } from 'zustand';
import { toast } from 'sonner';
import { authService } from '../services/authService';
import type { AuthState } from '@/types/store';
import { persist } from 'zustand/middleware';
import { useChatStore } from './useChatStore';

// zustand dùng 2 tham số
// get : lấy dữ liệu trong store

export const useAuthStore = create<AuthState>()(
    persist((set, get) => ({
        accessToken: null,
        user: null,
        loading: false,

        setAccessToken: (accessToken) => {
            set({ accessToken });
        },

        // clearState reset toàn bộ state về lại giá trị mặc định
        clearState: () => {
            set({ accessToken: null, user: null, loading: false });
            useChatStore.getState().reset();
            localStorage.clear();
            sessionStorage.clear();
        },

        signUp: async (firstname: string, lastname: string, username: string, email: string, password: string) => {
            try {
                set({ loading: true });
                await authService.signUp(firstname, lastname, username, email, password);
                toast.success("Đăng ký thành công! Bạn sẽ được chuyển hướng về trang đăng nhập.");
            } catch (error) {
                console.log(error);
                toast.error("Đăng ký thất bại");
            } finally {
                set({ loading: false });
            }
        },

        signIn: async (username, password) => {
            try {
                get().clearState();
                set({ loading: true });

                localStorage.clear();
                useChatStore.getState().reset();

                const { accessToken } = await authService.signIn(username, password);
                get().setAccessToken(accessToken) // cập nhật giá trị accessToken trong store

                await get().fetchMe();
                useChatStore.getState().fetchConversations();

                toast.success("Chào mừng bạn quay lại với REALCHAT");
            } catch (error) {
                console.error(error);
                toast.error("Đăng nhập thất bại!");
            } finally {
                set({ loading: false });
            }
        },

        signOut: async () => {
            try {
                get().clearState();
                await authService.signOut();
                toast.success("Đăng xuất thành công!");
            } catch (error) {
                console.error(error)
                toast.error("Đăng xuất thất bại. Hãy thử lại!");
            }
        },

        fetchMe: async () => {
            try {
                set({ loading: true });
                const user = await authService.fetchMe();
                set({ user });
            } catch (error) {
                console.error(error);
                set({ user: null, accessToken: null })
                toast.error("Lỗi xảy ra khi lấy dữ liệu từ người dùng. Hãy thử lại!")
            } finally {
                set({ loading: false })
            }
        },

        refresh: async () => {
            try {
                set({ loading: true });
                const { user, fetchMe, setAccessToken } = get();
                const accessToken = await authService.refresh();
                setAccessToken(accessToken);

                if (!user) {
                    await fetchMe();
                }
            } catch (error) {
                console.error(error)
                toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!")
                get().clearState();
            } finally {
                set({ loading: false });
            }
        }
    }), {
        name: "auth-storage",
        partialize: (state) => ({ user: state.user }), //chỉ persitst lại user
    })
);

import { friendService } from "@/services/friendService";
import type { FriendState } from "@/types/store";
import { create } from "zustand";

export const useFriendStore = create<FriendState>((set, get) => ({
    friends: [],
    loading: false,
    receivedList: [],
    sentList: [],

    searchByUsername: async (username) => {
        try {
            set({ loading: true });

            const user = await friendService.searchByUsername(username);

            return user;
        } catch (error) {
            console.error("Lỗi xảy ra khi tìm user bằng username", error);
            return null;
        } finally {
            set({ loading: false });
        }
    },

    addFriend: async (to, message) => {
        try {
            set({ loading: true });
            const resultMessage = await friendService.sendFriendRequest(to, message);
            return resultMessage;
        } catch (error) {
            console.error("Lỗi xảy ra khi addFriend", error);
            return "Gửi lời mời kết bạn thành công";
        } finally {
            set({ loading: false });
        }
    },
}));
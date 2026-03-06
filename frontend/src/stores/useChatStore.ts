
import { chatservice } from "@/services/chatService";
import type { ChatState } from "@/types/store";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useChatStore = create<ChatState>()(
    persist(
        (set, get) => ({
            conversations: [],
            messages: {},
            activeConversationId: null,
            loading: false,

            setActiveConversation: (id) => set({ activeConversationId: id }),
            reset: () => {
                set({
                    conversations: [],
                    messages: {},
                    activeConversationId: null,
                    loading: false,
                });
            },
            fetchConversations: async () => {
                try {
                    set({ loading: true });
                    const { conversations } = await chatservice.fetchConversations();

                    set({ conversations, loading: false });
                } catch (error) {
                    console.error("Lỗi xảy ra khi fetchConversations:", error)
                    set({ loading: false });
                }
            }
        }),
        {
            name: "chat-storage",
            partialize: (state) => ({ conversations: state.conversations })
        }
    )
)
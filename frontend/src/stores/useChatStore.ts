
import { chatService } from "@/services/chatService";
import type { ChatState } from "@/types/store";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useAuthStore } from "./useAuthStore";
import { useSocketStore } from "./useSocketStore";

export const useChatStore = create<ChatState>()(
    persist(
        (set, get) => ({
            conversations: [],
            messages: {} as ChatState['messages'],
            activeConversationId: null,
            convoLoading: false, // convo Loading
            messageLoading: false,
            loading: false,

            setActiveConversation: (id) => set({ activeConversationId: id }),
            reset: () => {
                set({
                    conversations: [],
                    messages: {},
                    activeConversationId: null,
                    convoLoading: false,
                    messageLoading: false,
                });
            },
            fetchConversations: async () => {
                try {
                    set({ convoLoading: true });
                    const { conversations } = await chatService.fetchConversations();

                    set({ conversations, convoLoading: false });
                } catch (error) {
                    console.error("Lỗi xảy ra khi fetchConversations:", error)
                    set({ convoLoading: false });
                }
            },
            fetchMessages: async (conversationId) => {
                const { activeConversationId, messages } = get();
                const { user } = useAuthStore.getState();

                const convoId = conversationId ?? activeConversationId;

                if (!convoId) return;

                const current = messages?.[convoId];
                const nextCursor = current?.nextCursor === undefined ? "" : current?.nextCursor;

                if (nextCursor === null) return;

                set({ messageLoading: true })

                try {
                    const { messages: fetched, cursor } = await chatService.fetchMessage(convoId, nextCursor);

                    const processed = fetched.map((m => ({
                        ...m,
                        isOwn: m.senderId === user?._id,
                    })));

                    set((state) => {
                        const prev = state.messages[convoId]?.items ?? [];
                        const merged = prev.length > 0 ? [...processed, ...prev] : processed;

                        return {
                            messages: {
                                ...state.messages,
                                [convoId]: {
                                    items: merged,
                                    hasMore: !!cursor,
                                    nextCursor: cursor ?? null,
                                }
                            }
                        }
                    });
                } catch (error) {
                    console.error("Lỗi xảy ra khi fetchMessages:", error);
                } finally {
                    set({ messageLoading: false })
                }
            },
            sendDirectMessage: async (recipientId, content, imgUrl, file) => {
                try {
                    const { activeConversationId } = get();
                    const sentMessage = await chatService.sendDirectMessage(recipientId, content, imgUrl, activeConversationId || undefined, file);

                    set((state) => ({
                        conversations: state.conversations.map((c) => c._id === activeConversationId ? { ...c, seenBy: [] } : c),
                    }))
                    return sentMessage;
                } catch (error) {
                    console.error("Lỗi xảy ra khi sendDirectMessage:", error);
                    throw error;
                }
            },
            sendGroupMessage: async (conversationId, content, imgUrl, file) => {
                try {
                    const sentMessage = await chatService.sendGroupMessage(conversationId, content, imgUrl, file);

                    set((state) => ({
                        conversations: state.conversations.map((c) => c._id === get().activeConversationId ? { ...c, seenBy: [] } : c)
                    }))
                    return sentMessage;
                } catch (error) {
                    console.error("Lỗi xảy ra khi sendGroupMessage:", error);
                    throw error;
                }
            },
            addMessage: async (message) => {
                try {
                    const { user } = useAuthStore.getState();
                    const { fetchMessages } = get();

                    message.isOwn = message.senderId === user?._id;

                    const convoId = message.conversationId;

                    let prevItems = get().messages[convoId]?.items ?? [];

                    if (prevItems.length === 0) {
                        await fetchMessages(message.conversationId);
                        prevItems = get().messages[convoId]?.items ?? [];
                    }
                    set((state) => {
                        // Dedupe by server message ID
                        if (prevItems.some((m) => m._id === message._id)) {
                            return state;
                        }

                        // Nếu có tin nhắn tạm của mình trùng content, đè lên
                        const filtered = prevItems.filter((m) => {
                            if (m.isTemp && m.senderId === message.senderId && m.content === message.content) {
                                return false;
                            }
                            return true;
                        });

                        return {
                            messages: {
                                ...state.messages,
                                [convoId]: {
                                    items: [...filtered, message],
                                    hasMore: state.messages[convoId].hasMore,
                                    nextCursor: state.messages[convoId]?.nextCursor ?? null
                                },
                            },
                        };
                    });
                } catch (error) {
                    console.error("Lỗi xảy ra khi addMessage:", error);
                }
            },
            addTempMessage: (message) => {
                const convoId = message.conversationId;
                set((state) => {
                    const prevItems = state.messages[convoId]?.items ?? [];
                    return {
                        messages: {
                            ...state.messages,
                            [convoId]: {
                                items: [...prevItems, message],
                                hasMore: state.messages[convoId]?.hasMore ?? false,
                                nextCursor: state.messages[convoId]?.nextCursor ?? null
                            },
                        },
                    };
                });
            },
            replaceTempMessage: (tempId, realMessage) => {
                const convoId = realMessage.conversationId;
                set((state) => {
                    const prevItems = state.messages[convoId]?.items ?? [];

                    // Nếu message thực đã tồn tại (vì socket push), chỉ xóa tạm
                    const existIndex = prevItems.findIndex((m) => m._id === realMessage._id);
                    let nextItems = prevItems;
                    if (existIndex >= 0) {
                        nextItems = prevItems.filter((m) => m._id !== tempId);
                    } else {
                        nextItems = prevItems.map((m) =>
                            m._id === tempId ? { ...realMessage, isOwn: true, tempId: m.tempId } : m
                        );
                    }

                    return {
                        messages: {
                            ...state.messages,
                            [convoId]: {
                                items: nextItems,
                                hasMore: state.messages[convoId]?.hasMore ?? false,
                                nextCursor: state.messages[convoId]?.nextCursor ?? null
                            },
                        },
                    };
                });
            },
            removeTempMessage: (tempId) => {
                const convoId = get().activeConversationId;
                if (!convoId) return;
                set((state) => {
                    const prevItems = state.messages[convoId]?.items ?? [];
                    const newItems = prevItems.filter((m) => m._id !== tempId);
                    return {
                        messages: {
                            ...state.messages,
                            [convoId]: {
                                items: newItems,
                                hasMore: state.messages[convoId]?.hasMore ?? false,
                                nextCursor: state.messages[convoId]?.nextCursor ?? null
                            },
                        },
                    };
                });
            },
            updateConversation: (conversation) => {
                set((state) => ({
                    conversations: state.conversations.map((c) =>
                        c._id === conversation._id ? { ...c, ...conversation } : c
                    ),
                }));
            },
            markAsSeen: async () => {
                try {
                    const { user } = useAuthStore.getState();
                    const { activeConversationId, conversations } = get();

                    if (!activeConversationId || !user) {
                        return;
                    }

                    const convo = conversations.find((c) => c._id === activeConversationId);

                    if (!convo) {
                        return;
                    }

                    if ((convo.unreadCounts?.[user._id] ?? 0) === 0) {
                        return;
                    }

                    await chatService.markAsSeen(activeConversationId);

                    set((state) => ({
                        conversations: state.conversations.map((c) =>
                            c._id === activeConversationId && c.lastMessage
                                ? {
                                    ...c,
                                    unreadCounts: {
                                        ...c.unreadCounts,
                                        [user._id]: 0,
                                    },
                                }
                                : c
                        ),
                    }));
                } catch (error) {
                    console.error("Lỗi xảy ra khi gọi markAsSeen trong store", error);
                }
            },
            addConvo: (convo) => {
                set((state) => {
                    const exists = state.conversations.some((c) => c._id.toString() === convo._id.toString());

                    return {
                        conversations: exists ? state.conversations : [convo, ...state.conversations],
                        activeConversationId: convo._id,
                    }
                })
            },

            createConversation: async (type, name, memberIds) => {
                set({ loading: true });
                try {
                    const conversation = await chatService.createConversation(type, name, memberIds);

                    get().addConvo(conversation);

                    useSocketStore.getState().socket?.emit("join-conversation", conversation._id)
                } catch (error) {
                    console.error("Lỗi xảy ra khi gọi createConversation trong store", error)
                } finally {
                    set({ loading: false });
                }
            },

        }),
        {
            name: "chat-storage",
            partialize: (state) => ({ conversations: state.conversations })
        }
    )
)
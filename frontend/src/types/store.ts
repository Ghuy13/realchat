import type { Conversation, Message } from "@/types/chat";
import type { User } from "./user";

export interface AuthState {
    accessToken: string | null;
    user: User | null;
    loading: boolean;

    setAccessToken: (accessToken: string) => void;
    clearState: () => void;
    signUp: (
        lastname: string,
        firstname: string,
        username: string,
        email: string,
        password: string
    ) => Promise<void>;

    signIn: (
        username: string,
        password: string
    ) => Promise<void>;

    signOut: () => Promise<void>;
    fetchMe: () => Promise<void>;
    refresh: () => Promise<void>;
}

export interface ThemeState {
    isDark: boolean;
    toggleTheme: () => void; // hàm chuyển lại theme giữa sáng và tối
    setTheme: (dark: boolean) => void;
}

export interface ChatState {
    conversations: Conversation[];
    messages: Record<string, {
        items: Message[],
        hasMore: boolean, // infinite-scroll
        nextCursor: string | null, // phân trang
    }>;
    activeConversationId: string | null;   //lưu id của conversation đang mở nếu user click vào chat thì giá trị sẽ được cập nhật
    convoLoading: boolean;                      // theo dỏi trạng thái req đã xong chưa
    messageLoading: boolean;
    reset: () => void;

    setActiveConversation: (id: string | null) => void; // dùng để những compoment khác cập nhật giá trị của activeConversation
    fetchConversations: () => Promise<void>;
    fetchMessages: (conversationId?: string) => Promise<void>;
    sendDirectMessage: (
        recipientId: string,
        content: string,
        imgUrl?: string,
    ) => Promise<void>;
    sendGroupMessage: (
        conversationId: string,
        content: string,
        imgUrl?: string,
    ) => Promise<void>;

}